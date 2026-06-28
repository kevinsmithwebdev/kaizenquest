/**
 * Kaizen light-mode palette derived from ai/basic-light-design-idea.png.
 * CSS variables in app/globals.css are the runtime source of truth for UI.
 */
export const kaizenPalette = {
  brand: {
    DEFAULT: "#FF5C00",
    foreground: "#FFFFFF",
    subtle: "#FFF7ED",
  },
  action: {
    DEFAULT: "#2563EB",
    foreground: "#FFFFFF",
    subtle: "#EFF6FF",
  },
  success: {
    DEFAULT: "#10B981",
    foreground: "#FFFFFF",
    subtle: "#ECFDF5",
  },
  focus: {
    DEFAULT: "#8B5CF6",
    foreground: "#FFFFFF",
    subtle: "#F5F3FF",
  },
  energy: {
    DEFAULT: "#F59E0B",
    foreground: "#111827",
    subtle: "#FFFBEB",
  },
  neutral: {
    background: "#F9FAFB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    foreground: "#111827",
    body: "#4B5563",
    muted: "#9CA3AF",
    mutedBackground: "#F3F4F6",
  },
} as const;

/** Goal category colors for charts, rings, and badges. */
export const goalCategoryColors = {
  workout: kaizenPalette.success.DEFAULT,
  read: kaizenPalette.action.DEFAULT,
  meditate: kaizenPalette.focus.DEFAULT,
  spanish: kaizenPalette.energy.DEFAULT,
  water: kaizenPalette.action.DEFAULT,
  streak: kaizenPalette.brand.DEFAULT,
} as const;
