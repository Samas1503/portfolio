"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Canvas, useFrame } from "@react-three/fiber";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Shape = "carrera" | "curso" | "evento";

// Cada Canvas es un contexto WebGL; los navegadores limitan el total
// (~8-16). Los mini-íconos comparten hasta MAX_3D slots — uno menos que
// el límite seguro para que el elemento principal siempre tenga contexto.
// Sin slot se muestra el PNG pre-renderizado del mismo mesh
// (public/icons3d/, generado por scripts/gen-icon-fallbacks.mjs).
const MAX_3D = 7;
let active3D = 0;

function Mesh({ color, shape }: { color: string; shape: Shape }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.rotation.x += delta * 0.25;
    }
  });
  return (
    <mesh ref={ref}>
      {shape === "carrera" ? (
        <icosahedronGeometry args={[1, 0]} />
      ) : shape === "evento" ? (
        <dodecahedronGeometry args={[1, 0]} />
      ) : (
        <torusKnotGeometry args={[0.7, 0.22, 64, 8]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.7}
        roughness={0.3}
        flatShading
      />
    </mesh>
  );
}

function Scene({ color, shape }: { color: string; shape: Shape }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 3]} intensity={25} />
      <Mesh color={color} shape={shape} />
    </Canvas>
  );
}

const MiniScene = dynamic(() => Promise.resolve(Scene), { ssr: false });

const MiniIcon3D = ({
  shape,
  className,
}: {
  shape: Shape;
  className?: string;
}) => {
  const { resolvedTheme } = useTheme();
  const host = useRef<HTMLDivElement>(null);
  const heldSlot = useRef(false);
  const [render3D, setRender3D] = useState(false);

  useEffect(() => {
    const release = () => {
      if (heldSlot.current) {
        heldSlot.current = false;
        active3D -= 1;
      }
    };
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!heldSlot.current && active3D < MAX_3D) {
            heldSlot.current = true;
            active3D += 1;
          }
          setRender3D(heldSlot.current);
        } else {
          release();
          setRender3D(false);
        }
      },
      { rootMargin: "80px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      release();
    };
  }, []);

  const color = resolvedTheme === "light" ? "#e7000b" : "#fb2c36";
  const fallbackSrc = `/icons3d/${shape}-${
    resolvedTheme === "light" ? "light" : "dark"
  }.png`;

  return (
    <div ref={host} className={className} aria-hidden="true">
      {render3D ? (
        <MiniScene color={color} shape={shape} />
      ) : (
        <div className="relative h-full w-full">
          <Image
            src={fallbackSrc}
            alt=""
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MiniIcon3D;
