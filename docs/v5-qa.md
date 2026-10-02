# MAP v5 quality record

Audit date: 2026-10-02. Local v5 checks are complete within the scope recorded below. Public GitHub/Pages publication is pending; this document is not a publication receipt. No v5 VPS action has been performed.

## Evidence already inspected

| Layer | Result | Evidence and scope |
| --- | --- | --- |
| Native Blender | PASS | [Native validation](../design/v5/native-validation.json): Blender 5.2.1 LTS, existing camera/parcel/zoning/parking locks preserved; wheel 90 m; 122 new palms; seven flags with two wind morph targets each; packed images decode; no external libraries. These are presentation-scene checks, not engineering approval. |
| Boomerang source geometry | PASS | Native source dimensions approximately 99.67 × 39.77 × 40.96 m, 534,879 source triangles, UVs and packed textures. The editable scene retains a reversible export decimator. |
| Browser GLB structure | PASS | [Export validation](../design/v5/web-export-validation.json) and [decoded model checks](../design/v5/web-model-validation.json): both compressed and decoded models have zero glTF errors/warnings. Informational findings remain, including non-power-of-two textures, overridden morph weights and some degenerate triangles. |
| Browser assets | PASS, snapshot | Park GLB 12,590,764 bytes; Boomerang GLB 5,126,608 bytes. No external image URI or absolute host path in either GLB. Park construction is 15 s, wheel rotation 60 s, flag loop 4 s. Browser visual performance is a separate check. |
| Boomerang video | PASS | [Video validation](../design/v5/video-validation.json): VP9/Opus WebM, 1080 × 1920, 50 fps, 730 frames; 14.600 s picture content, 14.621 s container including audio padding. No cropping/trimming; source retained privately. |
| Salalah imagery | PASS | All three generated lighting variants were visually inspected after WebP conversion; each is 1672 × 941. They derive from one supplied drone photograph. They are explicitly described as lighting interpretations, not three documentary photographs. |
| Content/source status | PASS | [Research](v5-research.md), [visual provenance](v5-visual-provenance.md), and [public source data](../public/data/project-sources-v5.json): eight parks is promoter-provided; largest is a project ambition; ASAAS cooperation, land rights and financing are proposals. Oman Vision 2040 is the national framework. No subsidy or approval is promised. |
| Combined build and static export | PASS locally | The integration owner completed the combined build after the photo-loop fix and the local export checks. The checked export contains 12 chapters and 131 files (about 81.1 MB), embedded model resources, required v5 WebPs and WebM. Exact published revision verification remains pending. |

The frontend implementation agent separately passed TypeScript after its own changes. Numeric park-camera checks reported no focused vertices outside the frustum at -5/0/+5 degrees for tested landscape/portrait aspects. These numeric checks supplement the combined build and the visual browser review below.

## Public-repository preflight

Post-cleanup scan snapshot at 11:04:39 UTC: 78 changed/new files, 130,947,350 bytes combined. Largest individual file is the park Blender source at 39,936,621 bytes; no candidate file reaches GitHub's 100 MiB limit. No new raw DNG, SRT, SKP, DWG, MAX or original MP4 is included. Original Salalah RAW photographs, full-resolution decode, transcript, private dependencies and release tools remain outside this repository.

The text/GLB/pattern scan found no credential indicators or private deployment paths. It found local workstation paths in metadata of four Blender render PNGs and packed-flag-related data in the park Blender file. The model agent completed narrow cleanup: packed flag paths are now relative; the four PNGs lost only their File text chunk. Native geometry/UV/material/transform fingerprint, packed texture bytes and PNG IDAT chunks are unchanged. [Native portability](../design/v5/metadata-portability-validation.json) and [PNG metadata validation](../design/v5/png-metadata-validation.json) record the read-back. Runtime GLB/WebP assets were not changed. The repeated scan found no host paths, private deployment paths or credential-pattern findings. Generated PNGs contain no text/EXIF metadata; the four native PNGs retain only X/Y resolution in EXIF, and WebPs contain no EXIF/XMP. A source-document phrase referring to supplied Salalah photographs was a benign text-pattern match. This bounded review is not a claim of exhaustive forensic secret discovery.

## Final local browser review

The integration owner completed the following checks on the combined v5 site:

| Scenario | Observed result |
| --- | --- |
| 4K presentation layout | All 12 chapters checked at 3840 × 2160 CSS resolution, including Place. Text and visuals remained separated without overlap. The final chapter was checked in both dark and light themes. |
| Earth-to-Muscat opening | Pausing the opening phase held its starting state without a jump; resuming reached the intended end state. |
| Masterplan interaction | Immediate pause, resume and re-entry in Present mode were checked, together with anchored pins and zone selection. |
| Wheel transition | The 90 m wheel sequence and transition to the final generated view were visually checked. |
| Boomerang | The actual textured GLB rendered. The 1080 × 1920 WebM reached readyState 4, played automatically and paused correctly; reported duration 14.621 s. |
| Final Salalah sequence | All three day/sunset/night images loaded and changed frames. Pause preserved exact opacities. Reduced-motion behavior was checked. |
| Sources | The sources panel, claim statuses and image-provenance wording were inspected. The selected RAW was developed at full resolution; the original source files were not changed. |
| Mobile fallback | A fresh 390 × 844 browser viewport with `graphics=off` was visually checked on Home and Boomerang. There was no horizontal overflow, and the menu worked. This is a targeted mobile check, not a claim that every chapter was visually accepted on mobile. |

Representative final captures were reviewed by the integration owner. Earlier failed captures were excluded from the accepted evidence. Browser viewport checks do not establish physical meeting-room readability.

## Publication status

- Local combined build, export checks, metadata cleanup and the browser checks above: complete.
- GitHub accepted commit/push identity and successful Pages workflow: pending.
- Public HTTPS revision/asset read-back and public browser smoke test: pending.
- V5 VPS upload, staging, activation or deployment: not performed; requires a separate direct instruction.

The earlier verified v4 VPS release remains distinct from this local v5 result.

## Remaining real-world checks

Physical readability on the 80-inch meeting display from 6 m and local Arabic editorial review remain open. Land/cadastral rights, engineering feasibility, hydrology, access, procurement, CAPEX and funding are not established by the presentation or its visual model.
