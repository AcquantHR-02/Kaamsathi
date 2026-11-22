"use client";

import styled from "styled-components";

// Soft blurred light behind a page (templates: 560–640px circles, blur 100px, opacity .18).
// Purely decorative: aria-hidden, no pointer events. Parent needs position: relative + overflow: hidden.

interface GlowProps {
  tone: "a" | "b"; // a = violet (--glow-a), b = rose (--glow-b)
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}

export default function Glow({ tone, size, opacity = 0.18, ...position }: GlowProps) {
  return <Light aria-hidden="true" $tone={tone} $size={size} $opacity={opacity} style={toPx(position)} />;
}

const toPx = (pos: Partial<Record<"top" | "left" | "right" | "bottom", number>>) =>
  Object.fromEntries(Object.entries(pos).map(([key, value]) => [key, `${value}px`]));

const Light = styled.div<{ $tone: "a" | "b"; $size: number; $opacity: number }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $tone }) => ($tone === "a" ? "var(--glow-a)" : "var(--glow-b)")};
  opacity: ${({ $opacity }) => $opacity};
  filter: blur(100px);
  pointer-events: none;
`;
