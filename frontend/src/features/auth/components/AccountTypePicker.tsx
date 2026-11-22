"use client";

import { Building2, Search } from "lucide-react";
import styled from "styled-components";
import type { SignupKind } from "../types/auth.types";
import { Small, shortScreen, u } from "../styles/auth.styles";

// "I'm looking for a job" / "I'm hiring" (template 01-auth/Register.html).
// value/onChange so it works as an AntD Form.Item control.

const OPTIONS: { kind: SignupKind; icon: React.ReactNode; title: string; hint: string }[] = [
  { kind: "seeker", icon: <Search />, title: "I'm looking for a job", hint: "Apply and track replies" },
  { kind: "company", icon: <Building2 />, title: "I'm hiring", hint: "Post jobs for my company" },
];

type AccountTypePickerProps = {
  value?: SignupKind;
  onChange?: (kind: SignupKind) => void;
  disabled?: boolean;
};

export default function AccountTypePicker({ value, onChange, disabled }: AccountTypePickerProps) {
  return (
    <Group role="group" aria-label="Account type">
      {OPTIONS.map(({ kind, icon, title, hint }) => (
        <Choice
          key={kind}
          type="button"
          aria-pressed={value === kind}
          disabled={disabled}
          onClick={() => onChange?.(kind)}
        >
          <span className="icon" aria-hidden="true">
            {icon}
          </span>
          <span className="title">{title}</span>
          <Small as="span">{hint}</Small>
        </Choice>
      ))}
    </Group>
  );
}

const Group = styled.div`
  display: flex;
  gap: ${u(12)};
`;

const Choice = styled.button`
  flex: 1;
  min-height: ${u(112)};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${u(8)};
  padding: ${u(16)};
  border-radius: ${u(16)};
  border: 1px solid var(--line);
  background: var(--glass);
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease),
    transform var(--motion-fast) var(--motion-ease);

  ${shortScreen} {
    min-height: 0;
    gap: ${u(6)};
    padding: ${u(12)} ${u(16)};
  }

  &:hover:not(:disabled) {
    border-color: var(--line2);
    transform: translateY(-1px);
  }

  &[aria-pressed="true"] {
    background: var(--vt);
    border-color: var(--vl);
  }

  &:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }

  .icon {
    display: flex;
    color: var(--ac);
  }

  .icon svg {
    width: ${u(20)};
    height: ${u(20)};
  }

  .title {
    font-size: ${u(15)};
    line-height: ${u(22)};
    font-weight: 600;
  }
`;
