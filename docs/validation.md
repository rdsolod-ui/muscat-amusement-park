# Validation — revision 3, 2 October 2026

## Website and visual checks

- Native Node.js 24.18.0; production static build, TypeScript and export validation pass. The existing Next.js/GSAP/Three.js stack is retained; animation needs no application backend.
- All eleven Salalah-format chapters remain, with an actual 3D Earth opening and the Muscat/Seeb geographic journey. Arabic is primary and right-aligned, with English beneath.
- At a 3840 × 2160 CSS viewport, all eleven chapters were measured: essential copy fits above the dock with no horizontal overflow. Arabic titles measure 122.88 px, Arabic main copy 76.8 px and English main copy 59.52 px where those roles apply. The longest checked parking panel ends at 1792.8 px, above the dock at 1976.53 px.
- Actual pixel inspection used 1280 × 720, including both themes, the updated plan, loaded 3D model, City Walk and final decision. The embedded browser's 4K raster capture showed compositor tiling, so that capture is not represented as a valid 4K visual proof. See [City Walk](v3-citywalk-tv.jpg) and [masterplan](v3-masterplan-tv.jpg).
- All eleven chapters were checked at 390 px mobile width with no horizontal overflow; full copy remains scrollable. The normal scroll layout and Present mode remain available.
- The final rides/water/dome containers use 16:10 proportions and contain the full illustration; the rides container measured 561.92 × 351.19 px at the 1280 px viewport.
- The model-derived plan → Blender render → generated vision sequence uses current v3 assets. Five zone selectors preserve source-versus-traced-area distinctions. The optional v3 GLB was visibly loaded and inspected while motion was paused.
- Eight generated images have unique hashes and one chapter owner each; no generated artwork is reused across chapters. [Visual manifest](../design/visuals/v3/visual-manifest.json).
- The reference catalogue contains 25 real photographs in nine groups. All 25 images loaded in the standalone catalogue; all nine filters and its mobile layout passed. The integrated rides gallery also loaded all five selected photographs. [Reference validation](reference-research/validation.json).
- No browser application errors in checked flows. The unchanged Three.js/R3F stack can emit a non-fatal THREE.Clock deprecation warning.
- Pause and static fallback were checked. In the final `?graphics=off` build, eleven chapters remained and zero WebGL canvases were created; 3D control was disabled. System reduced-motion behavior had passed the earlier integration checks; its logic was not changed by v3.
- An independent source review identified two issues, both repaired: specificity of the 16:10 scene rule and stale catalogue error state after retry. Impeccable typography detection returned no findings. This does not establish physical viewing-distance readability.

## Model and plan checks

- Editable `design/v3/muscat-park-v3.blend`: Blender 5.2.1, metres, 16 cameras, packed materials, no external texture dependencies or absolute workstation paths after portable reopen.
- Web GLB: 7,621,664 bytes, self-contained glTF 2.0 with meshopt compression, 667,827 triangles. Compressed and decoded validation returned zero errors and zero warnings.
- The observation wheel measures exactly 90.0 m in the editable scene and decoded browser export. This is a concept height, not a supplier-approved specification.
- Twenty-three locked meshes preserve the traced parcel/zones and parking geometry; 1,000 modelled parking spaces remain. All 13 new mesh groups were checked inside the traced outline. These checks do not validate setbacks, ride safety clearances or legal boundaries.
- The updated SVG is derived from current model footprints; public/design copies are identical, Arabic labels visually checked. Ten model renders have distinct hashes. [Delivery evidence](../design/v3/delivery-validation.json), [model notes](../design/v3/README.md).

## Scope and remaining validation

- 37 ha is the sum of original source labels; approximately 50.4 ha is the image-traced outline. Original parking was labelled 4 ha; the preserved traced parking footprint is approximately 6.2 ha. None is a cadastral or approved land balance.
- The expanded 90 m wheel/coaster/dome programme has no approved budget or funding. Phasing is a proposal; no low-CAPEX estimate is asserted.
- Engineering, traffic, utilities, hydrology, structural design, ride certification, official land rights and approvals remain unresolved. The model is a presentation concept, not a construction deliverable.
- Main declared walking routes have slatted pergolas and illustrative mist pipes/nozzles. Open plazas, ride safety envelopes and every possible informal pedestrian movement are not represented as fully covered.
- The Molniya DWG was not successfully imported into presentation geometry; the large coaster is authored concept geometry. No .3ds files were found in the supplied asset folder.
- Generated imagery expresses atmosphere and can differ from exact model geometry. Photo references show external precedents; their rights remain with their sources and availability depends on those sites.
- Final Omani Arabic editorial review and full-screen reading on the actual 80-inch TV from 6 m remain outstanding. The layout target is not a claim of room-tested readability.
- Public GitHub source publication is separate from deployment. CI produces an artifact only; no VPS release was performed or authorized by this revision.