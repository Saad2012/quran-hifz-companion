"use client";

import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";

export function ClientChart({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  return (
    <div className={cn("min-w-0 w-full", className)}>
      {mounted ? (
        children
      ) : (
        <div className="h-full min-h-[18rem] rounded-[22px] bg-[var(--surface-soft)]/70" />
      )}
    </div>
  );
}
