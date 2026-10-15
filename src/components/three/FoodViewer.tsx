"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { Layers, RotateCcw, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import type { ModelComponent, ModelConfig } from "@/lib/types";
import { getModelConfig } from "@/lib/model-registry";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/*
  Build view renderer.

  1. If a real GLB is registered for the dish (modelUrl in model-registry), it is
     loaded and its own meshes become the explodable parts.
  2. Otherwise a procedural build is used, built from per-dish geometry so each
     dish reads as itself: a ramen bowl with a broth surface, noodle strands,
     katsu slices and a soft egg; glazed chicken on a plate; a boba cup with
     pearls; a steamer basket with folded bao, and so on.

  Explosion is animated inside the render loop with damping (no React state
  updates per frame), and geometry is seeded per component so it is stable
  between renders. Everything degrades to the dish photo without WebGL.
*/

export interface FoodViewerProps {
  menuItemSlug: string;
  poster?: string;
  posterAlt?: string;
  exploded?: boolean;
  onExplodedChange?: (value: boolean) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  hiddenIds?: string[];
  showControls?: boolean;
  className?: string;
}

interface ViewApi {
  reset: () => void;
  zoom: (factor: number) => void;
}

const NO_HIDDEN: string[] = [];

/* ---------------- seeded randomness ---------------- */

function rng(seed: number) {
  let s = seed % 2147483647 || 12345;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Scatter n pieces deterministically inside a disc, calling make() for each. */
function scatter(count: number, seed: number, radius: number, make: (r: () => number) => ReactNode) {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * radius;
    return (
      <group key={i} position={[Math.cos(a) * d, 0, Math.sin(a) * d]} rotation={[r() * 3.14, r() * 3.14, r() * 3.14]}>
        {make(r)}
      </group>
    );
  });
}

/* ---------------- material library ---------------- */

function mat(color: string, roughness = 0.6, metalness = 0) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}

const glazed = (color: string) => (
  <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.05} clearcoat={0.85} clearcoatRoughness={0.3} />
);

const liquid = (color: string) => (
  <meshPhysicalMaterial color={color} roughness={0.08} metalness={0.05} clearcoat={0.7} />
);

const glassy = (color: string) => (
  <meshPhysicalMaterial
    color={color}
    transparent
    opacity={0.28}
    roughness={0.05}
    metalness={0}
    side={THREE.DoubleSide}
  />
);

/* ---------------- ramen helpers ---------------- */

function NoodleNest({ color, seed }: { color: string; seed: number }) {
  const curves = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 16 }, () => {
      const angle = r() * Math.PI * 2;
      const reach = 0.35 + r() * 0.35;
      const lift = 0.05 + r() * 0.09;
      const wobble = 0.1 + r() * 0.16;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const a = angle + t * (1.4 + r() * 1.2);
        const d = reach * Math.sin(Math.PI * t);
        points.push(
          new THREE.Vector3(
            Math.cos(a) * d + (r() - 0.5) * wobble,
            lift * Math.sin(Math.PI * t) * (0.7 + r() * 0.6),
            Math.sin(a) * d + (r() - 0.5) * wobble
          )
        );
      }
      return new THREE.CatmullRomCurve3(points);
    });
  }, [seed]);

  return (
    <group>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 26, 0.021, 6, false]} />
          {mat(color, 0.62)}
        </mesh>
      ))}
    </group>
  );
}

function ScallionRings({ color, seed }: { color: string; seed: number }) {
  return (
    <group>
      {scatter(14, seed, 0.55, () => (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.028, 0.011, 6, 12]} />
          {mat(color, 0.55)}
        </mesh>
      ))}
    </group>
  );
}

function Sesame({ color, seed }: { color: string; seed: number }) {
  return (
    <group>
      {scatter(26, seed, 0.62, () => (
        <mesh>
          <sphereGeometry args={[0.017, 6, 6]} />
          {mat(color, 0.55)}
        </mesh>
      ))}
    </group>
  );
}

function SoftEgg({ yolk }: { yolk: string }) {
  return (
    <group>
      <mesh scale={[1, 0.72, 0.78]}>
        <sphereGeometry args={[0.19, 26, 18]} />
        {mat("#fdf7ea", 0.35)}
      </mesh>
      <mesh position={[0, 0.055, 0]} scale={[1, 0.5, 0.55]}>
        <sphereGeometry args={[0.17, 22, 16]} />
        {mat(yolk, 0.32)}
      </mesh>
    </group>
  );
}

