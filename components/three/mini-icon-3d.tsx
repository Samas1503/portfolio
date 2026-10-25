"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type Shape = "carrera" | "curso" | "evento";

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
  return (
    <div className={className} aria-hidden="true">
      <MiniScene
        color={resolvedTheme === "light" ? "#e7000b" : "#fb2c36"}
        shape={shape}
      />
    </div>
  );
};

export default MiniIcon3D;
