# Validation — 2 October 2026

## Verified

- Native Node.js 24.18.0, isolated dependency installation; Next.js production static export and TypeScript pass.
- Eleven sections match the reference sequence, beginning with an actual 3D Earth and a smooth journey to Muscat/Seeb. Terrain reaches the 55-degree site perspective using the Muscat-specific satellite and DEM data.
- Desktop 1280×720 presentation: sections, navigation, right-aligned Arabic/English pairs, dark/light themes, source and chapter dialogs, and five masterplan selectors checked. No missing visible images or horizontal overflow.
- Mobile 390px layout: all eleven chapters checked for horizontal overflow; Earth and geography move into mobile slots. The page remains scrollable for complete copy and imagery.
- Reduced motion brings geography directly to its final state. `?graphics=off` uses static Earth/geography and disables the optional 3D control. No WebGL canvases remain in that fallback test.
- The GLB loads with global motion paused. Whole-site framing uses actual transformed vertices, and the camera near plane adapts to distance to preserve separation between ground, paths and water. The visible model was inspected after these fixes.
- Supplied ride geometry is combined with authored concept buildings, water and landscape. The browser GLB is self-contained glTF 2.0 with meshopt compression. Original ride sources are not republished as loose CAD assets.
- Source diagram preserves the supplied zone arrangement and outline. The public SVG removes the original screenshot background and provides Arabic-first labels. The Blender source reopens with packed materials and no external path dependencies.
- No application errors in the checked browser flows. The installed Three.js/R3F stack emits a non-fatal `THREE.Clock` deprecation warning.
- CI builds and retains a static artifact only. It contains no VPS credentials or deployment action.

## Scope and remaining validation

- 37 ha is the sum of supplied programme labels. Approximately 50.4 ha is the image-traced outline, not a cadastral boundary or confirmed buildable area. Official land rights, drainage, roads, utilities and feasibility remain to be established.
- 1,000 parking spaces is a concept programme target; traffic, dimensions and access require engineering validation.
- Lower initial CAPEX is a design objective, not a priced estimate. Phase dates, funding, partnerships and municipal approvals are not confirmed.
- Generated imagery expresses atmosphere and is not evidence of construction or engineering geometry. Final Omani Arabic editorial and real meeting-room checks remain outstanding.
- The supplied Molniya DWG was not successfully converted into presentation geometry. It is not represented as an imported ride in this concept. There were no `.3ds` files in the inspected supplied folder.
- Static site files and public GitHub publication are separate from deployment. No VPS release was performed; it requires a separate instruction from the owner.
