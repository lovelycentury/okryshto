/**
 * Pet projects section — side work, as a carousel of ProjectCard slides.
 * Uses the same Embla-style shell as the Carousel in Basic components.
 */

import { SITE } from "../tokens";
import { buildCarousel } from "../components/carousel";
import { projectCard } from "../components/projectCard";
import { ThemeContext } from "../core/theme";
import { section, sectionHeading } from "./helpers";

export async function petProjectsSection(t: ThemeContext, width: number): Promise<FrameNode> {
  const s = section(t, "Pet projects", width, 32);

  const head = await sectionHeading(
    t,
    SITE.intro.petProjects.eyebrow,
    SITE.intro.petProjects.title,
    undefined,
    { maxWidth: width },
  );
  head.layoutAlign = "STRETCH";
  s.appendChild(head);

  // Slides are a fraction of the viewport so the next one peeks in — that peek
  // is what tells the eye the row scrolls.
  const cardW = width < 560 ? Math.round(width * 0.86) : Math.round(width * 0.42);
  const cardH = 320;

  const slides = await Promise.all(
    SITE.intro.petProjects.items.map((p) =>
      projectCard(t, cardW, cardH, {
        title: p.name,
        desc: p.desc,
        tags: [...p.tech],
        hex1: p.hex1,
        hex2: p.hex2,
        device: true,
      }),
    ),
  );

  s.appendChild(await buildCarousel(t, width, cardH, slides));
  return s;
}
