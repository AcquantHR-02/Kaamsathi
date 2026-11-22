"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Form, Input } from "antd";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Lock, MailCheck } from "lucide-react";
import styled from "styled-components";
import { ROUTES } from "@/config/constants";
import { fadeRise } from "@/styles/motion";
import { useForgotPassword } from "../hooks/useForgotPassword";
import type { ForgotPasswordRequest } from "../types/auth.types";
import { EMAIL_RULES } from "../utils/validation";
import {
  AuthCard,
  CardFooter,
  CardHeader,
  CardTitle,
  FormWrap,
  IconBadge,
  Small,
  TextButton,
  u,
} from "../styles/auth.styles";
import AuthNotice from "./AuthNotice";
import FormErrorAlert from "./FormErrorAlert";

// Templates 01-auth/ForgotPassword.html + --link-sent. The demo-only "I have the link" button is
// left out: the real next step is the link in the email.

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { handleSubmit, isLoading, error, clearError, sent, tryAgain } = useForgotPassword();

  return (
    <AuthCard>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <AuthNotice
            key="sent"
            tone="info"
            icon={<MailCheck />}
            title="Check your inbox"
            action={
              <Button type="primary" size="large" block onClick={() => router.push(ROUTES.LOGIN)}>
                Back to sign in
              </Button>
            }
            secondary={<TextButton onClick={tryAgain}>Use another email</TextButton>}
          >
            If an account exists for that email, a reset link is on its way. Don&apos;t see it? Check spam, or try again
            in a minute.
          </AuthNotice>
        ) : (
          <Stack key="form" initial="hidden" animate="show" exit="hidden" variants={fadeRise}>
            <IconBadge aria-hidden>
              <Lock />
            </IconBadge>
            <CardHeader>
              <CardTitle>Forgot your password?</CardTitle>
              <Small>
                Enter your email and we&apos;ll send you a link to set a new one. The link works for 30 minutes.
              </Small>
            </CardHeader>

            <FormWrap>
              <Form<ForgotPasswordRequest>
                name="forgot"
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                onValuesChange={clearError}
                disabled={isLoading}
              >
                <Form.Item label="Email" name="email" rules={EMAIL_RULES}>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" autoFocus />
                </Form.Item>

                <FormErrorAlert message={error} />

                <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                  {isLoading ? "Sending link" : "Send reset link"}
                </Button>
              </Form>
            </FormWrap>

            <CardFooter>
              <BackLink href={ROUTES.LOGIN}>
                <ArrowLeft size={16} aria-hidden /> Back to sign in
              </BackLink>
            </CardFooter>
          </Stack>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}

const Stack = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${u(20)};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${u(6)};
`;
