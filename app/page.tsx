import AboutMe from "@/components/pages/about-me";
import Contact from "@/components/pages/contact";
import Experience from "@/components/pages/experiencie";
import Footer from "@/components/pages/footer";
import Introduction from "@/components/pages/introduction";
import Navbar from "@/components/pages/narvar";
import Portfolio from "@/components/pages/portfolio";
import Services from "@/components/pages/services";
import Testimonials from "@/components/pages/testimonials";
import InfoUsuario from "@/components/info-usuario";

export default function Home() {
  return (
    <main className="pb-40">
      <InfoUsuario />
      <Navbar />
      <Introduction />
      <AboutMe />
      <Experience />
      <Services />
      <Portfolio />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
