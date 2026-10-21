import { LoginForm } from "@/app/login/form";
import Hero3D from "@/components/three/hero-3d";

export default function LogIn() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center gap-10 overflow-hidden px-6 py-16 lg:flex-row lg:justify-evenly lg:gap-12">
      <div className="relative flex w-full max-w-md flex-col items-center justify-center text-center lg:max-w-lg">
        <Hero3D className="pointer-events-none h-64 w-full sm:h-80 lg:h-[420px]" />
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
          Samuel Paredes
        </h2>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-primary">
          backend developer · portfolio
        </p>
      </div>

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
