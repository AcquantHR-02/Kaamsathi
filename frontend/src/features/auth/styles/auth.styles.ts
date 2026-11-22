"use client";

import { motion } from "motion/react";
import styled, { css } from "styled-components";

// Building blocks shared by every auth screen (templates 01-auth; pattern from the Audit app).
// Every size is written as u(templatePx). On desktop, AuthShell sets --u so the whole page shrinks
// proportionally (0.8–1×) to fit one screen without scrolling (user runs 1080p at 150% ≈ 1280×632).
export const u = (px: number) => `calc(${px} * var(--u, 1px))`;

/** Short desktop screens: --u is already at its readability floor, so we tighten spacing, never text. */
export const shortScreen = "@media (min-width: 1024px) and (max-height: 720px)";

/** Links inside a sentence need more than colour to stand out (WCAG link-in-text-block):
    a soft underline that turns solid on hover. */
const inSentenceLinks = css`
  a {
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    text-underline-offset: 3px;
    transition:
      text-decoration-color var(--motion-fast) var(--motion-ease),
      color var(--motion-fast) var(--motion-ease);
  }

  a:hover {
    text-decoration-color: currentColor;
  }
`;

/* ── Card ───────────────────────────────────────────────── */

/** The glass card that holds each form. Radius 24, padding 40, gap 20. */
export const AuthCard = styled(motion.section)`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${u(20)};
  padding: ${u(40)};
  border-radius: ${u(24)};
  background: var(--glass);
  border: 1px solid var(--line);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);

  ${shortScreen} {
    gap: ${u(14)};
    padding: ${u(28)} ${u(36)};
  }

  @media (max-width: 480px) {
    padding: 28px 20px;
    border-radius: 20px;
  }
`;

/** Title + subtitle stack at the top of a card. */
export const CardHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${u(6)};
`;

export const CardTitle = styled.h1`
  font-size: ${u(28)};
  line-height: ${u(36)};
  font-weight: 700;
  letter-spacing: -0.01em;

  @media (max-width: 480px) {
    font-size: 24px;
    line-height: 32px;
  }
`;

/** Small muted text (templates' `.small`): subtitles, hints, footers. */
export const Small = styled.p`
  font-size: ${u(13)};
  line-height: ${u(20)};
  color: var(--muted);
  ${inSentenceLinks}
`;

/** Centered line under the main button ("New to Kaamsathi? Create an account"). */
export const CardFooter = styled(Small)`
  text-align: center;

  a {
    font-weight: 600;
  }
`;

/** 56px rounded badge with an icon (Forgot password lock, link states). */
export const IconBadge = styled.span`
  width: ${u(56)};
  height: ${u(56)};
  border-radius: ${u(16)};
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(165, 150, 230, 0.3), rgba(227, 162, 193, 0.22));
  color: var(--ink);

  svg {
    width: ${u(26)};
    height: ${u(26)};
  }
`;

/** Pastel gradient text ("work companion."). */
export const GradientText = styled.span`
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

/* ── Form pieces ────────────────────────────────────────── */

// Sizes AntD's Form to the template: 48px inputs (radius 12, sunken bg), 14px/600 labels, 48px button.
// "&&" doubles selector weight: AntD injects its CSS at runtime and would otherwise win ties.
export const FormWrap = styled.div`
  && .ant-form-item {
    margin-bottom: ${u(20)};

    ${shortScreen} {
      margin-bottom: ${u(14)};
    }
  }

  && .ant-form-item-label {
    padding-bottom: ${u(6)};
  }

  && .ant-form-item-label > label {
    height: auto;
    font-size: ${u(14)};
    line-height: ${u(20)};
    font-weight: 600;
    color: var(--ink);
  }

  && .ant-form-item-control-input {
    min-height: 0;
  }

  && .ant-form-item-explain-error,
  && .ant-form-item-extra {
    padding-top: ${u(4)};
    font-size: ${u(13)};
    line-height: ${u(18)};
  }

  && .ant-input-outlined {
    height: ${u(48)};
    padding: 0 ${u(6)} 0 ${u(14)};
    border-radius: ${u(12)};
    font-size: ${u(15)};
  }

  && .ant-input-affix-wrapper .ant-input {
    font-size: ${u(15)};
  }

  /* Chrome paints autofilled fields light blue and ignores background-color,
     so cover it with an inset shadow in the input's own colour. */
  && input:-webkit-autofill,
  && input:-webkit-autofill:hover,
  && input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--sunken) inset;
    -webkit-text-fill-color: var(--ink);
    caret-color: var(--ink);
  }

  && .ant-input-password-icon {
    padding: 0 ${u(10)};
    color: var(--muted);
    cursor: pointer;
  }

  /* Consent: box aligned with the first line of a long text (template: 18px box, gap 12). */
  && .ant-checkbox-wrapper {
    align-items: flex-start;
    gap: ${u(12)};
    font-size: ${u(13)};
    line-height: ${u(20)};
    color: var(--muted);
    ${inSentenceLinks}
  }

  && .ant-checkbox-wrapper > span:last-child {
    padding: 0;
  }

  && .ant-checkbox {
    align-self: flex-start;
    margin-top: 1px;
  }

  && .ant-btn-lg {
    height: ${u(48)};
    border-radius: ${u(12)};
    font-size: ${u(14)};
    font-weight: 600;
  }
`;

/** Password label with "Forgot password?" on the right (AntD labels can't hold a right-aligned link). */
export const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: ${u(6)};
  font-size: ${u(14)};
  line-height: ${u(20)};

  label {
    font-weight: 600;
    color: var(--ink);
  }

  a {
    font-size: ${u(13)};
    font-weight: 600;
  }
`;

/** Link-looking button for in-page actions ("Resend code", "Change email"). */
export const TextButton = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--av);
  cursor: pointer;
  transition: color var(--motion-fast) var(--motion-ease);

  &:hover:not(:disabled) {
    color: var(--ink);
  }

  &:disabled {
    color: var(--faint);
    cursor: default;
  }
`;

/**
 * Red banner above the button (template: role="alert", bad tint + line, radius 12).
 * Carries its own bottom space so it opens/closes with the banner: put it INSIDE the form,
 * not as a gap-spaced child of AuthCard (the gap would stay behind and jump).
 */
export const FormError = styled.div`
  margin-bottom: ${u(20)};
  display: flex;
  gap: ${u(10)};
  align-items: flex-start;
  padding: ${u(12)} ${u(14)};
  border: 1px solid var(--badl);
  border-radius: ${u(12)};
  background: var(--badt);
  font-size: ${u(13)};
  line-height: ${u(20)};
  color: var(--bad);

  ${shortScreen} {
    margin-bottom: ${u(14)};
  }

  svg {
    flex: none;
    width: ${u(16)};
    height: ${u(16)};
    margin-top: 2px;
  }
`;
