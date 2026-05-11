"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Flame, ShieldAlert, TimerReset } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeSessionCard } from "@/features/dashboard/resume-session-card";
import { FocusPreset, FocusSessionConsole } from "@/features/focus/focus-session-console";
import { useHifzData } from "@/hooks/use-hifz-data";
import { REVIEW_MODE_LABELS, SESSION_TYPE_LABELS, formatPageRange, formatMinutes, toDigitSystem } from "@/utils/pages";

function severityLabel(severity: "steady" | "gentle" | "medium" | "deep") {
  switch (severity) {
    case "deep":
      return "تعافٍ عميق";
    case "medium":
      return "تعافٍ متوسط";
    case "gentle":
      return "تعافٍ خفيف";
    default:
      return "جاهز";
  }
}

export function FocusPage() {
  const { data, derived, isHydrated } = useHifzData();

  if (!isHydrated) {
    return <Card className="p-6">جار تجهيز وضع التركيز...</Card>;
  }

  const { dashboard, recoveryPlan, reviewEngine, weeklyPlanner } = derived;
  const reviewTasks = reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].tasks;
  const firstMemDay = weeklyPlanner.days.find((day) =>
    day.plannedTasks.some((task) => task.type === "memorization"),
  );
  const firstMemTask = firstMemDay?.plannedTasks.find((task) => task.type === "memorization");

  const presets: FocusPreset[] = [
    recoveryPlan.isNeeded && recoveryPlan.days[0]
      ? {
          id: "recovery",
          label: recoveryPlan.days[0].title,
          helper: recoveryPlan.days[0].summary,
          sessionType: "review",
          startPage: recoveryPlan.days[0].tasks[0]?.pageNumbers[0] ?? 1,
          endPage:
            recoveryPlan.days[0].tasks[0]?.pageNumbers.at(-1) ??
            recoveryPlan.days[0].tasks.flatMap((task) => task.pageNumbers).at(-1) ??
            1,
          durationMinutes: recoveryPlan.days[0].totalMinutes || 20,
          notes: `${recoveryPlan.headline} — ${recoveryPlan.days[0].summary}`,
          weakPagesText: recoveryPlan.days[0].tasks
            .find((task) => task.type === "review")
            ?.pageNumbers.slice(0, 4)
            .join("، "),
          tagsText: "تعافٍ، تركيز",
        }
      : null,
    reviewTasks[0]
      ? {
          id: "review",
          label: reviewTasks[0].title,
          helper: reviewTasks[0].reason,
          sessionType: "review",
          startPage: reviewTasks[0].pageNumbers[0] ?? 1,
          endPage: reviewTasks[0].pageNumbers.at(-1) ?? reviewTasks[0].pageNumbers[0] ?? 1,
          durationMinutes: reviewTasks[0].estimatedMinutes,
          notes: reviewTasks[0].reason,
          weakPagesText: reviewEngine.weakPages.slice(0, 4).join("، "),
          tagsText: "مراجعة اليوم، تركيز",
        }
      : null,
    firstMemTask
      ? {
          id: "memorization",
          label: "الحفظ القادم",
          helper: `اقتراح من ${firstMemDay?.focusLabel ?? "الخطة الأسبوعية"} لتقدم هادئ بدون ضغط زائد.`,
          sessionType: "memorization",
          startPage: firstMemTask.pageNumbers[0] ?? dashboard.currentPage + 1,
          endPage:
            firstMemTask.pageNumbers.at(-1) ?? firstMemTask.pageNumbers[0] ?? dashboard.currentPage + 1,
          durationMinutes: firstMemTask.estimatedMinutes,
          notes: firstMemTask.reason,
          tagsText: "حفظ جديد، تركيز",
        }
      : null,
  ].filter(Boolean) as FocusPreset[];

  return (
    <div className="space-y-8 pb-28 xl:pb-8">
      <PageHeader
        eyebrow="وضع التركيز"
        title="جلسة واحدة، قرار واحد، شاشة هادئة"
        description="ابدأ من هنا عندما تريد تنفيذًا فعليًا: مؤقت، عداد تكرارات، اقتراح جاهز، وحفظ مباشر للجلسة مع مسار تعافٍ إذا كنت عائدًا بعد انقطاع."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary">
              <Link href="/today">اليوم فقط</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/review">خطة اليوم</Link>
            </Button>
            <Button asChild>
              <Link href="/weak-pages">الصفحات الضعيفة</Link>
            </Button>
          </div>
        }
      />

      {recoveryPlan.isNeeded ? (
        <Card className="overflow-hidden border-[rgba(188,116,74,0.28)]">
          <CardContent className="grid gap-0 p-0 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4 border-b border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-6 xl:border-b-0 xl:border-l">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">{severityLabel(recoveryPlan.severity)}</Badge>
                <Badge variant="accent">
                  انقطاع {toDigitSystem(recoveryPlan.gapDays, data.settings.numerals)} أيام
                </Badge>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{recoveryPlan.headline}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-[var(--muted-foreground)]">
                  {recoveryPlan.summary}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">وضع اليوم</p>
                  <p className="mt-2 font-semibold">{REVIEW_MODE_LABELS[recoveryPlan.recommendedMode]}</p>
                </div>
                <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">الحفظ الجديد</p>
                  <p className="mt-2 font-semibold">
                    {recoveryPlan.canResumeMemorization ? "ممكن تدريجيًا" : "أجّله قليلًا"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">أول يوم</p>
                  <p className="mt-2 font-semibold">
                    {formatMinutes(recoveryPlan.days[0]?.totalMinutes ?? 0, data.settings.numerals)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-6">
              {recoveryPlan.days.slice(0, 3).map((day) => (
                <div key={day.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">{day.label}</p>
                      <h3 className="mt-1 font-semibold">{day.title}</h3>
                    </div>
                    <Badge>{formatMinutes(day.totalMinutes, data.settings.numerals)}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{day.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>المهمة الأنسب الآن</CardTitle>
            <CardDescription>
              إذا أردت الدخول السريع جدًا، فابدأ بهذه الخطوة ثم احفظ الجلسة من نفس الشاشة.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr,auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={dashboard.nextAction.urgency === "high" ? "danger" : dashboard.nextAction.urgency === "medium" ? "warning" : "success"}>
                  {dashboard.nextAction.urgency === "high" ? "أولوية عالية" : dashboard.nextAction.urgency === "medium" ? "أولوية متوسطة" : "أولوية هادئة"}
                </Badge>
                <Badge variant="accent">{formatMinutes(dashboard.nextAction.estimatedMinutes, data.settings.numerals)}</Badge>
              </div>
              <h3 className="mt-3 text-xl font-semibold">{dashboard.nextAction.title}</h3>
              <p className="mt-2 text-sm leading-8 text-[var(--muted-foreground)]">{dashboard.nextAction.reason}</p>
            </div>
            <Button asChild className="md:min-w-[180px]">
              <Link href={dashboard.nextAction.targetHref}>
                {dashboard.nextAction.cta}
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لماذا هذه الشاشة؟</CardTitle>
            <CardDescription>حتى لا تضيع بين التحليلات والتخطيط وأنت في لحظة التنفيذ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <div className="flex items-start gap-3">
              <TimerReset className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
              <p>المؤقت محفوظ محليًا، فيمكنك الرجوع للجلسة حتى لو غادرت الشاشة.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
              <p>خطة التعافي تمنعك من العودة العشوائية بعد الانقطاع، وهي مندمجة مباشرة مع دورة المراجعة.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
              <p>الحفظ من هنا يذهب مباشرة إلى الجلسات والتحليلات والمزامنة دون خطوة إضافية.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {dashboard.resumeSuggestion ? (
        <ResumeSessionCard suggestion={dashboard.resumeSuggestion} numerals={data.settings.numerals} />
      ) : null}

      <FocusSessionConsole presets={presets} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>نسخة اليوم المختصرة</CardTitle>
            <CardDescription>
              صفحات واضحة يمكنك استعمالها الآن حتى لو لم تكن في مسار تعافٍ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{task.title}</p>
                  <Badge variant="accent">{formatMinutes(task.estimatedMinutes, data.settings.numerals)}</Badge>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{task.reason}</p>
                <p className="mt-3 text-sm">
                  {formatPageRange(task.pageNumbers, data.settings.numerals)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نقاط تثبيت سريعة</CardTitle>
            <CardDescription>مفيدة جدًا عند فتح التطبيق من الهاتف وأنت تريد بدءًا سريعًا.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--accent-strong)]" />
                <p className="font-semibold">سلسلة الالتزام</p>
              </div>
              <p className="mt-2 text-2xl font-semibold">
                {toDigitSystem(derived.analytics.metrics.currentStreak, data.settings.numerals)} يوم
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                تسجيل جلسة واحدة من هنا يكفي لحماية السلسلة لليوم.
              </p>
            </div>
            <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
              <p className="font-semibold">الصفحات المقترحة الآن</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                {formatPageRange(dashboard.nextAction.pageNumbers, data.settings.numerals)}
              </p>
            </div>
            <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
              <p className="font-semibold">وضع المراجعة الموصى به</p>
              <p className="mt-2 text-xl font-semibold">{REVIEW_MODE_LABELS[reviewEngine.recommendedMode]}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].explanation[0]}
              </p>
            </div>
            {firstMemTask ? (
              <div className="rounded-[22px] border border-dashed border-[var(--border)] p-4">
                <p className="font-semibold">الحفظ القادم عند الاستقرار</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {SESSION_TYPE_LABELS.memorization}:
                  {" "}
                  {formatPageRange(firstMemTask.pageNumbers, data.settings.numerals)}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
