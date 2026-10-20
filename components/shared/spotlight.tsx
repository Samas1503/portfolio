"use client";

import { useEffect, useRef } from "react";

const Spotlight = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current?.style.setProperty("--x", `${e.clientX}px`);
      ref.current?.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="spotlight pointer-events-none fixed inset-0 z-0 hidden transition duration-300 lg:block"
    />
  );
};

export default Spotlight;
