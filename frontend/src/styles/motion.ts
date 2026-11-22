import type { Transition, Variants } from "motion/react";
import { css, keyframes } from "styled-components";
import { EASE_OUT } from "./tokens";

/*
 * Shared motion, so every screen moves the same way.
 * - CSS entrances (enterRise…) for simple "appear" effects inside styled-components.
 * - Motion presets (fadeRise, stagger…) for orchestrated effects: lists, page changes, exits.
 * Reduced motion: CSS is shortened globally (GlobalStyles); Motion respects it via <MotionConfig reducedMotion="user">.
 */

const rise = keyframes`
  from { opacity: 0; transform: translateY(8px); }
`;

const fade = keyframes`
  from { opacity: 0; }
`;

const drop = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
`;

/** Page / section content arriving: fades in while settling up a few pixels. */
export const enterRise = css`
  animation: ${rise} var(--motion-slow) var(--motion-ease) backwards;
`;

/** Content swapped in place (a tab's body). */
export const enterFade = css`
  animation: ${fade} var(--motion-base) var(--motion-ease) backwards;
`;

/** Inline content opening below its trigger (alert, notice). */
export const enterDrop = css`
  animation: ${drop} var(--motion-base) var(--motion-ease) backwards;
`;

/** Default Motion timing: smooth settle, no bounce (professional, not playful). */
export const settle: Transition = { duration: 0.32, ease: EASE_OUT };

/** Springy but calm, for things the user drags or toggles. */
export const softSpring: Transition = { type: "spring", stiffness: 380, damping: 32, mass: 0.8 };

/** One item fading up into place. Use with a `stagger` parent for lists and cards. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: settle },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: EASE_OUT } },
};

/** Parent that reveals its children one after another. */
export const stagger = (gap = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Subtle lift on hover for clickable cards. */
export const hoverLift = { y: -3, transition: softSpring } as const;
