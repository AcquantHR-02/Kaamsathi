"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import styled from "styled-components";
import { formatCount } from "@/lib/format";
import { s } from "@/styles/scale";

// Dashboard number tile (template 11-admin .glass.tile): label, big number that counts up, one line.

type StatTileProps = {
  label: string;
  value: number;
  hint?: React.ReactNode;
  /** Defaults to Indian grouping (12,480); pass formatRupees for money. */
  format?: (n: number) => string;
};

export default function StatTile({ label, value, hint, format = formatCount }: StatTileProps) {
  return (
    <Tile>
      <Label>{label}</Label>
      <CountUp value={value} format={format} />
      {hint && <Hint>{hint}</Hint>}
    </Tile>
  );
}

/** Writes straight to the DOM while animating (no re-render per frame); final text is always exact. */
function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduceMotion || value === 0) {
      node.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => (node.textContent = format(Math.round(n))),
    });
    return () => controls.stop();
  }, [value, format, reduceMotion]);

  return <Value ref={ref}>{format(value)}</Value>;
}

const Tile = styled.div`
  position: relative;
  overflow: hidden;
  padding: ${s(20)};
  display: flex;
  flex-direction: column;
  gap: ${s(4)};
  border-radius: ${s(16)};
  border: 1px solid var(--line);
  background: var(--glass);
  box-shadow: var(--shadow);

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    opacity: 0.7;
    background: var(--btn-primary);
  }
`;

const Label = styled.span`
  font-size: ${s(12)};
  line-height: ${s(16)};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--faint);
`;

const Value = styled.b`
  font-size: ${s(28)};
  line-height: ${s(36)};
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
`;

const Hint = styled.span`
  font-size: ${s(14)};
  line-height: ${s(20)};
  color: var(--muted);
`;
