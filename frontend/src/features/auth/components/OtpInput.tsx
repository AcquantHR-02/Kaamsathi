"use client";

import { useRef } from "react";
import styled from "styled-components";
import { OTP_LENGTH } from "../types/auth.types";
import { u } from "../styles/auth.styles";

// Six one-digit boxes (template 01-auth/Register--otp-step.html).
// `value` keeps each box's place: " " marks an empty box, so "48 9  " is boxes 1, 2 and 4 filled.
// Typing moves on, Backspace moves back, arrows move, and a pasted or auto-filled code
// (phones put all 6 digits into the first box) spreads across the boxes.

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** All boxes filled: the step verifies without a button press. */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Receives the first box, so the step can focus it after a wrong code. */
  firstRef?: React.Ref<HTMLInputElement>;
};

export const isCompleteOtp = (value: string) => new RegExp(`^\\d{${OTP_LENGTH}}$`).test(value);

export default function OtpInput({ value, onChange, onComplete, disabled, invalid, firstRef }: OtpInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => (value[i] ?? " ").trim());

  const focusBox = (i: number) => boxes.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus();

  const write = (start: number, typed: string) => {
    const next = [...digits];
    [...typed].slice(0, OTP_LENGTH - start).forEach((d, k) => (next[start + k] = d));
    const joined = next.map((d) => d || " ").join("");
    onChange(joined);
    focusBox(start + typed.length);
    if (isCompleteOtp(joined)) onComplete?.(joined);
  };

  const handleChange = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    // A box already holding a digit receives "old + new": keep the new one.
    if (typed) write(i, typed.length === 2 && digits[i] ? typed.replace(digits[i], "") || typed[1] : typed);
  };

  const handleKeyDown = (i: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const target = digits[i] ? i : i - 1;
      if (target < 0) return;
      const next = [...digits];
      next[target] = "";
      onChange(next.map((d) => d || " ").join(""));
      focusBox(target);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(i - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(i + 1);
    }
  };

  return (
    <Boxes>
      <legend>Verification code</legend>
      {digits.map((digit, i) => (
        <Box
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
            if (i === 0 && firstRef) {
              if (typeof firstRef === "function") firstRef(el);
              else firstRef.current = el;
            }
          }}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => {
            e.preventDefault();
            write(i, e.clipboardData.getData("text/plain").replace(/\D/g, ""));
          }}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          $invalid={invalid}
        />
      ))}
    </Boxes>
  );
}

const Boxes = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: ${u(10)};

  legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
`;

const Box = styled.input<{ $invalid?: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  max-width: ${u(56)};
  height: ${u(64)};
  border-radius: ${u(12)};
  border: 1px solid ${({ $invalid }) => ($invalid ? "var(--bad)" : "var(--line2)")};
  background: var(--sunken);
  color: var(--ink);
  text-align: center;
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: ${u(24)};
  font-weight: 500;
  caret-color: var(--av);
  transition:
    border-color var(--motion-fast) var(--motion-ease),
    box-shadow var(--motion-fast) var(--motion-ease);

  &:focus {
    outline: none;
    border-color: var(--focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 30%, transparent);
  }

  &:disabled {
    opacity: 0.6;
  }

  @media (max-width: 480px) {
    height: 56px;
    font-size: 22px;
  }
`;
