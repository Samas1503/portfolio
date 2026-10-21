struct Params {
  time: f32,
  texel: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

const RED = vec3f(0.984, 0.173, 0.212);
const LIGHT = vec3f(0.55, 0.8, 0.45);

fn rot(a: f32) -> mat2x2f {
  let c = cos(a);
  let s = sin(a);
  return mat2x2f(c, -s, s, c);
}

fn smin(a: f32, b: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

fn sdTorus(p: vec3f, t: vec2f) -> f32 {
  let q = vec2f(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

fn map(p0: vec3f) -> f32 {
  var p = p0;
  let rxz = rot(params.time * 0.35) * p.xz;
  p = vec3f(rxz.x, p.y, rxz.y);
  let rxy = rot(params.time * 0.22 + 1.1) * p.xy;
  p = vec3f(rxy.x, rxy.y, p.z);
  let torus = sdTorus(p, vec2f(0.85, 0.3));
  let orb = length(p - vec3f(1.2, 0.0, 0.0)) - 0.24;
  return smin(torus, orb, 0.4);
}

fn raymarch(ro: vec3f, rd: vec3f) -> f32 {
  var t = 0.0;
  for (var i = 0; i < 80; i++) {
    let d = map(ro + rd * t);
    if (d < 0.001) {
      return t;
    }
    t += d * 0.9;
    if (t > 12.0) {
      break;
    }
  }
  return -1.0;
}

fn calcNormal(p: vec3f) -> vec3f {
  let e = vec2f(0.0015, -0.0015);
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx)
  );
}

fn softShadow(ro: vec3f, rd: vec3f) -> f32 {
  var res = 1.0;
  var t = 0.02;
  for (var i = 0; i < 32; i++) {
    let h = map(ro + rd * t);
    if (h < 0.001) {
      return 0.0;
    }
    res = min(res, 10.0 * h / t);
    t += clamp(h, 0.02, 0.3);
    if (t > 6.0) {
      break;
    }
  }
  return clamp(res, 0.0, 1.0);
}

fn calcAO(p: vec3f, n: vec3f) -> f32 {
  var occ = 0.0;
  var sca = 1.0;
  for (var i = 0; i < 5; i++) {
    let h = 0.01 + 0.13 * f32(i) / 4.0;
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.75;
  }
  return clamp(1.0 - 2.0 * occ, 0.0, 1.0);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = (uv - 0.5) * vec2f(params.texel.y / params.texel.x, 1.0) * 2.2;

  let ro = vec3f(0.0, 0.1, 2.9);
  let rd = normalize(vec3f(p, -1.9));

  var col = vec3f(0.012, 0.007, 0.013);
  col += RED * exp(-length(p - vec2f(0.0, 0.05)) * 2.2) * 0.05;

  let t = raymarch(ro, rd);
  if (t > 0.0) {
    let pos = ro + rd * t;
    let n = calcNormal(pos);
    let l = normalize(LIGHT);
    let shd = softShadow(pos + n * 0.004, l);
    let ao = calcAO(pos, n);

    let dif = max(dot(n, l), 0.0);
    let h = normalize(l - rd);
    let spe = pow(max(dot(n, h), 0.0), 48.0);
    let fre = pow(clamp(1.0 + dot(n, rd), 0.0, 1.0), 3.0);

    var c = RED * 0.08;
    c += RED * dif * shd * 1.25;
    c += vec3f(1.0, 0.85, 0.8) * spe * shd * 1.1;
    c += RED * fre * 0.4;
    c *= 0.3 + 0.7 * ao;
    col = c;
  }

  col *= 1.0 - dot(p, p) * 0.28;
  return vec4f(col, 1.0);
}
