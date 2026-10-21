import { simplex3d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  dt: f32,
  time: f32,
  aspect: f32,
  emit: f32,
  pointer: vec2f,
  velocity: vec2f,
  texel: vec2f,
  decay: f32,
  radius: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var prev: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

const SMOKE = vec3f(0.984, 0.173, 0.212); // #fb2c36

fn flow(p: vec2f, t: f32) -> vec2f {
  return vec2f(
    simplex3d(vec3f(p, t)),
    simplex3d(vec3f(p + vec2f(17.3, 9.1), t)),
  );
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let dt = min(params.dt, 0.05);
  let p = (uv - vec2f(0.5)) * vec2f(params.aspect, 1.0);

  // Advection: pull texels from where the smoke came from. Top-origin uv,
  // so a buoyant rise samples from below (positive v).
  let vel = clamp(params.velocity, vec2f(-2.0), vec2f(2.0));
  let turb = flow(p * 2.4, params.time * 0.25) * 0.9;
  var src = uv - vel * dt - turb * dt * 0.03;
  src.y += 0.012 * dt;

  // Cross blur for diffusion (5 taps).
  var c = textureSampleLevel(prev, samp, src, 0.0) * 0.55;
  let o = params.texel * 1.75;
  c += textureSampleLevel(prev, samp, src + vec2f(o.x, 0.0), 0.0) * 0.1125;
  c += textureSampleLevel(prev, samp, src - vec2f(o.x, 0.0), 0.0) * 0.1125;
  c += textureSampleLevel(prev, samp, src + vec2f(0.0, o.y), 0.0) * 0.1125;
  c += textureSampleLevel(prev, samp, src - vec2f(0.0, o.y), 0.0) * 0.1125;

  // Framerate-independent exponential decay.
  c *= exp2(-dt * params.decay);

  // Gaussian splat at the pointer (round in screen space).
  let dp = (uv - params.pointer) * vec2f(params.aspect, 1.0);
  let s = exp(-dot(dp, dp) / (params.radius * params.radius)) * params.emit;
  let rgb = c.rgb + SMOKE * s;
  let a = min(c.a + s, 1.0);
  return vec4f(rgb, a);
}
