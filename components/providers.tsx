
"use client";

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./theme-provider";
import { LocaleProvider } from "@/lib/i18n";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#242424] flex items-center justify-center">
        <div className="text-[#00AEEF] text-lg">Loading ARBORIS AI OS 1...</div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
