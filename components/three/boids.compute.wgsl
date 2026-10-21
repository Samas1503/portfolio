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

const PERCEPTION: f32 = 0.14;
const MAX_SPEED: f32 = 0.55;
const MIN_SPEED: f32 = 0.18;
const MAX_FORCE: f32 = 3.0;
const W_SEPARATE: f32 = 1.7;
const W_ALIGN: f32 = 1.0;
const W_COHERE: f32 = 0.9;
const BOUNDS_Y: f32 = 1.15;

var<workgroup> tile: array<Particle, 64>;

fn limitVec(v: vec2f, m: f32) -> vec2f {
  let l2 = dot(v, v);
  if (l2 > m * m) {
    return v * (m / sqrt(l2));
  }
  return v;
}

// Shortest wrapped delta (toroidal space): b - a across the wrap seams.
fn wrapDelta(a: vec2f, b: vec2f) -> vec2f {
  var d = b - a;
  let bx = params.aspect + 0.15;
  if (d.x > bx) {
    d.x -= 2.0 * bx;
  } else if (d.x < -bx) {
    d.x += 2.0 * bx;
  }
  if (d.y > BOUNDS_Y) {
    d.y -= 2.0 * BOUNDS_Y;
  } else if (d.y < -BOUNDS_Y) {
    d.y += 2.0 * BOUNDS_Y;
  }
  return d;
}

fn steer(desired: vec2f, vel: vec2f) -> vec2f {
  if (dot(desired, desired) < 1e-6) {
    return vec2f(0.0);
  }
  return limitVec(normalize(desired) * MAX_SPEED - vel, MAX_FORCE);
}

@compute @workgroup_size(64)
fn cs_main(
  @builtin(global_invocation_id) gid: vec3u,
  @builtin(local_invocation_id) lid: vec3u,
) {
  let n = arrayLength(&particles);
  let i = gid.x;
  var p = Particle(vec2f(0.0), vec2f(0.0));
  if (i < n) {
    p = particles[i];
  }

  // Neighborhood query: brute-force O(n^2) tiled through workgroup memory.
  var sep = vec2f(0.0);
  var ali = vec2f(0.0);
  var coh = vec2f(0.0);
  var neighbors = 0u;
  let r2 = PERCEPTION * PERCEPTION;
  let numTiles = (n + 63u) / 64u;
  for (var t = 0u; t < numTiles; t = t + 1u) {
    let j = t * 64u + lid.x;
    if (j < n) {
      tile[lid.x] = particles[j];
    }
    workgroupBarrier();
    for (var k = 0u; k < 64u; k = k + 1u) {
      let idx = t * 64u + k;
      if (idx >= n) {
        break;
      }
      if (idx == i) {
        continue;
      }
      let q = tile[k];
      let rel = wrapDelta(p.pos, q.pos); // p -> q
      let d2 = dot(rel, rel);
      if (d2 < r2 && d2 > 1e-7) {
        sep += -rel / (d2 + 1e-4); // push away, stronger when closer
        ali += q.vel;
        coh += rel; // accumulate wrapped offsets, avg is direction to flock
        neighbors += 1u;
      }
    }
    workgroupBarrier();
  }

  let dt = min(params.dt, 0.05);
  var acc = vec2f(0.0);
  if (neighbors > 0u) {
    let nf = f32(neighbors);
    acc += steer(sep, p.vel) * W_SEPARATE;
    acc += steer(ali / nf, p.vel) * W_ALIGN;
    acc += steer(coh / nf, p.vel) * W_COHERE;
  }

  // Gentle attraction to pointer (world space).
  let toPointer = wrapDelta(p.pos, params.pointer);
  let pd2 = dot(toPointer, toPointer);
  acc += toPointer * params.strength * 1.2 / (pd2 + 0.4);

  p.vel += limitVec(acc, MAX_FORCE) * dt;

  // Clamp speed; keep a floor so heading stays well-defined.
  p.vel = limitVec(p.vel, MAX_SPEED);
  let sp = length(p.vel);
  if (sp < MIN_SPEED && sp > 1e-5) {
    p.vel *= MIN_SPEED / sp;
  }
  p.pos += p.vel * dt;

  // Wrap at padded bounds.
  let bx = params.aspect + 0.15;
  if (p.pos.x > bx) {
    p.pos.x = -bx;
  }
  if (p.pos.x < -bx) {
    p.pos.x = bx;
  }
  if (p.pos.y > BOUNDS_Y) {
    p.pos.y = -BOUNDS_Y;
  }
  if (p.pos.y < -BOUNDS_Y) {
    p.pos.y = BOUNDS_Y;
  }

  if (i < n) {
    particles[i] = p;
  }
}
