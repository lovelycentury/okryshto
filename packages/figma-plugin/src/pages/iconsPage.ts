/**
 * Icons page — the full icon set, grouped, on inset tiles with names.
 * Every icon is reusable via `icon(t, name, size, token)`.
 */

import { RADII } from "../tokens";
import { autoFrame } from "../core/layout";
import { fillToken, makeText, strokeToken } from "../core/nodes";
import { icon, brandMark, ICON_NAMES } from "../core/icons";
import { ThemeContext } from "../core/theme";
import { addAtmosphere, board, boardTitle } from "./scaffold";

const BOARD_W = 1240;
const PAD = 96;
const CONTENT = BOARD_W - PAD * 2; // 1048

interface Group {
  title: string;
  names: string[];
}

const GROUPS: Group[] = [
  {
    title: "Arrows",
    names: ["arrow-right", "arrow-up-right", "arrow-left", "arrow-up", "arrow-down"],
  },
  {
    title: "Chevrons",
    names: ["chevron-right", "chevron-left", "chevron-down", "chevron-up"],
  },
  {
    title: "UI",
    names: [
      "plus",
      "minus",
      "x",
      "check",
      "menu",
      "search",
      "settings",
      "sliders",
      "filter",
      "eye",
      "eye-off",
      "more-horizontal",
      "plus-circle",
      "maximize",
      "scan",
      "qr-code",
      "info",
      "alert-triangle",
    ],
  },
  {
    title: "Actions",
    names: [
      "copy",
      "download",
      "upload",
      "external-link",
      "link",
      "share",
      "send",
      "log-out",
      "repeat",
      "shuffle",
      "rotate-ccw",
      "refresh-cw",
      "trash",
      "pencil",
      "pen-tool",
      "mouse",
    ],
  },
  {
    title: "Text & editing",
    names: ["bold", "italic", "underline", "type", "hash", "at-sign", "languages", "list", "grid"],
  },
  {
    title: "Communication",
    names: [
      "mail",
      "message-circle",
      "message-square",
      "phone",
      "video",
      "mic",
      "bell",
      "users",
      "user",
      "smile",
      "thumbs-up",
      "thumbs-down",
    ],
  },
  {
    title: "Media",
    names: [
      "play",
      "pause",
      "skip-back",
      "skip-forward",
      "music",
      "headphones",
      "volume-2",
      "audio-lines",
      "disc",
      "film",
      "camera",
      "image",
      "aperture",
      "radio",
    ],
  },
  {
    title: "Objects",
    names: [
      "folder",
      "file",
      "inbox",
      "archive",
      "paperclip",
      "tag",
      "bookmark",
      "gift",
      "briefcase",
      "package",
      "home",
      "book-open",
      "calendar",
      "clock",
      "umbrella",
      "anchor",
      "feather",
      "coffee",
    ],
  },
  {
    title: "Commerce & security",
    names: ["shopping-cart", "credit-card", "shield", "key", "lock", "unlock"],
  },
  {
    title: "Nature & weather",
    names: ["sun", "moon", "cloud", "cloud-rain", "droplet", "flame", "wind", "thermometer", "zap"],
  },
  {
    title: "Data & dev",
    names: [
      "terminal",
      "code",
      "cpu",
      "database",
      "server",
      "git-branch",
      "activity",
      "trending-up",
      "target",
      "wifi",
      "bluetooth",
      "battery",
      "monitor",
      "smartphone",
      "globe",
    ],
  },
  {
    title: "Maps & transport",
    names: [
      "map-pin",
      "navigation",
      "compass",
      "crosshair",
      "layers",
      "footprints",
      "bike",
      "car",
      "bus",
    ],
  },
  {
    title: "Fun & special",
    names: [
      "sparkles",
      "ghost",
      "skull",
      "gem",
      "crown",
      "trophy",
      "award",
      "rocket",
      "gamepad-2",
      "palette",
      "infinity",
      "star",
      "heart",
    ],
  },
  { title: "Social", names: ["github"] },
];

async function iconTile(t: ThemeContext, name: string): Promise<FrameNode> {
  const tile = autoFrame({ direction: "VERTICAL", gap: 10, cross: "CENTER" });
  tile.resize(120, tile.height);
  tile.counterAxisSizingMode = "FIXED";

  const box = autoFrame({ direction: "HORIZONTAL", align: "CENTER", cross: "CENTER" });
  box.resize(72, 72);
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "FIXED";
  box.cornerRadius = RADII.md;
  fillToken(t, box, "bg/inset");
  strokeToken(t, box, "border/subtle", 1);
  box.appendChild(icon(t, name, 24, "text/primary"));
  tile.appendChild(box);
  tile.appendChild(
    await makeText(t, "mono/sm", name, "text/muted", { maxWidth: 120, align: "CENTER" }),
  );
  return tile;
}

