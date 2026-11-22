import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

// next/font self-hosts the files at build time: no request to Google at runtime, no layout jump.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains",
});

// Shared by the root layout and global-error (which replaces the root layout).
export const fontVariables = `${jakarta.variable} ${jetbrains.variable}`;
