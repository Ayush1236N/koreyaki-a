import { MODEL_CONFIGS } from "./model-configs";
import type { ModelConfig } from "./types";

/*
  Central lookup for build views. A dish with no entry returns null and the UI
  falls back to its photo, so the 3D layer never blocks ordering.

  To attach a real model: drop the GLB in /public/models/<slug>.glb and set
  modelUrl on that dish's entry in model-configs.ts. The viewer loads the file
  and uses its own meshes as the explodable parts, keeping the registry labels.
*/
export function getModelConfig(slug: string): ModelConfig | null {
  return MODEL_CONFIGS[slug] ?? null;
}

export function hasBuildView(slug: string): boolean {
  return getModelConfig(slug) !== null;
}

/** True when a registered GLB is used instead of the procedural build. */
export function hasRealModel(slug: string): boolean {
  return !!getModelConfig(slug)?.modelUrl;
}
