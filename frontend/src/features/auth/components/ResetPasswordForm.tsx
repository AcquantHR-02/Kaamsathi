"use client";

import { useRouter } from "next/navigation";
import { Button, Form, Input } from "antd";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, Eye, EyeOff, LinkIcon } from "lucide-react";
import styled from "styled-components";
import { ROUTES } from "@/config/constants";
import { fadeRise } from "@/styles/motion";
import { useResetPassword } from "../hooks/useResetPassword";
import { NEW_PASSWORD_RULES, repeatPasswordRules } from "../utils/validation";
import { AuthCard, CardHeader, CardTitle, FormWrap, Small, u } from "../styles/auth.styles";
import AuthNotice from "./AuthNotice";
import FormErrorAlert from "./FormErrorAlert";

// Templates 01-auth/ForgotPassword--new-password.html + --done. Also the first-password page for
// new admins (same emailed link). The template's "For priya.s***@…" line is left out: the token
// doesn't tell us the email (backend gap).

type ResetFields = { newPassword: string; repeatPassword: string };

const eye = (visible: boolean) => (visible ? <EyeOff size={18} /> : <Eye size={18} />);

export default function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const { handleSubmit, isLoading, error, clearError, stage } = useResetPassword(token);

  return (
    <AuthCard>
      <AnimatePresence mode="wait" initial={false}>
        {stage === "done" && (
          <AuthNotice
            key="done"
            tone="ok"
            icon={<CircleCheck />}
            title="Password changed"
            action={
              <Button type="primary" size="large" block onClick={() => router.push(ROUTES.LOGIN)}>
                Go to sign in
              </Button>
            }
          >
            You can sign in with your new password now.
          </AuthNotice>
        )}

        {stage === "invalid" && (
          <AuthNotice
            key="invalid"
            tone="warn"
            icon={<LinkIcon />}
            title="This link has expired"
            action={
              <Button type="primary" size="large" block onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}>
                Send a new link
              </Button>
            }
          >
            Reset links work once and for 30 minutes. Ask for a new one and use the latest email.
          </AuthNotice>
        )}

        {stage === "form" && (
          <Stack key="form" initial="hidden" animate="show" exit="hidden" variants={fadeRise}>
            <Steps aria-hidden>
              <span />
              <span />
            </Steps>
            <CardHeader>
              <CardTitle>Set a new password</CardTitle>
              <Small>You&apos;ll be signed out on all other devices.</Small>
            </CardHeader>

            <FormWrap>
              <Form<ResetFields>
                name="reset"
                layout="vertical"
                requiredMark={false}
                onFinish={({ newPassword }) => handleSubmit({ newPassword })}
                onValuesChange={clearError}
                disabled={isLoading}
              >
                <Form.Item
                  label="New password"
                  name="newPassword"
                  rules={NEW_PASSWORD_RULES}
                  extra="8 to 72 characters."
                >
                  <Input.Password
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    iconRender={eye}
                    autoFocus
                  />
                </Form.Item>
                <Form.Item
                  label="Repeat new password"
                  name="repeatPassword"
                  dependencies={["newPassword"]}
                  rules={repeatPasswordRules("newPassword")}
                >
                  <Input.Password autoComplete="new-password" iconRender={eye} />
                </Form.Item>

                <FormErrorAlert message={error} />

                <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                  {isLoading ? "Saving" : "Save new password"}
                </Button>
              </Form>
            </FormWrap>
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

/** Step 2 of 2 (both bars filled), as in the template. */
const Steps = styled.div`
  display: flex;
  gap: ${u(6)};

  span {
    flex: 1;
    height: ${u(4)};
    border-radius: 999px;
    background: var(--btn-primary);
  }
`;
