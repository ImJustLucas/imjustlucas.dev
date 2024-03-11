import { AboutMeCard } from "@components/About";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { HeroSection } from "@components/Hero";
// import { ProjectsSection } from "@components/Projects";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <AboutMeCard />
      {/* <ProjectsSection />  */}
      <Footer />
    </>
  );
}
