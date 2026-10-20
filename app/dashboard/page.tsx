"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Mail, MousePointerClick, KeyRound } from "lucide-react";
import { useUsuario } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Visita = { path: string | null; created_at: string };
type Interaccion = { tipo: string | null; detalle: string | null; path: string | null; created_at: string };
type Mensaje = { id: number; nombre: string | null; origen: string | null; mensaje: string | null };

type Stats = { visitas: Visita[]; interacciones: Interaccion[]; mensajes: Mensaje[] };

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short" });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Dashboard() {
  const { usuario } = useUsuario();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pwMsg, setPwMsg] = useState("");
  const [vista, setVista] = useState<"semanal" | "mensual">("semanal");

  useEffect(() => {
    if (usuario === false) router.replace("/login");
  }, [usuario, router]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actual: fd.get("actual"),
        nueva: fd.get("nueva"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPwMsg(res.ok ? "Contraseña actualizada." : data.error || "Error");
    if (res.ok) e.currentTarget.reset();
  };

  const counts = (() => {
    const map = new Map<string, number>();
    stats?.visitas.forEach((v) => {
      const key = v.created_at.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  })();

  // Últimos N días consecutivos; hoy siempre queda al final.
  const lastDays = (n: number) => {
    const out: { label: string; n: number }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ label: formatDay(key + "T12:00:00"), n: counts.get(key) ?? 0 });
    }
    return out;
  };

  const porDia = lastDays(7);
  const porMes = lastDays(30);
  const maxDia = Math.max(...porDia.map((d) => d.n), 1);
  const maxMes = Math.max(...porMes.map((d) => d.n), 1);

  // Gráfico lineal para la vista mensual.
  const W = 600;
  const H = 140;
  const P = 10;
  const mesPts = porMes.map((d, i) => ({
    x: P + (i / (porMes.length - 1)) * (W - 2 * P),
    y: H - P - (d.n / maxMes) * (H - 2 * P - 8),
  }));
  const mesLine = mesPts.map((p) => `${p.x},${p.y}`).join(" ");
  const mesArea = `${P},${H - P} ${mesLine} ${W - P},${H - P}`;
  const lastPt = mesPts[mesPts.length - 1];

  const CARDS = [
    { icon: <Eye />, label: "Visitas", value: stats?.visitas.length ?? 0 },
    { icon: <Mail />, label: "Mensajes", value: stats?.mensajes.length ?? 0 },
    {
      icon: <MousePointerClick />,
      label: "Interacciones",
      value: stats?.interacciones.length ?? 0,
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:px-12">
      <h1 className="mb-8 flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
        <span className="font-mono text-primary">~$</span> Dashboard
        <span className="h-px flex-1 bg-border" aria-hidden />
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card/50 p-4"
          >
            <span className="text-primary">{c.icon}</span>
            <p className="mt-3 text-2xl font-bold text-card-foreground">
              {c.value}
            </p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-card/50 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-mono text-sm uppercase tracking-widest text-primary">
            Visitas por día
          </h2>
          <div className="flex gap-2">
            {(["semanal", "mensual"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVista(v)}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                  vista === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-card-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {vista === "semanal" ? (
          <div className="flex items-end gap-2">
            {porDia.map((d, idx) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {d.n}
                </span>
                <div
                  className={`w-full rounded-t ${idx === porDia.length - 1 ? "bg-primary" : "bg-primary/40"}`}
                  style={{ height: `${Math.max(4, (d.n / maxDia) * 120)}px` }}
                />
                <span
                  className={`font-mono text-[10px] ${idx === porDia.length - 1 ? "font-bold text-primary" : "text-muted-foreground"}`}
                >
                  {idx === porDia.length - 1 ? "hoy" : d.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full text-primary"
              role="img"
              aria-label="Visitas de los últimos 30 días"
            >
              <defs>
                <linearGradient id="visitasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={mesArea} fill="url(#visitasGrad)" />
              <polyline
                points={mesLine}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={lastPt.x} cy={lastPt.y} r="4.5" fill="currentColor" />
            </svg>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>{porMes[0].label}</span>
              <span>{porMes[Math.floor(porMes.length / 2)].label}</span>
              <span className="font-bold text-primary">hoy</span>
            </div>
          </div>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card/50 p-5">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-primary">
            Mensajes recibidos
          </h2>
          {stats?.mensajes.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin mensajes.</p>
          )}
          <ul className="space-y-3">
            {stats?.mensajes.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-border/60 p-3 text-sm"
              >
                <p className="font-medium text-card-foreground">
                  {m.nombre || "Anónimo"}{" "}
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.origen}
                  </span>
                </p>
                <p className="mt-1 break-words text-muted-foreground">{m.mensaje}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card/50 p-5">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-primary">
            Interacciones recientes
          </h2>
          {stats?.interacciones.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin interacciones.</p>
          )}
          <ul className="space-y-2 text-sm">
            {stats?.interacciones.map((i, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
              >
                <span className="min-w-0 font-medium text-card-foreground">
                  {i.tipo}
                  {i.detalle && (
                    <span className="ml-2 font-mono text-xs break-all text-muted-foreground">
                      {i.detalle}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatDateTime(i.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10 max-w-md rounded-xl border border-border bg-card/50 p-5">
        <h2 className="mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-primary">
          <KeyRound className="size-4" /> Cambiar contraseña
        </h2>
        <form onSubmit={changePassword} className="space-y-3">
          <Input
            name="actual"
            type="password"
            placeholder="Contraseña actual"
            required
          />
          <Input
            name="nueva"
            type="password"
            placeholder="Nueva contraseña (mín. 8)"
            minLength={8}
            required
          />
          <Button type="submit" variant="outline" size="sm">
            Guardar contraseña
          </Button>
          {pwMsg && <p className="text-sm text-muted-foreground">{pwMsg}</p>}
        </form>
      </section>
    </main>
  );
}
