"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_STORAGE_KEY } from "@/lib/theme/storage";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange={false}
      enableColorScheme
    >
      {children}
    </NextThemesProvider>
  );
}
