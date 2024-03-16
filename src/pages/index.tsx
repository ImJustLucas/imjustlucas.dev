import { Footer } from "@components/Layouts/Footer";
import { Header } from "@components/Layouts/Header";
import { AboutMeCard } from "@components/Pages/Home/About";
import { BestProject } from "@components/Pages/Home/BestProject";
import { Contact } from "@components/Pages/Home/Contact";
import { HeroSection } from "@components/Pages/Home/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <AboutMeCard />
      <BestProject />
      <Contact />
      <Footer />
    </>
  );
}
