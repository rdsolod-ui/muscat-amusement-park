# MAP v4 validation — 2 October 2026

## Build and assets

Native Windows Node24: Next production build and TypeScript passed. Static export:110files,48.7MB; no source CAD, transcripts, keys, environment files or source maps in the runtime artifact. Both GLBs are self-contained and have the required construction/rotation clips. Runtime park SHA matches the validated public model. Arabic UTF-8 regressions are guarded by the export check.

## Browser verification

Actual in-app Chromium checked the local production export:
- Eleven chapters, in order: family, place, site, rides, city-walk, character, water, indoor, comfort, city, land-request.
- 3840×2160 CSS viewport: all11 copyblocks end above the dock, zero overlap with their visual columns, no horizontal overflow. This is browser layout verification, not physical80-inch/6m venue acceptance.
- All5zonebuttons open their own image. Pins use separate satellite, model and generated-view coordinates.
- Masterplan samples:0/2.24/4.47seconds show satellite;6.69/8.92/11.14seconds show model;13.37/15.59seconds show vision. Each5-secondhold excludes the1.6-secondcrossfade. Automatic playback now also waits for all3images todecode.
- Updated3Dpark loaded and construction completed without JavaScript errors. Camera sizing corrected after visual review; finalfocusoccupancy80.6%, gentle±5-degree sway, manualrotation available. Long outer roadstubs may extend beyond frame; parcel, approach and existingjunction remain included.
- Wheel loaded with animated-model mode, completed allconstructionphases, and entered operation. Background shows the park and dryMuscatmountains. Bothconstruction and rotation clips have zero overlapping animated node/property channels.
- Pause/resume and reducedmotion checked. Reducedmotion uses final wheelposter.
- 390×844 CSSviewport: all11chapters withinwidth, no brokenvisibleimages or horizontaloverflow.
- No JavaScript errors in testedlocal scenarios. Existing upstream THREE.Clock deprecation warning remains.

## Sources and limits

See [Google registration](v4-site/README.md), [native Blender](../design/v4/README.md), [motion](v4-motion.md) and [generated visuals](v4-visuals.md).

Real-room readability and local Arabic editorial review remain unverified. Parcel/area/access are conceptual; site survey, drainage, traffic, supplier clearances and approvals remain necessary. Generatedviews are illustrative, while the SKP-derived Boom­erang mesh retains actual source scale.

Deployment evidence is maintained privately; it is not implied by this local validation report.
