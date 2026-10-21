"use client";

import { useEffect, useRef, useState } from "react";
import { clock, compute, draw, frameLoop, init, storage, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import computeShader from "./particles.compute.wgsl";
import renderShader from "./particles.render.wgsl";

const COUNT = 6144; // multiple of workgroup size (64)
const WORKGROUPS = COUNT / 64;
const BYTES_PER_PARTICLE = 16; // Particle { pos: vec2f, vel: vec2f }

const seedParticles = (aspect: number) => {
  const data = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    const o = i * 4;
    data[o] = (Math.random() * 2 - 1) * aspect;
    data[o + 1] = Math.random() * 2 - 1;
    data[o + 2] = (Math.random() - 0.5) * 0.06;
    data[o + 3] = (Math.random() - 0.5) * 0.06;
  }
  return data;
};

const VgpuParticles = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loop: FrameLoopHandle | undefined;
    const canvas = canvasRef.current;

    // Clip-space pointer target; eased in the frame callback.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, target: 0, strength: 0 };
    let aspect = 1;

    const onMove = (e: PointerEvent) => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ty = 1 - ((e.clientY - r.top) / r.height) * 2;
      pointer.target =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
          ? 1
          : 0;
    };
    const onLeave = () => {
      pointer.target = 0;
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
        aspect = surf.size[0] / Math.max(1, surf.size[1]);
        surf.onResize((e) => {
          aspect = e.width / Math.max(1, e.height);
        });

        const particles = storage(gpu, COUNT * BYTES_PER_PARTICLE);
        particles.write(seedParticles(aspect));

        const time = clock(gpu);
        const params = () => ({
          dt: time.deltaTime,
          time: time.time,
          aspect,
          strength: pointer.strength,
          pointer: [pointer.x, pointer.y],
        });

        const sim = compute(gpu, computeShader, {
          label: "particles-sim",
          set: { particles, params: params() },
        });
        const points = draw(gpu, {
          label: "particles-draw",
          shader: renderShader,
          vertices: 6,
          instances: COUNT,
          blend: "additive",
          set: { particles, params: params() },
        });
        await Promise.all([sim.compile(), points.compile(surf)]);
        if (cancelled) return;

        loop = frameLoop(gpu, (frame) => {
          pointer.x += (pointer.tx * aspect - pointer.x) * 0.12;
          pointer.y += (pointer.ty - pointer.y) * 0.12;
          pointer.strength += (pointer.target - pointer.strength) * 0.08;

          const next = params();
          sim.set({ params: next });
          points.set({ params: next });
          frame.computePass((pass) => pass.dispatch(sim, WORKGROUPS));
          frame.pass(surf, points);
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

export default VgpuParticles;
