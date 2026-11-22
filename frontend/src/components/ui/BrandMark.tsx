"use client";

import styled from "styled-components";

// Logo from the templates: gradient square with two linked circles ("saathi" = companion) + wordmark.

type Size = "sm" | "md";

const BOX = { sm: 32, md: 40 } as const;
const ICON = { sm: 19, md: 24 } as const;
const WORD = { sm: 17, md: 20 } as const;

export default function BrandMark({ size = "md", showName = true }: { size?: Size; showName?: boolean }) {
  return (
    <Root>
      <Box $size={size} aria-hidden="true">
        <svg width={ICON[size]} height={ICON[size]} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </svg>
      </Box>
      {showName ? (
        <Word $size={size}>
          Kaam<span>Sathi</span>
        </Word>
      ) : (
        <VisuallyHidden>Kaamsathi</VisuallyHidden>
      )}
    </Root>
  );
}

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
`;

const Box = styled.span<{ $size: Size }>`
  width: ${({ $size }) => BOX[$size]}px;
  height: ${({ $size }) => BOX[$size]}px;
  border-radius: ${({ $size }) => ($size === "sm" ? 10 : 12)}px;
  background: var(--brand-logo);
  display: grid;
  place-items: center;
  flex: none;
`;

const Word = styled.span<{ $size: Size }>`
  font-weight: 700;
  font-size: ${({ $size }) => WORD[$size]}px;
  letter-spacing: -0.01em;

  span {
    color: var(--av);
  }
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
