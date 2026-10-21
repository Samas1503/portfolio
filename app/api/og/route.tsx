import path from "node:path";
import { PNG } from "pngjs";
import { resolveShader } from "@vgpu/wgsl/runtime";
import { prepareShader } from "@vgpu/wgsl/prepare";
import { effect, init, target } from "vgpu/node";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;
const OG_TIME = 3.7;
const SHADER_PATH = path.join(process.cwd(), "components/three/og.wgsl");

const PNG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=31536000, immutable",
};

// Branded PNG rendered in pure JS — used when the host has no GPU adapter
// (e.g. Vercel serverless): dark base + red aurora bands + radial glow.
function renderFallbackPng() {
  const png = new PNG({ width: WIDTH, height: HEIGHT });
  const cx = WIDTH * 0.5;
  const cy = HEIGHT * 0.55;
  for (let y = 0; y < HEIGHT; y++) {
    const ny = y / HEIGHT;
    for (let x = 0; x < WIDTH; x++) {
      const nx = x / WIDTH;
      let r = 4, g = 2, b = 4;
      for (let k = 0; k < 3; k++) {
        const c = 0.32 + k * 0.17 + Math.sin(nx * 6 + k * 2.1) * 0.1;
        const d = ny - c;
        const glow = Math.exp(-d * d * 900) * (0.55 - k * 0.12);
        r += 251 * glow;
        g += 44 * glow;
        b += 54 * glow;
      }
      const dx = x - cx, dy = y - cy;
      const rad = Math.exp(-((dx * dx + dy * dy) / (WIDTH * HEIGHT)) * 60);
      r += 190 * rad;
      g += 38 * rad;
      b += 48 * rad;
      const i = (y * WIDTH + x) * 4;
      png.data[i] = Math.min(255, r);
      png.data[i + 1] = Math.min(255, g);
      png.data[i + 2] = Math.min(255, b);
      png.data[i + 3] = 255;
    }
  }
  return new Uint8Array(PNG.sync.write(png));
}

export async function GET() {
  let gpu: Awaited<ReturnType<typeof init>> | undefined;
  try {
    // No bundler loader inside route handlers: resolve + prepare the .wgsl file.
    const resolved = await resolveShader({ entry: SHADER_PATH });
    const prepared = prepareShader(resolved, SHADER_PATH);

    gpu = await init();
    const colorTarget = target(gpu, { size: [WIDTH, HEIGHT] });
    effect(gpu, prepared, {
      set: { params: { time: OG_TIME, texel: colorTarget.texelSize } },
    }).draw(colorTarget);

    const pixels = await colorTarget.color.read({ mipLevel: 0, region: "all" });
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    png.data.set(pixels);

    return new Response(new Uint8Array(PNG.sync.write(png)), {
      headers: PNG_HEADERS,
    });
  } catch (error) {
    console.error("[og] GPU render failed, serving JS fallback", error);
    return new Response(renderFallbackPng(), { headers: PNG_HEADERS });
  } finally {
    gpu?.dispose();
  }
}
