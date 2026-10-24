# 06 — Panel de administración

No hay un área separada: la UI de admin vive **dentro de la página pública**.
Todos los controles se renderizan solo si `useUsuario()` devuelve `true`
(la cookie legible `usuario=true`; la auth real es la cookie `session`).

## Piezas

| Pieza | Archivo | Rol |
| --- | --- | --- |
| `useUsuario` / `UserProvider` | `context/UserContext.tsx` | Lee `document.cookie` `usuario=`; flag de UI (no auth) |
| `ModalTriggerButton` | `components/pages/forms/ModalTriggerButton.tsx` | Envuelve un botón; abre un `Dialog` con el `DynamicForm`. Decide POST vs PATCH según `id` |
| `DynamicForm` | `components/pages/forms/DynamicForm.tsx` | Renderiza RHF+Zod a partir de `fields` |
| `formsData` | `components/pages/forms/formsData.tsx` | Config por formulario: schema Zod + `fields[]` |
| `FieldType` | `components/pages/forms/types.ts` | Tipos de campo soportados |
| `apiFetch` | `components/pages/fetch/tech-all.tsx` | `fetch` same-origin a `/api/table`; maneja 401 → `/login` |
| `DeleteButton` | `components/shared/delete-button.tsx` | Botón `X` → `DELETE /api/table/[id]` |
| `AdminMenu` | `components/pages/admin-menu.tsx` | Dropdown con links a secciones, dashboard y logout |
| `LogOutButton` | `app/logout/page.tsx` | Client component botón (no es página) |

## `ModalTriggerButton`

```tsx
<ModalTriggerButton
  tipoFormulario="project"        // key de formsData
  id={data.id}                    // opcional → PATCH; sin id → POST
  defaultValues={toFormValues(data)}
  omitFields={["image"]}          // omite fields y les hace .omit() al schema
  transform={(values) => ({...values, tags: parseTags(values.tags)})}
  title="Editar: Proyecto"
  onSuccess={(result, tipo) => ...}
>
  <Button>Editar</Button>         // el click en children abre el Dialog
</ModalTriggerButton>
```

- Solo renderiza si `usuario === true`.
- `omitFields` filtra `fields` **y** hace `schema.omit({campo: true})` para que
  Zod no exija el campo omitido (p. ej. la imagen al editar un proyecto).
- `transform` solo aplica cuando el payload **no** es `FormData`.
- `onSuccess` recibe el resultado del `apiFetch` (o `{...payload, id}` en
  edición) + el `tipo` del registro para actualizar el estado local.

## `DynamicForm` y tipos de campo

Renderiza cada `FieldType` (`label`, `name`, `placeholder`, `type`,
`accept?`, `values?`, `max?`, `min?`):

| `type` | Render | Notas |
| --- | --- | --- |
| `text`, `email`, `number`, `date`, `password` | `<Input>` | `number`/`hidden` inicializan en `0` |
| `textarea` | `<Textarea>` | |
| `dropdown` | `DropdownMenu` con `RadioGroup` | Opciones en `values`; estado espejo en `dropdownValues` |
| `file` | `<Input type="file">` | El archivo se guarda en `fileRefs` (fuera de RHF) |
| `hidden` | nada visible (label en `<p hidden>`) | Se envía igual (p. ej. `latitud`, `longitud`) |
| `geolocalization` | `<GoogleMaps>` | Click en el mapa escribe `latitud`/`longitud` |

**Submit**: si hay un campo `type: "file"` se arma `FormData` (los `File` de
`fileRefs` + los demás valores como strings) → `POST`/`PATCH` multipart
(que **salta la validación Zod del server** — gotcha). Si no, va JSON.
En `project`, `tags` viaja como string `"a, b, c"` y `parseTags` lo convierte
a array en el server.

## Formularios disponibles (`formsData`)

`contacto`, `project`, `perfil`, `servicios`, `skills`, `experience`,
`academia`, `mensajes` — cada uno con su schema Zod y fields (ver
`components/pages/forms/formsData.tsx`). El de `perfil` se usa dos veces con
`omitFields` opuestos: `PERFIL_HEADER_FIELDS` (header) vs
`PERFIL_ABOUT_FIELDS` (sección Sobre mí). Helpers: `toFormValues` (null→""),
`PROJECT_CATEGORIES`, `SERVICE_ICONS`, `CONTACT_ICONS` (dropdowns).

## Acciones especiales del admin

- **Subir CV**: en `components/pages/sidebar.tsx`, input file oculto →
  `POST /api/cv` con `file`+`id`. Actualiza `perfil.cvUrl` en estado local.
- **"Rellenar desde repositorio"**: en `DynamicForm`, aparece bajo el campo
  `urlGithub` si el form lo tiene. `GET /api/repo-fill?url=…` → rellena
  `titulo`, `descripcion`, `categoria`, `rol`, `periodo`, `tags`.
- **Recalcular skills**: botón en `components/pages/skils.tsx` →
  `POST /api/skills/sync`. Si `aborted === "rate_limit"` avisa configurar
  `GITHUB_TOKEN`.
- **Excluir skill del cálculo**: botón `Calculator`/`Lock` por skill →
  `POST /api/skills/exclusions {id, excluida}`. Las excluidas muestran
  badge "Manual" y un `<input type="range">` para setear `valor` a mano
  (PATCH con debounce de 500 ms; `nivel` se deriva de `valor`: ≥75
  Experimentado, ≥45 Intermedio, si no Básico).
- **Toggle de servicios**: `components/pages/services.tsx` permite tildar/
  destildar `estado` por servicio (PATCH); los destildados solo los ve el admin.
- **Editar/eliminar por ítem**: cada card/ítem de las secciones tiene su
  `ModalTriggerButton` (lápiz) y `DeleteButton` (X).

## Sync de skills (algoritmo)

`backend/Services/skillsSync.service.tsx`: corre tras cada POST/PATCH/DELETE
de `project` (`after()`) y por el botón manual.

1. Trae proyectos + skills + ids excluidos; extrae slugs `owner/repo` de
   `urlGithub` y llama a GitHub `/languages` (cache en memoria, 8 s timeout).
2. Peso = `0.6` × bytes de lenguaje (normalizado) + `0.4` × frecuencia en tags.
3. Mapea lenguaje/tag → skill via `SKILL_ALIASES` + `matchesCandidate`
   (sufijo numérico: `react19` matchea `react`).
4. `valor = round(35 + 65·√(peso/max))` — piso 35, máximo 100 para la top.
5. Skills sin evidencia conservan su valor; las excluidas no se tocan.
6. Lenguajes/tags detectados sin skill asociada se **crean** (nombre y `tipo`
   de `NEW_SKILL_CATALOG`, o el tag crudo + `"Herramientas"`).
7. Si algún repo dio rate limit → aborta entero (`aborted: "rate_limit"`).

`IGNORE_KEYS` filtra ruido (`json`, `yaml`, `makefile`, `dockerignore`, ...).
