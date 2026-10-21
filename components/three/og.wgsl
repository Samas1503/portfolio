// og.wgsl — 1200x630 OpenGraph brand background.
// Red aurora ribbons over a near-black field, centered glow, text-free.
// Rendered as a single static frame (the route sets params.time = 3.7).

struct Params {
  time: f32,
  texel: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

const RED = vec3f(0.984, 0.173, 0.212); // #fb2c36
const MAGENTA = vec3f(0.55, 0.10, 0.38);

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = params.texel.y / params.texel.x;
  let p = (uv - 0.5) * vec2f(aspect, 1.0);
  let t = params.time;

  // Near-black base with a faint warm tint.
  var col = vec3f(0.014, 0.008, 0.011);

  // Aurora ribbons: sine-displaced horizontal bands with tight cores.
  for (var i = 0.0; i < 4.0; i += 1.0) {
    let w1 = sin(p.x * (2.3 + i * 0.9) + t * (0.55 + i * 0.23));
    let w2 = sin(p.x * (5.2 + i * 1.4) - t * (0.7 - i * 0.12) + p.y * 5.0);
    let y = -0.26 + i * 0.17 + w1 * 0.15 + w2 * 0.045;
    let d = abs(p.y - y);
    let band = exp(-d * (13.0 - i * 2.0));
    let core = exp(-d * 70.0);
    col += RED * (band * (0.42 - i * 0.05) + core * 0.55);
    col += MAGENTA * band * 0.16;
  }

  // Centered glow: wide red halo plus a hotter, smaller core.
  let r = length((p - vec2f(0.0, -0.04)) * vec2f(0.9, 1.35));
  col += RED * exp(-r * 4.2) * 0.55;
  col += vec3f(1.0, 0.5, 0.45) * exp(-r * 9.0) * 0.30;

  // Vignette keeps the corners dark.
  col *= 1.0 - smoothstep(0.55, 1.2, length(p)) * 0.85;

  // Gentle contrast curve for punch, then dither against banding.
  col = clamp(col, vec3f(0.0), vec3f(1.0));
  col = col * col * (3.0 - 2.0 * col);
  col += (hash(uv / params.texel) - 0.5) * (2.0 / 255.0);

  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0);
}
