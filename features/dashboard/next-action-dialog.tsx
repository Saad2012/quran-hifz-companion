"use client";

import Link from "next/link";
import { Compass, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatPageRange, formatMinutes } from "@/utils/pages";

function getUrgencyVariant(urgency: "low" | "medium" | "high") {
  if (urgency === "high") {
    return "danger";
  }

  if (urgency === "medium") {
    return "warning";
  }

  return "success";
}

export function NextActionDialog() {
  const { data, derived } = useHifzData();
  const action = derived.dashboard.nextAction;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Compass className="h-4 w-4" />
          ماذا أفعل الآن؟
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{action.title}</DialogTitle>
          <DialogDescription>{action.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getUrgencyVariant(action.urgency)}>
              {action.urgency === "high"
                ? "أولوية عالية"
                : action.urgency === "medium"
                  ? "أولوية متوسطة"
                  : "أولوية هادئة"}
            </Badge>
            <Badge variant="default">
              <Timer className="h-3.5 w-3.5" />
              {formatMinutes(action.estimatedMinutes, data.settings.numerals)}
            </Badge>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--foreground)]">
            <p>{action.reason}</p>
          </div>
          {action.pageNumbers.length ? (
            <div className="rounded-[22px] border border-[var(--border)] p-4">
              <p className="mb-2 text-sm font-medium text-[var(--foreground)]">الصفحات المقترحة الآن</p>
              <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                {formatPageRange(action.pageNumbers, data.settings.numerals)}
              </p>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button asChild>
              <Link href={action.targetHref}>{action.cta}</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
