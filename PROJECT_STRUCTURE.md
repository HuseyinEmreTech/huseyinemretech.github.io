# Repository layout (LLM-friendly)

```text
huseyinemretech.github.io/
├── index.html                 # Vite SPA entry
├── public/                    # Static files copied to dist root (keep URLs stable)
│   └── gis-project.html       # → /gis-project.html when deployed
├── src/
│   ├── main.tsx              # React bootstrap
│   ├── app/                  # Shell: App + providers + error boundary
│   ├── core/                 # App-wide config (env defaults, API roots)
│   ├── services/             # External IO (e.g. GitHub REST client)
│   ├── hooks/                # Reusable React hooks (e.g. GitHub portfolio loader)
│   ├── features/             # Business capabilities (screaming folders)
│   │   ├── localization/     # i18n + translations + LanguageContext
│   │   ├── personalization/  # Adaptive layout + MBTI wizard
│   │   └── portfolio-page/   # One-page sections + registry
│   ├── entities/             # Static CV/profile content (data only)
│   ├── shared/               # shared components/ui, types, utils, logging
│   └── index.css
├── standalone-projects/      # Separate demos linked from the site (served/copied by Vite plugin)
│   ├── araba-yikama-tahmin/  # Standalone ML demo page + notebook assets
│   ├── cbs-trafik-projesi/   # Global atlas assets for /gis-project.html; Turkey il = R/PNG in repo (not on that page)
│   └── sunum/                # Standalone presentation assets
├── assets/images/            # favicon, OG image
├── workers/                  # Cloudflare worker (optional edge)
├── vite.config.ts
├── eslint.config.js
├── tsconfig.json
├── PROJECT_STRUCTURE.md
└── package.json
```

Notes:
- Shared React UI now lives under `src/shared/components/ui`; avoid re-introducing a parallel `src/components/ui` tree.
- Shared utilities live under `src/shared/lib`.
- `public/gis-project.html` is the CBS/GIS **country-level** coursework page only (World Bank `SH.STA.TRAF.P5`, JSON **2000–2019**, **173** polygons). Turkey provincial work (R, PNG, CSV) lives in `standalone-projects/cbs-trafik-projesi/` but is **not** rendered on `gis-project.html` (see that README).

Path aliases (see `vite.config.ts` and `tsconfig.json`): `@/*`, `@core/*`, `@services/*`, `@hooks/*` → `./src/...`.
