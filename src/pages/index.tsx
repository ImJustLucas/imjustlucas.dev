import { Footer } from "@components/Layouts/Footer";
import { Header } from "@components/Layouts/Header";
import { AboutMeCard } from "@components/Pages/Home/About";
import { HeroSection } from "@components/Pages/Home/Hero";
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
