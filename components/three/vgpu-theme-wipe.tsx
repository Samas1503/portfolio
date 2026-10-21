"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import { cn } from "@/lib/utils";
import wipeShader from "./theme-wipe.wgsl";

const DURATION_S = 0.6;

const VgpuThemeWipe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);
  const startRef = useRef<(() => void) | null>(null);
  const prevTheme = useRef<string | undefined>(undefined);

  // Boot WebGPU once; the frame loop only runs while a wipe plays.
  useEffect(() => {
    let cancelled = false;
    let loop: FrameLoopHandle | undefined;
    let t0 = -1;

    (async () => {
      try {
        const gpu = await init();
        if (cancelled || !canvasRef.current) return;
        const surf = surface(gpu, canvasRef.current, {
          dpr: [1, 1.5],
          clearColor: [0, 0, 0, 0],
        });
        const wipe = effect(gpu, wipeShader, {
          label: "theme-wipe",
          blend: "premultiplied",
          set: {
            params: { progress: 0, time: 0, aspect: 1, texel: surf.texelSize },
          },
        });
        const syncSize = () => {
          wipe.set({
            params: {
              texel: surf.texelSize,
              aspect: surf.size[0] / Math.max(1, surf.size[1]),
            },
          });
        };
        surf.onResize(syncSize);
        syncSize();
        const time = clock(gpu);
        await wipe.compile(surf);
        if (cancelled) return;

        startRef.current = () => {
          loop?.stop();
          t0 = -1;
          loop = frameLoop(gpu, (frame) => {
            if (t0 < 0) t0 = time.time;
            const p = (time.time - t0) / DURATION_S;
            const done = p >= 1;
            wipe.set({
              params: { progress: Math.min(p, 1), time: time.time },
            });
            // At p === 1 the shader outputs zero alpha — the pass also
            // clears the canvas so nothing lingers after stop().
            frame.pass(surf, wipe);
            if (done) {
              loop?.stop();
              loop = undefined;
              setActive(false);
            }
          });
        };
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      loop?.stop();
      startRef.current = null;
    };
  }, []);

  // Fire on resolvedTheme change, ignoring the hydration transition
  // (undefined -> theme) on first mount.
  useEffect(() => {
    const prev = prevTheme.current;
    prevTheme.current = resolvedTheme;
    if (prev === undefined || resolvedTheme === undefined) return;
    if (prev === resolvedTheme) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!startRef.current) return;
    setActive(true);
    startRef.current();
  }, [resolvedTheme]);

  if (failed) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-50 h-full w-full transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
};

export default VgpuThemeWipe;
