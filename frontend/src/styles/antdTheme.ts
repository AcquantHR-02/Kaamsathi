import { theme, type ThemeConfig } from "antd";
import { control, font, palette, radius, type ThemeMode } from "./tokens";

// AntD derives hover/active tints from these, so they must be real colours (not CSS vars).
export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  const c = palette[mode];
  const primary = mode === "dark" ? "#a596e6" : "#6b3fa8";

  return {
    algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorLink: c.av,
      colorInfo: c.ac,
      colorSuccess: c.ok,
      colorError: c.bad,
      colorWarning: c.warn,
      colorText: c.ink,
      colorTextHeading: c.ink,
      colorTextSecondary: c.muted,
      colorTextTertiary: c.faint,
      colorTextPlaceholder: c.faint,
      colorBorder: c.line2,
      colorBorderSecondary: c.line,
      colorBgLayout: c.bg,
      colorBgContainer: c.surface,
      colorBgElevated: c.surface,
      colorFillAlter: c.sunken,
      fontFamily: font.sans,
      fontFamilyCode: font.mono,
      fontSize: 15,
      borderRadius: radius.md,
      borderRadiusSM: radius.sm,
      borderRadiusLG: radius.lg,
      controlHeight: control.md,
      controlHeightSM: control.sm - 8,
      controlHeightLG: control.lg,
      controlOutline: mode === "dark" ? "rgba(201,194,227,.3)" : "rgba(90,59,140,.2)",
      controlOutlineWidth: 3,
      motionDurationFast: "0.12s",
      motionDurationMid: "0.2s",
      motionDurationSlow: "0.32s",
      motionEaseInOut: "cubic-bezier(0.22, 1, 0.36, 1)",
      motionEaseOut: "cubic-bezier(0.22, 1, 0.36, 1)",
      boxShadowSecondary: c.shadow,
    },
    components: {
      Button: {
        fontWeight: 600,
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none",
        paddingInline: 20,
        paddingInlineLG: 20,
        contentFontSizeLG: 14,
      },
      Input: {
        colorBgContainer: c.sunken,
        activeBorderColor: c.focus,
        hoverBorderColor: c.faint,
        activeShadow: `0 0 0 3px ${mode === "dark" ? "rgba(201,194,227,.3)" : "rgba(90,59,140,.2)"}`,
        paddingInline: 14,
        paddingInlineLG: 14,
        inputFontSizeLG: 15,
      },
      Select: {
        colorBgContainer: c.sunken,
        optionSelectedBg: c.vt,
        optionActiveBg: c.neut,
      },
      // Template consent box: 18px square; the global small radius (8) would make it a circle.
      Checkbox: {
        controlInteractiveSize: 18,
        borderRadiusSM: 4,
      },
      Form: {
        labelFontSize: 14,
        labelColor: c.ink,
        verticalLabelPadding: "0 0 6px",
      },
      Tooltip: {
        colorBgSpotlight: mode === "dark" ? "#2a2540" : "#1f1a33",
        borderRadius: radius.sm,
        fontSize: 13,
      },
      Table: {
        headerBg: c.sunken,
        headerColor: c.muted,
        headerSplitColor: "transparent",
        rowHoverBg: c.neut,
        borderColor: c.line,
      },
      Modal: { contentBg: c.surface, headerBg: c.surface },
    },
  };
}
