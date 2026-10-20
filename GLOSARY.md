# GLOSARY.md — Glosario del dominio

Términos, nombres y abstracciones propias de este proyecto. El código mezcla
español e inglés; este glosario explica esa correspondencia.

## Vocabulario de dominio

| Término | Significado |
| --- | --- |
| `tipo` | Query param de `/api/table` que selecciona la tabla lógica. Es una `SchemaKeys`. |
| `SchemaKeys` | Keys del objeto `schemas`: `project`, `skills`, `servicios`, `experience`, `perfil`, `contacto`, `mensajes`. |
| `estado` | Booleano de visibilidad en casi todas las tablas (`true` = visible). No es soft-delete: el DELETE borra la fila. |
| Perfil | Fila única de la tabla `Perfil` con los datos del dueño (nombre, rol, CV, stats). El header/about la leen. |
| Contacto | Link de contacto externo (LinkedIn, mail, etc.) con `icono` mapeado en `CONTACT_ICONS`. |
| Mensajes | Tabla `Mensajes` para el historial de mensajes del formulario de contacto. |
| `tags` | Array `text[]` en `Proyectos`; en formularios/API viaja como string separado por comas (`parseTags`). |
| `uploads/<hex>-<ts>` | Convención de `public_id` en Cloudinary para imágenes subidas. |
| bucket `portfolio` | Bucket público de Supabase Storage, solo acepta PDF ≤ 4 MB (el CV). |

## Mapeo API ↔ base de datos

Las tablas están en español/Capitalized; la API usa keys cortas en inglés.
`schemas[tipo].table` resuelve el nombre real.

| `tipo` (API) | Tabla Postgres | Campos camelCase → snake_case |
| --- | --- | --- |
| `project` | `Proyectos` | `urlGithub`→`url_github`, `urlDemo`→`url_demo` |
| `skills` | `Skills` | (iguales) |
| `servicios` | `Servicios` | (iguales) |
| `experience` | `Experiencia` | `nombreReferencia`→`nombre_referencia`, `nroReferencia`→`nro_referencia` |
| `perfil` | `Perfil` | `cvUrl`→`cv_url` |
| `contacto` | `Contacto` | (iguales) |
| `mensajes` | `Mensajes` | (iguales) |

## Abstracciones propias del proyecto

| Nombre | Dónde | Qué hace |
| --- | --- | --- |
| `defineTable` | `backend/data/schemas.ts` | Factory que genera `{ table, select, toColumns, create, update }` por tabla. `columns` mapea keys camelCase que difieren del nombre de columna. |
| `toColumns` | `backend/data/schemas.ts` | Traduce un body camelCase a columnas reales de Postgres antes de insert/update. |
| `select` | `backend/data/schemas.ts` | String de select de Supabase con alias `key:column` para devolver keys camelCase. |
| `withValidation` | `utils/withValidation.ts` | HOF que envuelve Route Handlers y valida `params`/`query`/`body` con Zod por método HTTP. Soporta body schema dinámico (función del query). |
| `commonParams` / `commonQuery` | `utils/schemasRequest.ts` | Schemas Zod compartidos: `{id}` numérico y `{tipo}` enum de `SchemaKeys`. |
| `serializeData` | `utils/serialize.ts` | Serializa respuestas convirtiendo `bigint` → string. |
| `apiFetch` | `components/pages/fetch/tech-all.tsx` | Wrapper de `fetch` para `/api/table`; same-origin en browser, maneja 401 → redirect a `/login`. |
| `formsData` | `components/pages/forms/formsData.tsx` | Config por formulario: schema Zod + `fields` (label/name/type/values). Fuente del admin UI. |
| `DynamicForm` | `components/pages/forms/DynamicForm.tsx` | Renderiza un form RHF+Zod a partir de `fields`. Si hay campo `file`, envía `FormData`. |
| `ModalTriggerButton` | `components/pages/forms/ModalTriggerButton.tsx` | Botón que abre el `DynamicForm` en un Dialog; decide POST vs PATCH según `id`. Solo visible con sesión. |
| `FieldType` | `components/pages/forms/types.ts` | Tipos de campo soportados: `text, email, number, textarea, date, password, file, dropdown, hidden, geolocalization`. |
| `useUsuario` | `context/UserContext.tsx` | Hook que lee la cookie `usuario` (flag de UI de admin). No es auth real. |
| `session` / `usuario` | `app/lib/session.ts` | Cookies: `session` = JWT httpOnly firmado (auth real); `usuario` = flag "true" legible por JS para mostrar/ocultar UI de admin. |
| `getSupabase` | `backend/db/supabase.ts` | Singleton del cliente Supabase con service role key. Server-only. |
| `getFileData` | `backend/Services/getData.service.tsx` | Si un registro tiene `image`/`file`, devuelve la URL de Cloudinary (salvo que ya empiece con `uploads/`). |
| `EmailTemplate` | `components/pages/templates/emailTemplate.tsx` | Template de React Email para `/api/send` (Resend). |
| `cn` | `lib/utils.ts` | `clsx` + `tailwind-merge`, helper de clases estándar shadcn. |
| `CONTACT_ICONS` | `components/shared/contact-icon.tsx` | Mapa nombre → ícono para los links de contacto. |

## Endpoints

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `GET /api/table?tipo=` | público | Lista todos los registros (paginado interno de 1000). |
| `POST /api/table?tipo=` | sesión | Inserta; acepta JSON o multipart (imagen → Cloudinary). |
| `GET /api/table/[id]?tipo=` | público | Un registro por id. |
| `PATCH /api/table/[id]?tipo=` | sesión | Update parcial (todos los campos opcionales). |
| `DELETE /api/table/[id]?tipo=` | sesión | Borra; en `project` también borra la imagen de Cloudinary. |
| `POST /api/send` | público | Envía email de contacto vía Resend. |
| `POST /api/cv` | sesión | Sube el PDF del CV al bucket `portfolio` y actualiza `Perfil.cv_url`. |
| `/login` `/logout` | — | Login con `ADMIN_EMAIL`/`ADMIN_PASSWORD` (server actions). |
