"use client";

import Link from "next/link";
import { motion } from "motion/react";
import styled from "styled-components";
import BrandMark from "@/components/ui/BrandMark";
import Glow from "@/components/ui/Glow";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/config/constants";
import { fadeRise } from "@/styles/motion";
import { u } from "../styles/auth.styles";
import BrandPanel from "./BrandPanel";

// The frame around every auth screen (templates 01-auth; scaling pattern from the Audit app).
// split    = Sign in: brand panel left, card right (panel hides below 1024px, logo moves above the card).
// centered = Register / Forgot / Invite: logo on top, one card below; `width` = card max width (template px).

type AuthShellProps = {
  children: React.ReactNode;
  variant?: "split" | "centered";
  width?: number;
  /** Screen height (template px) the page needs at 1×. Short pages pass less, so they grow more on big screens. */
  fitHeight?: number;
};

export default function AuthShell({ children, variant = "centered", width = 460, fitHeight = 900 }: AuthShellProps) {
  const card = (
    <motion.div initial="hidden" animate="show" variants={fadeRise} style={{ width: "100%" }}>
      {children}
    </motion.div>
  );

  return (
    <Page $fitHeight={fitHeight}>
      <Glow tone="a" size={640} left={-200} top={-220} opacity={0.2} />
      <Glow tone="b" size={560} right={-160} bottom={-200} />

      {/* Logo sits in the corner, not above the card: the card gets the full height (Register fits one screen). */}
      <TopLeft $hideOnDesktop={variant === "split"}>
        <Link href={ROUTES.HOME} aria-label="Kaamsathi home">
          <BrandMark />
        </Link>
      </TopLeft>

      <TopRight>
        <ThemeToggle />
      </TopRight>

      {variant === "split" ? (
        <Split>
          <BrandPanel />
          <FormSide>
            <Column $width={440}>{card}</Column>
          </FormSide>
        </Split>
      ) : (
        <Centered>
          <Column $width={width}>{card}</Column>
        </Centered>
      )}
    </Page>
  );
}

const Page = styled.main<{ $fitHeight: number }>`
  --u: 1px;
  position: relative;
  min-height: 100dvh;
  /* Both axes: the glows sit partly off-screen (like the template) and must never add scroll.
     Real content still scrolls on small screens, because the page grows with it (min-height). */
  overflow: clip;

  /* Template artboard is 1440 wide. The page scales like a zoom between 0.8px (readability floor)
     and 1.25px (big screens, so the card doesn't sit small in empty space), limited by the width
     and by the height this page needs, so it always fits one screen. */
  @media (min-width: 1024px) {
    --u: clamp(0.8px, min(calc(100dvh / ${({ $fitHeight }) => $fitHeight}), calc(100vw / 1440)), 1.25px);
  }
`;

const Corner = styled.div`
  position: absolute;
  top: 24px;
  z-index: 1;
`;

const TopLeft = styled(Corner)<{ $hideOnDesktop: boolean }>`
  left: clamp(16px, 3vw, 32px);

  /* Split layout: the brand panel already shows the logo on desktop. */
  ${({ $hideOnDesktop }) => $hideOnDesktop && "@media (min-width: 1024px) { display: none; }"}
`;

const TopRight = styled(Corner)`
  right: clamp(16px, 3vw, 32px);
`;

const Split = styled.div`
  position: relative;
  min-height: 100dvh;
  display: flex;
  /* On wide screens the halves would drift apart and leave an empty middle; keep them together. */
  max-width: ${u(1360)};
  margin-inline: auto;
`;

const FormSide = styled.div`
  flex: 1 1 480px;
  display: grid;
  place-items: center;
  padding: ${u(88)} 24px ${u(48)};

  /* Short desktop screens (1080p at 150% ≈ 632px tall): --u is already at its floor,
     so tighten whitespace instead of shrinking text further. */
  @media (min-width: 1024px) and (max-height: 700px) {
    padding: ${u(56)} 24px ${u(24)};
  }

  @media (max-width: 480px) {
    padding: 80px 16px 32px;
  }
`;

const Centered = styled.div`
  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  /* Below 1024px the corner logo/toggle sit above the card, so it needs top clearance (24 + 40 + 24). */
  padding: 88px 24px 48px;

  /* Desktop: the card (≤520 wide, centred) never reaches the corners, so only the template's 48px is needed. */
  @media (min-width: 1024px) {
    padding: ${u(48)} 24px;
  }

  @media (min-width: 1024px) and (max-height: 700px) {
    padding: ${u(24)} 24px;
  }

  @media (max-width: 480px) {
    padding: 80px 16px 32px;
  }
`;

const Column = styled.div<{ $width: number }>`
  width: 100%;
  max-width: ${({ $width }) => u($width)};

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;
