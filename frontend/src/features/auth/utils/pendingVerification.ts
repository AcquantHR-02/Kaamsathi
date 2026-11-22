// Carries the email from Sign in ("Confirm your email first") to the OTP step on /register (2.5),
// so the user needn't type it again. Kept in sessionStorage (this tab only), not the URL: an
// email in the URL would land in history and server logs.

const KEY = "kaamsathi.verify-email";

export function savePendingVerification(email: string): void {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Storage blocked: the OTP step asks for the email instead.
  }
}

/** Read without removing: safe in a state initializer (dev Strict Mode calls those twice). Server → null. */
export function peekPendingVerification(): string | null {
  try {
    return typeof window === "undefined" ? null : sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Once the OTP step has it: a later reload of /register starts at the form. */
export function clearPendingVerification(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing was saved either.
  }
}

/** "priya.sharma@gmail.com" → "priya.s***@gmail.com" (template AuthStates). */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, Math.min(7, Math.max(1, name.length - 3)))}***@${domain}`;
}
