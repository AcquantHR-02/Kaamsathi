"use client";

import { createGlobalStyle } from "styled-components";
import { brand, control, font, motion, palette, radius, space } from "./tokens";

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const toVars = (values: Record<string, string | number>, prefix = "") =>
  Object.entries(values)
    .map(([key, value]) => `--${prefix}${kebab(key)}: ${typeof value === "number" ? `${value}px` : value};`)
    .join("\n");

/*
 * Theme colours live on <html data-theme="dark|light"> (set before first paint by the inline script
 * in the root layout), so switching theme is one attribute change: no React re-render of every component.
 */
export const GlobalStyles = createGlobalStyle`
  :root {
    ${toVars(palette.dark)}
    ${toVars(brand, "brand-")}
    ${toVars(space, "space-")}
    ${toVars(radius, "radius-")}
    ${toVars(control, "control-")}
    --font-sans: ${font.sans};
    --font-mono: ${font.mono};
    --motion-fast: ${motion.fast};
    --motion-base: ${motion.base};
    --motion-slow: ${motion.slow};
    --motion-ease: ${motion.ease};
    color-scheme: dark;
    /* Signed-in UI scale (use s(px)): templates are 1440 wide; laptops at 150% Windows scaling are
       ~1280 wide, where 1× looks oversized. 0.9× there, 1× from 1440 up. Phones keep 1× (readability). */
    --s: 1px;
  }

  @media (min-width: 1024px) {
    :root {
      --s: clamp(0.9px, calc(100vw / 1440), 1px);
    }
  }

  :root[data-theme="light"] {
    ${toVars(palette.light)}
    color-scheme: light;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; }

  /* Side drawers (add / edit / details): never wider than a phone screen. */
  .ant-drawer-right .ant-drawer-content-wrapper { max-width: 100vw; }

  body {
    min-height: 100dvh;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 15px;
    line-height: 24px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color var(--motion-base) var(--motion-ease), color var(--motion-base) var(--motion-ease);
  }

  h1, h2, h3, h4, p { margin: 0; }

  a {
    color: var(--av);
    text-decoration: none;
    transition: color var(--motion-fast) var(--motion-ease);
  }

  a:hover { color: var(--ink); }

  ::selection { background: var(--vt); }

  :focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  /*
   * Scrollbars: a slim thumb shown only while the pointer is over the scrolling area, on a transparent
   * track that keeps its width, so showing it never shifts the layout.
   */
  * { --scrollbar-thumb: transparent; }
  *:hover { --scrollbar-thumb: var(--line2); }

  ::-webkit-scrollbar { width: 8px; height: 8px; background: transparent; }
  ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { background: transparent; }

  ::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background-color: var(--scrollbar-thumb);
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-thumb:hover { background-color: var(--faint); }

  @supports (-moz-appearance: none) {
    * { scrollbar-width: thin; scrollbar-color: transparent transparent; }
    *:hover { scrollbar-color: var(--line2) transparent; }
  }

  /*
   * AntD tokens can't express gradients: the templates' primary button (pastel sheen in dark,
   * deep purple → rose in light). Doubled class beats AntD's runtime CSS. Danger keeps its red.
   */
  .ant-btn.ant-btn-primary:not(:disabled):not(.ant-btn-dangerous) {
    background: var(--btn-primary);
    color: var(--btn-primary-ink);
    border-color: transparent;
    box-shadow: var(--btn-primary-shadow);
    transition: filter var(--motion-fast) var(--motion-ease), transform var(--motion-fast) var(--motion-ease);
  }

  .ant-btn.ant-btn-primary:not(:disabled):not(.ant-btn-dangerous):hover {
    background: var(--btn-primary);
    color: var(--btn-primary-ink);
    filter: brightness(1.06);
  }

  .ant-btn.ant-btn-primary:not(:disabled):not(.ant-btn-dangerous):active {
    transform: translateY(1px);
  }

  /* Popups and dialogs own their scroll: reaching the end never scrolls the page behind them. */
  .ant-select-dropdown-list-holder,
  .ant-picker-dropdown,
  .ant-dropdown-menu,
  .ant-popover-inner,
  .ant-modal-wrap,
  .ant-drawer-body {
    overscroll-behavior: contain;
  }

  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
