"use client";

import Link from "next/link";
import { Button, Checkbox, Form, Input } from "antd";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, LinkIcon, UserPlus } from "lucide-react";
import styled from "styled-components";
import { ROUTES } from "@/config/constants";
import { fadeRise } from "@/styles/motion";
import { useAcceptInvite } from "../hooks/useAcceptInvite";
import { CONSENT_RULES, NEW_PASSWORD_RULES } from "../utils/validation";
import { AuthCard, CardFooter, CardHeader, CardTitle, FormWrap, IconBadge, Small, u } from "../styles/auth.styles";
import AuthNotice from "./AuthNotice";
import FormErrorAlert from "./FormErrorAlert";

// Template 01-auth/AcceptInvite.html. Inviter, company and email are left out: the backend has no
// invite-preview endpoint, so the token alone can't show them (gap). On success the recruiter is
// signed in straight away, like the template's button that opens the employer dashboard.

type AcceptFields = { password: string; consent: boolean };

export default function AcceptInviteForm({ token }: { token: string | null }) {
  const { handleSubmit, isLoading, error, clearError, invalid } = useAcceptInvite(token);

  return (
    <AuthCard>
      <AnimatePresence mode="wait" initial={false}>
        {invalid ? (
          <AuthNotice
            key="invalid"
            tone="warn"
            icon={<LinkIcon />}
            title="This invite link has expired"
            action={
              <Button type="primary" size="large" block href={ROUTES.LOGIN}>
                Go to sign in
              </Button>
            }
          >
            Invite links work once and for 7 days. Ask the company owner to send you a new invite.
          </AuthNotice>
        ) : (
          <Stack key="form" initial="hidden" animate="show" exit="hidden" variants={fadeRise}>
            <IconBadge aria-hidden>
              <UserPlus />
            </IconBadge>
            <CardHeader>
              <CardTitle>Join as a recruiter</CardTitle>
              <Small>
                Set a password to finish. You&apos;ll be able to post jobs and manage applicants for your company.
              </Small>
            </CardHeader>

            <FormWrap>
              <Form<AcceptFields>
                name="invite"
                layout="vertical"
                requiredMark={false}
                initialValues={{ consent: false }}
                onFinish={handleSubmit}
                onValuesChange={clearError}
                disabled={isLoading}
              >
                <Form.Item
                  label="Create password"
                  name="password"
                  rules={NEW_PASSWORD_RULES}
                  extra="8 to 72 characters."
                >
                  <Input.Password
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    iconRender={(visible) => (visible ? <EyeOff size={18} /> : <Eye size={18} />)}
                    autoFocus
                  />
                </Form.Item>

                <Form.Item name="consent" valuePropName="checked" rules={CONSENT_RULES}>
                  <Checkbox>
                    I agree to the <Link href={ROUTES.HOME}>Terms</Link> and{" "}
                    <Link href={ROUTES.HOME}>Privacy Policy</Link>, and consent to my data being processed under
                    India&apos;s DPDP Act.
                  </Checkbox>
                </Form.Item>

                <FormErrorAlert message={error} />

                <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                  {isLoading ? "Joining" : "Join company"}
                </Button>
              </Form>
            </FormWrap>

            <CardFooter>This invite link works for 7 days and can be used once.</CardFooter>
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
