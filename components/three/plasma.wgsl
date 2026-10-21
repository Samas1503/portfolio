struct Params {
  time: f32,
  texel: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = params.time * 0.45;
  var p = (uv - 0.5) * vec2f(params.texel.y / params.texel.x, 1.0);
  var col = vec3f(0.03, 0.02, 0.03);

  for (var i = 0.0; i < 3.0; i += 1.0) {
    let w = sin(p.x * (2.2 + i) + t * (0.7 + i * 0.35) + sin(p.y * 3.0 + t * 0.8) * 1.4);
    let band = smoothstep(0.18 + i * 0.12, 0.0, abs(p.y + w * 0.22 - 0.15 + i * 0.28));
    col += vec3f(0.98, 0.17, 0.21) * band * (0.4 - i * 0.1);
    col += vec3f(0.5, 0.1, 0.6) * band * 0.15;
  }

  let glow = exp(-length(p - vec2f(sin(t * 0.3) * 0.3, -0.1)) * 3.0);
  col += vec3f(0.98, 0.17, 0.21) * glow * 0.25;

  col *= 1.0 - length(p) * 0.65;
  return vec4f(col, 1.0);
}
