import AboutMe from "@/components/pages/about-me";
import Academia from "@/components/pages/academia";
import VgpuAurora from "@/components/three/vgpu-aurora";
import Contact from "@/components/pages/contact";
import Eventos from "@/components/pages/eventos";
import Skills from "@/components/pages/skils";
import Footer from "@/components/pages/footer";
import Navbar from "@/components/pages/narvar";
import Portfolio from "@/components/pages/portfolio";
import Services from "@/components/pages/services";
import Works from "@/components/pages/experience";
import Sidebar from "@/components/pages/sidebar";
import Spotlight from "@/components/shared/spotlight";
import { getPerfil } from "@/backend/data/perfil";
import { getContactos } from "@/backend/data/contactos";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [perfil, contactos] = await Promise.all([getPerfil(), getContactos()]);
  return (
    <div className="relative">
      <Spotlight />
      <VgpuAurora className="fixed inset-0 h-full w-full" />
      <div className="relative z-10 mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:flex lg:justify-between lg:gap-8 lg:px-24 lg:py-0">
        <Sidebar perfil={perfil} contactos={contactos} />
        <main className="pt-16 lg:w-[52%] lg:py-24">
          <AboutMe perfil={perfil} />
          <Services />
          <Works />
          <Academia />
          <Eventos />
          <Portfolio />
          <Skills />
          <Contact contactos={contactos} />
          <Footer />
        </main>
      </div>
      <Navbar />
    </div>
  );
}
