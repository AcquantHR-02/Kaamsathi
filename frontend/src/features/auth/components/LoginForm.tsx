"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Form, Input } from "antd";
import { AnimatePresence, motion } from "motion/react";
import { Ban, Clock, Eye, EyeOff, Mail } from "lucide-react";
import styled from "styled-components";
import { ROUTES, SUPPORT_EMAIL } from "@/config/constants";
import { fadeRise } from "@/styles/motion";
import { useLogin, type LoginProblem } from "../hooks/useLogin";
import type { LoginRequest } from "../types/auth.types";
import { maskEmail, savePendingVerification } from "../utils/pendingVerification";
import { EMAIL_RULES, LOGIN_PASSWORD_RULES } from "../utils/validation";
import {
  AuthCard,
  CardFooter,
  CardHeader,
  CardTitle,
  FieldHeader,
  FormWrap,
  Small,
  TextButton,
  u,
} from "../styles/auth.styles";
import AuthNotice from "./AuthNotice";
import FormErrorAlert from "./FormErrorAlert";

// Sign in for every role (template 01-auth/Login.html). The role comes from the account.

export default function LoginForm() {
  const { handleSubmit, isLoading, error, clearError, problem, clearProblem } = useLogin();

  return (
    <AuthCard>
      <AnimatePresence mode="wait" initial={false}>
        {problem ? (
          <ProblemNotice key="notice" kind={problem.kind} email={problem.email} onBack={clearProblem} />
        ) : (
          <Stack key="form" initial="hidden" animate="show" exit="hidden" variants={fadeRise}>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <Small>Sign in with the email you registered with.</Small>
            </CardHeader>

            <FormWrap>
              <Form<LoginRequest>
                name="login"
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                onValuesChange={clearError}
                disabled={isLoading}
              >
                <Form.Item label="Email" name="email" rules={EMAIL_RULES}>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" autoFocus />
                </Form.Item>

                <FieldHeader>
                  <label htmlFor="login_password">Password</label>
                  <Link href={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
                </FieldHeader>
                <Form.Item name="password" rules={LOGIN_PASSWORD_RULES}>
                  <Input.Password
                    placeholder="Your password"
                    autoComplete="current-password"
                    iconRender={(visible) => (visible ? <EyeOff size={18} /> : <Eye size={18} />)}
                  />
                </Form.Item>

                <FormErrorAlert message={error} />

                <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                  {isLoading ? "Signing in" : "Sign in"}
                </Button>
              </Form>
            </FormWrap>

            <CardFooter>
              New to Kaamsathi? <Link href={ROUTES.REGISTER}>Create an account</Link>
            </CardFooter>
          </Stack>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}

function ProblemNotice({ kind, email, onBack }: { kind: LoginProblem; email: string; onBack: () => void }) {
  const router = useRouter();
  const back = <TextButton onClick={onBack}>Back to sign in</TextButton>;

  if (kind === "locked") {
    return (
      <AuthNotice
        tone="warn"
        icon={<Clock />}
        title="Sign-in paused for 15 minutes"
        action={
          <Button type="primary" size="large" block onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}>
            Reset password
          </Button>
        }
        secondary={back}
      >
        There were 5 wrong passwords in a row, so we paused sign-in to protect your account. Try again in 15 minutes, or
        reset your password now.
      </AuthNotice>
    );
  }

  if (kind === "unverified") {
    const enterCode = () => {
      savePendingVerification(email);
      router.push(ROUTES.REGISTER);
    };
    return (
      <AuthNotice
        tone="info"
        icon={<Mail />}
        title="Confirm your email first"
        action={
          <Button type="primary" size="large" block onClick={enterCode}>
            Enter code
          </Button>
        }
        secondary={<TextButton onClick={onBack}>Use another account</TextButton>}
      >
        Your account isn&apos;t active yet. Enter the 6-digit code we sent to {maskEmail(email)}.
      </AuthNotice>
    );
  }

  return (
    <AuthNotice
      tone="bad"
      icon={<Ban />}
      title="This account is suspended"
      action={
        <Button size="large" block onClick={onBack}>
          Back to sign in
        </Button>
      }
    >
      An admin has paused this account. If you think it&apos;s a mistake, write to{" "}
      <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
    </AuthNotice>
  );
}

const Stack = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${u(20)};
`;
