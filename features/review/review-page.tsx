"use client";

import { ArrowLeftCircle, Clock3, Sparkles, TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatPageRange, REVIEW_MODE_LABELS, toDigitSystem } from "@/utils/pages";

export function ReviewPage() {
  const { data, derived } = useHifzData();
  const { reviewEngine } = derived;

  if (!reviewEngine.todayReviewPlan.normal.tasks.length) {
    return (
      <EmptyState
        title="لا توجد خطة مراجعة بعد"
        description="ابدأ بإدخال جلسات الحفظ والمراجعة لتوليد خطة اليوم تلقائيًا."
        icon={Sparkles}
      />
    );
  }

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="مراجعة اليوم"
        title="خطة اليوم مولدة فعليًا"
        description="المحرك يوزع الدفعات حسب حجم المحفوظ، ويضيف الصفحات الحديثة والضعيفة والحرجة والمتأخرة بشكل صريح."
        action={
          <SessionFormDialog
            preset={{
              sessionType: "review",
              startPage: reviewEngine.baselinePages[0] ?? 1,
              endPage: reviewEngine.baselinePages.at(-1) ?? 1,
            }}
          >
            <Button>تسجيل مراجعة اليوم</Button>
          </SessionFormDialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>الخلاصة السريعة</CardTitle>
          <CardDescription>
            الوضع الموصى به اليوم هو <strong>{REVIEW_MODE_LABELS[reviewEngine.recommendedMode]}</strong>، والدورة الحالية {reviewEngine.cycle.cycleType === "weekly" ? "أسبوعية" : "كل 14 يومًا"} مع {toDigitSystem(reviewEngine.cycle.sessionsCount, data.settings.numerals)} دفعات.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">آخر الصفحات الحديثة</p>
            <p className="mt-2 text-base font-semibold">{formatPageRange(reviewEngine.recentPages.slice(0, 8), data.settings.numerals)}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">بلوك الدورة</p>
            <p className="mt-2 text-base font-semibold">{formatPageRange(reviewEngine.baselinePages, data.settings.numerals)}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">الصفحات الضعيفة</p>
            <p className="mt-2 text-base font-semibold">{formatPageRange(reviewEngine.weakPages.slice(0, 10), data.settings.numerals)}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">الصفحات الحرجة والمتأخرة</p>
            <p className="mt-2 text-base font-semibold">{formatPageRange([...reviewEngine.criticalPages, ...reviewEngine.overduePages], data.settings.numerals)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {(["light", "normal", "intensive"] as const).map((mode) => {
          const plan = reviewEngine.todayReviewPlan[mode];
          return (
            <Card key={mode} className={mode === reviewEngine.recommendedMode ? "ring-2 ring-[var(--accent)]" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>نسخة {REVIEW_MODE_LABELS[mode]}</CardTitle>
                    <CardDescription>
                      {toDigitSystem(plan.totalPages, data.settings.numerals)} صفحة تقريبًا
                    </CardDescription>
                  </div>
                  {mode === reviewEngine.recommendedMode ? <Badge variant="accent">الموصى بها</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.tasks.map((task) => (
                  <div key={task.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge variant={task.completed ? "success" : "default"}>
                        {toDigitSystem(task.pageNumbers.length, data.settings.numerals)}
                      </Badge>
                    </div>
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{task.reason}</p>
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      الصفحات: {formatPageRange(task.pageNumbers, data.settings.numerals)}
                    </p>
                  </div>
                ))}
                <div className="rounded-[20px] bg-[rgba(188,116,74,0.08)] p-4 text-sm leading-7 text-[var(--foreground)]">
                  {plan.explanation.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>لماذا اختيرت هذه الصفحات؟</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <div className="flex gap-3">
              <Clock3 className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
              <p>الصفحات الحديثة تبقى داخل الخطة دائمًا لأنها أكثر عرضة للنسيان في الأيام الأولى.</p>
            </div>
            <div className="flex gap-3">
              <TriangleAlert className="mt-1 h-4 w-4 text-amber-600" />
              <p>الصفحات الضعيفة والحرجة ترتفع إلى المقدمة كي لا تتسع فجوة المراجعة.</p>
            </div>
            <div className="flex gap-3">
              <ArrowLeftCircle className="mt-1 h-4 w-4 text-emerald-600" />
              <p>بلوك الدورة يضمن أن المحفوظ كله يمر من خلال النظام بحسب عتبة 7 أيام أو 14 يومًا.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>صفحات متأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              {formatPageRange(reviewEngine.overduePages, data.settings.numerals)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الصفحات الحرجة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              {formatPageRange(reviewEngine.criticalPages, data.settings.numerals)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
