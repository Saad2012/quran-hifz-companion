"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, CircleHelp, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatDateLabel } from "@/utils/date";
import { STATUS_LABELS, toDigitSystem } from "@/utils/pages";

function getBadgeVariant(status: string) {
  if (status === "strong") {
    return "success";
  }

  if (status === "weak") {
    return "warning";
  }

  if (status === "critical" || status === "overdue") {
    return "danger";
  }

  if (status === "fresh") {
    return "accent";
  }

  return "default";
}

export function PageInspector() {
  const { data, derived } = useHifzData();
  const [pageInput, setPageInput] = useState(String(Math.max(1, derived.dashboard.currentPage || 1)));
  const pageNumber = Math.min(604, Math.max(1, Number(pageInput) || 1));

  const insights = useMemo(() => {
    const pageState = derived.pageStates.find((page) => page.pageNumber === pageNumber);
    const sessions = data.sessions.filter(
      (session) => session.startPage <= pageNumber && session.endPage >= pageNumber,
    );
    const tests = data.testRecords.filter(
      (record) => record.startPage <= pageNumber && record.endPage >= pageNumber,
    );
    const totalDeclaredRepetitions = sessions.reduce(
      (total, session) => total + session.repetitions,
      0,
    );
    const reviewTouches = sessions.filter(
      (session) =>
        ["review", "ramadan", "mixed", "stop", "test"].includes(session.sessionType) ||
        session.reviewedFromMemory,
    ).length;

    return {
      pageState,
      sessions,
      tests,
      totalDeclaredRepetitions,
      reviewTouches,
    };
  }, [data.sessions, data.testRecords, derived.pageStates, pageNumber]);

  const { pageState } = insights;

  if (!pageState) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>مستكشف الصفحة</CardTitle>
            <CardDescription>
              أدخل أي صفحة لترى حالتها بالتفصيل، وكم مرة مرت عليها جلسات، وكم مجموع التكرارات المسجلة لها.
            </CardDescription>
          </div>
          <div className="w-full max-w-[220px]">
            <Input
              type="number"
              min={1}
              max={604}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              placeholder="رقم الصفحة"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">الصفحة</p>
            <p className="mt-2 text-2xl font-semibold">
              {toDigitSystem(pageState.pageNumber, data.settings.numerals)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {pageState.surahLabel} | الجزء {toDigitSystem(pageState.juzApprox ?? 1, data.settings.numerals)}
            </p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">الحالة</p>
            <div className="mt-2">
              <Badge variant={getBadgeVariant(pageState.status)}>{STATUS_LABELS[pageState.status]}</Badge>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              القوة الحالية {toDigitSystem(pageState.strengthScore, data.settings.numerals)}/100
            </p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">مرات المراجعة</p>
            <p className="mt-2 text-2xl font-semibold">
              {toDigitSystem(pageState.totalReviewCount, data.settings.numerals)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              عدد مرات المرور المشتق من جلسات المراجعة والاختبارات.
            </p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">إجمالي التكرارات</p>
            <p className="mt-2 text-2xl font-semibold">
              {toDigitSystem(insights.totalDeclaredRepetitions, data.settings.numerals)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              مجموع حقل التكرارات في كل جلسة شملت هذه الصفحة.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[22px] border border-[var(--border)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-[var(--accent-strong)]" />
              <p className="font-semibold">تفاصيل الحفظ</p>
            </div>
            <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
              <p>محفوظة: {pageState.memorized ? "نعم" : "لا"}</p>
              <p>
                أول حفظ:{" "}
                {pageState.firstMemorizedAt
                  ? formatDateLabel(pageState.firstMemorizedAt, "d MMM yyyy")
                  : "غير مسجل"}
              </p>
              <p>
                آخر مراجعة:{" "}
                {pageState.lastReviewedAt
                  ? formatDateLabel(pageState.lastReviewedAt, "d MMM yyyy")
                  : "غير موجودة"}
              </p>
              <p>
                آخر اختبار:{" "}
                {pageState.lastTestedAt
                  ? formatDateLabel(pageState.lastTestedAt, "d MMM yyyy")
                  : "غير موجود"}
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <p className="font-semibold">تفاصيل المتابعة</p>
            </div>
            <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
              <p>دخلت الضعف: {toDigitSystem(pageState.totalWeakCount, data.settings.numerals)} مرة</p>
              <p>في طابور الضعف: {pageState.inWeakQueue ? "نعم" : "لا"}</p>
              <p>في طابور الحرج: {pageState.inCriticalQueue ? "نعم" : "لا"}</p>
              <p>عدد الجلسات التي مرّت عليها الصفحة: {toDigitSystem(insights.sessions.length, data.settings.numerals)}</p>
              <p>عدد الاختبارات التي شملتها: {toDigitSystem(insights.tests.length, data.settings.numerals)}</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <CircleHelp className="h-4 w-4 text-emerald-600" />
              <p className="font-semibold">كيف تقرأ هذه الصفحة؟</p>
            </div>
            <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
              <p>إذا كان مجموع التكرارات مرتفعًا لكن القوة منخفضة، فغالبًا توجد مراجعة غير مستقرة أو ضعف متكرر.</p>
              <p>إذا كانت الصفحة حديثة فبقاؤها في الخطة طبيعي حتى لو لم تكن ضعيفة.</p>
              <p>إذا ظهرت في الحرج أو التأخر، فالأفضل إعطاؤها أولوية في جلسة اليوم التالية.</p>
            </div>
          </div>
        </div>

        {pageState.notes ? (
          <div className="rounded-[22px] bg-[rgba(188,116,74,0.08)] p-4 text-sm leading-7 text-[var(--foreground)]">
            <strong>آخر إشارات مرتبطة بهذه الصفحة:</strong> {pageState.notes}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
