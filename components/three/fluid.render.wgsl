@group(0) @binding(0) var prev: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

// Presents the sim buffer onto the transparent overlay canvas.
// Canvas alphaMode is premultiplied, so output premultiplied color.
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let c = textureSampleLevel(prev, samp, uv, 0.0);
  let a = clamp(c.a, 0.0, 1.0);
  let rgb = clamp(c.rgb, vec3f(0.0), vec3f(1.0));
  return vec4f(rgb * a, a);
}
