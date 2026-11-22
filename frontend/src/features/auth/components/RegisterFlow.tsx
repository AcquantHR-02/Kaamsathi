"use client";

import { useEffect, useState } from "react";
import { Form } from "antd";
import { AnimatePresence, motion } from "motion/react";
import styled from "styled-components";
import { fadeRise } from "@/styles/motion";
import type { RegisterFormValues } from "../types/auth.types";
import { clearPendingVerification, peekPendingVerification } from "../utils/pendingVerification";
import { AuthCard, u } from "../styles/auth.styles";
import RegisterForm from "./RegisterForm";
import VerifyEmailStep from "./VerifyEmailStep";

// /register: step 1 (account form) → step 2 (6-digit code), on one page (backend contract).

type Step = { name: "form" } | { name: "code"; email: string; sendOnStart: boolean };

export default function RegisterFlow() {
  const [form] = Form.useForm<RegisterFormValues>();
  // Arrived from Sign in → "Enter code": start at step 2, so the form never flashes. That arrival is
  // an in-app navigation (no server render), so reading sessionStorage here can't mismatch.
  const [step, setStep] = useState<Step>(() => {
    const email = peekPendingVerification();
    return email ? { name: "code", email, sendOnStart: true } : { name: "form" };
  });

  useEffect(() => clearPendingVerification(), []);

  return (
    <AuthCard>
      <AnimatePresence mode="wait" initial={false}>
        <Stack key={step.name} initial="hidden" animate="show" exit="hidden" variants={fadeRise}>
          {step.name === "form" ? (
            <RegisterForm form={form} onCreated={(email) => setStep({ name: "code", email, sendOnStart: false })} />
          ) : (
            <VerifyEmailStep
              email={step.email}
              sendOnStart={step.sendOnStart}
              onChangeEmail={() => {
                form.setFieldValue("email", step.email);
                setStep({ name: "form" });
              }}
            />
          )}
        </Stack>
      </AnimatePresence>
    </AuthCard>
  );
}

const Stack = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${u(20)};
`;
