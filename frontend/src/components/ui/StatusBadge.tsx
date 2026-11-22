"use client";

import styled from "styled-components";
import { s } from "@/styles/scale";

// Pill badge (template .badge / .b-ok / .b-warn / .b-bad). Backend statuses are shown as-is.

export type BadgeTone = "ok" | "warn" | "bad" | "info" | "neutral" | "role";

const TONES: Record<BadgeTone, { bg: string; line: string; fg: string }> = {
  ok: { bg: "var(--okt)", line: "var(--okl)", fg: "var(--ok)" },
  warn: { bg: "var(--warnt)", line: "var(--warnl)", fg: "var(--warn)" },
  bad: { bg: "var(--badt)", line: "var(--badl)", fg: "var(--bad)" },
  info: { bg: "var(--infot)", line: "var(--infol)", fg: "var(--ac)" },
  neutral: { bg: "var(--neut)", line: "var(--line)", fg: "var(--muted)" },
  /* Who someone is (Seeker, Recruiter…), not a state: soft brand tint (template .b-role). */
  role: { bg: "var(--brand-icon-bg)", line: "var(--line2)", fg: "var(--av)" },
};

export default function StatusBadge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return <Pill $tone={tone}>{children}</Pill>;
}

const Pill = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Same width for every badge (fits "Company owner"), so badge columns line up. */
  min-width: ${s(108)};
  gap: ${s(4)};
  height: ${s(22)};
  padding: 0 ${s(10)};
  border-radius: 999px;
  font-size: ${s(12)};
  line-height: ${s(16)};
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid ${({ $tone }) => TONES[$tone].line};
  background: ${({ $tone }) => TONES[$tone].bg};
  color: ${({ $tone }) => TONES[$tone].fg};
`;
