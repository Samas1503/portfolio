import { fbmPerlin2d } from "@vgpu/wgsl-std/noise/perlin";

struct Params {
  time: f32,
  texel: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

const RED = vec3f(0.984, 0.173, 0.212);
const VIOLET = vec3f(0.42, 0.16, 0.74);

fn auroraLayer(p: vec2f, t: f32, seed: f32) -> f32 {
  let warp = fbmPerlin2d(p * 1.6 + vec2f(seed * 9.17, t * 0.05), 3, 2.0, 0.5);
  let x = p.x + warp * 0.45;
  let ridge = fbmPerlin2d(vec2f(x * 2.3 + seed * 5.31, seed * 2.87), 4, 2.0, 0.5) * 0.3;
  let d = p.y - ridge;
  let rays = 0.5 + 0.5 * fbmPerlin2d(vec2f(x * 6.5 + seed * 3.0, p.y * 0.7 - t * 0.12), 3, 2.0, 0.5);
  let edge = exp(-d * d * 26.0);
  let veil = exp(-max(d, 0.0) * 3.5) * exp(-max(-d, 0.0) * 9.0);
  return (edge + veil * 0.5) * (0.3 + 0.7 * rays);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = (uv - 0.5) * vec2f(params.texel.y / params.texel.x, 1.0);
  let t = params.time;
  let q = p + vec2f(t * 0.02, 0.0);

  var col = vec3f(0.014, 0.009, 0.016);

  let a1 = auroraLayer(q + vec2f(0.0, -0.08), t * 0.8, 0.0);
  let a2 = auroraLayer(q * 1.25 + vec2f(1.7, -0.3), t * 1.15, 4.7);
  let a3 = auroraLayer(q * 0.8 + vec2f(-2.3, 0.14), t * 0.6, 9.3);

  col += RED * a1 * 0.55;
  col += mix(RED, VIOLET, 0.55) * a2 * 0.4;
  col += mix(VIOLET, RED, 0.3) * a3 * 0.3;

  let glow = exp(-length(p - vec2f(sin(t * 0.25) * 0.3, -0.05)) * 2.8);
  col += RED * glow * 0.16;

  col *= 1.0 - length(p) * 0.62;
  return vec4f(col, 1.0);
}
