# 01 — Arquitectura

## Stack

| Capa | Tecnología | Dónde |
| --- | --- | --- |
| Framework | Next.js 15 App Router + React 19 | `app/` |
| Lenguaje | TypeScript `strict: true`, Node 24.x | `tsconfig.json`, `package.json` |
| Base de datos | Supabase (Postgres), `@supabase/supabase-js` | `backend/db/supabase.ts` |
| Validación | Zod + React Hook Form | `backend/data/schemas.ts`, `components/pages/forms/` |
| Auth | JWT HS256 (`jose`) en cookie httpOnly | `app/lib/session.ts`, `middleware.ts` |
| UI | Tailwind v4, Radix/shadcn, `next-themes` | `app/globals.css`, `components/ui/` |
| Media | Cloudinary (imágenes), Supabase Storage (PDF) | `backend/cloudinary.ts`, `app/api/cv/route.ts` |
| Email | Resend + React Email | `app/api/send/route.ts` |
| GPU | `vgpu` + `@vgpu/wgsl`, Three.js | `components/three/` |

## Estructura de carpetas

```
app/                     # App Router
  layout.tsx             # Root: fonts, ThemeProvider, Tracker, VgpuThemeWipe
  page.tsx               # Home (force-dynamic, fetch perfil+contactos en server)
  globals.css            # Tema oklch, keyframes reveal/breathe, spotlight
  login/                 # page + form + actions (server actions de auth)
  logout/page.tsx        # En realidad es el <LogOutButton/> (client component)
  dashboard/page.tsx     # Panel de métricas + cambio de contraseña (client)
  api/                   # Route Handlers — ver docs/05-api.md
  lib/                   # session.ts (JWT) y password.ts (hash sha256)
backend/
  db/supabase.ts         # Cliente singleton service-role — SERVER ONLY
  db/database.types.ts   # Tipos generados con `supabase gen types`
  data/schemas.ts        # FUENTE DE VERDAD: tablas + select + toColumns + zod
  data/perfil.ts         # Helpers server-side (getPerfil, getContactos)
  data/contactos.ts
  Services/              # Lógica de negocio (get/post/update/delete + skillsSync)
  repository/            # Queries a Supabase por operación
  cloudinary.ts          # Config de Cloudinary — SERVER ONLY
components/
  pages/                 # Secciones de la home + forms + fetch (apiFetch)
  shared/                # section, tracker, spotlight, delete-button, contact-icon
  theme/                 # ThemeProvider + ToggleTheme
  three/                 # Hero3D/MiniIcon3D (three.js) + vgpu-* (WebGPU/WGSL)
  ui/                    # Primitivas shadcn (button, dialog, form, ...)
context/UserContext.tsx  # Flag de UI `usuario` (lee cookie no-httpOnly)
utils/                   # withValidation, schemasRequest, serialize, tags, response
lib/utils.ts             # cn() = clsx + tailwind-merge
data.tsx                 # itemsNavbar (íconos del navbar móvil)
supabase/migrations/     # SQL de la base — ver docs/03-database.md
middleware.ts            # Auth por ruta/método — ver docs/04-auth.md
```

## Flujo de un request

```
HTTP request
  → middleware.ts                     # JWT cookie "session"; GETs públicos,
                                      # mutaciones a /api/table|/api/cv|/api/skills → 401
  → app/api/*/route.ts                # Route Handlers
      → withValidation(req, ctx)      # utils/withValidation.ts: valida
                                      # params/query/body con Zod por método
  → backend/Services/                 # lógica (services = merge de *.service)
  → backend/repository/               # queries (usa schemas[tipo].select/toColumns)
  → backend/db/supabase.ts            # getSupabase() singleton, service role
  → serializeData()                   # bigint → string antes de responder
```

Los services y repositories se exportan como objetos mergeados:
`backend/Services/index.tsx` y `backend/repository/index.tsx` combinan todos
los módulos `*.{service,repository}.tsx` en un solo `services` / `repository`.

## `schemas` como fuente de verdad

`backend/data/schemas.ts` define cada tabla con `defineTable(table, fields,
columns)` y devuelve `{ table, select, toColumns, create, update }`:

- `select`: string de select de Supabase con alias `key:columna` → la API
  devuelve camelCase aunque la columna sea snake_case.
- `toColumns`: traduce un body camelCase a nombres de columna reales.
- `create`/`update`: schema Zod (todos los campos opcionales).

El query param `?tipo=` de `/api/table` es una key de `schemas`
(`SchemaKeys`): `project`, `skills`, `servicios`, `experience`, `perfil`,
`contacto`, `academia`, `mensajes`.

## Alias `@/`

`tsconfig.json` mapea `"@/*": ["./*"]` — la raíz del repo, **no** `./src`.
Convención: siempre `@/` en imports (p. ej. `@/backend/db/supabase`).

## Reglas de la casa

- `backend/db/supabase.ts` es **server-only**: usa la service role key que
  bypasea RLS. Nunca importarlo desde un componente `"use client"`.
- Server components por defecto; `"use client"` solo donde haga falta
  (formularios, contexto, mapas, Three.js/vgpu).
- Los services/repositories hacen `console.log` del error y devuelven
  `undefined`; en código nuevo es preferible devolver errores útiles.
- El fetch del admin es `apiFetch` (`components/pages/fetch/tech-all.tsx`):
  same-origin en browser para que viaje la cookie `session`.
