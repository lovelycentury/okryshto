import type { IconName } from "@okryshto/react";

/**
 * Section anchors used by in-page CTAs (hero buttons, etc.).
 */
export const SECTION_ID = {
  about: "about",
  work: "work",
  stack: "stack",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

export const CONTACT = {
  email: "oleksii.kryshtopa@gmail.com",
  github: "https://github.com/lovelycentury",
  githubHandle: "@lovelycentury",
  linkedin: "https://www.linkedin.com/in/oleksii-k-412625261",
  linkedinHandle: "oleksii-k",
  onyx: "https://onyx.schwarz/about/team.html",
  onyxHandle: "onyx.schwarz",
  orbit: "https://orbit.okryshto.dev",
  site: "https://profile.okryshto.dev",
  storybook: "https://storybook.okryshto.dev",
  award: "https://immersiveeducation.org/news/Winners-of-2024-South-Africa-Hackathon-Announced",
} as const;

/**
 * Pet projects, in carousel order. `gradient` reproduces each card's Figma fill
 * — ProjectCard paints a shared default, so the per-project tint is passed in.
 */
export const PROJECTS: readonly {
  id: string;
  href: string;
  gradient: string;
}[] = [
  {
    id: "uni-donate",
    href: "https://etrr2-daaaa-aaaap-qcbha-cai.icp0.io/",
    gradient: "linear-gradient(145.75deg, rgb(90, 58, 30) 14.286%, rgb(42, 22, 8) 85.714%)",
  },
  {
    id: "privateStorybook",
    href: CONTACT.storybook,
    gradient: "linear-gradient(145.75deg, rgb(14, 75, 60) 14.286%, rgb(94, 230, 193) 85.714%)",
  },
  // {
  //   id: "orbit",
  //   href: CONTACT.orbit,
  //   gradient: "linear-gradient(145.75deg, rgb(29, 33, 80) 14.286%, rgb(129, 140, 248) 85.714%)",
  // },
  // {
  //   id: "omm",
  //   href: CONTACT.orbit,
  //   gradient: "linear-gradient(145.75deg, rgb(32, 34, 58) 14.286%, rgb(14, 22, 34) 85.714%)",
  // },
  {
    id: "ai-tooling-security",
    href: "https://github.com/lovelycentury/ai-tooling-security",
    gradient: "linear-gradient(145.75deg, rgb(58, 31, 82) 14.286%, rgb(22, 14, 51) 85.714%)",
  },
];

/** Skill groups, laid out as two columns on wide viewports (Figma "Columns"). */
export const SKILL_GROUPS: readonly {
  id: string;
  column: 1 | 2;
  items: readonly { key: string; icon: IconName }[];
}[] = [
  {
    id: "core",
    column: 1,
    items: [
      { key: "typescript", icon: "iconCode" },
      { key: "react", icon: "iconCpu" },
      { key: "vue", icon: "iconLayers" },
      { key: "next", icon: "iconRocket" },
      { key: "node", icon: "iconServer" },
      { key: "svelte", icon: "iconFlame" },
      { key: "postgresql", icon: "iconDatabase" },
      { key: "mongodb", icon: "iconDatabase" },
      { key: "rest", icon: "iconGlobe" },
    ],
  },
  {
    id: "architecture",
    column: 2,
    items: [
      { key: "design-systems", icon: "iconPalette" },
      { key: "headless", icon: "iconPackage" },
      { key: "wai-aria", icon: "iconEye" },
      { key: "tanstack-query", icon: "iconRefreshCw" },
      { key: "redux", icon: "iconInfinity" },
      { key: "react-hook-form", icon: "iconList" },
      { key: "fsd", icon: "iconGrid" },
      { key: "virtualization", icon: "iconActivity" },
    ],
  },
  {
    id: "operations",
    column: 1,
    items: [
      { key: "jest", icon: "iconCheck" },
      { key: "playwright", icon: "iconPlay" },
      { key: "storybook", icon: "iconBookOpen" },
      { key: "rollup", icon: "iconPackage" },
      { key: "docker", icon: "iconArchive" },
      { key: "github-actions", icon: "iconGitBranch" },
      { key: "jenkins", icon: "iconSettings" },
      { key: "aws", icon: "iconCloud" },
      { key: "vault", icon: "iconLock" },
      { key: "tdd", icon: "iconShield" },
    ],
  },
  {
    id: "languages",
    column: 2,
    items: [
      { key: "english", icon: "iconLanguages" },
      { key: "german", icon: "iconLanguages" },
      { key: "ukrainian", icon: "iconLanguages" },
      { key: "russian", icon: "iconLanguages" },
    ],
  },
];

/**
 * Commercial experience cards — order is newest first.
 * Copy lives in messages; this list only drives layout identity.
 */
export const EXPERIENCE: readonly { id: "sporTechCompany" | "addTechCompany" }[] = [
  { id: "sporTechCompany" },
  { id: "addTechCompany" },
];

/** Numeric stats for NumberFlow; locale-specific suffixes live in messages when needed. */
export const STATS: readonly {
  id: "years" | "participants" | "hackathon";
  value: number;
  /** Locale-invariant suffix; omit when copy must come from i18n (hackathon). */
  suffix?: string;
}[] = [
  { id: "years", value: 5, suffix: "+" },
  { id: "participants", value: 500, suffix: "K+" },
  { id: "hackathon", value: 1 },
];

/** "Beyond code" cards, laid out as two columns on wide viewports. */
/** "Beyond code" cards — adaptive 2×N grid (stacks below `sm` container). */
export const BEYOND_CODE: readonly { id: string; icon: IconName }[] = [
  { id: "music", icon: "iconMusic" },
  { id: "boxing", icon: "iconTarget" },
  { id: "books", icon: "iconBookOpen" },
  { id: "pattern-matching", icon: "iconSearch" },
];

export const SELECTED_LINKS: readonly {
  id: string;
  href: string;
  meta: string;
  featured?: boolean;
}[] = [
  { id: "github", href: CONTACT.github, meta: CONTACT.githubHandle, featured: true },
  { id: "onyx", href: CONTACT.onyx, meta: CONTACT.onyxHandle },
  { id: "linkedin", href: CONTACT.linkedin, meta: CONTACT.linkedinHandle },
  // { id: "email", href: `mailto:${CONTACT.email}`, meta: CONTACT.email },
];

export const CONTACT_LINKS: readonly { id: string; href: string }[] = [
  // { id: "email", href: `mailto:${CONTACT.email}` },
  { id: "linkedin", href: CONTACT.linkedin },
  { id: "github", href: CONTACT.github },
  { id: "onyx", href: CONTACT.onyx },
];
