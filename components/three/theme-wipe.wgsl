struct Params {
  progress: f32,
  time: f32,
  aspect: f32,
  texel: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

const RED = vec3f(0.984, 0.173, 0.212); // #fb2c36
const DEEP = vec3f(0.906, 0.0, 0.043); // #e7000b

// Radial wipe: a red disc grows to cover the screen, then a hole grows
// from the center to reveal the new theme. Premultiplied output.
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = clamp(params.progress, 0.0, 1.0);
  let d = length((uv - vec2f(0.5)) * vec2f(params.aspect, 1.0));
  let maxR = length(vec2f(params.aspect, 1.0) * 0.5) + 0.08;

  let e = 0.05;
  let r1 = smoothstep(0.0, 0.45, p) * maxR; // cover edge
  let r2 = smoothstep(0.55, 1.0, p) * maxR; // reveal hole
  let cover = (1.0 - smoothstep(r1 - e, r1, d)) * smoothstep(r2 - e, r2, d);

  // Bright rim on both sweeping edges.
  let ringIn = smoothstep(r1 - e * 2.5, r1, d) - smoothstep(r1 - e * 0.5, r1, d);
  let ringOut = (smoothstep(r2 - e * 0.5, r2, d) - smoothstep(r2 + e * 1.5, r2, d)) * step(0.001, r2);
  let ring = clamp(ringIn + ringOut, 0.0, 1.0);

  // Subtle concentric scanline shimmer.
  let scan = 0.93 + 0.07 * sin(d * 240.0 - params.time * 30.0);

  let col = mix(RED, DEEP, ring) * scan;
  let a = clamp(cover + ring * 0.4, 0.0, 1.0);
  return vec4f(col * a, a);
}
