struct Params {
  direction: vec2f,
  threshold: f32,
  intensity: f32,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var srcTex: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;
@group(0) @binding(3) var bloomTex: texture_2d<f32>;

// Bright-pass: keep only luminance above threshold (soft knee).
@fragment fn fs_bright(@location(0) uv: vec2f) -> @location(0) vec4f {
  let c = textureSampleLevel(srcTex, samp, uv, 0.0).rgb;
  let luma = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  let w = smoothstep(params.threshold, params.threshold + 0.4, luma);
  return vec4f(c * w, 1.0);
}

// Separable Gaussian blur (9-tap, linear-sampled). direction = (1,0) or (0,1).
@fragment fn fs_blur(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = params.direction / vec2f(textureDimensions(srcTex));
  var acc = textureSampleLevel(srcTex, samp, uv, 0.0).rgb * 0.2270270;
  acc += textureSampleLevel(srcTex, samp, uv + texel * 1.3846154, 0.0).rgb * 0.3162162;
  acc += textureSampleLevel(srcTex, samp, uv - texel * 1.3846154, 0.0).rgb * 0.3162162;
  acc += textureSampleLevel(srcTex, samp, uv + texel * 3.2307692, 0.0).rgb * 0.0702703;
  acc += textureSampleLevel(srcTex, samp, uv - texel * 3.2307692, 0.0).rgb * 0.0702703;
  return vec4f(acc, 1.0);
}

// Composite scene + bloom, gentle filmic curve to keep reds from clipping.
@fragment fn fs_composite(@location(0) uv: vec2f) -> @location(0) vec4f {
  let scene = textureSampleLevel(srcTex, samp, uv, 0.0).rgb;
  let bloom = textureSampleLevel(bloomTex, samp, uv, 0.0).rgb;
  var col = scene + bloom * params.intensity;
  col = col / (1.0 + col * 0.12);
  return vec4f(col, 1.0);
}
