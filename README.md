# Muscat Amusement & Water Park

![Earth-to-Muscat opening](docs/preview-earth.jpg)

An Arabic-first, bilingual concept website for a proposed family destination in Seeb, Muscat. The programme brings together rides, a water park, an indoor family centre and City Walk, with phased development and family public spaces.

This repository contains the editable website, a portable Blender concept scene and selected concept illustrations. The land proposal is subject to official boundaries, rights, site investigations, feasibility, funding and approvals. Visuals express a proposed experience, not existing construction or an engineered development plan.

## Run locally

Use Node.js 24 (the tested version is in `.nvmrc`). No credentials or environment file are required.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3108/muscat-amusement-park/`.

## Build and preview the static export

```sh
npm run build
npm run typecheck
npm run check:export
npm run preview
```

The static export is written to `out/`. The preview server binds only to `127.0.0.1:3108` and serves the configured `/muscat-amusement-park/` base path. Use `PORT=...` in your shell or `npm run preview -- 3110` for another port. Stop it with Ctrl+C.

## Project contents

- `src/`: React/Next.js presentation, public bilingual copy and styles.
- `public/`: runtime images, fonts, geographic context and the browser GLB model.
- `design/muscat-park.blend`: editable Blender concept source with packed resources.
- `design/visuals/`: selected full-resolution generated concept illustrations.
- `docs/assets-provenance.md`: source and rights notes; third-party licence files are in `public/licenses/`.
- `.github/workflows/build.yml`: installs the lockfile, builds and uploads the static output as an Actions artifact.

## Publication and deployment are separate

Publishing this source repository on GitHub does not deploy the website. CI has read-only repository permissions and produces a downloadable artifact; it does not configure GitHub Pages, upload to a VPS or activate a public website. A future VPS release requires a separate command from the project owner.

The website has passed local production-build and browser checks. Arabic editorial review, official site verification and venue testing remain separate. See [validation](docs/validation.md).

## Asset rights

Public visibility does not create a blanket licence for project designs or third-party assets. Preserve the individual licence and attribution notices. The concept material must not be represented as an official municipal endorsement. See [asset provenance](docs/assets-provenance.md).

## Presentation and source

The eleven chapters follow the Salalah reference: Earth → Muscat/Seeb → proposed attractions → masterplan → City Walk → character → water park → indoor centre → family comfort → city value → phases and land decision. Arabic is primary and right-aligned; English is immediately below.

Three.js / React Three Fiber render the Earth, real Muscat terrain and an on-demand model viewer. GSAP controls chapter transitions and the original diagram → Blender render → generated vision sequence. Next.js builds a static export; presentation animation requires no application backend or account credentials. Motion pause, system reduced-motion preferences and `?graphics=off` are supported.

Open `design/muscat-park.blend` in Blender to edit the concept (metres, six cameras, packed materials, no external satellite texture). The smaller `public/models/muscat-park.glb` is the browser presentation export. The model is conceptual, not a construction or manufacturing deliverable.
