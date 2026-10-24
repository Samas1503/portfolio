# 09 — vgpu / WebGPU

El proyecto usa [`vgpu`](https://github.com/vercel-labs/vgpu) `^0.6.0` +
`@vgpu/wgsl` `^0.6.0` para efectos WebGPU escritos en WGSL, tanto en el
browser (componentes `components/three/vgpu-*.tsx`) como headless en Node
(`/api/og`). Convive con Three.js (`@react-three/fiber`), que se usa solo
para `Hero3D` y `MiniIcon3D` — son dos stacks distintos.

## Loaders de `.wgsl` (`next.config.ts`)

Los shaders se importan como módulos TS (`import shader from "./x.wgsl"`).
Hay loaders para los dos bundlers:

```ts
turbopack: { rules: { "*.wgsl": wgslTurbopackRule({ minify: true }) } },
webpack(config) {
  config.module.rules.push({
    test: /\.wgsl$/,
    loader: "@vgpu/wgsl/loader-webpack",
    options: { minify: true },
  });
}
```

`npm run dev` usa turbopack (`next dev --turbopack`); el rule de webpack cubre
builds/hosts que no usen turbopack. Los tipos de los imports `.wgsl` vienen de
`wgsl-env.d.ts` (`/// <reference types="@vgpu/wgsl/wgsl-types" />`).

En **route handlers no hay loader**: `/api/og` resuelve el shader a mano con
`resolveShader({entry})` + `prepareShader` de `@vgpu/wgsl` (runtime), porque
los imports de `.wgsl` no pasan por el bundler dentro del handler.

## Componentes montados

| Componente | Shader | Dónde | Qué hace |
| --- | --- | --- | --- |
| `VgpuAurora` | `aurora-bg.wgsl` | `app/page.tsx` (canvas `fixed inset-0`, fondo) | Aurora de fondo. `init()` → `surface` (dpr `[1,1.5]`) → `effect` con `params {time, texel, mood}`. `mood` viene del evento `section-mood` que dispara el `IntersectionObserver` del sidebar (0→1 al bajar por las secciones). Con `prefers-reduced-motion` renderiza un solo frame (`time=20`) y solo redibuja al cambiar `mood`. Si `init()` falla → `return null` |
| `VgpuThemeWipe` | `theme-wipe.wgsl` | `app/layout.tsx` (canvas `fixed` z-50) | Transición de 0.6 s al cambiar `resolvedTheme`: `frameLoop` solo corre durante el wipe (`blend:"premultiplied"`); ignora la hidratación inicial (`prev === undefined`) y reduced-motion |
| `/api/og` | `og.wgsl` | route handler | Render headless 1200×630 con `vgpu/node` (`init`, `target`, `effect(...).draw(target)`, `time=3.7`), pixeles → PNG con `pngjs`. Si el host no tiene adaptador GPU → `renderFallbackPng()` puro JS (ver `docs/05-api.md`) |

Todos los componentes browser siguen el mismo patrón: `init()` dentro de un
`useEffect` async, `frameLoop`/`frame` para dibujar, `loop?.stop()` y flag
`cancelled` en el cleanup, y estado `failed` → `return null` cuando WebGPU no
está disponible (degradación silenciosa).

## Componentes existentes pero desmontados

Los archivos existen en `components/three/` pero **no se importan desde
ningún otro módulo** (quedaron fuera por performance). Sirven de base para
reincorporar efectos:

- `vgpu-bloom.tsx` — `bloom.wgsl`
- `vgpu-raymarched.tsx` — `raymarched.wgsl`
- `vgpu-particles.tsx` — `particles.compute.wgsl` + `particles.render.wgsl`
- `vgpu-boids.tsx` — `boids.compute.wgsl` + `boids.render.wgsl`
- `vgpu-fluid.tsx` — `fluid.sim.wgsl` + `fluid.render.wgsl`
- `vgpu-plasma.tsx` — `plasma.wgsl`

Los que usan compute shaders (`particles`, `boids`, `fluid`) tienen dos WGSL
(sim + render).

## CLI y skills

`vgpu` expone un bin (`npx vgpu`). Subcomandos útiles (salida de
`npx vgpu --help` en v0.6.0):

```bash
npx vgpu docs cat getting-started.md   # doc de referencia del paquete instalado
npx vgpu docs find "<topic|símbolo>"   # buscar en los docs
npx vgpu check <file.wgsl>             # valida/refleja un shader WGSL como JSON
npx vgpu examples search "<topic>"     # ejemplos oficiales
npx vgpu doctor                        # diagnóstico del entorno de render en Node
npx vgpu mcp                           # sirve docs+examples por stdio (MCP)
```

El repo trae skills de agente instalados en `.agents/skills/`
(pinneados en `skills-lock.json`, source `vercel-labs/vgpu`):

- `vgpu` — API, workflows WGSL, browser/Node rendering, Blender assets.
- `vgpu-agent-flow` — workflow de agentes para features vgpu.
- `visual-explainer` — walkthroughs visuales.

Se instalan con `npx skills add vercel-labs/vgpu`.
