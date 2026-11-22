"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styled from "styled-components";
import { s } from "@/styles/scale";

// Section card with a title row and an optional "Open queue →" link (template 11-admin .panel).

type PanelProps = {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
};

export default function Panel({ title, link, children }: PanelProps) {
  return (
    <Card>
      <Head>
        <Title>{title}</Title>
        {link && (
          <MoreLink href={link.href}>
            {link.label} <ArrowRight size={16} aria-hidden />
          </MoreLink>
        )}
      </Head>
      {children}
    </Card>
  );
}

/** One line in a panel list: icon/logo, text, action (template .qrow). */
export const PanelRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${s(12)};
  padding: ${s(14)} ${s(20)};
  border-top: 1px solid var(--line);
`;

const Card = styled.section`
  min-width: 0;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: ${s(16)};
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${s(12)};
  padding: ${s(20)};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${s(20)};
  line-height: ${s(28)};
  font-weight: 600;
`;

const MoreLink = styled(Link)`
  && {
    display: inline-flex;
    align-items: center;
    gap: ${s(6)};
    font-size: ${s(14)};
    font-weight: 600;
    text-decoration: none;
    color: var(--ac);
  }

  svg {
    transition: transform var(--motion-fast) var(--motion-ease);
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;
