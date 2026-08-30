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
      <RevealOnView section="hero">
        <HeroSection />
      </RevealOnView>
      <RevealOnView section="intro">
        <IntroSection />
      </RevealOnView>
      <RevealOnView section="experience">
        <ExperienceSection />
      </RevealOnView>
      <RevealOnView section="projects">
        <ProjectsSection />
      </RevealOnView>
      <RevealOnView section="skills">
        <SkillsSection />
      </RevealOnView>
      <RevealOnView section="credibility">
        <CredibilitySection />
      </RevealOnView>
      <RevealOnView section="beyond-code">
        <BeyondCodeSection />
      </RevealOnView>
      <RevealOnView section="links">
        <LinksSection />
      </RevealOnView>
      <RevealOnView section="contact">
        <ContactSection />
      </RevealOnView>
    </>
  );
}
