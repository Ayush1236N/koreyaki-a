# 3D model assets

Drop a GLB file here to replace a dish's procedural build view with a real model.

## How to attach a model to a dish

1. Save the file as `<dish-slug>.glb` (e.g. `katsu-ramen.glb`), binary glTF 2.0.
2. Edit `src/lib/model-configs.ts` and set `modelUrl` on that dish:

   ```ts
   "katsu-ramen": {
     menuItemSlug: "katsu-ramen",
     modelUrl: "/models/katsu-ramen.glb",
     ...
   }
   ```

3. List the model's meshes in `components` in the same order they should appear
   in the parts inspector. The `label` fields are shown to the customer; each
   mesh becomes an explodable part. Components beyond the list get generic labels.

If the file is missing or fails to load, the viewer falls back to the procedural
build view, so ordering is never blocked.

## Licensing

Only add models you own or that are licensed for commercial use (CC0, CC-BY with
attribution, or a purchased asset). Record the licence and author in the dish's
`licenseInfo` field when the registry moves into the database.
