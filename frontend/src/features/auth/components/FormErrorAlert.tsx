"use client";

import { AnimatePresence, motion } from "motion/react";
import { FormError } from "../styles/auth.styles";

// The auth forms' error banner (template 01-auth/Login.html). Opens and closes smoothly, so the
// card grows instead of jumping. Pass null to hide it.
// The outer wrapper animates height (the padded banner inside would leave a strip at height 0).
export default function FormErrorAlert({ message }: { message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key="form-error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          <FormError role="alert">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3 2 21h20z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
            <span>{message}</span>
          </FormError>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