function Chopsticks({ color, y }: { color: string; y: number }) {
  return (
    <group position={[0, y, 0.42]} rotation={[0, 0.34, 0]}>
      {[-0.045, 0.045].map((off, i) => (
        <mesh key={i} position={[off, 0, 0]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.022, 0.022, 1.9]} />
          {mat(color, 0.62)}
        </mesh>
      ))}
    </group>
  );
}

function BambooSteamer({ color, radius = 1.02 }: { color: string; radius?: number }) {
  return (
    <group>
      {[0, 0.1].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[radius, radius * 0.98, 0.1, 48, 1, true]} />
          <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[0.05, 0.15].map((y, i) => (
        <mesh key={`rim-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.016, 8, 48]} />
          {mat(color, 0.85)}
        </mesh>
      ))}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[radius * 0.97, radius * 0.9, 0.05, 48]} />
        {mat(color, 0.9)}
      </mesh>
    </group>
  );
}

function Dumpling() {
  return (
    <group>
      <mesh scale={[1.15, 0.62, 0.92]}>
        <sphereGeometry args={[0.2, 20, 14]} />
        {mat("#f6ecdb", 0.72)}
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = -0.9 + i * 0.3;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.14, 0.11, 0]} rotation={[0, 0, a * 0.2]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            {mat("#efe2cd", 0.7)}
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------------- per-component geometry ---------------- */

function buildShape(id: string, color: string): ReactNode {
  const seed = hashSeed(id);

  switch (true) {
    /* containers */
    case id === "bowl":
      return (
        <group>
          <mesh scale={[1, 0.62, 1]}>
            <sphereGeometry args={[1.06, 56, 26, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
            <meshPhysicalMaterial color={color} roughness={0.22} metalness={0.08} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.06, 0.035, 10, 56]} />
            {mat("#4a362d", 0.25)}
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.42, 0.36, 0.1, 40]} />
            {mat(color, 0.4)}
          </mesh>
        </group>
      );
    case id === "plate":
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[1.32, 1.26, 0.06, 64]} />
            {mat(color, 0.2, 0.05)}
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.24, 0.035, 10, 64]} />
            {mat("#3a302c", 0.25)}
          </mesh>
        </group>
      );
    case id === "steamer":
      return <BambooSteamer color={color} />;
    case id === "paper":
      return (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 0.008, 40]} />
          {mat(color, 0.95)}
        </mesh>
      );
    case id === "board":
      return (
        <group>
          <mesh>
            <boxGeometry args={[2.2, 0.07, 1.35]} />
            {mat(color, 0.82)}
          </mesh>
          <mesh position={[0.85, 0.045, 0]}>
            <torusGeometry args={[0.09, 0.02, 8, 20]} />
            {mat("#5d3f21", 0.8)}
          </mesh>
        </group>
      );

    /* liquids */
    case id === "broth":
      return (
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.98, 0.98, 0.06, 56]} />
          {liquid(color)}
        </mesh>
      );
    case id === "sauce":
      return (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.96, 0.96, 0.1, 48]} />
          {glazed(color)}
        </mesh>
      );
    case id === "rice":
      return (
        <mesh position={[0, 0.12, 0]} scale={[1, 0.7, 1]}>
          <sphereGeometry args={[0.9, 44, 26]} />
          {mat(color, 0.78)}
        </mesh>
      );

    /* boba cup */
    case id === "cup":
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.52, 0.4, 1.06, 40, 1, true]} />
            {glassy(color)}
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.03, 40]} />
            {mat("#eef6f7", 0.35)}
          </mesh>
          <mesh position={[0, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.016, 8, 40]} />
            {mat("#e2dacb", 0.4)}
          </mesh>
        </group>
      );
    case id === "tea":
      return (
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.5, 0.42, 0.74, 40]} />
          {liquid(color)}
        </mesh>
      );

    /* ramen parts */
    case id === "noodles":
      return <NoodleNest color={color} seed={seed} />;
    case id === "katsu":
      return (
        <group>
          {Array.from({ length: 5 }, (_, i) => (
            <group key={i} position={[(i - 2) * 0.3, 0, Math.abs(i - 2) * 0.05]} rotation={[0, 0.06 * (i - 2), -0.14]}>
              <mesh>
                <boxGeometry args={[0.26, 0.11, 0.56]} />
                {mat(color, 0.86)}
              </mesh>
              <mesh position={[0, 0.055, 0]}>
                <boxGeometry args={[0.26, 0.012, 0.56]} />
                {mat("#e2ab5c", 0.85)}
              </mesh>
            </group>
          ))}
        </group>
      );
    case id === "egg":
      return <SoftEgg yolk={color} />;
    case id === "corn":
      return (
        <group>
          {scatter(16, seed, 0.24, () => (
            <mesh>
              <sphereGeometry args={[0.038, 8, 8]} />
              {mat(color, 0.42)}
            </mesh>
          ))}
        </group>
      );
    case id === "scallion":
      return <ScallionRings color={color} seed={seed} />;
    case id === "nori":
      return (
        <mesh position={[0, 0.08, 0]} rotation={[0.12, 0, 0.1]}>
          <boxGeometry args={[0.62, 0.42, 0.012]} />
          <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.4} side={THREE.DoubleSide} />
        </mesh>
      );
    case id === "chopsticks":
      return <Chopsticks color={color} y={0} />;

    /* chicken */
    case id === "chicken":
      return (
        <group>
          {Array.from({ length: 7 }, (_, i) => {
            const r = rng(seed + i * 7);
            const a = (i / 7) * Math.PI * 2;
            const d = 0.2 + r() * 0.45;
            return (
              <group key={i} position={[Math.cos(a) * d, 0.14 + (i % 3) * 0.09, Math.sin(a) * d]} rotation={[r() * 0.6, a, r() * 0.5]}>
                <mesh scale={[1.25, 0.9, 1]}>
                  <sphereGeometry args={[0.22, 18, 14]} />
                  {glazed(color)}
                </mesh>
              </group>
            );
          })}
        </group>
      );
    case id === "glaze":
      return (
        <group>
          {scatter(9, seed, 0.5, () => (
            <mesh scale={[1.4, 0.5, 1.2]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              {glazed(color)}
            </mesh>
          ))}
        </group>
      );
    case id === "sesame":
      return <Sesame color={color} seed={seed} />;
    case id === "pickled-radish":
      return (
        <group>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.28, 0.24, 0.14, 28]} />
            {mat("#f7f2e6", 0.35)}
          </mesh>
          <group position={[0, 0.12, 0]}>
            {scatter(7, seed, 0.14, () => (
              <mesh>
                <boxGeometry args={[0.09, 0.05, 0.09]} />
                {mat(color, 0.35)}
              </mesh>
            ))}
          </group>
        </group>
      );

    /* tteokbokki */
    case id === "rice-cakes":
      return (
        <group>
          {Array.from({ length: 7 }, (_, i) => {
            const r = rng(seed + i * 3);
            const a = (i / 7) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.32, 0.06, Math.sin(a) * 0.32]} rotation={[0.1, a + r() * 0.5, 0.08]}>
                <capsuleGeometry args={[0.07, 0.2, 6, 12]} />
                {mat(color, 0.5)}
              </mesh>
            );
          })}
        </group>
      );
    case id === "fish-cakes":
      return (
        <group>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} position={[(i - 1.5) * 0.16, 0.05, 0.05 * i]} rotation={[0.1, i * 0.7, 0.06]}>
              <boxGeometry args={[0.24, 0.035, 0.16]} />
              {mat(color, 0.55)}
            </mesh>
          ))}
        </group>
      );

    /* dumplings */
    case id.startsWith("dumpling"):
      return <Dumpling />;
    case id === "dip":
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.24, 0.2, 0.12, 28]} />
            {mat("#f2ede1", 0.5)}
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.03, 28]} />
            {liquid(color)}
          </mesh>
          <group position={[0, 0.08, 0]}>
            {scatter(5, seed, 0.1, () => (
              <mesh>
                <sphereGeometry args={[0.012, 6, 6]} />
                {mat("#2a1a0c", 0.4)}
              </mesh>
            ))}
          </group>
        </group>
      );

    /* bao */
    case id.endsWith("-bottom") || id.endsWith("-top"): {
      const isTop = id.endsWith("-top");
      return (
        <mesh position={[0, isTop ? 0.05 : 0, 0]} scale={[1.35, 0.62, 1.05]} rotation={[isTop ? Math.PI : 0, 0, 0]}>
          <sphereGeometry args={[0.3, 30, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshPhysicalMaterial color={color} roughness={0.75} clearcoat={0.15} side={THREE.DoubleSide} />
        </mesh>
      );
    }
    case id.endsWith("-filling"):
      return (
        <group>
          <mesh scale={[1.3, 0.55, 0.9]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.7} />
          </mesh>
          {scatter(5, seed, 0.09, () => (
            <mesh scale={[2, 0.6, 1]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              {mat("#3f7a2c", 0.6)}
            </mesh>
          ))}
        </group>
      );

    /* corn dogs */
    case id === "stick":
      return (
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 1.5, 10]} />
          {mat(color, 0.75)}
        </mesh>
      );
    case id === "batter":
      return (
        <mesh scale={[1, 1, 1]}>
          <capsuleGeometry args={[0.2, 0.62, 8, 24]} />
          {mat(color, 0.72)}
        </mesh>
      );
    case id === "sausage":
      return (
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.15, 0.34, 8, 20]} />
          {mat(color, 0.45)}
        </mesh>
      );
    case id === "sugar-ketchup" || id === "mustard": {
      const isRed = id === "sugar-ketchup";
      return (
        <group position={[0, 0.22, 0]}>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} position={[0, i * 0.16, 0]} rotation={[Math.PI / 2, 0, i * 0.8]}>
              <torusGeometry args={[0.11, isRed ? 0.022 : 0.018, 8, 20, Math.PI * 1.2]} />
              {isRed ? glazed(color) : mat(color, 0.4)}
            </mesh>
          ))}
        </group>
      );
    }

    /* kimbap */
    case id === "kimbap-nori":
      return (
        <group>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[(i % 3) * 0.36 - 0.36, 0, Math.floor(i / 3) * 0.36 - 0.18]} rotation={[Math.PI / 2, 0, 0.2 * i]}>
              <cylinderGeometry args={[0.17, 0.17, 0.3, 26, 1, true]} />
              <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.35} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      );
    case id === "kimbap-rice":
      return (
        <group>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[(i % 3) * 0.36 - 0.36, 0, Math.floor(i / 3) * 0.36 - 0.18]} rotation={[Math.PI / 2, 0, 0.2 * i]}>
              <cylinderGeometry args={[0.145, 0.145, 0.305, 26]} />
              {mat(color, 0.72)}
            </mesh>
          ))}
        </group>
      );
    case id === "kimbap-filling": {
      const colors = ["#e07a24", "#7fbf4a", "#f0d24a", "#c04a3a"];
      return (
        <group>
          {Array.from({ length: 6 }, (_, i) =>
            colors.map((c, j) => (
              <mesh
                key={`${i}-${j}`}
                position={[
                  (i % 3) * 0.36 - 0.36 + Math.cos((j / 4) * 6.28) * 0.06,
                  0,
                  Math.floor(i / 3) * 0.36 - 0.18 + Math.sin((j / 4) * 6.28) * 0.06,
                ]}
                rotation={[Math.PI / 2, 0, 0.2 * i]}
              >
                <cylinderGeometry args={[0.032, 0.032, 0.31, 8]} />
                {mat(c, 0.55)}
              </mesh>
            ))
          )}
        </group>
      );
    }
    case id === "egg-strip":
      return (
        <group>
          {scatter(6, seed, 0.2, () => (
            <mesh>
              <boxGeometry args={[0.16, 0.02, 0.035]} />
              {mat(color, 0.55)}
            </mesh>
          ))}
        </group>
      );

    /* rice bowls / sides */
    case id === "kimchi":
      return (
        <group>
          {scatter(8, seed, 0.4, () => (
            <mesh scale={[1.6, 0.6, 1]}>
              <boxGeometry args={[0.22, 0.035, 0.1]} />
              {glazed(color)}
            </mesh>
          ))}
        </group>
      );
    case id === "seaweed":
      return (
        <group>
          {scatter(14, seed, 0.3, () => (
            <mesh>
              <boxGeometry args={[0.1, 0.008, 0.07]} />
              {mat(color, 0.6)}
            </mesh>
          ))}
        </group>
      );

    /* boba */
    case id === "pearls":
      return (
        <group position={[0, -0.36, 0]}>
          {scatter(30, seed, 0.3, () => (
            <mesh scale={[1, 0.85, 1]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshPhysicalMaterial color={color} roughness={0.18} clearcoat={0.9} />
            </mesh>
          ))}
        </group>
      );
    case id === "lid":
      return (
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.56, 0.54, 0.03, 40]} />
          {mat(color, 0.4)}
        </mesh>
      );
    case id === "straw":
      return (
        <mesh position={[0, 0.1, 0]} rotation={[0.16, 0, 0.1]}>
          <cylinderGeometry args={[0.05, 0.05, 1.3, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.5} />
        </mesh>
      );
    case id === "whipped-cream":
      return (
        <group>
          <mesh position={[0, -0.04, 0]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.4, 26, 18]} />
            {mat(color, 0.62)}
          </mesh>
          <mesh position={[0.1, 0.1, 0.06]} scale={[0.7, 0.6, 0.7]}>
            <sphereGeometry args={[0.22, 20, 14]} />
            {mat(color, 0.62)}
          </mesh>
          <mesh position={[-0.14, 0.06, -0.08]} scale={[0.6, 0.5, 0.6]}>
            <sphereGeometry args={[0.2, 18, 12]} />
            {mat(color, 0.62)}
          </mesh>
        </group>
      );
    case id === "drizzle":
      return (
        <group position={[0, 0.05, 0]}>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[0, i * 0.06, 0]} rotation={[Math.PI / 2, 0, i]}>
              <torusGeometry args={[0.3 - i * 0.06, 0.018, 8, 24, Math.PI * 1.4]} />
              <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.8} />
            </mesh>
          ))}
        </group>
      );
    case id === "ice":
      return (
        <group>
          {scatter(5, seed, 0.24, (r) => (
            <mesh rotation={[r() * 3, r() * 3, r() * 3]}>
              <boxGeometry args={[0.14, 0.14, 0.14]} />
              <meshPhysicalMaterial color={color} transparent opacity={0.65} roughness={0.08} clearcoat={1} />
            </mesh>
          ))}
        </group>
      );
    case id === "lime":
      return (
        <mesh position={[0, 0.02, 0]} rotation={[0.2, 0, 0.3]}>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 24]} />
          {mat(color, 0.4)}
        </mesh>
      );

    default:
      return (
        <mesh>
          <sphereGeometry args={[0.24, 20, 16]} />
          {mat(color, 0.5)}
        </mesh>
      );
  }
}

/* ---------------- procedural scene parts ---------------- */

function Part({
  component,
  progress,
  selected,
  hidden,
  onSelect,
}: {
  component: ModelComponent;
  progress: MutableRefObject<number>;
  selected: boolean;
  hidden: boolean;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const color = component.color ?? "#d97757";
  const shape = useMemo(() => buildShape(component.id, color), [component.id, color]);
  const [px, py, pz] = component.position;
  const [ex, ey, ez] = component.explodedPosition;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const t = progress.current;
    g.position.set(px + (ex - px) * t, py + (ey - py) * t, pz + (ez - pz) * t);
    const target = hidden ? 0 : selected ? 1.05 : 1;
    const s = THREE.MathUtils.damp(g.scale.x, target, 12, dt);
    g.scale.setScalar(Math.max(s, 0));
    g.visible = s > 0.02;
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {shape}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]}>
          <ringGeometry args={[0.72, 0.8, 48]} />
          <meshBasicMaterial color="#ff5a4e" transparent opacity={0.9} depthTest={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function ProceduralScene({
  config,
  progress,
  selectedId,
  onSelect,
  hiddenIds,
}: {
  config: ModelConfig;
  progress: MutableRefObject<number>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hiddenIds: string[];
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff4e6", "#1a120e", 0.55]} />
      <directionalLight position={[4, 7, 4]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -3]} intensity={0.5} color="#ffd6b0" />
      <ContactShadows position={[0, -0.34, 0]} opacity={0.5} scale={7} blur={2.4} far={3} />
      {config.components.map((c) => (
        <Part
          key={c.id}
          component={c}
          progress={progress}
          selected={selectedId === c.id}
          hidden={hiddenIds.includes(c.id)}
          onSelect={() => onSelect(selectedId === c.id ? null : c.id)}
        />
      ))}
    </>
  );
}

/* ---------------- real GLB path ---------------- */

interface GlbPart {
  object: THREE.Object3D;
  base: THREE.Vector3;
  explode: THREE.Vector3;
  id: string;
  label: string;
}

/*
  Loads a registered GLB. Each mesh becomes an explodable part; labels and ids
  come from the registry (config.components) so the parts list on the dish page
  stays in sync. If loading throws, ViewerErrorBoundary swaps in the procedural build.
*/
function GlbScene({
  url,
  config,
  progress,
  selectedId,
  onSelect,
  hiddenIds,
}: {
  url: string;
  config: ModelConfig;
  progress: MutableRefObject<number>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hiddenIds: string[];
}) {
  const { scene } = useGLTF(url);
  const proxies = useRef<THREE.Group>(null);

  const root = useMemo(() => {
    const cloned = scene.clone(true);
    const meshes: THREE.Object3D[] = [];
    cloned.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o);
    });
    const pool = meshes.length > 1 ? meshes : [cloned];

    const centers = pool.map((o) => {
      const b = new THREE.Box3().setFromObject(o);
      const c = new THREE.Vector3();
      b.getCenter(c);
      return c;
    });
    const center = new THREE.Vector3();
    centers.forEach((c) => center.add(c));
    center.multiplyScalar(1 / Math.max(pool.length, 1));

    const parts: GlbPart[] = pool.map((o, i) => {
      const dir = centers[i].clone().sub(center);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      dir.normalize();
      const cfg = config.components[i];
      return {
        object: o,
        base: o.position.clone(),
        explode: o.position
          .clone()
          .add(dir.multiplyScalar(config.explodedDistance * 1.6))
          .add(new THREE.Vector3(0, 0.3 * i, 0)),
        id: cfg?.id ?? `part-${i + 1}`,
        label: cfg?.label ?? (o.name?.trim() || `Part ${i + 1}`),
      };
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2.6 / Math.max(size.x, size.y, size.z, 0.001);
    return { cloned, parts, scale };
  }, [scene, config]);

  useFrame((_, dt) => {
    const t = progress.current;
    root.parts.forEach((p, i) => {
      p.object.position.lerpVectors(p.base, p.explode, t);
      const isHidden = hiddenIds.includes(p.id);
      p.object.visible = !isHidden;
      const proxy = proxies.current?.children[i];
      if (proxy) {
        proxy.position.lerpVectors(p.base, p.explode, t);
        proxy.visible = !isHidden;
        const want = selectedId === p.id ? 1.12 : 1;
        proxy.scale.setScalar(THREE.MathUtils.damp(proxy.scale.x, want, 12, dt));
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff4e6", "#1a120e", 0.55]} />
      <directionalLight position={[4, 7, 4]} intensity={1.25} />
      <directionalLight position={[-5, 3, -3]} intensity={0.5} color="#ffd6b0" />
      <ContactShadows position={[0, -0.34, 0]} opacity={0.5} scale={7} blur={2.4} far={3} />
      <group scale={root.scale} position={[0, 0.15, 0]}>
        <primitive object={root.cloned} />
      </group>
      <group ref={proxies}>
        {root.parts.map((p) => (
          <mesh
            key={p.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selectedId === p.id ? null : p.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <sphereGeometry args={[0.3, 10, 10]} />
            <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}


class ViewerErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/* ---------------- camera ---------------- */

function CameraSetup({ config, api }: { config: ModelConfig; api: MutableRefObject<ViewApi | null> }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;

  useEffect(() => {
    const home = new THREE.Vector3(...config.cameraPosition);
    const focus = new THREE.Vector3(...config.cameraTarget);
    const place = () => {
      camera.position.copy(home);
      if (controls) {
        controls.target.copy(focus);
        controls.update();
      } else {
        camera.lookAt(focus);
      }
    };
    place();
    api.current = {
      reset: place,
      zoom: (factor) => {
        if (!controls) return;
        const offset = camera.position.clone().sub(controls.target);
        const distance = THREE.MathUtils.clamp(offset.length() * factor, config.minDistance, config.maxDistance);
        camera.position.copy(controls.target).add(offset.setLength(distance));
        controls.update();
      },
    };
  }, [config, camera, controls, api]);

  return null;
}

/* ---------------- wrapper ---------------- */

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function FoodViewer({
  menuItemSlug,
  poster,
  posterAlt,
  exploded: explodedProp,
  onExplodedChange,
  selectedId: selectedProp,
  onSelect,
  hiddenIds,
  showControls = true,
  className,
}: FoodViewerProps) {
  const config = getModelConfig(menuItemSlug);
  const { ref, inView } = useInView<HTMLDivElement>("180px");

  const [innerExploded, setInnerExploded] = useState(false);
  const [innerSelected, setInnerSelected] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const isExploded = explodedProp ?? innerExploded;
  const setExploded = onExplodedChange ?? setInnerExploded;
  const selectedId = selectedProp !== undefined ? selectedProp : innerSelected;
  const setSelected = onSelect ?? setInnerSelected;
  const hidden = hiddenIds ?? NO_HIDDEN;

  const progress = useRef(0);
  const target = useRef(0);
  const api = useRef<ViewApi | null>(null);

  useEffect(() => {
    target.current = isExploded ? 1 : 0;
  }, [isExploded]);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  if (!config) return null;

  const selectedComp = config.components.find((c) => c.id === selectedId) ?? null;
  const canRender = inView && webgl === true;
  const glbUrl = config.modelUrl;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden rounded-2xl border border-ink-800", className)}
      style={{
        background: "radial-gradient(ellipse at 50% 32%, #2e211c 0%, #151113 52%, #0a0a0b 100%)",
      }}
    >
      {canRender ? (
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: config.cameraPosition, fov: 35 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          className="!absolute inset-0"
        >
          <ViewerErrorBoundary
            fallback={
              <ProceduralScene
                config={config}
                progress={progress}
                selectedId={selectedId}
                onSelect={setSelected}
                hiddenIds={hidden}
              />
            }
          >
            {glbUrl ? (
              <Suspense fallback={null}>
                <GlbScene
                  url={glbUrl}
                  config={config}
                  progress={progress}
                  selectedId={selectedId}
                  onSelect={setSelected}
                  hiddenIds={hidden}
                />
              </Suspense>
            ) : (
              <ProceduralScene
                config={config}
                progress={progress}
                selectedId={selectedId}
                onSelect={setSelected}
                hiddenIds={hidden}
              />
            )}
          </ViewerErrorBoundary>

          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={config.minDistance}
            maxDistance={config.maxDistance}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
          />
          <CameraSetup config={config} api={api} />
        </Canvas>
      ) : (
        <div className="absolute inset-0">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt={posterAlt ?? ""} className="h-full w-full object-cover opacity-80" loading="lazy" />
          )}
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink-950/85 to-transparent p-6 text-center">
            <p className="text-xs text-ink-300">
              {webgl === false
                ? "3D view isn't supported on this device. The dish photo is shown instead."
                : "Loading 3D build view…"}
            </p>
          </div>
        </div>
      )}

      {canRender && (
        <>
          <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] text-ink-300 backdrop-blur-sm">
            Drag to rotate · Tap a part to inspect
          </div>

          {selectedComp && (
            <div className="pointer-events-none absolute left-1/2 top-4 max-w-[70%] -translate-x-1/2 truncate rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white shadow-lg">
              {selectedComp.label}
            </div>
          )}

          {showControls && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-ink-700 bg-ink-900/90 p-1.5 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={() => setExploded(!isExploded)}
                aria-pressed={isExploded}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
                  isExploded ? "bg-accent text-white" : "text-ink-100 hover:bg-ink-800"
                )}
              >
                <Layers className="h-4 w-4" />
                {isExploded ? "Assemble" : "Explode"}
              </button>
              <span className="mx-1 h-5 w-px bg-ink-700" />
              <IconButton label="Zoom in" onClick={() => api.current?.zoom(0.8)}>
                <ZoomIn className="h-4 w-4" />
              </IconButton>
              <IconButton label="Zoom out" onClick={() => api.current?.zoom(1.25)}>
                <ZoomOut className="h-4 w-4" />
              </IconButton>
              <IconButton label="Reset view" onClick={() => api.current?.reset()}>
                <RotateCcw className="h-4 w-4" />
              </IconButton>
              <IconButton label="Toggle auto-rotate" pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)}>
                <Sparkles className="h-4 w-4" />
              </IconButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-800 hover:text-white",
        pressed && "bg-ink-800 text-accent-soft"
      )}
    >
      {children}
    </button>
  );
}
