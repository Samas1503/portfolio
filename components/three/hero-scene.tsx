"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type SceneProps = { color: string; animate: boolean };

function Core({ color, animate }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (animate) {
      g.rotation.y += delta * 0.25;
      g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
      if (inner.current) inner.current.rotation.y -= delta * 0.6;
    }
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, state.pointer.y * 0.4, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -state.pointer.x * 0.3, 0.05);
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.25}
          flatShading
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.85, 0.012, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.6, 0]}>
        <torusGeometry args={[2.1, 0.008, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Particles({ color, animate, count = 450 }: SceneProps & { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = seeded(1503);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.6 + rand() * 1.6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y -= delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

export default function HeroScene({ color, animate }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 4]} intensity={30} />
      <Core color={color} animate={animate} />
      <Particles color={color} animate={animate} />
    </Canvas>
  );
}
