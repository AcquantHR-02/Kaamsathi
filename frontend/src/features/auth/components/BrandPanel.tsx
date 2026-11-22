"use client";

import Link from "next/link";
import { motion } from "motion/react";
import styled from "styled-components";
import BrandMark from "@/components/ui/BrandMark";
import { ROUTES } from "@/config/constants";
import { fadeRise, stagger } from "@/styles/motion";
import { GradientText, Small, u } from "../styles/auth.styles";

// Left half of the split auth layout (template 01-auth/Login.html).

const PROMISES = [
  "Track every application, step by step",
  "Hear back within 14 days, every time",
  "Only verified companies can post jobs",
];

export default function BrandPanel() {
  return (
    <Panel>
      <Link href={ROUTES.HOME} aria-label="Kaamsathi home">
        <BrandMark />
      </Link>

      <Story initial="hidden" animate="show" variants={stagger(0.08, 0.15)}>
        <motion.h2 variants={fadeRise}>
          Your <GradientText>work companion.</GradientText>
        </motion.h2>
        <motion.p variants={fadeRise} className="lead">
          Job seekers, employers and our admin team all sign in here. We&apos;ll take you to the right place.
        </motion.p>
        <Promises>
          {PROMISES.map((text) => (
            <motion.li key={text} variants={fadeRise}>
              <Tick aria-hidden="true">✓</Tick>
              <span>{text}</span>
            </motion.li>
          ))}
        </Promises>
      </Story>

      <Small>
        © {new Date().getFullYear()} Kaamsathi · <Link href={ROUTES.HOME}>Privacy</Link> ·{" "}
        <Link href={ROUTES.HOME}>Terms</Link>
      </Small>
    </Panel>
  );
}

const Panel = styled.section`
  position: relative;
  flex: 1 1 560px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${u(48)};
  padding: ${u(48)} ${u(64)};

  @media (min-width: 1024px) and (max-height: 700px) {
    gap: ${u(24)};
    padding: ${u(32)} ${u(64)};
  }

  /* Below 1024px the panel is decoration we can drop: the form takes the screen. */
  @media (max-width: 1023px) {
    display: none;
  }
`;

const Story = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${u(20)};
  max-width: ${u(520)};

  h2 {
    font-size: ${u(44)};
    line-height: ${u(52)};
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .lead {
    font-size: ${u(18)};
    line-height: ${u(28)};
    color: var(--muted);
  }
`;

const Promises = styled.ul`
  list-style: none;
  margin: ${u(12)} 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${u(12)};

  li {
    display: flex;
    gap: ${u(12)};
    align-items: center;
    font-size: ${u(15)};
    line-height: ${u(24)};
  }
`;

const Tick = styled.span`
  width: ${u(32)};
  height: ${u(32)};
  flex: none;
  border-radius: var(--radius-pill);
  display: grid;
  place-items: center;
  background: var(--glass2);
  border: 1px solid var(--line);
  color: var(--ok);
`;
