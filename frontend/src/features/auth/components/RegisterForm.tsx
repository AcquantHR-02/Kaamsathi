"use client";

import Link from "next/link";
import { Button, Checkbox, Form, Input, type FormInstance } from "antd";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Info } from "lucide-react";
import styled from "styled-components";
import { ROUTES } from "@/config/constants";
import { useSignup } from "../hooks/useSignup";
import type { RegisterFormValues } from "../types/auth.types";
import { CONSENT_RULES, EMAIL_RULES, NEW_PASSWORD_RULES } from "../utils/validation";
import { CardFooter, CardHeader, CardTitle, FormWrap, Small, shortScreen, u } from "../styles/auth.styles";
import AccountTypePicker from "./AccountTypePicker";
import FormErrorAlert from "./FormErrorAlert";

// Register step 1 (templates 01-auth/Register.html, Register--company.html).
// `form` lives in RegisterFlow, so "Change email" on step 2 comes back with the fields filled.

type RegisterFormProps = {
  form: FormInstance<RegisterFormValues>;
  onCreated: (email: string) => void;
};

export default function RegisterForm({ form, onCreated }: RegisterFormProps) {
  const { handleSubmit, isLoading, error, clearError } = useSignup((email) => {
    // Never keep a password around once it has done its job.
    form.setFieldValue("password", undefined);
    onCreated(email);
  });
  const kind = Form.useWatch("kind", form);

  return (
    <>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <Small>Step 1 of 2 · then we&apos;ll email you a 6-digit code.</Small>
      </CardHeader>

      <FormWrap>
        <Form<RegisterFormValues>
          form={form}
          name="register"
          layout="vertical"
          requiredMark={false}
          initialValues={{ kind: "seeker", consent: false }}
          onFinish={handleSubmit}
          onValuesChange={clearError}
          disabled={isLoading}
        >
          <Form.Item name="kind">
            <AccountTypePicker />
          </Form.Item>

          <Form.Item label={kind === "company" ? "Work email" : "Email"} name="email" rules={EMAIL_RULES}>
            <Input type="email" placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={NEW_PASSWORD_RULES} extra="8 to 72 characters.">
            <Input.Password
              placeholder="At least 8 characters"
              autoComplete="new-password"
              iconRender={(visible) => (visible ? <EyeOff size={18} /> : <Eye size={18} />)}
            />
          </Form.Item>

          <Form.Item name="consent" valuePropName="checked" rules={CONSENT_RULES}>
            <Checkbox>
              I agree to the <Link href={ROUTES.HOME}>Terms</Link> and <Link href={ROUTES.HOME}>Privacy Policy</Link>,
              and consent to Kaamsathi processing my data under India&apos;s DPDP Act. I can delete my account any time.
            </Checkbox>
          </Form.Item>

          <AnimatePresence initial={false}>
            {kind === "company" && (
              <motion.div
                key="company-note"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <CompanyNote>
                  <Info aria-hidden="true" />
                  <span>
                    Next you&apos;ll add your company details. Our team verifies your company before your first job
                    post.
                  </span>
                </CompanyNote>
              </motion.div>
            )}
          </AnimatePresence>

          <FormErrorAlert message={error} />

          <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
            {isLoading ? "Creating account" : "Create account"}
          </Button>
        </Form>
      </FormWrap>

      <CardFooter>
        Already have an account? <Link href={ROUTES.LOGIN}>Sign in</Link>
      </CardFooter>
    </>
  );
}

/** Carries its own bottom space (like FormError), so it opens and closes without a jump. */
const CompanyNote = styled.div`
  margin-bottom: ${u(20)};
  display: flex;
  gap: ${u(10)};
  padding: ${u(12)} ${u(14)};
  border-radius: ${u(12)};
  background: var(--infot);
  border: 1px solid var(--infol);
  color: var(--ac);
  font-size: ${u(13)};
  line-height: ${u(20)};

  ${shortScreen} {
    margin-bottom: ${u(14)};
  }

  svg {
    flex: none;
    width: ${u(16)};
    height: ${u(16)};
    margin-top: 2px;
  }
`;
