export type IconMetadata = {
  /** Human-readable group the icon belongs to, e.g. `"Arrows"`. */
  category: string;
  /** Marked for removal in a future major — still exported, but avoid new usage. */
  deprecated?: boolean;
  /** Extra search terms so the icon is findable under more than its file name. */
  aliases?: string[];
};

export type GroupedIcon = {
  iconName: string;
  metadata: IconMetadata;
};

export type IconCategories = Record<string, GroupedIcon[]>;
