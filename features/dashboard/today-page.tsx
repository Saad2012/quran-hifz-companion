"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock, PlayCircle, ShieldAlert, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeSessionCard } from "@/features/dashboard/resume-session-card";
import { TodayFocusPanel } from "@/features/dashboard/today-focus-panel";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatMinutes, toDigitSystem } from "@/utils/pages";

export function TodayPage() {
  const { data, derived, isHydrated } = useHifzData();

  if (!isHydrated) {
    return <Card className="p-6">جار تجهيز نسخة اليوم الخفيفة...</Card>;
  }

  const { dashboard, reviewEngine } = derived;

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="اليوم فقط"
        title="صفحة متابعة خفيفة تمنع التشتت"
        description="هنا ستجد ما تحتاجه الآن فقط: الخطوة التالية، نسخة اليوم المختصرة، وطريق سريع للرجوع إلى آخر نقطة كنت تعمل عليها."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={dashboard.nextAction.targetHref}>
                ابدأ المهمة التالية
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/focus">وضع التركيز</Link>
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={dashboard.nextAction.urgency === "high" ? "danger" : dashboard.nextAction.urgency === "medium" ? "warning" : "success"}>
                {dashboard.nextAction.urgency === "high"
                  ? "الآن"
                  : dashboard.nextAction.urgency === "medium"
                    ? "هذا أفضل وقت"
                    : "متى ما أردت"}
              </Badge>
              <Badge variant="default">{formatMinutes(dashboard.nextAction.estimatedMinutes, data.settings.numerals)}</Badge>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">ابدأ من خطوة واحدة واضحة</h2>
              <p className="text-sm leading-8 text-[var(--muted-foreground)] md:text-base">
                {dashboard.nextAction.description}
              </p>
              <p className="text-sm leading-8 text-[var(--foreground)]">{dashboard.nextAction.reason}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={dashboard.nextAction.targetHref}>{dashboard.nextAction.cta}</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">ارجع إلى لوحة القيادة</Link>
              </Button>
            </div>
          </div>
          <div className="border-t border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-6 xl:border-r xl:border-t-0">
            <div className="space-y-4">
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">وضع اليوم الموصى به</p>
                <p className="mt-2 text-xl font-semibold">
                  {reviewEngine.recommendedMode === "light"
                    ? "خفيف"
                    : reviewEngine.recommendedMode === "normal"
                      ? "عادي"
                      : "موسع"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  {reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].explanation[0]}
                </p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">الهدف الأدنى لليوم</p>
                <p className="mt-2 text-xl font-semibold">
                  {toDigitSystem(dashboard.todayFocus.items.length || 1, data.settings.numerals)} خطوة
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  ليس مطلوبًا فتح بقية الأقسام الآن. نفّذ هذه الخطوات ثم غادر التطبيق براحة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <TodayFocusPanel snapshot={dashboard.todayFocus} numerals={data.settings.numerals} />
        {dashboard.resumeSuggestion ? (
          <ResumeSessionCard suggestion={dashboard.resumeSuggestion} numerals={data.settings.numerals} />
        ) : (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>ابدأ أول نقطة متابعة</CardTitle>
              <CardDescription>بمجرد تسجيل أول جلسة سيظهر لك هنا اقتراح ذكي للرجوع من حيث توقفت لاحقًا.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionFormDialog
                preset={{
                  sessionType: "review",
                  startPage: Math.max(1, dashboard.currentPage),
                  endPage: Math.max(1, dashboard.currentPage),
                  durationMinutes: 20,
                }}
              >
                <Button className="w-full">سجّل أول جلسة الآن</Button>
              </SessionFormDialog>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="مراجعة اليوم"
          value={`${toDigitSystem(dashboard.todayReviewPages, data.settings.numerals)} صفحة`}
          hint="الحجم المختصر الذي ينبغي الالتزام به اليوم."
          icon={Target}
        />
        <StatCard
          label="سلسلة الالتزام"
          value={`${toDigitSystem(dashboard.currentStreak, data.settings.numerals)} يوم`}
          hint="جلسة واحدة فقط اليوم تكفي للمحافظة على هذا الإيقاع."
          icon={CalendarClock}
        />
        <StatCard
          label="الصفحات الضعيفة"
          value={toDigitSystem(dashboard.weakPagesCount, data.settings.numerals)}
          hint="كلما خفّ هذا الرقم، صار الرجوع للحفظ الجديد أسهل."
          icon={ShieldAlert}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إن احتجت الدخول الأسرع</CardTitle>
          <CardDescription>يمكنك أيضًا فتح وضع التركيز مباشرة، لكن هذه الصفحة صُممت كي تمنع التشتت قبل أن تبدأ.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/focus">
              افتح وضع التركيز
              <PlayCircle className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={dashboard.nextAction.targetHref}>نفّذ المهمة التالية فقط</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
