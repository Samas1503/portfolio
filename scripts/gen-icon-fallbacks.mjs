// Renderiza los meshes de MiniIcon3D a PNG (software raster) para usar
// como fallback cuando no hay contexto WebGL disponible.
// Uso: node scripts/gen-icon-fallbacks.mjs
import * as THREE from "three";
import { PNG } from "pngjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public/icons3d"
);
mkdirSync(OUT, { recursive: true });

const SS = 4; // supersampling anti-alias
const SIZE = 256;
const W = SIZE * SS;

const SHAPES = {
  carrera: new THREE.IcosahedronGeometry(1, 0),
  evento: new THREE.DodecahedronGeometry(1, 0),
  curso: new THREE.TorusKnotGeometry(0.7, 0.22, 64, 8),
};

const THEMES = {
  dark: new THREE.Color("#fb2c36"),
  light: new THREE.Color("#e7000b"),
};

// Cámara y luces replicando Scene: camera z=3.2 fov=45, ambient 0.7,
// pointLight en (2,2,3).
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0, 3.2);
camera.updateMatrixWorld();
camera.updateProjectionMatrix();
const light = new THREE.Vector3(2, 2, 3).normalize();
const AMBIENT = 0.55;
const DIFFUSE = 0.85;

function rasterize(geo, base) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.getAttribute("position");
  const px = new Float32Array(W * W * 4);

  const v = new THREE.Vector3();
  const tris = [];
  for (let i = 0; i < pos.count; i += 3) {
    const pts = [];
    let zSum = 0;
    for (let j = 0; j < 3; j++) {
      v.fromBufferAttribute(pos, i + j);
      const worldZ = v.z;
      zSum += worldZ;
      v.project(camera);
      pts.push([(v.x * 0.5 + 0.5) * W, (0.5 - v.y * 0.5) * W, v.z]);
    }
    // normal de cara (flat shading) con el orden original
    const a = new THREE.Vector3().fromBufferAttribute(pos, i);
    const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
    const n = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .normalize();
    tris.push({ pts, n, z: zSum / 3 });
  }
  tris.sort((t1, t2) => t1.z - t2.z); // painter: lejos → cerca (z ndc)

  for (const { pts, n } of tris) {
    const lam = Math.max(0, n.dot(light));
    const lum = Math.min(1, AMBIENT + DIFFUSE * lam);
    const [r, gCol, b] = [
      Math.min(255, base.r * 255 * lum * 1.15),
      Math.min(255, base.g * 255 * lum * 1.15),
      Math.min(255, base.b * 255 * lum * 1.15),
    ];
    const minX = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[0]))));
    const maxX = Math.min(W - 1, Math.ceil(Math.max(...pts.map((p) => p[0]))));
    const minY = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[1]))));
    const maxY = Math.min(W - 1, Math.ceil(Math.max(...pts.map((p) => p[1]))));
    const [p0, p1, p2] = pts;
    const den =
      (p1[1] - p2[1]) * (p0[0] - p2[0]) + (p2[0] - p1[0]) * (p0[1] - p2[1]);
    if (den === 0) continue;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const w0 =
          ((p1[1] - p2[1]) * (x - p2[0]) + (p2[0] - p1[0]) * (y - p2[1])) / den;
        const w1 =
          ((p2[1] - p0[1]) * (x - p2[0]) + (p0[0] - p2[0]) * (y - p2[1])) / den;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const idx = (y * W + x) * 4;
        px[idx] = r;
        px[idx + 1] = gCol;
        px[idx + 2] = b;
        px[idx + 3] = 255;
      }
    }
  }

  // downsample SS→1
  const png = new PNG({ width: SIZE, height: SIZE });
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let r = 0,
        gCol = 0,
        b = 0,
        a = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const idx = ((y * SS + dy) * W + x * SS + dx) * 4;
          r += px[idx];
          gCol += px[idx + 1];
          b += px[idx + 2];
          a += px[idx + 3];
        }
      }
      const n = SS * SS;
      const o = (y * SIZE + x) * 4;
      png.data[o] = r / n;
      png.data[o + 1] = gCol / n;
      png.data[o + 2] = b / n;
      png.data[o + 3] = a / n;
    }
  }
  return png;
}

for (const [shape, geo] of Object.entries(SHAPES)) {
  for (const [theme, color] of Object.entries(THEMES)) {
    const png = rasterize(geo, color);
    const file = join(OUT, `${shape}-${theme}.png`);
    writeFileSync(file, PNG.sync.write(png));
    console.log("written", file);
  }
}
