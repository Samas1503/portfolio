"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Registra una visita por sesión por path (sessionStorage evita duplicar).
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/login") || pathname.startsWith("/dashboard")) return;
    const key = `v:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage no disponible
    }
    const body = JSON.stringify({
      tipo: "visita",
      path: pathname,
      referrer: document.referrer || null,
    });
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
