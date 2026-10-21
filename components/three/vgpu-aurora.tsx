"use client";

import { useEffect, useRef, useState } from "react";
import { clock, effect, frame, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import auroraShader from "./aurora-bg.wgsl";

const VgpuAurora = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loop: FrameLoopHandle | undefined;
    let redraw: (() => void) | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMood = (e: Event) => {
      const v = (e as CustomEvent<number>).detail;
      if (typeof v === "number" && Number.isFinite(v)) {
        moodRef.current = Math.min(1, Math.max(0, v));
        redraw?.();
      }
    };
    window.addEventListener("section-mood", onMood);

    (async () => {
      try {
        const gpu = await init();
        if (cancelled || !canvasRef.current) return;
        const surf = surface(gpu, canvasRef.current, { dpr: [1, 1.5] });
        const aurora = effect(gpu, auroraShader, {
          set: {
            params: { time: 0, texel: surf.texelSize, mood: moodRef.current },
          },
        });
        surf.onResize(() => {
          aurora.set({ params: { texel: surf.texelSize } });
          redraw?.();
        });
        if (reduced) {
          aurora.set({ params: { time: 20 } });
          redraw = () => {
            aurora.set({ params: { mood: moodRef.current } });
            requestAnimationFrame(() => {
              if (!cancelled) frame(gpu, (f) => f.pass(surf, aurora));
            });
          };
          frame(gpu, (f) => f.pass(surf, aurora));
        } else {
          const time = clock(gpu);
          loop = frameLoop(gpu, (f) => {
            aurora.set({
              params: { time: time.time, mood: moodRef.current },
            });
            f.pass(surf, aurora);
          });
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("section-mood", onMood);
      loop?.stop();
    };
  }, []);

  if (failed) return null;
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default VgpuAurora;
