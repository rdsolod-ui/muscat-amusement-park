# Muscat park — concept model v3

This revision implements the current brief in editable geometry. It is a presentation concept, not a construction design, approved ride design or municipal consent.

## Deliverables

- `muscat-park-v3.blend`: editable Blender 5.2.1 scene, metres, 16 cameras (10 new v3 views), two packed texture images.
- `../../public/models/muscat-park-v3.glb`: optimized web mesh, 7.62 MB, Meshopt decoder required.
- `masterplan-v3.svg`: Arabic/English schematic derived from actual scene footprints, the locked parcel and parking coordinates. The matching public copy is `../../public/media/masterplan-v3.svg`.
- `../visuals/v3/`: ten distinct model renders: top, aerial, promenade, rides, water, parking, approach, entrance, dome and pergola.
- `scene-manifest.json`: units, local georeference, camera positions, programme, route geometry and mesh counts. `delivery-validation.json` records delivered file hashes.

Paths above are relative to this directory. The previous `../muscat-park.blend` remains unchanged as the rebuild input. No satellite raster or source CAD is included in the new scene.

## What changed

The authored observation wheel measures exactly 90 m from the lowest geometry to the highest cabin. The new large coaster is a spatial concept with approximately 818 m of centreline, not a successful import of the supplied Molniya DWG. The earlier source-derived Condor, drop tower, Typhoon and chain carousel remain in the park. Additional authored family carousel forms and two arcade pavilions complete the concept.

Fourteen two-storey pavilions include retail, cafes, family indoor games, arcade halls and the beach club. Their original facade geometry uses narrow frontage modules, shop windows, upper arches, pilasters, cornices and stepped gables. The visual research reference was the Dream Island facade contractor's project photographs: <https://ms31.ru/fasadnyj-dekor/decor-ostrov-mechty.php>. No reference photograph is used as a texture.

A hemispherical family venue terminates the promenade. Its model shell is 68 m in diameter; the podium is 74 m. Laser tag and a performance venue are proposed uses, with a modelled outdoor stage and seating forecourt. Room planning, occupancy and acoustics remain undeveloped.

The water zone includes a proposed wave pool, six flumes, a children's pool, beach club, loungers, umbrellas and a separate lounge pool. Wave crests, mist and ride systems are illustrative geometry or atmosphere, not simulated engineering.

Every declared main walking route in the model has an open-louvre pergola with fine-mist pipes and nozzles. Louvres have visible gaps. Open plazas, ride safety envelopes and all possible informal walking areas have not been represented as fully covered. The parking and roundabout approach retain their original geometric arrangement; shade and arrival elements are added above it.

## Evidence and limits

- `portable-validation.json`: reopened the scene from another directory; both packed images decoded, no external dependencies or absolute host paths found, metres retained.
- `web-export-validation.json`: compressed and decoded glTF validation both returned zero errors and zero warnings. Informational items identify one non-power-of-two texture and small degenerate faces inherited from the concept geometry. This is not a manufacturing mesh certification.
- `web-model-validation.json`: measured the optimized wheel at 90 m, checked opaque water material, embedded images and exported bounds.
- `parcel-fit-validation.json`: all vertices of 13 new mesh groups project within the image-traced parcel with 0.05 m numerical tolerance. Five major object hulls also have zero area outside that outline. This does not establish legal boundaries, setbacks, safe ride envelopes or buildability.
- Exact mesh hashes preserve the parcel, five zones, parking bays/cars and 16 parking aisle meshes: 23 locked objects. The parking register remains 1,000 spaces, including the earlier 100-staff-space planning assumption. Access, accessible bays, traffic and emergency design require local review.
- The five original area labels total 37 ha and remain briefing targets, not measured zone totals. The image-traced gross site is approximately 50.4 ha; it is not cadastral evidence.
- Survey, drainage, flooding, utilities, structural design, ride certification and approvals remain unresolved. Phasing is proposed. No low-CAPEX or approved budget claim is made.
- All ten rendered cameras and the final SVG were visually checked. Browser integration is verified separately in the website workflow.

## Rebuild

Use Blender 5.2.1 or a verified compatible version. Scripts derive the repository root from their own locations and contain no developer-specific filesystem paths. Rebuild into a working copy if preserving hand edits: the generator writes the v3 outputs.

```text
blender --background --factory-startup --python design/v3/scripts/build_scene.py
blender --background --factory-startup --python design/v3/scripts/verify_scene.py
python design/v3/scripts/make_masterplan.py
node design/v3/scripts/optimize_web.cjs design/v3/muscat-park-v3-raw.glb public/models/muscat-park-v3.glb <tooling-node_modules>
node design/v3/scripts/verify_export.cjs public/models/muscat-park-v3.glb <tooling-node_modules>
```

The SVG generator needs Shapely. The Node tools were verified with glTF Transform 4.5, meshoptimizer 1.3 and gltf-validator 2. The Blender generator also accepts a raw-export path after `--`. Raw GLB, coordinate dumps, bytecode and Blender backups are ignored; they remain local and can be regenerated. The build writes the ten renders after saving and exporting the model. Keep editable `.blend`, raw mesh and optimized web export separate.
