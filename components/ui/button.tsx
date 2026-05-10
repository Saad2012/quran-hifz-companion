import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-white shadow-[0_12px_30px_rgba(188,116,74,0.24)] hover:bg-[var(--accent-strong)]",
        secondary: "bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)]",
        ghost: "text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
        destructive: "bg-rose-500 text-white hover:bg-rose-600",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 rounded-xl",
        lg: "h-12 px-5 rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
