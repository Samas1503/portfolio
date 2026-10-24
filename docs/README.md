# Documentación — Portfolio Samuel Paredes

Portfolio personal deployado en `cv.samas-server.com` con un panel de
administración embebido: tras hacer login en `/login`, el dueño puede crear,
editar y eliminar el contenido de cada sección (proyectos, skills, experiencia,
servicios, contactos, perfil/CV) sin redesplegar. Es **single-admin**.

La documentación funcional de alto nivel está en `README.md` (raíz), la guía
para agentes en `AGENTS.md` y el vocabulario del dominio en `GLOSARY.md`.
Esta carpeta contiene la referencia técnica completa, basada en el código real.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript estricto — Node **24.x**
- Supabase (Postgres) vía `@supabase/supabase-js` con service role key
- Zod + React Hook Form · Tailwind CSS v4 · Radix UI / shadcn (`new-york`)
- `next-themes`, Embla, `@react-google-maps/api`, Three.js (`@react-three/fiber`)
- `vgpu` + `@vgpu/wgsl` (WebGPU en browser y headless en Node)
- Cloudinary (imágenes) · Supabase Storage bucket `portfolio` (PDF del CV)
- Resend + `@react-email/render` (formulario de contacto)
- `jose` (JWT de sesión) · Vercel (deploy)

## Quickstart

```bash
npm install                    # requiere Node 24.x (engines en package.json)

cp .env.example .env.local     # completá las variables — ver docs/02-entorno.md
# Obligatorias: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET,
# ADMIN_EMAIL, ADMIN_PASSWORD (+ Cloudinary para uploads de imágenes)

npm run dev                    # http://localhost:3000 (turbopack)
```

Comandos de verificación (no hay tests configurados):

```bash
npm run lint    # next lint — el build ignora ESLint, corré esto aparte
npm run build   # next build
```

La base de datos se crea aplicando `supabase/migrations/` (ver
`docs/03-database.md`). El primer login en `/login` crea/re-hashea el usuario
admin en la tabla `Usuarios` a partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(ver `docs/04-auth.md`).

## Índice

| Archivo | Contenido |
| --- | --- |
| `docs/01-arquitectura.md` | Stack, estructura de carpetas, flujo request middleware→route→service→repository→supabase, alias `@/` |
| `docs/02-entorno.md` | Todas las env vars: propósito, dónde se usan, obligatoria/opcional, gotchas de nombres |
| `docs/03-database.md` | Tablas Supabase, `defineTable`/`schemas`, migraciones, tipos generados, RLS |
| `docs/04-auth.md` | Login completo, hashing, JWT, cookies, middleware, logout, cambio de contraseña |
| `docs/05-api.md` | Todos los endpoints: `/api/table`, `/api/cv`, `/api/send`, `/api/track`, `/api/dashboard`, `/api/skills/*`, `/api/repo-fill`, `/api/og` |
| `docs/06-admin.md` | Panel de administración: `ModalTriggerButton`, `DynamicForm`, `formsData`, subir CV, repo-fill, exclusiones de skills |
| `docs/07-frontend.md` | Secciones de la home, sidebar/nav, tema claro-oscuro, spotlight, animaciones, Three.js |
| `docs/08-analytics.md` | Tracker, tablas `Visitas`/`Interacciones`/`Mensajes`, `/api/dashboard`, gráficos |
| `docs/09-vgpu.md` | WebGPU con `vgpu`: loaders, componentes montados/desmontados, `/api/og`, CLI y skills |
| `docs/10-deploy.md` | Vercel, dominio, env vars, límites serverless, CORS, migraciones |
