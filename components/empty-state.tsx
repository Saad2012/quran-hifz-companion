import { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center gap-3 border-dashed text-center">
      <div className="rounded-full bg-[var(--surface-soft)] p-4 text-[var(--accent-strong)]">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-md text-sm leading-7 text-[var(--muted-foreground)]">{description}</p>
      </div>
    </Card>
  );
}
