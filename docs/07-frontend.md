# 07 — Frontend

Una sola página (`app/page.tsx`) con layout tipo "split": sidebar sticky a la
izquierda (desktop) y columna de secciones a la derecha. Es
`force-dynamic`: el Server Component hace `Promise.all([getPerfil(),
getContactos()])` contra el repository directamente
(`backend/data/perfil.ts`, `backend/data/contactos.ts`).

## Estructura de la home

```tsx
<div className="relative">
  <Spotlight />                                        // halo que sigue al mouse (lg+)
  <VgpuAurora className="fixed inset-0 ..." />          // fondo WebGPU (z-0)
  <div className="... lg:flex lg:justify-between">
    <Sidebar perfil contactos />                        // lg:w-[48%] sticky h-screen
    <main className="lg:w-[52%]">
      <AboutMe /> <Services /> <Works /> <Academia />
      <Portfolio /> <Skills /> <Contact /> <Footer />
    </main>
  </div>
  <Navbar />                                            // bottom bar móvil (lg:hidden)
</div>
```

## Secciones (orden numerado)

Cada sección usa `Section` (`components/shared/section.tsx`):
`<section id className="reveal">` + título `NN.` + línea. El `id` es el anchor.

| # | `id` | Componente | Datos |
| --- | --- | --- | --- |
| 01 | `about` | `about-me.tsx` | `perfil` (server prop): párrafos separados por línea en blanco, `**texto**` resaltado; métricas `experiencia`/`clientes`/`proyectos` |
| 02 | `services` | `services.tsx` | `GET tipo=servicios`, agrupa por `tipo`; check `estado` (los no visibles solo los ve el admin) |
| 03 | `experience` | `experience.tsx` | `tipo=experience`; timeline ordenada por `fecha_fin` (vacío = actual); `MapDialog` con Google Maps si hay lat/lng |
| 04 | `academia` | `academia.tsx` | `tipo=academia`; `Carrera` en timeline, `Curso` en `<details>`; `MiniIcon3D` por tipo |
| 05 | `projects` | `portfolio.tsx` | `tipo=project`; filtros por `categoria`/`tags`, orden por `periodo`, 6 visibles + "Ver más"; clicks trackean a `/api/track` |
| 06 | `skills` | `skils.tsx` | `tipo=skills`; barras por `valor`, badge `nivel`; admin: sync/exclusiones/slider |
| 07 | `contact` | `contact.tsx` | `contactos` (server prop) + `ContactForm` → `/api/send` |

## Sidebar (`components/pages/sidebar.tsx`)

`lg:sticky lg:top-0 lg:h-screen lg:w-[48%]`: nombre/rol/alias/resumen del
perfil, CTA "Contactame" + "Descargar CV" (`perfil.cvUrl`), `Hero3D`,
iconos de `contactos`, `ToggleTheme`, y (admin) `AdminMenu` + `LogOutButton`
+ editar perfil + subir CV.

**Nav activo**: un `IntersectionObserver` con `rootMargin "-35% 0px -60% 0px"`
observa los ids de `sections` (`about…contact`) y marca el activo
(línea `w-8→w-16` + `text-primary`). Además dispara
`CustomEvent("section-mood", {detail: idx/(n-1)})` que `VgpuAurora` usa para
mover el parámetro `mood` del shader (0 → 1 a lo largo de la página).

## Navbar móvil (`components/pages/narvar.tsx`)

Barra fija `bottom-5` redondeada, solo `< lg`. Items de `itemsNavbar`
(`data.tsx`: Inicio + las 7 secciones) más `ToggleTheme`, `AdminMenu iconOnly`
y `LogOutButton`.

## Tema claro/oscuro

- `ThemeProvider` (`components/theme/theme-providers.tsx`, `next-themes`) en
  `app/layout.tsx`: `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`, `disableTransitionOnChange`; `<html suppressHydrationWarning>`.
- `app/globals.css`: tokens oklch en `:root` y `.dark` (vía
  `@custom-variant dark`), mapeados a Tailwind en `@theme inline`
  (`--color-*`). `primary` es el mismo rojo en ambos temas.
- `ToggleTheme` (`components/theme/toogle-theme.tsx`) alterna el tema;
  el cambio dispara el wipe WebGPU de `VgpuThemeWipe` (ver `docs/09-vgpu.md`).
- `metadata.other` en layout: `"darkreader-lock": "1"` (evita que extensiones
  tipo Dark Reader repinten) + `"color-scheme": "light dark"`.

## Animaciones

- `.reveal` (`globals.css`): `reveal-up` (fade+translate+blur) con
  `animation-timeline: view()` — entra al scrollear; solo con
  `prefers-reduced-motion: no-preference`.
- `.timeline-breathe`: keyframe `breathe` (glow+scale en los puntos del
  timeline de experiencia/academia), delay escalonado por ítem; items
  "actuales" suman `animate-ping`.
- `.spotlight` (`components/shared/spotlight.tsx`): div fijo con
  `radial-gradient(600px at var(--x) var(--y), var(--spotlight), transparent)`
  que sigue `pointermove` (solo `lg:`; color distinto por tema).
- Scroll suave global (`scroll-behavior: smooth`, desactivado con reduced-motion).

## Three.js (distinto de vgpu/WebGPU)

- `Hero3D` (`components/three/hero-3d.tsx`): wrapper con
  `dynamic(..., {ssr:false})` de `hero-scene.tsx` (@react-three/fiber):
  icosaedro wireframe + octaedro interior emissive, rotación + parallax con
  `state.pointer`, color por tema (`#e7000b` light / `#fb2c36` dark),
  respeta `prefers-reduced-motion`. Se usa en sidebar y en `/login`.
- `MiniIcon3D` (`components/three/mini-icon-3d.tsx`): icosaedro (`carrera`) o
  torus knot (`curso`) girando, en la sección Formación.

## Fuentes e imágenes

`layout.tsx` carga Inter (`--font-inter` → `font-sans`) y JetBrains Mono
(`--font-jetbrains` → `font-mono`) vía `next/font/google`.
Imágenes de proyectos (`ProjectImage` en `portfolio.tsx`): URL http(s) →
`<img>`; path cuyo segundo segmento es `uploads` (p. ej. `/uploads/...`) →
`next/Image`; cualquier otra cosa → `CldImage` (next-cloudinary) tratándolo
como public_id. En el server, `getFileData`
(`backend/Services/getData.service.tsx`) hace la conversión opuesta: si el
segundo segmento **no** es `uploads`, genera la URL con `cloudinary.url()`.
