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
│   ├── cbs-trafik-projesi/   # GIS atlas data + JS used by /gis-project.html
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
- `public/gis-project.html` is the deployed shell for the GIS coursework page, while its runtime assets stay in `standalone-projects/cbs-trafik-projesi/`.

Path aliases (see `vite.config.ts` and `tsconfig.json`): `@/*`, `@core/*`, `@services/*`, `@hooks/*` → `./src/...`.
