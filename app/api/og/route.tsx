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
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[og] failed to render OpenGraph image", error);
    return Response.json(
      { error: "Failed to render OpenGraph image" },
      { status: 500 },
    );
  } finally {
    gpu?.dispose();
  }
}
