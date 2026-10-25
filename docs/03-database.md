# 03 — Base de datos (Supabase / Postgres)

El proyecto usa `@supabase/supabase-js` **solo en el servidor**
(`backend/db/supabase.ts`, singleton `getSupabase()`). **Todas las tablas
tienen RLS habilitado sin policies**: solo se llega con la service role key.
No crees un cliente con la anon key esperando que funcione.

## Tablas

Nombres en español y capitalizados; todas tienen `id` PK serial y casi todas
`estado boolean DEFAULT true` (flag de visibilidad — **no** es soft-delete:
el DELETE borra la fila).

| Tabla | Columnas | Propósito | `tipo` API |
| --- | --- | --- | --- |
| `Proyectos` | `titulo`, `image`, `url_github`, `url_demo`, `categoria`, `tags text[]`, `descripcion`, `rol`, `periodo`, `estado` | Proyectos del portfolio. `image` guarda el public_id de Cloudinary (`uploads/<hex>-<ts>`) | `project` |
| `Skills` | `tipo`, `nombre`, `nivel`, `valor int`, `excluida bool`, `estado` | Habilidades agrupadas por `tipo`. `valor` (0-100) lo recalcula `skillsSync`; `excluida` marca las manuales | `skills` |
| `Servicios` | `tipo`, `icono`, `nombre`, `estado` | Servicios ofrecidos, agrupados por `tipo` | `servicios` |
| `Experiencia` | `empresa`, `cargo`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `latitud`, `longitud`, `nombre_referencia`, `nro_referencia bigint`, `estado` | Experiencia laboral; `fecha_fin` null = trabajo actual | `experience` |
| `Academia` | `tipo`, `institucion`, `titulo`, `periodo`, `descripcion`, `diploma`, `estado` | Formación: `tipo` = `"Carrera"` o `"Curso"` | `academia` |
| `Eventos` | `tipo`, `organizador`, `titulo`, `periodo`, `descripcion`, `certificado`, `estado` | Participaciones: `tipo` = `"Evento"`/`"Competencia"`/`"Torneo"`/`"Actividad"`; `certificado` = `uploads/…` o URL externa | `eventos` |
| `Perfil` | `nombre`, `rol`, `alias`, `resumen`, `cv_url`, `descripcion`, `experiencia`, `clientes`, `proyectos`, `telefono` | Fila única con los datos del dueño (header + about + stats). La PK se llama `SobreMi_pkey` (rename en migración remota) | `perfil` |
| `Contacto` | `nombre`, `titulo`, `link`, `icono`, `estado` | Links de contacto; `icono` se mapea en `CONTACT_ICONS` | `contacto` |
| `Mensajes` | `id_mensaje`, `origen`, `nombre`, `destino`, `mensaje`, `estado` | Historial de mensajes del formulario de contacto | `mensajes` |
| `Usuarios` | `email unique`, `password_hash`, `nombre`, `created_at` | Credenciales del admin (una fila). No está en `schemas` — la usan solo `app/login/actions.tsx` y `app/api/dashboard/route.ts` | — |
| `Visitas` | `path`, `referrer`, `created_at` (`bigint id` identity always) | Una fila por visita (tracker) | — |
| `Interacciones` | `tipo`, `detalle`, `path`, `created_at` | Clicks (`github:*`, `demo:*`) y `contacto` | — |

## `defineTable` y `schemas`: la fuente de verdad

`backend/data/schemas.ts` mapea cada `tipo` de la API a su tabla:

```ts
function defineTable<T extends z.ZodRawShape>(
  table: TableName,        // nombre real en Postgres (tipado desde database.types)
  fields: T,               # campos zod en camelCase
  columns: Partial<Record<keyof T, string>> = {}  // camelCase → snake_case
) { ... return { table, select, toColumns, create, update }; }
```

- `select`: arma el string de select de Supabase con alias `key:columna`
  (p. ej. `urlGithub:url_github`) → la API siempre devuelve camelCase.
- `toColumns(data)`: renombra las keys del body a columnas reales antes de
  `insert`/`update`.
- `create`/`update`: `z.object({id?}).extend(fields).partial()` — todos los
  campos son opcionales en ambos. Los primitivos zod: `text`, `int`, `bigint`,
  `double`, `bool`, `textArray` (todo `.nullable()`).

Mapeos camelCase→snake_case activos: `urlGithub`→`url_github`,
`urlDemo`→`url_demo`, `nombreReferencia`→`nombre_referencia`,
`nroReferencia`→`nro_referencia`, `cvUrl`→`cv_url`.

`SchemaKeys = keyof typeof schemas` es el tipo del query param `?tipo=`.

**Gotchas:**

- `Skills.excluida` **no** está en el schema genérico `skills` (se accede con
  queries directas en `skillsSync.service.tsx`) para que el sitio siga
  funcionando si la migración `20261020150000_skills_excluida.sql` no se aplicó.
- `nroReferencia` es `bigint` en Postgres → `serializeData` lo convierte a
  string en las respuestas (`utils/serialize.ts`).
- `Usuarios`, `Visitas` e `Interacciones` no pasan por `schemas` ni por
  `/api/table`: las tocan directamente `app/api/*` con `getSupabase()`.

## Migraciones

En `supabase/migrations/`, aplicadas en orden por timestamp:

| Archivo | Qué hace |
| --- | --- |
| `20261020000000_init_portfolio.sql` | Crea `Contacto`, `Experiencia`, `Mensajes`, `Proyectos`, `Servicios`, `Skills` (todas con RLS enabled) |
| `20261020120000_project_tags.sql` | `Proyectos.categoria`, `Proyectos.tags text[] DEFAULT '{}'` |
| `20261020130000_project_details.sql` | `Proyectos.descripcion`, `rol`, `periodo` |
| `20261020140000_perfil.sql` | Crea `Perfil` + bucket de Storage `portfolio` (público, 4 MB, solo `application/pdf`) |
| `20261020150000_skills_excluida.sql` | `Skills.excluida bool DEFAULT false` |
| `20261020150530_remote_schema.sql` | Dump remoto: `drop extension pg_net`, rename `Perfil_pkey` → `SobreMi_pkey` |
| `20261020160000_dashboard.sql` | Crea `Usuarios`, `Visitas`, `Interacciones` |
| `20261020170000_academia.sql` | Crea `Academia` |
| `20261020180000_academia_diploma.sql` | `Academia.diploma` |
| `20261024120000_eventos.sql` | Crea `Eventos` |

## Cambiar el schema

1. Agregá una migración en `supabase/migrations/` (aplicar con Supabase CLI
   o en el dashboard SQL del proyecto `ahjufrjambuzlxraavky`).
2. Actualizá `backend/data/schemas.ts` (`defineTable` + `columns` si difiere
   el nombre) y `components/pages/forms/formsData.tsx` si se edita desde el admin.
3. Regenerá los tipos:

   ```bash
   npx supabase gen types typescript --project-id ahjufrjambuzlxraavky \
     > backend/db/database.types.ts
   ```

   `database.types.ts` tipa `TableName` dentro de `defineTable`, así una tabla
   mal escrita falla en compile time.

## Storage

Bucket `portfolio` (creado en `20261020140000_perfil.sql`): público,
`file_size_limit` 4 MB, solo `application/pdf`. Guarda el CV en `cv/cv-<ts>.pdf`;
`app/api/cv/route.ts` actualiza `Perfil.cv_url` con la public URL y borra el
PDF anterior. Las **imágenes no van a Supabase Storage**: van a Cloudinary
(límite de ~4.5 MB del body en Vercel).
