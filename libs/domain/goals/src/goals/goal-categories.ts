import {
  Briefcase,
  Flower2,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  ListChecks,
  Palette,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const GOAL_CATEGORIES = [
  "health",
  "spiritual",
  "learning",
  "creative",
  "work",
  "productivity",
  "financial",
  "social",
  "hobby",
  "charity",
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

/** Icon color for uncategorized goals. */
export const DEFAULT_GOAL_CATEGORY_COLOR = "oklch(0.55 0.02 260)";

const CATEGORY_ICON_BACKGROUND_ALPHA = 0.14;

type GoalCategoryConfig = {
  slug: GoalCategory;
  label: string;
  icon: LucideIcon;
  color: string;
};

/**
 * Icon colors evenly spaced around the oklch hue wheel (36° apart).
 * Health is anchored at red; default/uncategorized stays gray.
 * Room for ~15 more categories before hues need rebalancing.
 */
export const GOAL_CATEGORY_CONFIG: GoalCategoryConfig[] = [
  {
    slug: "health",
    label: "Health",
    icon: HeartPulse,
    color: "oklch(0.55 0.20 15)",
  },
  {
    slug: "spiritual",
    label: "Spiritual",
    icon: Flower2,
    color: "oklch(0.54 0.18 51)",
  },
  {
    slug: "learning",
    label: "Learning",
    icon: GraduationCap,
    color: "oklch(0.58 0.16 87)",
  },
  {
    slug: "creative",
    label: "Creative",
    icon: Palette,
    color: "oklch(0.56 0.16 123)",
  },
  {
    slug: "work",
    label: "Work",
    icon: Briefcase,
    color: "oklch(0.50 0.14 159)",
  },
  {
    slug: "productivity",
    label: "Productivity",
    icon: ListChecks,
    color: "oklch(0.52 0.14 195)",
  },
  {
    slug: "financial",
    label: "Financial",
    icon: Wallet,
    color: "oklch(0.50 0.16 231)",
  },
  {
    slug: "social",
    label: "Social",
    icon: Users,
    color: "oklch(0.54 0.16 267)",
  },
  {
    slug: "hobby",
    label: "Hobby",
    icon: Gamepad2,
    color: "oklch(0.56 0.18 303)",
  },
  {
    slug: "charity",
    label: "Charity",
    icon: HeartHandshake,
    color: "oklch(0.54 0.18 339)",
  },
];

/** Maps legacy category slugs to their consolidated replacements. */
export const LEGACY_GOAL_CATEGORY_MAP: Record<string, GoalCategory> = {
  fitness: "health",
  education: "learning",
  reading: "learning",
  writing: "learning",
  language: "learning",
  cognitive: "learning",
  art: "creative",
  music: "creative",
  career: "work",
};

const goalCategoryIconBySlug = new Map(
  GOAL_CATEGORY_CONFIG.map((config) => [config.slug, config.icon]),
);

const goalCategoryColorBySlug = new Map(
  GOAL_CATEGORY_CONFIG.map((config) => [config.slug, config.color]),
);

export const DEFAULT_GOAL_CATEGORY_ICON: LucideIcon = Target;

export type GoalCategoryColors = {
  icon: string;
  /** Pastel fill for the icon squircle. */
  background: string;
};

const withOklchAlpha = (color: string, alpha: number): string =>
  color.replace(/\)$/, ` / ${alpha})`);

export const isGoalCategory = (value: string): value is GoalCategory => {
  return (GOAL_CATEGORIES as readonly string[]).includes(value);
};

export const normalizeGoalCategory = (
  value: string | null,
): GoalCategory | null => {
  if (value === null) {
    return null;
  }

  if (isGoalCategory(value)) {
    return value;
  }

  return LEGACY_GOAL_CATEGORY_MAP[value] ?? null;
};

export const getGoalCategoryIcon = (
  category: GoalCategory | null,
): LucideIcon => {
  if (category === null) {
    return DEFAULT_GOAL_CATEGORY_ICON;
  }

  return goalCategoryIconBySlug.get(category) ?? DEFAULT_GOAL_CATEGORY_ICON;
};

export const getGoalCategoryColor = (category: GoalCategory | null): string => {
  if (category === null) {
    return DEFAULT_GOAL_CATEGORY_COLOR;
  }

  return goalCategoryColorBySlug.get(category) ?? DEFAULT_GOAL_CATEGORY_COLOR;
};

export const getGoalCategoryColors = (
  category: GoalCategory | null,
): GoalCategoryColors => {
  const icon = getGoalCategoryColor(category);

  return {
    icon,
    background: withOklchAlpha(icon, CATEGORY_ICON_BACKGROUND_ALPHA),
  };
};
