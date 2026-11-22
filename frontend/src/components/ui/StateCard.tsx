"use client";

import { motion } from "motion/react";
import styled from "styled-components";
import { fadeRise } from "@/styles/motion";
import { s } from "@/styles/scale";

// Empty and error screens (template 12-common/States): icon or big number, title, one line, one action.

type StateCardProps = {
  /** Lucide icon in a soft tile; ignored when `big` is given. */
  icon?: React.ReactNode;
  /** Large gradient text instead of an icon, e.g. "404". */
  big?: string;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  /** "alert" for errors (announced by screen readers); default for empty states. */
  role?: "alert" | "status";
};

export default function StateCard({ icon, big, title, children, action, role }: StateCardProps) {
  return (
    <Card role={role} initial="hidden" animate="show" variants={fadeRise}>
      {big ? <Big>{big}</Big> : icon && <IconTile aria-hidden>{icon}</IconTile>}
      <Title>{title}</Title>
      {children && <Text>{children}</Text>}
      {action && <Action>{action}</Action>}
    </Card>
  );
}

const Card = styled(motion.section)`
  min-height: ${s(260)};
  padding: ${s(28)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${s(10)};
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: ${s(18)};
`;

const IconTile = styled.span`
  width: ${s(56)};
  height: ${s(56)};
  border-radius: ${s(18)};
  display: grid;
  place-items: center;
  background: var(--brand-icon-bg);
  color: var(--ink);

  svg {
    width: ${s(24)};
    height: ${s(24)};
  }
`;

const Big = styled.span`
  font-size: ${s(44)};
  line-height: ${s(52)};
  font-weight: 700;
  letter-spacing: -0.02em;
  background: var(--gradient-text);
  background-clip: text;
  color: transparent;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${s(17)};
  line-height: ${s(24)};
  font-weight: 700;
`;

const Text = styled.p`
  margin: 0;
  max-width: ${s(360)};
  font-size: ${s(14)};
  line-height: ${s(20)};
  color: var(--muted);
`;

const Action = styled.div`
  margin-top: ${s(6)};
`;
