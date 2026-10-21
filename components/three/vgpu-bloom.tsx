"use client";

import { useEffect, useRef, useState } from "react";
import { clock, effect, frameLoop, init, sampler, surface, target } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import sceneShader from "./raymarched.wgsl";
import bloomShader from "./bloom.wgsl";

const VgpuBloom = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loop: FrameLoopHandle | undefined;

    (async () => {
      try {
        const gpu = await init();
        if (cancelled || !canvasRef.current) return;
        const surf = surface(gpu, canvasRef.current, { dpr: [1, 1.5] });

        const sceneTarget = target(gpu, { size: surf.size });
        const half = (s: readonly [number, number]) =>
          [Math.max(1, s[0] >> 1), Math.max(1, s[1] >> 1)] as const;
        const bloomA = target(gpu, { size: half(surf.size) });
        const bloomB = target(gpu, { size: half(surf.size) });
        const linear = sampler(gpu, { minFilter: "linear", magFilter: "linear" });

        const scene = effect(gpu, sceneShader, {
          set: { params: { time: 0, texel: sceneTarget.texelSize } },
        });
        const bright = effect(gpu, bloomShader, {
          entry: { fragment: "fs_bright" },
          set: {
            params: { direction: [0, 0], threshold: 0.5, intensity: 0 },
            srcTex: sceneTarget,
            samp: linear,
          },
        });
        const blur = effect(gpu, bloomShader, {
          entry: { fragment: "fs_blur" },
          set: {
            params: { direction: [1, 0], threshold: 0, intensity: 0 },
            srcTex: bloomA,
            samp: linear,
          },
        });
        const composite = effect(gpu, bloomShader, {
          entry: { fragment: "fs_composite" },
          set: {
            params: { direction: [0, 0], threshold: 0, intensity: 0.9 },
            srcTex: sceneTarget,
            bloomTex: bloomA,
            samp: linear,
          },
        });

        surf.onResize(() => {
          sceneTarget.resize(surf.size);
          bloomA.resize(half(surf.size));
          bloomB.resize(half(surf.size));
          scene.set({ params: { texel: sceneTarget.texelSize } });
        });

        const time = clock(gpu);
        loop = frameLoop(gpu, (frame) => {
          scene.set({ params: { time: time.time } });
          frame.pass(sceneTarget, scene);
          frame.pass(bloomA, bright);
          blur.set({ params: { direction: [1, 0] }, srcTex: bloomA });
          frame.pass(bloomB, blur);
          blur.set({ params: { direction: [0, 1] }, srcTex: bloomB });
          frame.pass(bloomA, blur);
          frame.pass(surf, composite);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, []);

  if (failed) return null;
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default VgpuBloom;
