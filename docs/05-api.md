# 05 — API (Route Handlers)

Todas las rutas viven en `app/api/`. La auth está en `middleware.ts`
(GET público; mutaciones a `/api/table`, `/api/cv`, `/api/skills` exigen
sesión) salvo `/api/dashboard` y `/api/repo-fill`, que verifican el JWT
internamente. Toda respuesta pasa por `serializeData` (bigint → string)
donde aplica.

## Tabla de endpoints

| Endpoint | Método | Auth | Params/body | Respuesta |
| --- | --- | --- | --- | --- |
| `/api/table?tipo=` | GET | público | `tipo`: `SchemaKeys` | Array de filas (camelCase) |
| `/api/table?tipo=` | POST | sesión | `tipo`; body JSON validado por `schemas[tipo].create` **o** `multipart/form-data` | Fila insertada (con URL de imagen resuelta) |
| `/api/table/[id]?tipo=` | GET | público | `id` numérico, `tipo` | Fila o `404 {error:"No encontrado"}` |
| `/api/table/[id]?tipo=` | PATCH | sesión | `id`, `tipo`; body JSON (schema dinámico) | `id` actualizado |
| `/api/table/[id]?tipo=` | DELETE | sesión | `id`, `tipo` | `id` borrado; en `project` también borra la imagen de Cloudinary |
| `/api/cv` | POST | sesión | multipart: `file` (PDF ≤4 MB), `id` (perfil) | `{cvUrl}` |
| `/api/send` | POST | público | JSON `{username,email,message}` | Resultado de Resend; guarda en `Mensajes`+`Interacciones` |
| `/api/track` | POST | público | JSON `{tipo,path?,detalle?,referrer?}` | `{ok:true}` |
| `/api/dashboard` | GET | sesión (interna) | — | `{visitas[], interacciones[], mensajes[]}` |
| `/api/dashboard` | POST | sesión (interna) | `{actual,nueva}` | `{ok:true}` — cambio de contraseña |
| `/api/skills/sync` | POST | sesión | — | `{updated, added[], excluded?, aborted?}` |
| `/api/skills/exclusions` | GET | público | — | `[id,...]` de skills excluidas |
| `/api/skills/exclusions` | POST | sesión | `{id:int, excluida:bool}` | `{ok:true}` |
| `/api/repo-fill?url=` | GET | sesión (interna) | `url` de repo GitHub | `{titulo,descripcion,categoria,rol,periodo,tags}` |
| `/api/og` | GET | público | — | PNG 1200×630 (GPU o fallback JS) |

## `/api/table` — la API genérica

`tipo` es una key de `schemas` (`utils/schemasRequest.ts`: `commonQuery` la
valida como enum; `commonParams` valida `id` como entero positivo).
`withValidation` (`utils/withValidation.ts`) valida `params`/`query`/`body`
por método; el schema del body es **dinámico**: `({query}) => schemas[query.tipo].create`.

- **GET**: `services.getAllDataService(tipo)` — paginado interno de 1000 filas
  por página (`backend/repository/getData.repository.tsx`). Si la fila tiene
  `image`/`file`, `getFileData` resuelve la URL de Cloudinary.
- **POST JSON**: body validado con Zod → `postDataService` (re-parsea con
  `create` y devuelve la fila insertada con `getDataByIdService(..., getUrl=true)`).
- **POST multipart** ⚠️: `withValidation` **no valida el body multipart**
  (solo JSON). El handler arma el body a mano: busca el archivo en
  `file|image|audio|video`, lo sube a Cloudinary (`folder: "uploads"`,
  `public_id = <hex16 del nombre>-<timestamp>`) y setea
  `body[file.type.split("/")[0]] = "uploads/<public_id>"` → para una imagen
  queda `body.image = "uploads/..."`. `tags` llega como string CSV y
  `parseTags` (`utils/tags.ts`) lo convierte a `string[]` único.
- **PATCH**: usa `schemas[tipo].create` como schema del body (el archivo lo
  llama igual que `update`; todos los campos son opcionales de todos modos).
- **DELETE**: trae la fila, la borra y —solo para `project`— llama
  `cloudinary.uploader.destroy(data.image)`.
