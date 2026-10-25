"use client";

import { useEffect, useRef, useState } from "react";
import Spinner from "./spinner";

// Monta los children recién cuando el div se acerca al viewport: el
// rootMargin de 300px dispara el fetch antes de que la sección sea
// visible. Una vez montada queda montada (el observer se desconecta).
const LazyLoad = ({ children }: { children: React.ReactNode }) => {
  const host = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host}>
      {mounted ? (
        children
      ) : (
        <div className="grid min-h-40 place-items-center">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default LazyLoad;
