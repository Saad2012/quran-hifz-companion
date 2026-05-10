"use client";

import { Toaster } from "sonner";

import { HifzAppProvider } from "@/features/app-state/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HifzAppProvider>
      {children}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          classNames: {
            toast: "!bg-[var(--card)] !text-[var(--foreground)] !border !border-[var(--border)]",
          },
        }}
      />
    </HifzAppProvider>
  );
}