- **Efecto colateral**: tras POST/PATCH/DELETE con `tipo === "project"`, un
  `after(() => syncSkillsFromProjects())` recalcula las skills en background.
- **CORS**: cada respuesta setea `Access-Control-Allow-Origin` con el header
  `origin` del request (o `*`).

## `/api/cv` — subir el CV

`POST` multipart con `file` + `id` (del perfil). Valida:
`file.type === "application/pdf"`, `file.size ≤ 4 MB` (límite del body de
Vercel), `id` entero. Sube a Supabase Storage bucket `portfolio` en
`cv/cv-<ts>.pdf`, actualiza `Perfil.cv_url` con la public URL y borra el PDF
anterior del bucket. Devuelve `{cvUrl}`.

## `/api/send` — formulario de contacto

`POST` JSON `{username,email,message}` → Resend (`RESEND_API_KEY`), template
`EmailTemplate` (`components/pages/templates/emailTemplate.tsx`), `replyTo` =
email del remitente. Luego inserta en `Mensajes` (`nombre`, `origen`,
`mensaje`) y en `Interacciones` (`tipo:"contacto"`, `detalle:email`). Público:
no pasa por el middleware.

## `/api/track` — analytics

`POST` JSON validado: `{tipo: "visita"|"click"|"contacto", path?, detalle?,
referrer?}` (strings con `max()` acotado). `visita` → insert en `Visitas`;
el resto → `Interacciones`. Lo usa `Tracker` (fetch keepalive) y los clicks
de proyectos (`navigator.sendBeacon`).

## `/api/dashboard` — métricas + contraseña

Check interno `requireSession()` (lee cookie `session`, `decrypt`).
`GET` devuelve últimas 500 `Visitas`, 50 `Interacciones` y 50 `Mensajes`
(orden desc). `POST {actual,nueva}` cambia la contraseña (ver
`docs/04-auth.md`).

## `/api/skills/sync` y `/api/skills/exclusions`

- `POST /api/skills/sync` → `syncSkillsFromProjects({force:true})` — limpia la
  cache de lenguajes y recalcula (ver `docs/06-admin.md` para el algoritmo).
  Respuesta: `{updated, added[], excluded}`, o `{aborted:"rate_limit"}` si
  GitHub respondió 403/429 (aborta para no pisar valores con datos parciales).
- `GET /api/skills/exclusions` → array de ids con `Skills.excluida = true`
  (público: no es sensible; si la columna no existe devuelve `[]` vía catch).
- `POST /api/skills/exclusions` → `{id, excluida}` setea la columna.

## `/api/repo-fill` — autocompletar proyecto desde GitHub

`GET ?url=https://github.com/<owner>/<repo>` (regex `github\.com[/:]([^/]+)/([^/?#.]+)`).
Verifica sesión internamente → 401 sin JWT. Llama a `api.github.com` (con
`GITHUB_TOKEN` si está), `revalidate: 300`. Lee el repo + README (raw), infiere:

- `titulo`: nombre en Title Case (`-`/`_` → espacios)
- `descripcion`: `repo.description` o primer párrafo "limpio" del README
- `categoria`: regex sobre topics+lenguaje → `Web3|Mobile|Desktop|Fullstack|Frontend|Backend|Otro`
- `rol`: mapa `ROLE_BY_CATEGORY` → p. ej. `"Backend Developer"`
- `periodo`: años `created_at`–`pushed_at`
- `tags`: lenguaje + topics + keywords del README (`TECH_KEYWORDS`), CSV

Errores: `400` URL inválida, `502` si GitHub responde error, `500` genérico.

## `/api/og` — imagen OpenGraph

`GET` → PNG 1200×630. Intenta render headless con `vgpu/node` +
`og.wgsl` (`resolveShader` + `prepareShader` de `@vgpu/wgsl`, `time=3.7`);
si el host no tiene GPU (Vercel serverless) cae a `renderFallbackPng()`
(píxeles JS con `pngjs`: base oscura + bandas aurora + glow radial).
Headers `Content-Type: image/png`, `Cache-Control: immutable` (1 año).
Referenciado en `metadata.openGraph`/`twitter` de `app/layout.tsx`.
