import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { StoreProvider, StyledComponentsRegistry, THEME_INIT_SCRIPT, ThemeProvider } from "@/lib";
import { fontVariables } from "@/styles/fonts";

export const metadata: Metadata = {
  title: { default: "Kaamsathi · Your work companion", template: "%s · Kaamsathi" },
  description: "Jobs in India from verified companies. Track every application and hear back within 14 days.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#14111f" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2f9" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_INIT_SCRIPT sets data-theme before React hydrates.
    <html lang="en-IN" className={fontVariables} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's cz-shortcut-listen) add body attributes. */}
      <body suppressHydrationWarning>
        {/* AntdRegistry wraps styled-components so AntD CSS is inserted first and ours wins ties. */}
        <AntdRegistry>
          <StyledComponentsRegistry>
            <StoreProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </StoreProvider>
          </StyledComponentsRegistry>
        </AntdRegistry>
      </body>
    </html>
  );
}
