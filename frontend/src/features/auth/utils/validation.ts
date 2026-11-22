import type { Rule } from "antd/es/form";
import { PASSWORD_MAX, PASSWORD_MIN } from "../types/auth.types";

// Form rules shared by every auth screen. Same limits as the backend DTOs, so mistakes show
// before a round trip. Pasted emails often carry spaces: rules trim, and hooks trim before sending.

export const EMAIL_RULES: Rule[] = [
  { required: true, whitespace: true, message: "Enter your email." },
  { type: "email", transform: (v?: string) => v?.trim(), message: "Enter an email like you@example.com" },
  { max: 254, transform: (v?: string) => v?.trim(), message: "Email is too long." },
];

/** Sign in only checks the password is there; length rules belong to signup / reset. */
export const LOGIN_PASSWORD_RULES: Rule[] = [{ required: true, message: "Enter your password." }];

/** Signup, reset and invite: same 8–72 rule as the backend (BCrypt reads only 72). */
export const NEW_PASSWORD_RULES: Rule[] = [
  { required: true, message: "Enter a password." },
  { min: PASSWORD_MIN, max: PASSWORD_MAX, message: `Use ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.` },
];

/** "Repeat password" must match the field named `passwordField` (re-checked when that one changes). */
export const repeatPasswordRules = (passwordField: string): Rule[] => [
  { required: true, message: "Repeat the password." },
  ({ getFieldValue }) => ({
    validator: (_, value?: string) =>
      !value || value === getFieldValue(passwordField)
        ? Promise.resolve()
        : Promise.reject(new Error("Passwords don't match.")),
  }),
];

/** DPDP consent checkbox: the backend refuses signup without it. */
export const CONSENT_RULES: Rule[] = [
  {
    validator: (_, checked?: boolean) =>
      checked ? Promise.resolve() : Promise.reject(new Error("Please accept to create your account.")),
  },
];
