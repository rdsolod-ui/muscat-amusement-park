# Muscat Amusement Park — Blender v4

Editable scene: `muscat-park-v4.blend`. Units: metres; Blender Z-up. The web exports are glTF Y-up, with X=easting, Z=-northing. Original v3 scene, original parcel/zone polygons, 1,000 parking bays and all 16 parking aisle meshes are retained unchanged.

## Supplied ride source

The Boomerang is the actual **WFC-20A.skp** geometry, converted with native SketchUp C API: 534,879 triangles, 1,180 traversed source instances, 40 materials, four textures and no conversion errors. Source SHA is recorded in `native-coaster-audit.json`. Its native scale is 99.670 × 39.769 × 40.963 m. Source triangles remain in the editable scene; a reversible 0.55 Decimate modifier produces the display LOD. There is no surrogate coaster mesh.

The placement centre is original source-image pixel (422,427). Its full XY source bounding box lies in the rides zone and does not intersect the declared pergola corridors; the nearest canopy edge is 10.73 m away. This checks the concept drawing only; supplier operating envelopes and statutory clearances are not validated.

The wheel remains an **authored 90 m concept**, as confirmed by the user. The supplied filename referring to 50 m is not relabelled as a certified 90 m engineering source. There are 36 individually parented cabins with counter-rotation.

## v4 architecture and access

- Entrance loggia, ticket/support buildings, gates, shopfront identity and furniture.
- Two-storey promenade façades, upper arched openings, cornices, balconies, stripe awnings and cafe terraces.
- Open-slat pergolas and physical fine-mist pipes/nozzles; no thermal or hygiene performance claim.
- Hemisphere venue with panel joints, glazing and entry details; concert/laser-tag programme remains conceptual.
- Actual northern road junction (source pixel 1035,164) is distinguished from the proposed internal roundabout (945,383). A continuous geometric approach joins the preserved parking-aisle network. Widths and access approvals remain unverified.

## Animation contracts

`public/models/muscat-park-v4.glb`:
- `Park_Construction`: 15 seconds, 9 transform channels. Final pose at 15 seconds.
- `Wheel_Rotation`: 60-second seamless loop, 37 channels (rotor plus level cabins).

`public/models/muscat-wheel-v4.glb`:
- `Wheel_Construction`: 15 seconds — foundations 0–2, supports 2–5, rim 5–8, spokes 8–10.5, cabins 10.5–14, final hold to15.
- `Wheel_Rotation`: same loop.

These are presentation reveals, not construction methods, engineering schedules or operating speeds. Architectural reveal is vertical so footprints stay fixed. The web viewer can gently orbit the complete scene after construction; it must stop offscreen, paused or with reduced motion.

Blender timeline: construction frames1–361 at24fps, then one wheel revolution through frame1801. Saved scene opens at the complete pose. Blender individual actions remain editable; `export_animated.cjs` aggregates equivalent transforms into the named web clips, corrects the static export rest pose, deduplicates and applies meshopt compression. A meshopt decoder is required.

## Camera and images

The fixed aerial is 1920×1200 (16:10), including the full concept parcel and the existing northern junction. `model-anchors.json` gives five camera-projected pins as percentages (`x`,`y`), not Google-map screen positions. Keep camera/framing unchanged when generating the corresponding architectural vision.

`design/visuals/v4/model-*.png` contains distinct aerial, entrance, promenade, dome, rides and water views. `wheel-poster.png` is transparent. Browser versions are encoded to `public/media/v4/*.webp`.

## Reproduction

Run the native Blender executable in an isolated background process; never use the user's open scene. `scripts/build_scene.py -- <private-working-folder>` reads the preserved v3 scene and the private native conversion `boomerang-wfc20a.glb`. Do not publish the original CAD files or private conversion receipts. Then run:

```
node design/v4/scripts/export_animated.cjs <private-working-folder> <gltf-tooling-node_modules>
node design/v4/scripts/verify_export.cjs <gltf-tooling-node_modules>
node design/v4/scripts/encode-media.cjs <sharp-node_modules>
```

`verify_scene.py` reopens the saved scene, checks metric scale/90 m height/packed decoded textures/unchanged parcel and parking, and renders construction proof frames. `verify_coaster_fit.py <python-dependency-folder>` checks the actual-size coaster footprint against the retained zone/pergola network.

## Actual validation

- Native Blender5.2.1: scene reopens; 90.0 m wheel; six packed images decode; zero external libraries; original v3 hash unchanged.
- Decoded GLB: wheel height90.000062 m after quantization; clips15s/60s; no external image URLs or host paths.
- glTF validator: **0 errors and0 warnings**, both compressed and decoded exports. Informational diagnostics record retained source texture sizes and minor degenerate triangles in authored label/dome geometry; these are not hidden.
- Boomerang, entrance, dome, aerial and wheel poster visually inspected. Browser animation/runtime checks are performed by the website integration work.

The model is a municipal discussion/presentation concept. It is not a surveyed, cadastral, structural, ride-safety, hydraulic or construction-ready design.