async function groupBlock(t: ThemeContext, group: Group): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 16 });
  col.layoutAlign = "STRETCH";
  col.appendChild(await makeText(t, "overline", group.title, "accent/primary"));
  const grid = autoFrame({ direction: "HORIZONTAL", gap: 16, wrap: true, cross: "MIN" });
  grid.primaryAxisSizingMode = "FIXED";
  grid.counterAxisSizingMode = "AUTO";
  grid.resize(CONTENT, grid.height);
  grid.counterAxisSpacing = 16;
  // Skip names missing from the registry instead of killing the whole run.
  for (const name of group.names)
    if (ICON_NAMES.includes(name)) grid.appendChild(await iconTile(t, name));
  col.appendChild(grid);
  return col;
}

/** Featured brand mark — the primary short symbol of the brand. */
async function brandBlock(t: ThemeContext): Promise<FrameNode> {
  const col = autoFrame({ direction: "VERTICAL", gap: 16 });
  col.layoutAlign = "STRETCH";
  col.appendChild(await makeText(t, "overline", "Brand mark", "accent/primary"));
  const card = autoFrame({ direction: "HORIZONTAL", gap: 36, cross: "CENTER", padding: 32 });
  card.layoutAlign = "STRETCH";
  card.primaryAxisSizingMode = "FIXED";
  card.cornerRadius = RADII.xl;
  fillToken(t, card, "bg/inset");
  strokeToken(t, card, "border/subtle", 1);
  // hero mark
  card.appendChild(brandMark(t, 104));
  // description
  const txt = autoFrame({ direction: "VERTICAL", gap: 6 });
  txt.appendChild(await makeText(t, "heading/h3", "okryshto", "text/primary"));
  txt.appendChild(
    await makeText(
      t,
      "body/md",
      "Celestial Yin-Yang — balance, access, unlocked. The primary brand symbol; doubles as the avatar. Ancient sacred geometry meets modern cryptographic design.",
      "text/secondary",
      { maxWidth: 380 },
    ),
  );
  txt.appendChild(
    await makeText(
      t,
      "caption",
      "Celestial yin-yang. Primary brand mark and avatar. Background — Dante blood gradient (mint → dante). Balance and accessibility.",
      "text/muted",
      { maxWidth: 380 },
    ),
  );
  card.appendChild(txt);
  txt.layoutGrow = 1;
  // sizes + flat variant
  const sizes = autoFrame({ direction: "VERTICAL", gap: 10, cross: "CENTER" });
  const row = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  row.appendChild(brandMark(t, 24));
  row.appendChild(brandMark(t, 32));
  row.appendChild(brandMark(t, 48));
  sizes.appendChild(row);
  const flatRow = autoFrame({ direction: "HORIZONTAL", gap: 14, cross: "CENTER" });
  flatRow.appendChild(brandMark(t, 48, { gradient: false }));
  const flatCap = autoFrame({ direction: "VERTICAL", gap: 0 });
  flatCap.appendChild(await makeText(t, "caption", "flat mint", "text/muted"));
  flatCap.appendChild(await makeText(t, "caption", "gradient →", "accent/primary"));
  flatRow.appendChild(flatCap);
  sizes.appendChild(flatRow);
  card.appendChild(sizes);
  col.appendChild(card);
  return col;
}

export async function paintIcons(t: ThemeContext, page: PageNode): Promise<void> {
  const b = board(t, "Icons", BOARD_W, { gap: 44, pad: PAD });
  addAtmosphere(b, [{ x: 1000, y: -80, size: 560, hex: "#5EE6C1" }]);

  b.appendChild(
    await boardTitle(
      t,
      "Foundations — Icons",
      "Icon set",
      "Crisp 24px stroke icons — open-source Lucide (ISC) & Feather (MIT). Reuse anywhere via icon(name); recolor with any color token.",
    ),
  );

  b.appendChild(await brandBlock(t));

  for (const group of GROUPS) b.appendChild(await groupBlock(t, group));

  // Safety net: anything registered but not listed above still shows up.
  // `brand` is featured above, so keep it out of the leftovers grid.
  const listed = new Set(GROUPS.flatMap((g) => g.names));
  const rest = ICON_NAMES.filter((n) => !listed.has(n) && n !== "brand");
  if (rest.length) b.appendChild(await groupBlock(t, { title: "More", names: rest }));

  page.appendChild(b);
  b.x = 0;
  b.y = 0;
}
