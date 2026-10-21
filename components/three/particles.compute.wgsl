import { simplex3d } from "@vgpu/wgsl-std/noise/simplex";

struct Particle {
  pos: vec2f,
  vel: vec2f,
}

struct SimParams {
  dt: f32,
  time: f32,
  aspect: f32,
  strength: f32,
  pointer: vec2f,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;

fn flow(p: vec2f, t: f32) -> vec2f {
  return vec2f(
    simplex3d(vec3f(p * 0.85, t)),
    simplex3d(vec3f(p * 0.85 + vec2f(19.7, 7.3), t)),
  );
}

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&particles)) {
    return;
  }
  var p = particles[i];
  let dt = min(params.dt, 0.05);

  // Organic drift: simplex flow field.
  p.vel += flow(p.pos, params.time * 0.12) * 0.55 * dt;

  // Subtle pointer repulsion (world space, y in [-1, 1], x in [-aspect, aspect]).
  let toPointer = p.pos - params.pointer;
  let d2 = dot(toPointer, toPointer);
  p.vel += toPointer * (params.strength * 0.6) * dt / (d2 + 0.06);

  // Weak centering pull so the field never fully escapes the canvas.
  p.vel += -p.pos * 0.04 * dt;

  p.vel *= max(0.0, 1.0 - 1.8 * dt);
  p.pos += p.vel * dt;

  // Wrap at padded bounds.
  let bx = params.aspect + 0.15;
  if (p.pos.x > bx) {
    p.pos.x = -bx;
  }
  if (p.pos.x < -bx) {
    p.pos.x = bx;
  }
  if (p.pos.y > 1.15) {
    p.pos.y = -1.15;
  }
  if (p.pos.y < -1.15) {
    p.pos.y = 1.15;
  }

  particles[i] = p;
}
