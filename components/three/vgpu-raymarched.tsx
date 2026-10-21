"use client";

import { useEffect, useRef, useState } from "react";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import raymarchedShader from "./raymarched.wgsl";

const VgpuRaymarched = ({ className }: { className?: string }) => {
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
        const raymarched = effect(gpu, raymarchedShader, {
          set: { params: { time: 0, texel: surf.texelSize } },
        });
        surf.onResize(() => {
          raymarched.set({ params: { texel: surf.texelSize } });
        });
        const time = clock(gpu);
        loop = frameLoop(gpu, (frame) => {
          raymarched.set({ params: { time: time.time } });
          frame.pass(surf, raymarched);
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

export default VgpuRaymarched;
