// Single source of truth for the design system (Kaamsathi templates, "comfort layer" values).
// Feeds both the AntD theme (antdTheme.ts) and the CSS variables (GlobalStyles.ts).

export type ThemeMode = "dark" | "light";

/** Colours that change with the theme. Components read them as CSS vars: var(--ink), var(--surface)… */
export const palette = {
  dark: {
    bg: "#14111f",
    surface: "#1b1729",
    sunken: "#110e1b",
    glass: "linear-gradient(160deg, rgba(201,194,227,.10), rgba(201,194,227,.03))",
    glass2: "rgba(201,194,227,.09)",
    line: "#33314a",
    line2: "#45425f",
    ink: "#e8e5f3",
    muted: "#a9a2c6",
    faint: "#8f86b8",
    av: "#c3b6f2",
    ac: "#8fd9c2",
    vt: "rgba(90,59,140,.45)",
    vl: "#d99bbb",
    ok: "#7dd3a0",
    okt: "rgba(34,197,94,.16)",
    okl: "rgba(74,222,128,.40)",
    bad: "#f09a9a",
    badt: "rgba(240,154,154,.12)",
    badl: "rgba(240,154,154,.35)",
    warn: "#f2c46b",
    warnt: "rgba(242,196,107,.12)",
    warnl: "rgba(242,196,107,.35)",
    infot: "rgba(143,217,194,.12)",
    infol: "rgba(126,224,195,.38)",
    neut: "rgba(201,194,227,.08)",
    focus: "#c9c2e3",
    shadow: "0 20px 48px rgba(0,0,0,.4)",
    btnPrimary: "linear-gradient(120deg, #a596e6 0%, #e3a2c1 60%, #efbf9f 100%)",
    btnPrimaryInk: "#0e0b1d",
    btnPrimaryShadow: "0 6px 18px rgba(227,162,193,.16)",
    gradientText: "linear-gradient(90deg, #c3b6f2, #e3a2c1 55%, #efbf9f)",
    navActive: "linear-gradient(120deg, rgba(160,140,240,.28), rgba(240,143,182,.18))",
    navActiveBar: "#f08fb6",
    glowA: "#6a43b0",
    glowB: "#ec6fa5",
  },
  light: {
    bg: "#f4f2f9",
    surface: "#fbfaff",
    sunken: "#efecf6",
    glass: "rgba(255,255,255,.85)",
    glass2: "rgba(255,255,255,.95)",
    line: "rgba(58,58,82,.16)",
    line2: "rgba(58,58,82,.28)",
    ink: "#1f1a33",
    muted: "#4a4763",
    faint: "#635e80",
    av: "#6b3fa8",
    ac: "#0f766e",
    vt: "#ebe6f7",
    vl: "#b8336a",
    ok: "#1f7a4a",
    okt: "#dcfce7",
    okl: "#86efac",
    bad: "#b23a3a",
    badt: "#fee2e2",
    badl: "#fca5a5",
    warn: "#9a5b0c",
    warnt: "#fbf0d9",
    warnl: "#ecc98a",
    infot: "#dcf7ee",
    infol: "#99e2cb",
    neut: "#f0edf8",
    focus: "#5a3b8c",
    shadow: "0 24px 64px rgba(42,30,77,.16)",
    btnPrimary: "linear-gradient(120deg, #4b2f86, #b8336a)",
    btnPrimaryInk: "#ffffff",
    btnPrimaryShadow: "0 8px 24px rgba(90,59,140,.3)",
    gradientText: "linear-gradient(90deg, #5a3b8c, #a23a68)",
    navActive: "linear-gradient(120deg, #ebe6f7, #fde4ee)",
    navActiveBar: "#b8336a",
    glowA: "#6a43b0",
    glowB: "#ec6fa5",
  },
} as const;

export type PaletteKey = keyof (typeof palette)["dark"];

/** Fixed brand colours (same in both themes). */
export const brand = {
  logo: "linear-gradient(135deg, #7b62c4, #d48fb2)",
  /** Soft tile behind state / notice icons (template 12-common/States .ic). */
  iconBg: "linear-gradient(135deg, rgba(165,150,230,.2), rgba(227,162,193,.14))",
  purple900: "#0e0b1d",
  purple800: "#2a1e4d",
  purple600: "#5a3b8c",
  purple400: "#8b7cc7",
  purple200: "#c9c2e3",
} as const;

export const font = {
  sans: "var(--font-jakarta), 'Noto Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "var(--font-jetbrains), ui-monospace, 'Cascadia Mono', monospace",
} as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;

/** Templates: inputs/buttons 12, section cards 16, auth card 24. */
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Control heights from the templates. */
export const control = { sm: 36, md: 40, lg: 48 } as const;

export const motion = {
  fast: "120ms",
  base: "200ms",
  slow: "320ms",
  /** Smooth "settle" curve used everywhere (CSS + Motion). */
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/** Same curve as motion.ease, as numbers for the Motion library. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const THEME_STORAGE_KEY = "kaamsathi.theme";
