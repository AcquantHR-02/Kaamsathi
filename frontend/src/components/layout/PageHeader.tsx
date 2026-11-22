"use client";

import styled from "styled-components";
import { s } from "@/styles/scale";

// Title row at the top of every signed-in page (template EmployerDashboard): title, one line, actions.

type PageHeaderProps = { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode };

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Row>
      <div>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {actions && <Actions>{actions}</Actions>}
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  /* Top-aligned so header buttons sit level with the corner theme toggle (40px, top-right). */
  align-items: flex-start;
  gap: ${s(16)};
  flex-wrap: wrap;
  /* Leaves room for the theme toggle in the corner. */
  padding-right: ${s(56)};

  @media (max-width: 1023px) {
    padding-right: 0;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${s(28)};
  line-height: ${s(36)};
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: ${s(15)};
  line-height: ${s(24)};
  color: var(--muted);
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${s(12)};

  /* Same height as the theme toggle next to it, so the pair reads as one row. */
  .ant-btn {
    height: 40px;
  }
`;
