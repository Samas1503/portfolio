import { hashU32, unitFloat } from "@vgpu/wgsl-std/hash";

struct Particle {
  pos: vec2f,
  vel: vec2f,
}

struct RenderParams {
  dt: f32,
  time: f32,
  aspect: f32,
  strength: f32,
  pointer: vec2f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: RenderParams;

struct VSOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) tint: f32,
}

@vertex
fn vs_main(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  var corners = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0),
    vec2f(-1.0, -1.0),
    vec2f(1.0, 1.0),
    vec2f(-1.0, 1.0),
  );
  let p = particles[ii];
  let corner = corners[vi];
  let rnd = unitFloat(hashU32(ii + 1u));

  // Elongated dart oriented along velocity.
  let speed = length(p.vel);
  let fwd = p.vel / max(speed, 1e-4);
  let side = vec2f(-fwd.y, fwd.x);
  let halfLen = 0.011 + 0.004 * rnd;
  let halfWid = 0.0035 + 0.0015 * rnd;
  let offset = fwd * corner.y * halfLen + side * corner.x * halfWid;
  let center = vec2f(p.pos.x / params.aspect, p.pos.y);

  var out: VSOut;
  out.position = vec4f(
    center + offset * vec2f(1.0 / params.aspect, 1.0),
    0.0,
    1.0,
  );
  out.uv = corner;
  out.tint = 0.35 + 0.65 * rnd;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  let d = length(in.uv);
  let fall = saturate(1.0 - d);
  var a = fall * fall * in.tint;
  // Slightly brighter toward the leading tip.
  a *= 0.7 + 0.3 * smoothstep(-1.0, 1.0, in.uv.y);
  let core = vec3f(0.984, 0.173, 0.212); // #fb2c36
  let glow = vec3f(0.4, 0.08, 0.35);
  let col = (core + glow * (1.0 - fall)) * a;
  return vec4f(col, a);
}
