# 10 — Deploy

| | |
| --- | --- |
| Plataforma | Vercel |
| Proyecto | `portfolio-paredes-samuel` |
| Dominio | `cv.samas-server.com` |
| Branch de deploy | `main` (deploy automático en cada push) |

## Env vars en Vercel

Las variables de `docs/02-entorno.md` se configuran en el dashboard del
proyecto (Settings → Environment Variables); las de Supabase
(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) las inyecta la integración de
Supabase con Vercel. Reglas:

- `NEXT_PUBLIC_*` va al bundle del cliente — nada secreto ahí
  (`CLOUDINARY_CLOUD_APY_SECRET` no lleva el prefijo, correctamente).
- Definí exactamente los nombres que el código lee:
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY`
  (ojo el `APY`) y `CLOUDINARY_CLOUD_APY_SECRET` — `app/api/table/[id]/route.ts`
  no tiene fallbacks.
- `GITHUB_TOKEN` es opcional pero recomendable en prod: sin él el sync de
  skills comparte el rate limit de 60 req/h por IP de GitHub.

## Límites serverless que condicionan el código

- **Body ≈ 4.5 MB** por request: por eso el CV se limita a **4 MB**
  (`app/api/cv/route.ts`, `MAX_BYTES = 4 * 1024 * 1024`) y las imágenes van a
  Cloudinary en vez de Supabase Storage. `next.config.ts` también declara
  `experimental.serverActions.bodySizeLimit: "5mb"` (con
  `allowedOrigins: ["*"]`) para las server actions.
- **Sin GPU** en las funciones: `GET /api/og` intenta render WebGPU headless
  con `vgpu/node` y, al fallar `init()`/draw, cae al PNG procedural en JS
  (`renderFallbackPng` con `pngjs`). Ambos caminos responden
  `Content-Type: image/png` con cache immutable.
- `app/page.tsx` es `force-dynamic` — SSR por request, sin caché de página.

## `vercel.json` — CORS

```json
{ "source": "/api/(.*)", "headers": [
  { "key": "Access-Control-Allow-Credentials", "value": "true" },
  { "key": "Access-Control-Allow-Origin", "value": "*" },
  { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
  { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, ..." }
] }
```

⚠️ CORS `*` en `/api/*` **no es un control de acceso** — cualquier origen
puede leer la API pública. La seguridad real está en `middleware.ts` (JWT) y
en los checks internos de `/api/dashboard` y `/api/repo-fill`. Además los
handlers de `/api/table` devuelven `Access-Control-Allow-Origin` con el
`origin` del request.

## Base de datos en producción

Las migraciones de `supabase/migrations/` se aplican al proyecto Supabase
`ahjufrjambuzlxraavky` (ver `supabase/.temp/project-ref`) con la CLI
(`supabase db push` / `migrate`) o a mano en el SQL editor. Orden y detalle en
`docs/03-database.md`. Después de aplicar cambios de schema regenerá los
tipos:

```bash
npx supabase gen types typescript --project-id ahjufrjambuzlxraavky \
  > backend/db/database.types.ts
```

Checklist de migraciones pendientes: `Skills.excluida`
(`20261020150000_skills_excluida.sql`) es opcional por diseño (el código la
tolerante si falta, pero el toggle de exclusiones del admin falla sin ella —
`skils.tsx` muestra el alert "¿Aplicaste la migración de Skills.excluida?").

## Notas de build

- `next.config.ts` tiene `eslint.ignoreDuringBuilds: true` → el build puede
  pasar con errores de lint; corré `npm run lint` aparte antes de pushear.
- `npm run dev` usa turbopack; el build de Vercel también (Next 15 default en
  este repo) — la regla `*.wgsl` existe para turbopack **y** webpack
  (`docs/09-vgpu.md`).
- Node 24.x (`engines` en `package.json`); configurarlo en Vercel → Project
  Settings → Node.js Version si hiciera falta.
