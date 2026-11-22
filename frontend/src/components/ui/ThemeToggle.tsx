"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import styled from "styled-components";
import { setThemeMode, useThemeMode } from "@/lib/themeMode";

export default function ThemeToggle() {
  const mode = useThemeMode();
  const next = mode === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      onClick={() => setThemeMode(next)}
      aria-label={`Switch to ${next} mode`}
      title={`${next} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.22 }}
          style={{ display: "grid" }}
        >
          {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

const Button = styled.button`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-pill);
  border: 1px solid var(--line);
  background: var(--glass2);
  color: var(--muted);
  cursor: pointer;
  transition:
    color var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease);

  &:hover {
    color: var(--ink);
    border-color: var(--line2);
  }
`;
