# MAP v5 — visual provenance

This revision separates proposed Muscat concept imagery, native 3D renders, supplied ride media and documentary geographic/Salalah sources. Public visibility does not transfer third-party rights or establish a municipal endorsement, land award, supplier selection or investment commitment.

## Generated Muscat illustrations

The built-in image generation tool created targeted edits of earlier project concept illustrations. Full-resolution PNG outputs are retained in `design/visuals/v5/generated/`; runtime derivatives are WebP files in `public/media/v5/`. No image-generation service is called by the website.

| Runtime file | Treatment and role |
| --- | --- |
| `dome.webp` | Generated hemisphere concept with a large Oman flag above its apex. |
| `promenade.webp` | Generated two-storey cafe promenade, shaded pedestrian route and flag-bearing hemisphere at its end. |
| `zone-city.webp` | Separate generated City Walk closeup, with the hemisphere flag visible. |
| `city.webp` | Generated Muscat family-destination context with the flag-bearing hemisphere. |
| `vision-aerial.webp` | Generated interpretation of the registered Blender composition, with perimeter planting and project flags. |
| `zone-parking.webp` | Latest owner-selected entrance/parking edit: flags, white G-Class vehicle facing counterclockwise along the roundabout, unobstructed road and flowering landscaped island. The superseded generated version is preserved outside the public repository. |
| `wheel-final.webp` | Generated finished 90 m concept wheel and Muscat park setting, used after the native construction animation. |

These are photorealistic **concept illustrations**, not photographs of an existing Muscat park. Their vehicles, visitors, planting, flag fabric and lighting are generated elements. The images do not certify object dimensions, flag artwork accuracy, road geometry or engineering feasibility. Exact emblem texture provenance applies to the native 3D model described below; generated flags remain artistic depictions.

The satellite frame is not generated. `media/v5/google-site.svg` carries the attributed Google capture and project-created zoning/road overlays. Read [site-source registration and attribution](v4-site/README.md). The Google logo and imagery-provider credit strip must remain visible.

## Native Blender model and renders

| Runtime file | Native source |
| --- | --- |
| `models/boomerang-v5.glb` and `media/v5/boomerang-render.webp` | Actual owner-supplied `WFC-20A.skp` geometry, converted with the native SketchUp C API, then prepared and rendered in Blender. |
| `models/muscat-park-v5.glb` | Editable `design/v5/muscat-park-v5.blend`, preserving the v4 parcel, zoning, road connection, camera and parking geometry. |
| `media/v5/model-aerial.webp` | Registered native Blender aerial, with v4 image-space anchors retained. |
| `media/v5/model-dome.webp` | Native hemisphere and pole/flag detail. |
| `media/v5/model-entrance.webp` | Native entrance flags and architecture detail. |

The Boomerang uses the actual supplied track, supports, train, station, materials and UVs. Its source mesh is retained in `design/v5/boomerang.blend` with four packed texture images and a reversible export LOD. The native source measures approximately 99.67 × 39.77 × 40.96 m; these are model dimensions, not independently certified manufacturer specifications. The wheel remains a separately authored **90 m concept wheel**. Read the [model handoff and validation](../design/v5/README.md).

V5 adds 122 authored, instanced perimeter palms and seven moving flags: one large Oman flag above the hemisphere, four Oman flags and two Russian flags at the entrance. Russian tricolours use material bands. Oman flags use the [Oman Foreign Ministry's official flag artwork](https://www.fm.gov.om/en/ministry/media/downloads/), packed into the model, including the emblem. The native cloth motion uses two authored morph targets per flag; it is a presentation effect, not a wind-load or fabric simulation.

These native renders are views of the concept model. Their source geometry is traceable and their scale is checked, but they are not documentary photographs or construction documents.

## Supplied Boomerang video

The owner supplied `boomerang-video.mp4`. Its untouched source remains outside the runtime export. `media/v5/boomerang-video.webm` is a proportional browser derivative: VP9/Opus, 1080 × 1920, 50 fps, stereo audio and all 730 frames. No crop or trim was applied. Content duration remains 14.600 seconds; the 14.621-second WebM container includes Opus padding. The final black frame exists in the source.

`boomerang-video-poster.webp` is the first frame of that supplied footage, not a generated scene. The video illustrates a ride experience and must not be presented as footage of the unbuilt Muscat proposal. The phone frame is website interface decoration.

## Salalah source and lighting interpretations

The project team supplied original DJI drone photographs of the actual Salalah wheel and coast. Selected source **0035** was developed from DNG through LibRaw at 5280 × 2970 with camera white balance, no automatic brightening and no crop or artistic retouch. Original source hashes remained unchanged. See [Salalah source research](v5-research.md).

Requested day, sunset and night variations are generated **lighting interpretations of this supplied photograph**. They are not three separately photographed documentary conditions and do not prove when the source was captured. They should retain the real wheel, coast and surrounding composition. Their final runtime derivatives use the `salalah-day.webp`, `salalah-sunset.webp` and `salalah-night.webp` names. All three derivatives are integrated at 1672 × 941 pixels. Their individual PNG production outputs are preserved in `design/visuals/v5/generated/`; matching WebP files are used at runtime. Source hashes and conversion receipts were checked during integration, and the project lead inspected each returned generation. Final slideshow playback is verified by the site publication workflow.

## Real reference photographs and runtime formats

The [reference catalogue](reference-research/README.md) contains separately credited real-world precedents. Those photographs are research references for parking, architecture, shading, attractions and water facilities; they do not show the proposed Muscat project. Source links and rights notes remain attached to each record.

New v5 runtime photographic/rendered illustrations use **WebP**; the supplied video uses **WebM**. SVG remains appropriate for the annotated geographic frame. Editable Blender and full-resolution production PNGs remain outside the static website export. Format conversion does not turn a generated image into a real photograph or remove source rights.

`npm run check:export` checks the actual built files, embedded model dependencies, animation clip names, WebP/WebM signatures, twelve Arabic chapters and the MAP v5 marker. Technical format checks supplement visual/source review; they do not establish a commercial licence, independent factual verification or in-room readability.
