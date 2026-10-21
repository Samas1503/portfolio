"use client";

import { useEffect, useRef, useState } from "react";
import {
  clock,
  effect,
  frameLoop,
  init,
  pingPong,
  sampler,
  surface,
} from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import simShader from "./fluid.sim.wgsl";
import renderShader from "./fluid.render.wgsl";

const SIM_SCALE = 0.5; // half-res feedback buffers
const DECAY = 3.2; // exp2 rate: ~0.3s half-life
const SPLAT_RADIUS = 0.045; // in height-normalized screen units

const VgpuFluid = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loop: FrameLoopHandle | undefined;
    const canvas = canvasRef.current;

    // Skip on touch devices: finger drags leave an unwanted smoke trail.
    if (window.matchMedia("(pointer: coarse), (hover: none)").matches) {
      setFailed(true);
      return;
    }


    // Pointer state in top-origin uv space (matches vgpu effect uv).
    const pointer = {
      x: 0.5,
      y: 0.5,
      px: 0.5,
      py: 0.5,
      vx: 0,
      vy: 0,
      emit: 0,
      inside: false,
    };
    let aspect = 1;

    const onMove = (e: PointerEvent) => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
      pointer.inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    (async () => {
      try {
        const gpu = await init();
        if (cancelled || !canvasRef.current) return;
        const surf = surface(gpu, canvasRef.current, {
          dpr: [1, 1.5],
          clearColor: [0, 0, 0, 0],
        });
        const simSize = (w: number, h: number): [number, number] => [
          Math.max(1, Math.round(w * SIM_SCALE)),
          Math.max(1, Math.round(h * SIM_SCALE)),
        ];
        const pair = pingPong(gpu, ...simSize(surf.size[0], surf.size[1]), {
          format: "rgba16float",
        });
        const samp = sampler(gpu, {
          minFilter: "linear",
          magFilter: "linear",
        });
        aspect = surf.size[0] / Math.max(1, surf.size[1]);
        surf.onResize((e) => {
          aspect = e.width / Math.max(1, e.height);
          const size = simSize(e.width, e.height);
          pair.read.resize(size);
          pair.write.resize(size);
        });

        const time = clock(gpu);
        const params = () => ({
          dt: time.deltaTime,
          time: time.time,
          aspect,
          emit: pointer.emit,
          pointer: [pointer.x, pointer.y],
          velocity: [pointer.vx, pointer.vy],
          texel: pair.read.texelSize,
          decay: DECAY,
          radius: SPLAT_RADIUS,
        });

        const sim = effect(gpu, simShader, {
          label: "fluid-sim",
          set: { params: params(), prev: pair.read, samp },
        });
        const present = effect(gpu, renderShader, {
          label: "fluid-present",
          blend: "premultiplied",
          set: { prev: pair.read, samp },
        });
        await Promise.all([sim.compile(pair.write), present.compile(surf)]);
        if (cancelled) return;

        loop = frameLoop(gpu, (frame) => {
          const dt = Math.min(Math.max(time.deltaTime, 1e-4), 0.05);
          // Smoothed pointer velocity in uv/s drives advection.
          const ivx = (pointer.x - pointer.px) / dt;
          const ivy = (pointer.y - pointer.py) / dt;
          pointer.vx += (ivx - pointer.vx) * 0.25;
          pointer.vy += (ivy - pointer.vy) * 0.25;
          pointer.px = pointer.x;
          pointer.py = pointer.y;

          // Emit while inside; faster movement -> denser trail.
          const speed = Math.hypot(pointer.vx, pointer.vy);
          const target = pointer.inside
            ? Math.min(1, 0.3 + speed * 0.8)
            : 0;
          pointer.emit += (target - pointer.emit) * 0.12;

          sim.set({ params: params(), prev: pair.read });
          frame.pass({ target: pair.write, clear: [0, 0, 0, 0] }, sim);
          pair.swap();
          present.set({ prev: pair.read });
          frame.pass(surf, present);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      loop?.stop();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  if (failed) return null;
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default VgpuFluid;
