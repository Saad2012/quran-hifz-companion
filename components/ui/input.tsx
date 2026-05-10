import * as React from "react";

import { cn } from "@/utils/cn";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] placeholder:text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
