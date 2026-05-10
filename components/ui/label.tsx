import * as React from "react";

import { cn } from "@/utils/cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

export { Label };
