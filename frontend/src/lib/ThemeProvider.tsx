"use client";

import { App, ConfigProvider } from "antd";
import { MotionConfig } from "motion/react";
import { getAntdTheme } from "@/styles/antdTheme";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { useThemeMode } from "./themeMode";

// AntD <App> enables the hook-based message/modal/notification APIs (App.useApp()).
// MotionConfig reducedMotion="user": animations turn off for people who asked their OS for less motion.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeMode();

  return (
    <ConfigProvider theme={getAntdTheme(mode)}>
      <GlobalStyles />
      <MotionConfig reducedMotion="user">
        <App>{children}</App>
      </MotionConfig>
    </ConfigProvider>
  );
}
