# 08 — Analytics y dashboard

Métricas propias, sin servicios externos: el cliente reporta eventos a
`/api/track`, que inserta en Postgres; `/dashboard` los agrega y los muestra.

## Captura de eventos

### `Tracker` (`components/shared/tracker.tsx`)

Montado en `app/layout.tsx` (client component invisible). Por cada cambio de
`usePathname()`:

1. Salta `/login*` y `/dashboard*` (no trackea páginas de admin).
2. `sessionStorage.getItem("v:<path>")` evita duplicar → **una visita por
   path por sesión de pestaña** (si sessionStorage no está disponible, sigue
   igual).
3. `POST /api/track` con `{tipo:"visita", path, referrer: document.referrer}`,
   `keepalive: true` (sobrevive a la navegación).

### Clicks en proyectos

`components/pages/portfolio.tsx` usa `navigator.sendBeacon("/api/track", …)`
con `{tipo:"click", detalle:"github:<titulo>"|"demo:<titulo>", path}` al
clickear los links de cada proyecto.

### Contacto

`POST /api/send` además de mandar el mail inserta directamente
`Interacciones {tipo:"contacto", detalle:<email>}` y la fila en `Mensajes`.

## `/api/track`

`app/api/track/route.ts` — POST público, valida con zod:

```ts
{ tipo: z.enum(["visita","click","contacto"]),
  path: z.string().max(300).nullish(),
  detalle: z.string().max(300).nullish(),
  referrer: z.string().max(500).nullish() }
```

`visita` → `INSERT INTO Visitas {path, referrer}`; el resto →
`INSERT INTO Interacciones {tipo, detalle, path}`. Devuelve `{ok:true}`.

## Tablas (migración `20261020160000_dashboard.sql`)

| Tabla | Columnas | Notas |
| --- | --- | --- |
| `Visitas` | `id bigint identity always`, `path`, `referrer`, `created_at` | Una fila por path/sesión |
| `Interacciones` | `id bigint`, `tipo`, `detalle`, `path`, `created_at` | `tipo`: `click`, `contacto` |
| `Mensajes` | `id`, `id_mensaje`, `origen`, `nombre`, `destino`, `mensaje`, `estado` | Copia de cada mail enviado |

Las tres tienen RLS sin policies — se escriben solo con service role.

## `/api/dashboard`

`GET` (requiere sesión — check interno, no middleware) devuelve:

```ts
{ visitas:   Visitas[]        // últimas 500, desc por created_at
  interacciones: Interacciones[] // últimas 50
  mensajes:  Mensajes[]       // últimos 50 }
```

`POST {actual,nueva}` = cambio de contraseña (ver `docs/04-auth.md`).

## Página `/dashboard` (`app/dashboard/page.tsx`)

Client component; si `usuario === false` redirige a `/login` (además el
middleware protege `/dashboard` server-side). Muestra:

- **Cards** con totales: visitas, mensajes, interacciones.
- **Gráfico "Visitas por día"** con toggle `semanal`/`mensual`:
  - *Semanal* (7 días): barras de altura `(n/maxDia)*120px`, la última
    ("hoy") en `bg-primary` pleno.
  - *Mensual* (30 días): línea SVG (`<polyline>` + área con gradiente +
    punto final), viewBox `600×140`, eje con tres etiquetas
    (inicio / medio / "hoy").
  - La agregación es client-side: `counts` = Map `created_at.slice(0,10)` → n;
    `lastDays(n)` genera los últimos N días consecutivos (rellena ceros).
- **"Mensajes recibidos"**: lista `nombre`/`origen`/`mensaje` ("Anónimo" si
  falta nombre).
- **"Interacciones recientes"**: `tipo` + `detalle` + fecha/hora.
- **"Cambiar contraseña"**: form → `POST /api/dashboard`.

Nota: los contadores de las cards reflejan los **límites** del fetch
(500/50/50), no totales históricos.
