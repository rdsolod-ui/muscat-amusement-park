# Asset provenance



The project distinguishes concept imagery, geographic context and operational claims.



| Asset group | Provenance and treatment |

|---|---|

| `design/muscat-park.blend`, `public/models/muscat-park.glb` | Project-created concept scene. The GLB is a browser-optimised derivative, not a CAD/construction deliverable. The public Blender file packs its material resources and contains no satellite context raster. The original private context scene remains separate; third-party material rights continue to apply. |

| `design/visuals/*.png`, matching `public/media/*vision.webp` | Generated concept illustrations prepared for this project. They show an intended atmosphere, not documentary photographs or engineering dimensions. |

| Other park renders in `public/media/` | Rendered project concept geometry. No claim of completed construction. |

| `public/media/source-masterplan-diagram.svg` | Project-created vector redraw of the project-owner-supplied composition, without its embedded map screenshot. Original labels total 37 ha; the traced image extent is approximately 50.4 ha and is not a cadastral survey. This source diagram is not a building footprint or a certified land balance. |

| `public/media/site-evidence.svg` and any local satellite context | Geographic reference includes third-party basemap imagery. Keep provider attribution; no open-data or unrestricted redistribution licence is asserted. Esri static map guidance: https://doc.arcgis.com/en/arcgis-online/reference/static-maps.htm . Keep imagery-provider credits on or beside each relevant visual. |

| Earth imagery in `public/textures/earth-v2/` | Historical NASA composites, with per-image source/credit/output hashes in `sources.json`. Illustrative lighting and cloud movement; not live weather. No NASA endorsement. |

| Muscat satellite and terrain in `public/data/geography/` | Site-centred Esri World Imagery and Copernicus DEM, with attribution and source details in `credits.html` and `sources.json`. Real regional context; the parcel remains an image-traced proposal, not an official survey. |
| Natural Earth geography | Public-domain geographic context; see `public/licenses/Natural-Earth.txt`. Boundaries are illustrative, not authoritative project land limits. |

| Fonts | Aref Ruqaa and IBM Plex families, self-hosted under their SIL Open Font License notices in `public/licenses/`. |

| Poly Haven materials | Source texture/HDR resources are covered by the retained Poly Haven notice. Packing a resource does not remove its provenance. |



Arabic copy is a working bilingual project text; local Omani editorial review remains separate. Do not interpret country references, a national flag or a policy citation as project endorsement, an awarded plot, confirmed investment or an operating licence.



This file is a public provenance summary. Private transcripts, research evidence logs, deployment receipts and local workstation details are intentionally not included.



Detailed scope of licences: [asset licence boundaries](ASSET-LICENSES.md). No licence for the complete repository or all supplied ride models is inferred from a third-party CC0/OFL notice.

## Revision 3 additions

- `design/v3/muscat-park-v3.blend` and `public/models/muscat-park-v3.glb` are the current editable and optimized concept scene. The previous source remains unchanged. Model-derived renders and `masterplan-v3.svg` express the updated proposal, not an approved design. See [model provenance and limits](../design/v3/README.md).
- `design/visuals/v3/generated/` and `public/media/v3/` contain eight distinct generated concept illustrations. [The manifest](../design/visuals/v3/visual-manifest.json) maps each image to one chapter. These are not documentary photographs or engineering evidence.
- `public/data/design-references.json` indexes 25 real reference photographs in nine functional groups. Images remain at their credited source URLs; their bytes are not redistributed in this repository. Each record includes the source page, author/provider, relevance and rights status. Marketing composites are identified in the catalogue. See [research catalogue](reference-research/README.md).
- Dream Island facade, arcade and beach photographs are precedent research only. The proposed architecture is project-created; no reference photograph is baked into the Blender model. No supplier selection, commercial partnership or endorsement is implied.
