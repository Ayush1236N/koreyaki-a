import type { ModelConfig } from "./types";

/*
  ASSET REGISTRY — one entry per dish.

  modelUrl: point this at a real GLB in /public/models to use a scanned or
  commissioned model, e.g. modelUrl: "/models/katsu-ramen.glb". When set, the
  viewer loads that file and explodes its own meshes; if the file is missing or
  fails to load it silently falls back to the procedural build below, so the
  3D view never blocks ordering.

  Components below drive the procedural build view. Each entry is a separate
  3D group, so exploding, selecting and hiding are genuine per-part operations.
  Positions are in metres-ish scene units; explodedPosition is where the part
  travels to when the dish is pulled apart.

  To add a dish: drop its GLB in /public/models, set modelUrl, and keep
  `components` as the label list for the part inspector.
*/

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "katsu-ramen": {
    menuItemSlug: "katsu-ramen",
    modelUrl: null,
    cameraPosition: [0.2, 2.6, 4.6],
    cameraTarget: [0, 0.25, 0],
    minDistance: 2.2,
    maxDistance: 9,
    explodedDistance: 1.3,
    components: [
      { id: "bowl", label: "Ceramic bowl", position: [0, 0, 0], explodedPosition: [0, -1.6, 0], color: "#241a16" },
      { id: "broth", label: "Slow-simmered broth", position: [0, 0.12, 0], explodedPosition: [-2.6, 0.1, 0.2], color: "#a86a2c" },
      { id: "noodles", label: "Fresh ramen noodles", position: [0, 0.16, 0], explodedPosition: [2.6, 0.2, 0.2], color: "#e8c98a" },
      { id: "katsu", label: "Crispy katsu cutlet", position: [0, 0.34, -0.28], explodedPosition: [0, 2.3, -1.2], color: "#c98b3a" },
      { id: "egg", label: "Soft-boiled egg", position: [0.62, 0.3, 0.34], explodedPosition: [2.3, 1.5, 1.2], color: "#f6b03c" },
      { id: "corn", label: "Sweet corn", position: [-0.55, 0.26, 0.36], explodedPosition: [-2.3, 1.4, 1.3], color: "#f2c53d" },
      { id: "scallion", label: "Scallions", position: [-0.2, 0.3, -0.15], explodedPosition: [-2.4, 2.0, -1.1], color: "#5f8f3a", optional: true },
      { id: "nori", label: "Nori sheet", position: [0.78, 0.42, -0.2], explodedPosition: [2.5, 2.2, -1.3], color: "#16210f", optional: true },
      { id: "chopsticks", label: "Chopsticks", position: [0, 0.34, 0.5], explodedPosition: [0, 2.6, 2.1], color: "#a5763f" },
    ],
  },
  "korean-ramen": {
    menuItemSlug: "korean-ramen",
    modelUrl: null,
    cameraPosition: [0.2, 2.6, 4.6],
    cameraTarget: [0, 0.25, 0],
    minDistance: 2.2,
    maxDistance: 9,
    explodedDistance: 1.3,
    components: [
      { id: "bowl", label: "Ceramic bowl", position: [0, 0, 0], explodedPosition: [0, -1.6, 0], color: "#241a16" },
      { id: "broth", label: "Korean-style broth", position: [0, 0.12, 0], explodedPosition: [-2.6, 0.1, 0.2], color: "#b8531f" },
      { id: "noodles", label: "Ramen noodles", position: [0, 0.16, 0], explodedPosition: [2.6, 0.2, 0.2], color: "#e8c98a" },
      { id: "egg", label: "Soft-boiled egg", position: [0.6, 0.3, 0.3], explodedPosition: [2.3, 1.5, 1.2], color: "#f6b03c" },
      { id: "scallion", label: "Scallions", position: [-0.25, 0.3, -0.1], explodedPosition: [-2.4, 2.0, -1.1], color: "#5f8f3a" },
      { id: "kimchi", label: "Kimchi", position: [-0.55, 0.26, 0.32], explodedPosition: [-2.3, 1.4, 1.3], color: "#b8301d" },
      { id: "chopsticks", label: "Chopsticks", position: [0, 0.34, 0.5], explodedPosition: [0, 2.6, 2.1], color: "#a5763f" },
    ],
  },
  "kimchi-fried-rice": {
    menuItemSlug: "kimchi-fried-rice",
    modelUrl: null,
    cameraPosition: [0.3, 2.4, 4.4],
    cameraTarget: [0, 0.25, 0],
    minDistance: 2.2,
    maxDistance: 8.5,
    explodedDistance: 1.2,
    components: [
      { id: "bowl", label: "Stone bowl", position: [0, 0, 0], explodedPosition: [0, -1.5, 0], color: "#2b211c" },
      { id: "rice", label: "Kimchi fried rice", position: [0, 0.2, 0], explodedPosition: [-2.4, 0.2, 0.2], color: "#c85a24" },
      { id: "kimchi", label: "Fermented kimchi", position: [0, 0.42, 0.34], explodedPosition: [2.4, 1.0, 0.8], color: "#a92c19" },
      { id: "egg", label: "Fried egg", position: [0, 0.46, -0.08], explodedPosition: [0, 2.2, -0.2], color: "#f7d64a" },
      { id: "seaweed", label: "Seaweed flakes", position: [0.3, 0.5, 0.16], explodedPosition: [2.5, 1.9, -1], color: "#1b2618", optional: true },
      { id: "sesame", label: "Toasted sesame", position: [-0.2, 0.52, -0.1], explodedPosition: [-2.5, 2.0, -0.9], color: "#e6d3a6" },
    ],
  },
  "korean-fried-chicken": {
    menuItemSlug: "korean-fried-chicken",
    modelUrl: null,
    cameraPosition: [0.4, 2.4, 4.2],
    cameraTarget: [0, 0.2, 0],
    minDistance: 2,
    maxDistance: 8,
    explodedDistance: 1.2,
    components: [
      { id: "plate", label: "Serving plate", position: [0, 0, 0], explodedPosition: [0, -1.4, 0], color: "#1f1a18" },
      { id: "chicken", label: "Glazed fried chicken", position: [0, 0.24, 0], explodedPosition: [-2.2, 0.5, 0.9], color: "#a8331f" },
      { id: "glaze", label: "Yangnyeom glaze", position: [0, 0.36, 0], explodedPosition: [2.2, 0.9, -0.5], color: "#8f1f12", optional: true },
      { id: "sesame", label: "Sesame & scallions", position: [0, 0.44, 0], explodedPosition: [0, 2.3, -1.2], color: "#f0e2bc" },
      { id: "pickled-radish", label: "Pickled radish", position: [-1.25, 0.1, -0.65], explodedPosition: [-2.6, 0.3, -1.9], color: "#f5e7d0", optional: true },
      { id: "chopsticks", label: "Chopsticks", position: [0, 0.24, 0.6], explodedPosition: [2.4, 2.0, 1.6], color: "#a5763f" },
    ],
  },
  "bao-buns": {
    menuItemSlug: "bao-buns",
    modelUrl: null,
    cameraPosition: [0.4, 2.2, 3.8],
    cameraTarget: [0, 0.28, 0],
    minDistance: 1.9,
    maxDistance: 7.5,
    explodedDistance: 1.1,
    components: [
      { id: "steamer", label: "Bamboo steamer", position: [0, 0, 0], explodedPosition: [0, -1.4, 0], color: "#b0803f" },
      { id: "bao1-bottom", label: "Bao shell (lower)", position: [-0.48, 0.28, 0.12], explodedPosition: [-1.6, 0.3, 0.4], color: "#f7efe0" },
      { id: "bao1-filling", label: "Teriyaki filling", position: [-0.48, 0.44, 0.12], explodedPosition: [-1.6, 1.6, 0.5], color: "#6b3216" },
      { id: "bao1-top", label: "Bao shell (upper)", position: [-0.48, 0.6, 0.12], explodedPosition: [-1.6, 2.7, 0.4], color: "#fdf6ea" },
      { id: "bao2-bottom", label: "Bao shell (lower)", position: [0.5, 0.28, -0.14], explodedPosition: [1.6, 0.3, -0.4], color: "#f7efe0" },
      { id: "bao2-filling", label: "Teriyaki filling", position: [0.5, 0.44, -0.14], explodedPosition: [1.6, 1.6, -0.5], color: "#6b3216" },
      { id: "bao2-top", label: "Bao shell (upper)", position: [0.5, 0.6, -0.14], explodedPosition: [1.6, 2.7, -0.4], color: "#fdf6ea" },
      { id: "scallion", label: "Scallion garnish", position: [0, 0.62, 0], explodedPosition: [0, 2.9, 1.6], color: "#5f8f3a", optional: true },
    ],
  },
  tteokbokki: {
    menuItemSlug: "tteokbokki",
    modelUrl: null,
    cameraPosition: [0.2, 2.4, 4.2],
    cameraTarget: [0, 0.22, 0],
    minDistance: 2,
    maxDistance: 8,
    explodedDistance: 1.2,
    components: [
      { id: "bowl", label: "Serving bowl", position: [0, 0, 0], explodedPosition: [0, -1.5, 0], color: "#1d1917" },
      { id: "sauce", label: "Gochujang sauce", position: [0, 0.12, 0], explodedPosition: [-2.4, 0.1, 0.2], color: "#c0331d" },
      { id: "rice-cakes", label: "Rice cakes", position: [0, 0.24, 0], explodedPosition: [0, 1.0, 0.3], color: "#f4e8d2" },
      { id: "fish-cakes", label: "Fish cakes", position: [0.3, 0.3, 0.1], explodedPosition: [2.4, 1.4, 0.7], color: "#c98a5e", optional: true },
      { id: "egg", label: "Boiled egg", position: [-0.5, 0.28, -0.08], explodedPosition: [-2.4, 1.5, -0.8], color: "#f7f0dd", optional: true },
      { id: "scallion", label: "Scallions", position: [0.1, 0.36, -0.2], explodedPosition: [0.2, 2.4, -1.4], color: "#5f8f3a" },
      { id: "sesame", label: "Sesame seeds", position: [-0.2, 0.38, 0.2], explodedPosition: [2.5, 2.2, -1.2], color: "#efe0b8" },
    ],
  },
  dumplings: {
    menuItemSlug: "dumplings",
    modelUrl: null,
    cameraPosition: [0.4, 2.2, 3.8],
    cameraTarget: [0, 0.26, 0],
    minDistance: 1.9,
    maxDistance: 7.5,
    explodedDistance: 1.1,
    components: [
      { id: "steamer", label: "Bamboo steamer", position: [0, 0, 0], explodedPosition: [0, -1.3, 0], color: "#b0803f" },
      { id: "paper", label: "Parchment liner", position: [0, 0.2, 0], explodedPosition: [0, -0.4, 0], color: "#efe6d2" },
      { id: "dumpling-1", label: "Steamed dumpling", position: [-0.45, 0.34, 0], explodedPosition: [-1.9, 0.9, 0.2], color: "#f6ecdb" },
      { id: "dumpling-2", label: "Steamed dumpling", position: [0.45, 0.34, 0], explodedPosition: [1.9, 0.9, 0.2], color: "#f6ecdb" },
      { id: "dumpling-3", label: "Steamed dumpling", position: [0, 0.34, 0.48], explodedPosition: [0, 0.9, 2.1], color: "#f6ecdb" },
      { id: "dumpling-4", label: "Steamed dumpling", position: [0, 0.34, -0.48], explodedPosition: [0, 0.9, -2.1], color: "#f6ecdb" },
      { id: "dip", label: "Soy-vinegar dip", position: [-1.15, 0.12, -0.6], explodedPosition: [-2.6, 0.3, -2], color: "#3a2412", optional: true },
    ],
  },
  "corn-dogs": {
    menuItemSlug: "corn-dogs",
    modelUrl: null,
    cameraPosition: [0.5, 2, 3.6],
    cameraTarget: [0, 0.55, 0],
    minDistance: 1.6,
    maxDistance: 6.5,
    explodedDistance: 1.1,
    components: [
      { id: "board", label: "Wooden board", position: [0, 0, 0], explodedPosition: [0, -1.3, 0], color: "#7d5630" },
      { id: "stick", label: "Wooden skewer", position: [0, 0, 0], explodedPosition: [0, -1.2, 2], color: "#c9a06a" },
      { id: "batter", label: "Fried batter", position: [0, 0.62, 0], explodedPosition: [0, 0.4, 0], color: "#e0a23a" },
      { id: "sausage", label: "Sausage", position: [0, 0.42, 0], explodedPosition: [-2.1, 0.6, -0.3], color: "#b04a33" },
      { id: "sugar-ketchup", label: "Sugar & ketchup", position: [0, 0.72, 0], explodedPosition: [0, 2.4, 0.6], color: "#d0362a", optional: true },
      { id: "mustard", label: "Honey mustard", position: [0.1, 0.74, 0.06], explodedPosition: [2.2, 2.2, 1.2], color: "#e0b13a", optional: true },
    ],
  },
  kimbap: {
    menuItemSlug: "kimbap",
    modelUrl: null,
    cameraPosition: [0.5, 2.2, 3.9],
    cameraTarget: [0, 0.18, 0],
    minDistance: 1.9,
    maxDistance: 7.5,
    explodedDistance: 1.1,
    components: [
      { id: "plate", label: "Serving plate", position: [0, 0, 0], explodedPosition: [0, -1.4, 0], color: "#231d1a" },
      { id: "kimbap-nori", label: "Seaweed wrap", position: [0, 0.18, 0], explodedPosition: [0, 0.3, -2.2], color: "#16200f" },
      { id: "kimbap-rice", label: "Seasoned rice", position: [0, 0.18, 0], explodedPosition: [-2.4, 0.3, 0.2], color: "#f6f0e0" },
      { id: "kimbap-filling", label: "Vegetable filling", position: [0, 0.18, 0], explodedPosition: [2.4, 0.5, 0.3], color: "#e07a24" },
      { id: "pickled-radish", label: "Pickled radish", position: [-0.95, 0.14, -0.5], explodedPosition: [-2.4, 0.9, -1.6], color: "#f0d24a", optional: true },
      { id: "egg-strip", label: "Egg strips", position: [0.9, 0.16, -0.4], explodedPosition: [2.4, 1.2, -1.5], color: "#f2c94c", optional: true },
    ],
  },
  "boba-tea": {
    menuItemSlug: "boba-tea",
    modelUrl: null,
    cameraPosition: [0.4, 1.6, 3.1],
    cameraTarget: [0, 0.5, 0],
    minDistance: 1.6,
    maxDistance: 6.5,
    explodedDistance: 1,
    components: [
      { id: "cup", label: "Clear cup", position: [0, 0, 0], explodedPosition: [-2, -0.4, 0], color: "#dff0f2" },
      { id: "pearls", label: "Tapioca pearls", position: [0, 0, 0], explodedPosition: [-2, -1.3, 0.9], color: "#2a170e" },
      { id: "tea", label: "Milk tea", position: [0, 0.1, 0], explodedPosition: [0, 0.3, 1.9], color: "#b98c5e" },
      { id: "lid", label: "Sealed lid", position: [0, 0.72, 0], explodedPosition: [2.1, 1.9, 0], color: "#efe9dc" },
      { id: "straw", label: "Wide straw", position: [0.2, 0.45, 0.06], explodedPosition: [2.6, 0.5, -0.8], color: "#d0453a" },
    ],
  },
  "milkshake-boba": {
    menuItemSlug: "milkshake-boba",
    modelUrl: null,
    cameraPosition: [0.4, 1.6, 3.1],
    cameraTarget: [0, 0.5, 0],
    minDistance: 1.6,
    maxDistance: 6.5,
    explodedDistance: 1,
    components: [
      { id: "cup", label: "Clear cup", position: [0, 0, 0], explodedPosition: [-2, -0.4, 0], color: "#dff0f2" },
      { id: "pearls", label: "Tapioca pearls", position: [0, 0, 0], explodedPosition: [-2, -1.3, 0.9], color: "#2a170e" },
      { id: "tea", label: "Chocolate milkshake", position: [0, 0.1, 0], explodedPosition: [0, 0.3, 1.9], color: "#8a5a3a" },
      { id: "whipped-cream", label: "Whipped cream", position: [0, 0.8, 0], explodedPosition: [0, 2.4, 0], color: "#fbf6ec" },
      { id: "drizzle", label: "Chocolate drizzle", position: [0, 0.9, 0], explodedPosition: [2.2, 2.3, -0.6], color: "#4a2a17", optional: true },
      { id: "straw", label: "Wide straw", position: [0.2, 0.5, 0.06], explodedPosition: [2.6, 0.5, -0.9], color: "#3a3a3a" },
    ],
  },
  "fizzy-boba": {
    menuItemSlug: "fizzy-boba",
    modelUrl: null,
    cameraPosition: [0.4, 1.6, 3.1],
    cameraTarget: [0, 0.5, 0],
    minDistance: 1.6,
    maxDistance: 6.5,
    explodedDistance: 1,
    components: [
      { id: "cup", label: "Clear cup", position: [0, 0, 0], explodedPosition: [-2, -0.4, 0], color: "#dff0f2" },
      { id: "pearls", label: "Popping boba", position: [0, 0, 0], explodedPosition: [-2, -1.3, 0.9], color: "#c04a63" },
      { id: "tea", label: "Sparkling fruit soda", position: [0, 0.1, 0], explodedPosition: [0, 0.3, 1.9], color: "#e8899b" },
      { id: "ice", label: "Ice cubes", position: [0, 0.45, 0], explodedPosition: [2.2, 1.5, 0.7], color: "#d8eef2" },
      { id: "lime", label: "Lime slice", position: [-0.3, 0.66, 0.1], explodedPosition: [-2.2, 2.1, 0.8], color: "#7fbf4a", optional: true },
      { id: "straw", label: "Wide straw", position: [0.2, 0.5, 0.06], explodedPosition: [2.6, 0.5, -0.9], color: "#3aa0b8" },
    ],
  },
};
