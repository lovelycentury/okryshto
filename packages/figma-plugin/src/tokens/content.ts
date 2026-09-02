/**
 * Content model for the vizitka (business-card) site.
 * Sourced from okryshto_resume_en_long.tex — the full, personal CV.
 */

export interface LinkItem {
  title: string;
  subtitle: string;
  meta: string;
  featured?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
}

export const SITE = {
  brand: "OK",
  name: "Oleksii Kryshtopa",
  role: "Senior Frontend Engineer · Design Systems",
  location: "Heilbronn, Germany",
  availability: "Open to select collaborations",

  intro: {
    eyebrow: "Senior Frontend Engineer",
    headline: "I build product platforms that ship at scale.",
    body: "5 years owning SaaS platforms end-to-end — from design systems and payment-critical registration flows to data grids built for 500K+ participants. Leadership here has never meant a title; it meant being the person others rely on when the system is on fire.",

    whoAmI: {
      title: "Who I am",
      text: "Frontend Lead who thinks in supply chains and cause-and-effect. 15 years of music taught me precision: small details compound into masterpieces — or into bugs. Intuition is data — train it, act on it.",
    },

    projects: {
      title: "Companies I've worked with",
      items: [
        {
          name: "NDA",
          role: "Frontend Lead · Swiss sports-event SaaS · 2023 — Present",
          desc: "Rebuilt the platform after a failed €2M delivery: participant management, registration with SEPA/PayPal/Payrexx, and an embeddable widget serving 500K+ participants.",
          tech: ["React", "TypeScript", "Payments"],
          hex1: "#0E4B3C",
          hex2: "#5EE6C1",
        },
        {
          name: "xDefi",
          role: "Senior Frontend via Devico · 2022 — 2023",
          desc: "Built UI-kit components and mentored blockchain developers on frontend patterns — mapping style variants instead of if-chains.",
          tech: ["React", "UI Kit", "Web3"],
          hex1: "#3A1F52",
          hex2: "#160E33",
        },
        {
          name: "Mint",
          role: "Senior Frontend via Devico · 2021 — 2023",
          desc: "Media-planning platform. Owned code quality and architecture; turned the media-plan table into the platform's reference grid — the team called me “table master”.",
          tech: ["React", "MUI", "Virtualization"],
          hex1: "#12332B",
          hex2: "#0E2033",
        },
        {
          name: "Planelty",
          role: "React Developer via Devico · 2021",
          desc: "Delivered React features at 80% test coverage, and formed a lasting opinion: test critical paths and uncertain business logic, not everything for the number.",
          tech: ["React", "Testing"],
          hex1: "#2E4A57",
          hex2: "#3A2E52",
        },
      ],
    },

    /** Side projects — shipped outside of client work. */
    petProjects: {
      eyebrow: "Side quests",
      title: "Pet projects.",
      items: [
        {
          name: "uni-donate",
          role: "1st place, hackathon · 2024",
          desc: "Blockchain donation platform. Learned Svelte from zero in one week to ship it — the win earned an invitation to the United Nations office in Qatar.",
          tech: ["Svelte", "ICP", "Blockchain"],
          hex1: "#5A3A1E",
          hex2: "#2A1608",
        },
        {
          name: "Vizitka",
          role: "Design system generator",
          desc: "A dark-first design system generated from TypeScript straight into Figma: components, variants, icons, tokens and page templates from one source of truth.",
          tech: ["TypeScript", "Figma Plugin API"],
          hex1: "#0E4B3C",
          hex2: "#5EE6C1",
        },
        {
          name: "Orbit",
          role: "orbit.okryshto.dev",
          desc: "A public map with self-intro access: request access, introduce yourself, get approved, download the payload.",
          tech: ["Web", "Maps", "Access flow"],
          hex1: "#1D2150",
          hex2: "#818CF8",
        },
        {
          name: "Omm",
          role: "omm.okryshto.dev",
          desc: "Internal dashboard behind custom SSO — overview, CRUD over points, and reviewing the intro requests coming in from Orbit.",
          tech: ["Dashboard", "Keycloak SSO"],
          hex1: "#20223A",
          hex2: "#0E1622",
        },
        {
          name: "AI Tooling Security",
          role: "Research · since 2026",
          desc: "Investigating AI-agent tooling and where the holes are — threat-modelling what happens when a compromised agent reaches docker.sock, and prototyping a proxy layer that filters agent output.",
          tech: ["Security", "MCP", "Threat modelling"],
          hex1: "#3A1F52",
          hex2: "#160E33",
        },
      ],
    },

    tech: {
      title: "Core stack",
      favorites: {
        languages: ["TypeScript", "React", "Vue 3", "Next.js", "Node.js", "Svelte"],
        tools: [
          "PostgreSQL",
          "MongoDB",
          "TanStack Query",
          "Playwright",
          "GitHub Actions",
          "Docker",
        ],
        approaches: [
          "Design systems",
          "Headless components",
          "WAI-ARIA",
          "FSD",
          "Virtualization",
          "TDD",
        ],
      },
    },

    achievements: {
      title: "Wins & milestones",
      items: [
        {
          icon: "trophy",
          value: "1st Place",
          label: "Hackathon winner",
          desc: "South Africa Blockchain in Education Hackathon — shipped uni-donate on Svelte + ICP, learned the framework from zero in one week.",
        },
        {
          icon: "trending-up",
          value: "500K+",
          label: "Participants scaled",
          desc: "Led the frontend for a Swiss sports-event platform: registration, payments, and an embeddable widget serving half a million people.",
        },
        {
          icon: "zap",
          value: "~70%",
          label: "Run-rate reduction",
          desc: "Rebuilt a platform after a failed €2M delivery, restructuring a €38K/month outsourced team into a lean €12K/month one — keeping every key client.",
        },
        {
          icon: "git-branch",
          value: "8.4K LOC",
          label: "Featured contributor",
          desc: "Eight merged PRs into SchwarzIT/onyx, a public Vue 3 design system — featured on their team page.",
        },
      ],
    },

    closing: {
      eyebrow: "Let's build",
      headline:
        "If you're shipping something that matters and need someone who moves code and people equally well.",
      ctas: ["orbit.okryshto.dev", "okryshto.dev"],
    },
  },

  /** Career timeline — most recent first. */
  experience: [
    {
      role: "Frontend Lead — Senior Frontend Engineer",
      company: "Swiss sports-event SaaS (under NDA)",
      period: "June 2023 — Present",
      place: "Remote, Germany",
      bullets: [
        "Took over the platform after a failed €2M CRM delivery by a €38K/month outsourced team: rebuilt it from scratch and restructured delivery into a lean team at ~€12K/month, retaining all key clients.",
        "Built the participant management system and public registration platform end-to-end, then repackaged the flow as an embeddable widget that landed a new B2B client.",
        "After the backend lead left, I was the only person who knew how everything worked — wrote the tickets and component requirements myself and guided the new developer to rebuild the API cleanly.",
        "Audited the most critical CRM component ahead of a release, found supply-chain-vulnerable dependencies and patched them within 30 minutes.",
      ],
    },
    {
      role: "Senior Frontend Developer",
      company: "Devico Solutions — clients: Mint, xDefi",
      period: "Nov 2021 — May 2023",
      place: "Kharkiv, Ukraine / Remote",
      bullets: [
        "First developer from the company to pass the client's Senior interview for Mint — after which they staffed the account to 30+ engineers.",
        "Owned code quality and architectural decisions on a media-planning platform; optimized the media-plan table into the platform's reference grid.",
        "Built UI-kit components for xDefi in parallel and mentored blockchain developers on frontend patterns.",
        "Declined a management-track promotion in 2023 — creating things is what I want to keep doing, so I stayed hands-on.",
      ],
    },
    {
      role: "React Developer",
      company: "Devico Solutions — training + client: Planelty",
      period: "June 2021 — Nov 2021",
      place: "Kharkiv, Ukraine",
      bullets: [
        "3-month intensive: the same Todo app rebuilt across paradigms — vanilla JS → classes → TypeScript → React class components → hooks, plus an Express/MongoDB API and a first JWT auth implementation.",
        "Delivered React features at 80% test coverage, and formed a lasting opinion: test critical paths and uncertain business logic, not everything for the number.",
      ],
    },
  ],

  /**
   * Grouped technical skills, from the CV. Each item carries an icon name from
   * the design-system icon set (see core/icons.ts) so chips read at a glance.
   */
  skills: [
    {
      group: "Core Technologies",
      items: [
        { name: "TypeScript", icon: "code" },
        { name: "React", icon: "cpu" },
        { name: "Vue 3", icon: "layers" },
        { name: "Next.js", icon: "rocket" },
        { name: "Node.js", icon: "server" },
        { name: "Svelte", icon: "flame" },
        { name: "PostgreSQL", icon: "database" },
        { name: "MongoDB", icon: "database" },
        { name: "REST APIs", icon: "globe" },
      ],
    },
    {
      group: "Frontend Architecture",
      items: [
        { name: "Design systems", icon: "palette" },
        { name: "Headless components", icon: "package" },
        { name: "WAI-ARIA", icon: "eye" },
        { name: "TanStack Query", icon: "refresh-cw" },
        { name: "Redux (+Saga)", icon: "infinity" },
        { name: "react-hook-form", icon: "list" },
        { name: "FSD", icon: "grid" },
        { name: "Virtualization", icon: "activity" },
      ],
    },
    {
      group: "Development & Operations",
      items: [
        { name: "Jest", icon: "check" },
        { name: "Playwright", icon: "play" },
        { name: "Storybook", icon: "book-open" },
        { name: "Rollup", icon: "package" },
        { name: "Docker", icon: "archive" },
        { name: "GitHub Actions", icon: "git-branch" },
        { name: "Jenkins", icon: "settings" },
        { name: "AWS", icon: "cloud" },
        { name: "Vault", icon: "lock" },
        { name: "TDD", icon: "shield" },
      ],
    },
    {
      group: "Languages",
      items: [
        { name: "English (fluent)", icon: "languages" },
        { name: "German (A2)", icon: "languages" },
        { name: "Ukrainian (native)", icon: "languages" },
        { name: "Russian (native)", icon: "languages" },
      ],
    },
  ],

  /** The human part — what explains the rest. */
  beyondCode: {
    eyebrow: "Beyond code",
    headline: "The part that explains the rest.",
    items: [
      {
        icon: "music",
        title: "Music, 15 years",
        desc: "Recorder from age four — learned notes before letters — and trumpet from 11 to 19. Handel, Albinoni, Piazzolla; originals only. Music taught me precision: small details compound into masterpieces, or into bugs.",
      },
      {
        icon: "target",
        title: "Boxing",
        desc: "A year and a half of it. Discipline, and staying calm when hit.",
      },
      {
        icon: "book-open",
        title: "Books",
        desc: "Tom Sawyer, the Orthodox Bible, and on the reread list: Goethe's Faust, Dante, Gorky's Danko — the man who carried everything alone. Carrying everything solo was my biggest flaw; delegation is the fix.",
      },
      {
        icon: "search",
        title: "Pattern-matching",
        desc: "Attentive by nature — I remember key facts and build cause-and-effect chains like a detective. It found the vulnerabilities; it also gets me called paranoid. Both are true costs of the same skill.",
      },
    ],
  },

  education: {
    degree: "BSc in Computer Science",
    school: "Kharkiv National University of Radio Electronics",
    period: "Oct 2018 — June 2022",
    place: "Kharkiv, Ukraine",
  },

  hero: {
    eyebrow: "Digital business card",
    headline: "I build platforms that ship at scale.",
    lead: "Senior Frontend Engineer with 5 years owning SaaS platforms end-to-end — design systems, payment-critical flows, and grids built for 500K+ participants.",
    primaryCta: "See my work",
    secondaryCta: "Get in touch",
  },

  links: [
    {
      title: "GitHub",
      subtitle: "Open-source & personal projects",
      meta: "@lovelycentury",
      featured: true,
    },
    {
      title: "onyx design system",
      subtitle: "Featured contributor — SchwarzIT",
      meta: "onyx.schwarz",
    },
    { title: "LinkedIn", subtitle: "Experience, teams, and growth edges", meta: "oleksii-k" },
    { title: "Email", subtitle: "Let's talk", meta: "oleksii.kryshtopa@tutamail.com" },
  ] as LinkItem[],

  credibility: {
    eyebrow: "Trusted by",
    logos: ["Mint", "xDefi", "SchwarzIT", "Devico", "Swiss Sports SaaS"],
    stats: [
      { value: "5+", label: "Years Frontend Lead" },
      { value: "500K+", label: "Participants scaled" },
      { value: "1st Place", label: "Hackathon winner" },
    ] as StatItem[],
    quote:
      '"Huge thanks for this amazing contribution — we really appreciate that you invested time learning and aligning to onyx principles."',
    quoteAuthor: "SchwarzIT/onyx",
    hackathon: {
      headline: "1st Place — South Africa Blockchain in Education Hackathon",
      meta: "Stellenbosch University · Feb 2024 · $10,000 Internet Computer developer grant, with Denys K. & Eduard P.",
      source: "immersiveeducation.org",
    },
  },

  contact: {
    eyebrow: "Let's talk",
    headline: "If you are shipping something that matters.",
    email: "oleksii.kryshtopa@tutamail.com",
    replyTime: "GMT+1 · replies in a day",
    socials: ["Email", "LinkedIn", "GitHub", "onyx"],
  },

  /** Site language switcher. */
  locales: {
    current: "EN",
    available: ["EN", "DE", "UA"],
  },

  nav: ["About", "Work", "Stack", "Contact"],
  footer: {
    copyright: "© 2026 Oleksii Kryshtopa",
    note: "Designed & generated in Figma",
  },
} as const;
