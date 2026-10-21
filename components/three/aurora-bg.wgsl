import { fbmPerlin2d } from "@vgpu/wgsl-std/noise/perlin";

struct Params {
  time: f32,
  texel: vec2f,
  mood: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

const RED = vec3f(0.984, 0.173, 0.212);
const VIOLET = vec3f(0.4, 0.17, 0.72);

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = (uv - 0.5) * vec2f(params.texel.y / params.texel.x, 1.0);
  let t = params.time;

  var q = p * 1.5;
  q += vec2f(t * 0.03, -t * 0.012);

  let warp = fbmPerlin2d(q + vec2f(t * 0.02, 0.0), 4, 2.0, 0.5);
  let wq = q + vec2f(warp * 0.9, warp * 0.35);
  let field = fbmPerlin2d(wq + vec2f(3.71, 8.23), 5, 2.0, 0.5);
  let band = smoothstep(-0.15, 0.9, field);
  let swell = 0.5 + 0.5 * fbmPerlin2d(wq * vec2f(2.6, 0.9) + vec2f(17.4, -t * 0.05), 3, 2.0, 0.5);

  let accent = mix(RED, VIOLET, clamp(params.mood, 0.0, 1.0));

  var col = vec3f(0.011, 0.007, 0.013);
  col += accent * band * (0.028 + 0.05 * swell);
  col += mix(accent, VIOLET, 0.4) * swell * band * 0.03;

  col *= 1.0 - length(p) * 0.45;
  return vec4f(max(col, vec3f(0.0)), 1.0);
}
