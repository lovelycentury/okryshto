import BeyondCodeSection from "@/components/sections/BeyondCodeSection/BeyondCodeSection";
import ContactSection from "@/components/sections/ContactSection/ContactSection";
import CredibilitySection from "@/components/sections/CredibilitySection/CredibilitySection";
import ExperienceSection from "@/components/sections/ExperienceSection/ExperienceSection";
import HeroSection from "@/components/sections/HeroSection/HeroSection";
import IntroSection from "@/components/sections/IntroSection/IntroSection";
import LinksSection from "@/components/sections/LinksSection/LinksSection";
import ProjectsSection from "@/components/sections/ProjectsSection/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection/SkillsSection";
import RevealOnView from "@/components/RevealOnView/RevealOnView";

export default function HomePage() {
  return (
    <>
      <RevealOnView>
        <HeroSection />
      </RevealOnView>
      <RevealOnView>
        <IntroSection />
      </RevealOnView>
      <RevealOnView>
        <ProjectsSection />
      </RevealOnView>
      <RevealOnView>
        <ExperienceSection />
      </RevealOnView>
      <RevealOnView>
        <SkillsSection />
      </RevealOnView>
      <RevealOnView>
        <CredibilitySection />
      </RevealOnView>
      <RevealOnView>
        <BeyondCodeSection />
      </RevealOnView>
      <RevealOnView>
        <LinksSection />
      </RevealOnView>
      <RevealOnView>
        <ContactSection />
      </RevealOnView>
    </>
  );
}
