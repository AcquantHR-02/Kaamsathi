"use client";

import { motion } from "motion/react";
import styled from "styled-components";
import { fadeRise } from "@/styles/motion";
import { Small, u } from "../styles/auth.styles";

// "What happened + the one next step" (template 01-auth/AuthStates.html). Goes inside an AuthCard
// in place of the form: locked / unverified / suspended sign-in, expired or used email links.

type Tone = "ok" | "warn" | "info" | "bad" | "neutral";

type AuthNoticeProps = {
  tone: Tone;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  /** The one next step (a large block button). */
  action: React.ReactNode;
  /** Optional quiet way back, e.g. "Use another account". */
  secondary?: React.ReactNode;
};

export default function AuthNotice({ tone, icon, title, children, action, secondary }: AuthNoticeProps) {
  return (
    // role="alert": it replaces the form after a failed sign-in, so screen readers must announce it.
    <Wrap role="alert" initial="hidden" animate="show" exit="hidden" variants={fadeRise}>
      <Icon $tone={tone} aria-hidden="true">
        {icon}
      </Icon>
      <Title>{title}</Title>
      <Small>{children}</Small>
      <Actions>
        {action}
        {secondary}
      </Actions>
    </Wrap>
  );
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  ok: { bg: "var(--okt)", fg: "var(--ok)" },
  warn: { bg: "var(--warnt)", fg: "var(--warn)" },
  info: { bg: "var(--infot)", fg: "var(--ac)" },
  bad: { bg: "var(--badt)", fg: "var(--bad)" },
  neutral: { bg: "var(--neut)", fg: "var(--muted)" },
};

const Wrap = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${u(12)};
`;

const Icon = styled.span<{ $tone: Tone }>`
  width: ${u(52)};
  height: ${u(52)};
  border-radius: ${u(16)};
  display: grid;
  place-items: center;
  background: ${({ $tone }) => TONES[$tone].bg};
  color: ${({ $tone }) => TONES[$tone].fg};

  svg {
    width: ${u(24)};
    height: ${u(24)};
  }
`;

const Title = styled.h1`
  margin-top: ${u(4)};
  font-size: ${u(19)};
  line-height: ${u(27)};
  font-weight: 700;
`;

const Actions = styled.div`
  width: 100%;
  margin-top: ${u(8)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${u(12)};

  .ant-btn-lg {
    height: ${u(48)};
    font-size: ${u(14)};
    font-weight: 600;
  }
`;
