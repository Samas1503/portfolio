import { LoginForm } from "@/app/login/form";
import Hero3D from "@/components/three/hero-3d";
import VgpuPlasma from "@/components/three/vgpu-plasma";

export default function LogIn() {
  return (
    <main className="relative grid min-h-[80vh] place-items-center overflow-hidden px-6 py-16">
      <VgpuPlasma className="pointer-events-none absolute inset-0 h-full w-full" />
      <Hero3D className="pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          admin
        </p>
        <h1 className="mt-1 text-2xl font-bold text-card-foreground">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accedé al panel de administración del portfolio.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
