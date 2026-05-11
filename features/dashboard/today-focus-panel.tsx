"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberSystem, TodayFocusSnapshot } from "@/types";
import { formatMinutes, formatPageRange } from "@/utils/pages";

function sourceLabel(source: TodayFocusSnapshot["source"]) {
  switch (source) {
    case "recovery":
      return { label: "تعافٍ ذكي", variant: "warning" as const };
    case "review":
      return { label: "مراجعة اليوم", variant: "accent" as const };
    case "weekly":
      return { label: "تنظيم خفيف", variant: "success" as const };
    default:
      return { label: "يوم هادئ", variant: "default" as const };
  }
}

export function TodayFocusPanel({
  snapshot,
  numerals,
}: {
  snapshot: TodayFocusSnapshot;
  numerals: NumberSystem;
}) {
  const source = sourceLabel(snapshot.source);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={source.variant}>{source.label}</Badge>
          <Badge variant="default">{formatMinutes(snapshot.totalMinutes, numerals)}</Badge>
        </div>
        <CardTitle>{snapshot.title}</CardTitle>
        <CardDescription>{snapshot.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        {snapshot.items.length ? (
          snapshot.items.map((item) => (
            <div key={item.id} className="rounded-[22px] bg-[var(--surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{item.title}</p>
                <Badge variant={item.completed ? "success" : "default"}>
                  {formatMinutes(item.estimatedMinutes, numerals)}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.detail}</p>
              {item.pageNumbers.length ? (
                <p className="mt-3 text-sm text-[var(--foreground)]">
                  {formatPageRange(item.pageNumbers, numerals)}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--muted-foreground)]">
            لا توجد قائمة ثقيلة اليوم. افتح المهمة التالية وسجّل جلسة قصيرة فقط للمحافظة على المسار.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
