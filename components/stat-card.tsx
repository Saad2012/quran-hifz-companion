import { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
          <p className="text-xs leading-6 text-[var(--muted-foreground)]">{hint}</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--accent-strong)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
