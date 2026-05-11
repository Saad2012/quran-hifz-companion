"use client";

import { RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { NumberSystem, ResumeSuggestion } from "@/types";
import { formatPageRange } from "@/utils/pages";

export function ResumeSessionCard({
  suggestion,
  numerals,
}: {
  suggestion?: ResumeSuggestion;
  numerals: NumberSystem;
}) {
  if (!suggestion) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="accent">
            <RotateCcw className="h-3.5 w-3.5" />
            استئناف
          </Badge>
        </div>
        <CardTitle>{suggestion.title}</CardTitle>
        <CardDescription>{suggestion.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">نقطة العودة المقترحة</p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
            {formatPageRange(suggestion.pageNumbers, numerals)}
          </p>
        </div>
        <SessionFormDialog preset={suggestion.preset}>
          <Button className="w-full">{suggestion.cta}</Button>
        </SessionFormDialog>
      </CardContent>
    </Card>
  );
}
