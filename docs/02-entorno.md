# 02 — Variables de entorno

Copiá `.env.example` a `.env.local` (o `.env`) y completá los valores.
**Nunca commitees `.env*`** ni expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente.

## Tabla de variables

| Variable | Propósito | Dónde se usa | Obligatoria |
| --- | --- | --- | --- |
| `SUPABASE_URL` | URL del proyecto Supabase | `backend/db/supabase.ts` (`getSupabase`) | Sí¹ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasea RLS) | `backend/db/supabase.ts` | Sí¹ |
| `NEXT_PUBLIC_SUPABASE_URL` | Fallback de `SUPABASE_URL` | `backend/db/supabase.ts` | Alternativa¹ |
| `SUPABASE_SECRET_KEY` | Fallback de `SUPABASE_SERVICE_ROLE_KEY` | `backend/db/supabase.ts` | Alternativa¹ |
| `SESSION_SECRET` | Firma del JWT (HS256) **y** salt del hash de contraseña | `app/lib/session.ts`, `app/lib/password.ts` | Sí |
| `ADMIN_EMAIL` | Email del único admin (bootstrap) | `app/login/actions.tsx` | Sí |
| `ADMIN_PASSWORD` | Contraseña del único admin (bootstrap) | `app/login/actions.tsx` | Sí |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | `backend/cloudinary.ts`, `app/api/table/[id]/route.ts` | Para uploads |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY` | API key de Cloudinary | ídem | Para uploads |
| `CLOUDINARY_CLOUD_APY_SECRET` | API secret de Cloudinary | ídem | Para uploads |
| `RESEND_API_KEY` | Envío de emails del formulario de contacto | `app/api/send/route.ts` | Para `/api/send` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapa de contacto/experiencia | `components/pages/google-maps.tsx` | Para el mapa |
| `GITHUB_TOKEN` | Sube el rate limit de la API de GitHub (de 60 req/h por IP) | `backend/Services/skillsSync.service.tsx`, `app/api/repo-fill/route.ts` | Opcional |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL de la API en fetches server-side (en browser se usa same-origin) | `components/pages/fetch/tech-all.tsx` | Opcional² |
| `NEXT_PUBLIC_FRONTEND_URL` | `Access-Control-Allow-Origin` de `/api/send` | `app/api/send/route.ts` | Opcional |

¹ `getSupabase()` acepta `SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SECRET_KEY`. Si falta alguna, lanza
`"Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"`.

² `apiFetch` devuelve `""` en el browser (same-origin, así viaja la cookie
`session`); `NEXT_PUBLIC_BACKEND_URL` solo aplica cuando se ejecuta en el
servidor.

## Gotchas de nombres

- **`APY` no es typo corregible a la ligera.** Las variables son
  `CLOUDINARY_CLOUD_APY_KEY` / `CLOUDINARY_CLOUD_APY_SECRET` (con `APY`).
  `backend/cloudinary.ts` acepta además los nombres "correctos" como fallback:

  ```ts
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY ?? process.env.CLOUDINARY_CLOUD_APY_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_APY_SECRET ?? process.env.CLOUDINARY_API_SECRET,
  });
  ```

  **Ojo:** `app/api/table/[id]/route.ts` configura Cloudinary por su cuenta y
  **solo** lee las variantes `NEXT_PUBLIC_*` + `CLOUDINARY_CLOUD_APY_SECRET`
  (sin fallbacks). Si definís solo los nombres "limpios", el DELETE de imagen
  en Cloudinary va a fallar silenciosamente por credenciales.

- **El `NEXT_PUBLIC_` es engañoso:** aunque `NEXT_PUBLIC_CLOUDINARY_*` se
  expone al bundle cliente, el secret `CLOUDINARY_CLOUD_APY_SECRET` no lleva
  prefijo y queda server-side. No renombres el secret a `NEXT_PUBLIC_*`.

- **`SESSION_SECRET` cumple dos roles:** firma el JWT de sesión
  (`app/lib/session.ts`) y es el pepper del hash de contraseña
  (`sha256(password + SESSION_SECRET)` en `app/lib/password.ts`). Si lo
  cambiás, el `password_hash` guardado en `Usuarios` deja de coincidir — pero
  el login con `ADMIN_EMAIL`/`ADMIN_PASSWORD` lo re-hashea solo
  (self-heal, ver `docs/04-auth.md`).

- **`ADMIN_EMAIL` / `ADMIN_PASSWORD` no son la fuente de verdad del login:**
  el login consulta la tabla `Usuarios`; las env vars solo sirven para el
  bootstrap/self-heal de la primera fila (o tras cambiar `SESSION_SECRET`).

## En Vercel

Las env vars se inyectan por la integración de Supabase + el dashboard del
proyecto `portfolio-paredes-samuel` (ver `docs/10-deploy.md`).
