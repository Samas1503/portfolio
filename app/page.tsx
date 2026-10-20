import AboutMe from "@/components/pages/about-me";
import Contact from "@/components/pages/contact";
import Skills from "@/components/pages/skils";
import Footer from "@/components/pages/footer";
import Navbar from "@/components/pages/narvar";
import Portfolio from "@/components/pages/portfolio";
import Services from "@/components/pages/services";
import Works from "@/components/pages/experience";
import Sidebar from "@/components/pages/sidebar";
import Spotlight from "@/components/shared/spotlight";

export default function Home() {
  return (
    <div className="relative">
      <Spotlight />
      <div className="relative z-10 mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:flex lg:justify-between lg:gap-8 lg:px-24 lg:py-0">
        <Sidebar />
        <main className="pt-16 lg:w-[52%] lg:py-24">
          <AboutMe />
          <Works />
          <Skills />
          <Services />
          <Portfolio />
          <Contact />
          <Footer />
        </main>
      </div>
      <Navbar />
    </div>
  );
}
