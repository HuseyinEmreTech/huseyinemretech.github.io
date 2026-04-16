# Repository layout (LLM-friendly)

```text
huseyinemretech.github.io/
├── index.html                 # Vite SPA entry
├── public/                    # Static files copied to dist root (keep URLs stable)
│   └── gis-project.html       # → /gis-project.html when deployed
├── src/
│   ├── main.tsx               # React bootstrap
│   ├── app/                   # Shell: App + providers + error boundary
│   ├── core/                  # App-wide config (env defaults, API roots)
│   ├── services/              # External IO (e.g. GitHub REST client)
│   ├── hooks/                 # Reusable React hooks (e.g. GitHub portfolio loader)
│   ├── features/              # Business capabilities (screaming folders)
│   │   ├── localization/    # i18n + translations + LanguageContext
│   │   ├── personalization/ # Adaptive layout + MBTI wizard
│   │   └── portfolio-page/    # One-page sections + registry
│   ├── entities/              # Static CV/profile content (data only)
│   ├── shared/                # components/ui, types, utils, logging
│   └── index.css
├── standalone-projects/       # Separate demos linked from the site (not part of Vite bundle)
├── assets/images/             # favicon, OG image
├── workers/                   # Cloudflare worker (optional edge)
├── vite.config.ts
├── eslint.config.js
├── tsconfig.json
└── package.json
```

Path aliases (see `vite.config.ts` and `tsconfig.json`): `@/*`, `@core/*`, `@services/*`, `@hooks/*` → `./src/...`.
