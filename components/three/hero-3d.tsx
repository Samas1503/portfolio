"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

const Hero3D = ({ className }: { className?: string }) => {
  const { resolvedTheme } = useTheme();
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!media.matches);
    const onChange = () => setAnimate(!media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <HeroScene
        color={resolvedTheme === "light" ? "#0d9488" : "#5eead4"}
        animate={animate}
      />
    </div>
  );
};

export default Hero3D;
