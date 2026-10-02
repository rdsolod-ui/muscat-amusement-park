# MAP — v5 model and media handoff

This revision adds the separate actual-source Boomerang asset, seven moving flags and a denser perimeter palm belt. The v4 model, parcel, zone footprints, parking geometry, road connection and registered aerial camera remain preserved.

## Runtime assets

| Asset | Purpose | Verified properties |
| --- | --- | --- |
| `public/models/boomerang-v5.glb` | Standalone WFC-20A viewer | 5,126,608 bytes; 374,415 triangles; embedded textures; metre scale; no clips |
| `public/models/muscat-park-v5.glb` | Park viewer | 12,590,764 bytes; self-contained; three clips listed below |
| `public/media/v5/boomerang-render.webp` | Native Blender presentation render | Cycles, 48 samples, denoised, 1920 × 1200 |
| `public/media/v5/model-aerial.webp` | Registered park render | 1920 × 1200; v4 camera and anchor positions retained |
| `public/media/v5/model-dome.webp` | Hemisphere and Oman flag detail | Native Blender render, 1920 × 1200 |
| `public/media/v5/model-entrance.webp` | Entrance flags detail | Native Blender render, 1920 × 1200 |
| `public/media/v5/boomerang-video.webm` | Supplied video for the phone viewer | VP9/Opus; 1080 × 1920; 50 fps; 730 frames; stereo 48 kHz; 9,676,046 bytes |
| `public/media/v5/boomerang-video-poster.webp` | Video poster | First frame, same 9:16 aspect |

All paths are relative to the repository. Native render PNGs live in `design/visuals/v5`; generated images elsewhere in `public/media/v5` are separate assets owned by the site production workflow.

## Editable source and geometry provenance

- `boomerang.blend`: the actual `WFC-20A.skp` supplier geometry imported through the native SketchUp C API conversion. Full editable source mesh: 534,879 triangles, 40 material slots, four packed texture images and source UVs. A reversible 70% Decimate modifier creates the presentation/export LOD. No generic replacement track is substituted.
- Native source dimensions: **99.6700 × 39.7687 × 40.9633 m**. The web export height is 40.9576 m after LOD/quantization (5.7 mm difference). Dimensions reproduce source units and are not independently surveyed or certified ride specifications.
- Web deduplication removes redundant/unused slots, leaving 38 unique used materials and three unique used textures. Texture appearance is retained; editable source keeps all four original images.
- `muscat-park-v5.blend`: editable v4 park plus v5 additions. Wheel remains **90.0000 m** in Blender and 90.00006 m in GLB. Existing concept road, 1,000 parking bays, sixteen connected aisles, zone boundaries, entrance and hemisphere positions remain unchanged.
- `model-anchors.json`: five pin positions and road projection unchanged from v4, with the v5 image path. Pin projection uses the original 4 m anchor elevation; ground position is not silently substituted.

The park is a presentation/master-plan concept, not a cadastral, traffic, structural or ride-safety design.

## Flags and landscape

- One 12 × 6.858 m Oman flag on an 18 m pole above the hemisphere apex.
- Six entrance flags on 10 m poles: four Oman and two Russia flags, arranged symmetrically around the entrance.
- Oman cloth uses the [Oman Foreign Ministry official flag download](https://www.fm.gov.om/en/ministry/media/downloads/), with its original emblem and ratio, packed into Blender and GLB. Original image SHA-256: `9e86fbfc8f10223e5ffbdfba5601f3b53b0a80e960edc341e99768baecc71574`.
- Russia flags use three horizontal white/blue/red bands. Their web meshes intentionally need no texture UVs; their colours are materials.
- Every flag has two cloth morph targets. Native and web animation deform the cloth while its pole attachment remains fixed. These are authored presentation waves, not a wind-load simulation.
- 122 additional authored date-palm meshes are instanced along the retained perimeter, generally at 24 m intervals and inset from the edge. Existing palms are retained. Landscape spacing and irrigation remain concept decisions.

## Animation contract

| Clip | Duration | Channels | Playback |
| --- | --- | --- | --- |
| `Park_Construction` | 15 s | 9 | Once, then clamp at completion |
| `Wheel_Rotation` | 60 s | 37 | Gentle continuous rotation after construction |
| `Flags_Wind` | 4 s | 7 | Cloth morph loop after construction |

The GLB base pose is the complete park. Start construction explicitly at time zero. Pause/reduced-motion/offscreen rules belong to the site viewer. Flags use two morph weights, sampled at 0, 4/3, 8/3 and 4 seconds. The standalone Boomerang is static; bounded viewer camera orbit supplies inspection motion.

The Boomerang render camera is Blender `(123, -174, 98)` looking at `(0, 0, 19)`; the corresponding glTF Y-up camera direction ratio is `(0.707, 0.454, 1)`.

## Video preservation

The supplied `boomerang-video.mp4` remains untouched. Source SHA-256: `29c2040e0bc709e37ceded948bb04fd6573e9b68cf2a7e01744490ee35c1b492`.

Its original 2160 × 3840, 50 fps footage is downsampled proportionally to 1080 × 1920. All 730 frames and source audio are retained, with no crop or trim. Video content duration is 14.600 s. WebM container duration is 14.621 s because of Opus padding. The black final frame also exists in the source; it is not an encoding failure. First, middle and last frames were visually checked against the source. Output SHA-256: `899f89426aac431c15d5c5489d22e564dac27fbe3cb312b4963f2a8218b5fd1e`.

## Verification and reproducibility

- `native-validation.json`: Blender 5.2.1 LTS reopened both editable files, decoded packed textures, verified flags, measured dimensions and checked retained geometry hashes/camera/pins. The verification is read-only.
- `web-export-validation.json`: compressed and decoded glTF validation, zero errors and zero warnings for both GLBs. Informational messages include the unsupported-validator Meshopt extension and intentional non-power-of-two source textures.
- `web-model-validation.json`: decoded metre-scale bounds, wheel height, animation durations/channels, flag targets, embedded images and absence of absolute host paths.
- `video-validation.json`: actual ffprobe codec, aspect, frame count, duration, audio and source preservation.
- `park-additions.json` and `boomerang-source.json`: source provenance and additions inventory.

Scripts in `scripts/` use native Blender, glTF-Transform/Meshopt, Sharp and ffmpeg. `build_v5.py` accepts private native-output and original conversion directories after `--`; `export_web.cjs` accepts native-output and tooling directories; `encode_media.cjs` accepts the Sharp runtime module directory. `verify_native.py` derives repository paths; `verify_web.cjs` accepts the tooling module directory. Preserve the source geometry and work into a new revision when modifying these assets.

Native render/asset checks are complete. Actual browser interactions, publication and in-room readability are verified separately by the main site workflow.

## Static export release guard

`npm run check:export` validates the actual `out/` build, not the source directory. The v5 guard checks self-contained park/Boomerang/wheel GLBs, exact animation clip sets, seven flag morph channels, actual WFC-20A source marker and retained materials/textures. It inventories every v5 WebP and validates RIFF/WebP signatures, checks the WebM EBML header and bounded byte size, verifies the MAP v5 marker and all twelve Arabic chapter headings in order, and requires the final ASAAS / Vision 2040 proposal. It preserves the existing check against private/source files in the public export.

New v5 presentation photographs must use WebP and video must use WebM. Existing source-evidence JPEGs and the globe's technical mask are outside this new-photo guard. All three Salalah lighting variants are mandatory runtime assets and are included in this format audit. Publication workflow must separately verify the final photographic sequence.

The script syntax check passed. Run it after generating the current static build; a previous v4 `out/` correctly fails the v5 asset/chapter contract.
