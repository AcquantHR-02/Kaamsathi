"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { ArrowLeft } from "lucide-react";
import styled from "styled-components";
import { formatSeconds } from "../hooks/useCountdown";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { maskEmail } from "../utils/pendingVerification";
import { CardHeader, CardTitle, Small, TextButton, u } from "../styles/auth.styles";
import FormErrorAlert from "./FormErrorAlert";
import OtpInput, { isCompleteOtp } from "./OtpInput";

// Register step 2 (template 01-auth/Register--otp-step.html).

type VerifyEmailStepProps = {
  email: string;
  /** Arrived from Sign in: send a fresh code first. */
  sendOnStart: boolean;
  onChangeEmail: () => void;
};

export default function VerifyEmailStep({ email, sendOnStart, onChangeEmail }: VerifyEmailStepProps) {
  const { verify, resend, isVerifying, isResending, error, clearError, secondsLeft } = useVerifyEmail(
    email,
    sendOnStart,
  );
  const [code, setCode] = useState("");
  const firstBox = useRef<HTMLInputElement>(null);
  const focusPending = useRef(false);

  // Boxes are disabled while verifying, and a disabled input ignores focus(),
  // so focus after the render that enables them again.
  useEffect(() => {
    if (focusPending.current && !isVerifying) {
      focusPending.current = false;
      firstBox.current?.focus();
    }
  });

  const restart = () => {
    setCode("");
    focusPending.current = true;
  };

  const submit = async (otp: string) => {
    if (!isCompleteOtp(otp) || isVerifying) return;
    if (!(await verify(otp))) restart();
  };

  const handleResend = async () => {
    if (await resend()) restart();
  };

  return (
    <>
      <BackButton type="button" onClick={onChangeEmail}>
        <ArrowLeft aria-hidden="true" /> Change email
      </BackButton>

      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <Small>
          Step 2 of 2 · Enter the 6-digit code we sent to <Strong>{maskEmail(email)}</Strong>
        </Small>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(code);
        }}
      >
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            clearError();
          }}
          onComplete={submit}
          disabled={isVerifying}
          invalid={!!error}
          firstRef={firstBox}
        />

        <Timing>
          <span>Code expires in 10 minutes</span>
          {secondsLeft > 0 ? (
            <span>
              Resend code in <Mono>{formatSeconds(secondsLeft)}</Mono>
            </span>
          ) : (
            <TextButton type="button" onClick={handleResend} disabled={isResending}>
              {isResending ? "Sending…" : "Resend code"}
            </TextButton>
          )}
        </Timing>

        <FormErrorAlert message={error} />

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isVerifying}
          disabled={!isCompleteOtp(code)}
        >
          {isVerifying ? "Verifying" : "Verify email"}
        </Button>
      </form>

      <Small style={{ textAlign: "center" }}>
        After 5 wrong tries the code stops working — just ask for a new one.
      </Small>
    </>
  );
}

const BackButton = styled.button`
  align-self: flex-start;
  height: ${u(32)};
  margin-left: ${u(-8)};
  padding: 0 ${u(8)};
  display: inline-flex;
  align-items: center;
  gap: ${u(6)};
  border: 0;
  border-radius: ${u(8)};
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: ${u(14)};
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--motion-fast) var(--motion-ease),
    background var(--motion-fast) var(--motion-ease);

  &:hover {
    color: var(--ink);
    background: var(--neut);
  }

  &:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  svg {
    width: ${u(16)};
    height: ${u(16)};
  }
`;

const Strong = styled.b`
  color: var(--ink);
`;

const Timing = styled.div`
  margin: ${u(20)} 0;
  display: flex;
  justify-content: space-between;
  gap: ${u(12)};
  font-size: ${u(13)};
  line-height: ${u(20)};
  color: var(--muted);
`;

const Mono = styled.span`
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  color: var(--ink);
`;
