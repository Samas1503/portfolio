# 04 — Autenticación

Single-admin. Las credenciales se verifican contra la tabla `Usuarios`
(`email` + `password_hash`); `ADMIN_EMAIL`/`ADMIN_PASSWORD` sirven para el
bootstrap y el self-heal del hash.

## Flujo de login

```
/login (app/login/page.tsx)
  → LoginForm (app/login/form.tsx, "use client", RHF + zodResolver loginSchema)
      email valido + password min 8 (app/login/schema.tsx)
  → server action login() (app/login/actions.tsx)
      1. hash = sha256(password + SESSION_SECRET)     (app/lib/password.ts)
      2. SELECT Usuarios WHERE email=? AND password_hash=hash
      3. Si no hay match y (email,password) === (ADMIN_EMAIL, ADMIN_PASSWORD):
             UPSERT Usuarios SET password_hash=hash ON CONFLICT email
             → crea la fila la primera vez y re-hashea si SESSION_SECRET cambió
      4. createSession(userId)                         (app/lib/session.ts)
             JWT HS256 ("jose"), exp 1h
             cookie "session"  httpOnly secure expires=1h   ← auth real
             cookie "usuario"  httpOnly:false "true"        ← flag de UI
      5. redirect("/dashboard")
```

Si las credenciales no matchean ni la DB ni las env vars →
`{ errors: { email: ["Email o contraseña inválidos"] } }`.

## Hash de contraseña

`app/lib/password.ts`:

```ts
createHash("sha256").update(password + (process.env.SESSION_SECRET ?? "")).digest("hex")
```

SHA-256 con `SESSION_SECRET` como pepper del servidor. Consecuencia: cambiar
`SESSION_SECRET` invalida el hash guardado, pero el próximo login con las env
vars correctas lo re-hashea solo (paso 3). La contraseña nueva debe tener
mínimo 8 caracteres (zod en `app/api/dashboard/route.ts` y en `loginSchema`).

## Sesión

`app/lib/session.ts` (marcado `import "server-only"`):

- `encript(payload)` → `SignJWT({userId, expiresAt})`, `alg: HS256`,
  `setExpirationTime("1h")`, firmado con `SESSION_SECRET`.
- `decrypt(token)` → `jwtVerify`; devuelve `undefined` si expiró/es inválido
  (loguea el error, no lanza).
- `createSession(userId)` setea las dos cookies; `deleteSession()` borra ambas.

La cookie `usuario` es **solo un flag de UI**: `useUsuario()`
(`context/UserContext.tsx`) la lee de `document.cookie` para mostrar/ocultar
los controles de admin. La autorización real es siempre la cookie `session`
httpOnly, que JS no puede leer.

## Middleware (`middleware.ts`)

```ts
const protectedRoutes = ["/api", "/dashboard"];
const publicRoutes = ["/login"];

const isMutatingApi =
  (path.startsWith("/api/table") ||
   path.startsWith("/api/cv") ||
   path.startsWith("/api/skills")) &&
  req.method !== "GET" && req.method !== "OPTIONS";
```

| Condición | Sin sesión | Con sesión |
| --- | --- | --- |
| `isMutatingApi` (POST/PATCH/DELETE a `/api/table*`, `/api/cv*`, `/api/skills*`) | `401 {error:"No autorizado"}` | pasa |
| `path === "/api"` o `"/dashboard"` (match exacto) | redirect → `/login` | pasa |
| `path === "/login"` | pasa | redirect → `/` |

**Gotchas:**

- Los GET a `/api/*` son **públicos** (la web pública lee el contenido sin sesión).
- El middleware solo protege los prefijos listados. `/api/send`, `/api/track`
  son públicos; `/api/dashboard` y `/api/repo-fill` **no** pasan por el
  middleware (GET no mutante) y hacen su propio check de sesión interno
  (`requireSession()` / `decrypt` manual).
- `protectedRoutes.includes(path)` es comparación exacta, no `startsWith`
  — protege `/dashboard` pero no subrutas arbitrarias.

## Logout

`app/login/actions.tsx` exporta `logout()`: borra ambas cookies y redirige a
`/login`. Lo invoca `LogOutButton` (`app/logout/page.tsx` — es un client
component botón, no una página real) y `AdminMenu`
(`components/pages/admin-menu.tsx`). Ambos también hacen `setUsuario(false)`
para apagar la UI de admin en el momento.

Además, `apiFetch` (`components/pages/fetch/tech-all.tsx`) maneja el `401`
de una sesión expirada: borra `document.cookie = "usuario=; Max-Age=0"` y
redirige a `/login`.

## Cambio de contraseña (dashboard)

`POST /api/dashboard` con `{ actual, nueva }` (zod: `nueva` min 8):

1. `requireSession()` verifica el JWT.
2. Lee `Usuarios` por `session.userId` y compara
   `password_hash === hashPassword(actual)` → 400 si no coincide.
3. `UPDATE password_hash = hashPassword(nueva)`.

Nota: el cambio solo afecta la tabla — si `ADMIN_PASSWORD` sigue siendo la
vieja, el próximo login con la contraseña nueva funciona (matchea la DB) pero
el self-heal no pisa el hash salvo que el login falle *y* las env vars
coincidan.
