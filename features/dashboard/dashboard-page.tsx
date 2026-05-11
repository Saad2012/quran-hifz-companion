"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Layers3,
  PlayCircle,
  ShieldAlert,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ChartCard } from "@/components/charts/chart-card";
import { ClientChart } from "@/components/charts/client-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NextActionDialog } from "@/features/dashboard/next-action-dialog";
import { ResumeSessionCard } from "@/features/dashboard/resume-session-card";
import { TodayFocusPanel } from "@/features/dashboard/today-focus-panel";
import { StatCard } from "@/components/stat-card";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatDateLabel } from "@/utils/date";
import { formatMinutes, toDigitSystem } from "@/utils/pages";

export function DashboardPage() {
  const { data, derived, isHydrated } = useHifzData();

  if (!isHydrated) {
    return <Card>جار تحميل بياناتك المحلية...</Card>;
  }

  const { dashboard, analytics, reviewEngine } = derived;

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="لوحة القيادة"
        title="صورة واضحة لمشروعك الآن"
        description="تركيز اليوم هنا على ما وصلت إليه، وما ينبغي مراجعته الآن، مع اختصارات مباشرة تمنعك من الضياع بين الأقسام حين تريد التنفيذ."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={dashboard.nextAction.targetHref}>
                ابدأ المهمة التالية
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/today">اليوم فقط</Link>
            </Button>
            <NextActionDialog />
            <SessionFormDialog preset={{ sessionType: "memorization", startPage: dashboard.currentPage + 1, endPage: dashboard.currentPage + 1 }}>
              <Button variant="ghost">جلسة جديدة</Button>
            </SessionFormDialog>
            <Button asChild variant="ghost">
              <Link href="/review">خطة المراجعة اليوم</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <TodayFocusPanel snapshot={dashboard.todayFocus} numerals={data.settings.numerals} />
        {dashboard.resumeSuggestion ? (
          <ResumeSessionCard suggestion={dashboard.resumeSuggestion} numerals={data.settings.numerals} />
        ) : (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>أكمل من حيث توقفت</CardTitle>
              <CardDescription>بمجرد تسجيل أول جلسة سيظهر هنا اقتراح تلقائي يعيدك مباشرةً إلى آخر نقطة كنت تعمل عليها.</CardDescription>
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
                <Button className="w-full">سجّل أول جلسة</Button>
              </SessionFormDialog>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.5fr,1fr]">
          <div className="space-y-5 p-6 md:p-8">
            <Badge variant="accent">المشروع {dashboard.projectHealth === "steady" ? "مستقر" : dashboard.projectHealth === "busy" ? "مزدحم" : "تحت ضغط"}</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                وصلت الآن إلى الصفحة {toDigitSystem(dashboard.currentPage, data.settings.numerals)}
              </h2>
              <p className="max-w-2xl text-sm leading-8 text-[var(--muted-foreground)] md:text-base">
                السورة الحالية تقريبًا {dashboard.currentSurah}، والجزء الحالي تقريبًا {toDigitSystem(dashboard.currentJuzApprox, data.settings.numerals)}. بقي {toDigitSystem(dashboard.remainingPages, data.settings.numerals)} صفحة على الختم.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">المقطع الجاري</p>
                <p className="mt-2 text-xl font-semibold">{dashboard.currentSegment?.label ?? "غير محدد"}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {dashboard.currentSegment?.startPage} - {dashboard.currentSegment?.endPage}
                </p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">الوقفة القادمة</p>
                <p className="mt-2 text-xl font-semibold">
                  {dashboard.nextStop ? formatDateLabel(dashboard.nextStop.plannedStart) : "لا توجد"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{dashboard.nextStop?.notes ?? "لا توجد وقفة مخططة الآن."}</p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">تقدير الختم</p>
                <p className="mt-2 text-xl font-semibold">
                  {dashboard.estimatedCompletionDate ? formatDateLabel(dashboard.estimatedCompletionDate, "d MMM yyyy") : "غير متاح"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">مبني على متوسط الحفظ الأسبوعي الحالي.</p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>نسبة الإنجاز</span>
                <span>{toDigitSystem(Math.round(dashboard.completionRatio * 100), data.settings.numerals)}%</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--surface-soft)]">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,var(--accent),#d9996d)]"
                  style={{ width: `${dashboard.completionRatio * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border)] bg-[rgba(255,255,255,0.55)] p-6 xl:border-r xl:border-t-0">
            <div className="space-y-4">
              {dashboard.smartAlerts.map((alert) => (
                <div key={alert.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={alert.tone === "warning" ? "warning" : alert.tone === "success" ? "success" : "default"}>
                      {alert.title}
                    </Badge>
                  </div>
                  <p className="text-sm leading-7 text-[var(--foreground)]">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {derived.recoveryPlan.isNeeded ? (
        <Card className="border-[rgba(188,116,74,0.24)]">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>خطة تعافٍ جاهزة</CardTitle>
                <CardDescription>{derived.recoveryPlan.summary}</CardDescription>
              </div>
              <Button asChild>
                <Link href="/focus">افتح وضع التركيز</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {derived.recoveryPlan.days.slice(0, 3).map((day) => (
              <div key={day.id} className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">{day.label}</p>
                <p className="mt-2 font-semibold">{day.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{day.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>ماذا أفعل الآن؟</CardTitle>
              <CardDescription>
                قرار سريع مبني على حالة المشروع الحالية بدل التخمين أو البدء من شاشة عشوائية.
              </CardDescription>
            </div>
            <NextActionDialog />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="rounded-[24px] bg-[var(--surface-soft)] p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={dashboard.nextAction.urgency === "high" ? "danger" : dashboard.nextAction.urgency === "medium" ? "warning" : "success"}>
                {dashboard.nextAction.urgency === "high"
                  ? "أولوية عالية"
                  : dashboard.nextAction.urgency === "medium"
                    ? "أولوية متوسطة"
                    : "أولوية هادئة"}
              </Badge>
              <Badge variant="default">{formatMinutes(dashboard.nextAction.estimatedMinutes, data.settings.numerals)}</Badge>
            </div>
            <h3 className="text-2xl font-semibold">{dashboard.nextAction.title}</h3>
            <p className="mt-3 text-sm leading-8 text-[var(--muted-foreground)]">
              {dashboard.nextAction.description}
            </p>
            <p className="mt-3 text-sm leading-8 text-[var(--foreground)]">
              {dashboard.nextAction.reason}
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] p-5">
            <p className="text-sm text-[var(--muted-foreground)]">الصفحات المقترحة</p>
            <p className="mt-3 text-base leading-8 text-[var(--foreground)]">
              {dashboard.nextAction.pageNumbers.length
                ? `ص ${dashboard.nextAction.pageNumbers.map((page) => toDigitSystem(page, data.settings.numerals)).join("، ")}`
                : "لا توجد صفحات محددة، والتركيز هنا على تنظيم الأسبوع أو فتح الشاشة المقترحة."}
            </p>
            <div className="mt-5">
              <Button asChild className="w-full">
                <Link href={dashboard.nextAction.targetHref}>{dashboard.nextAction.cta}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="مراجعة اليوم"
          value={`${toDigitSystem(dashboard.todayReviewPages, data.settings.numerals)} صفحة`}
          hint="الكمية المقترحة وفق الوضع الموصى به."
          icon={Target}
        />
        <StatCard
          label="الصفحات الضعيفة"
          value={toDigitSystem(dashboard.weakPagesCount, data.settings.numerals)}
          hint="في الطابور الحالي وتحتاج تكرارًا أعلى."
          icon={ShieldAlert}
        />
        <StatCard
          label="سلسلة الالتزام"
          value={`${toDigitSystem(dashboard.currentStreak, data.settings.numerals)} يوم`}
          hint="عدد الأيام النشطة المتصلة حتى الآن."
          icon={CalendarClock}
        />
        <StatCard
          label="آخر جلسة"
          value={dashboard.lastSession ? formatDateLabel(dashboard.lastSession.date) : "لا توجد"}
          hint={dashboard.lastSession ? `${dashboard.lastSession.pagesCount} صفحات | ${formatMinutes(dashboard.lastSession.durationMinutes, data.settings.numerals)}` : "ابدأ أول جلسة الآن"}
          icon={PlayCircle}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>خطة اليوم المختصرة</CardTitle>
            <CardDescription>المحرك أوصى بوضع {reviewEngine.recommendedMode === "light" ? "خفيف" : reviewEngine.recommendedMode === "normal" ? "عادي" : "موسع"} لهذا اليوم.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].tasks.map((task) => (
              <div key={task.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <Badge variant={task.completed ? "success" : "accent"}>
                    {task.completed ? "مكتمل" : `${toDigitSystem(task.pageNumbers.length, data.settings.numerals)} صفحات`}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{task.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <ChartCard
          title="توقع حجم المراجعة"
          description="الأيام القادمة بحسب دورة المراجعة الحالية والصفحات الضعيفة والحرجة."
        >
          <ClientChart className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.charts.reviewVolumeForecast}>
                <defs>
                  <linearGradient id="loadFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="duePages" stroke="var(--accent)" fill="url(#loadFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ClientChart>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="حجم المراجعة الحالي"
          value={dashboard.reviewVolume === "high" ? "مرتفع" : dashboard.reviewVolume === "balanced" ? "متوازن" : "منخفض"}
          hint="مبني على صفحات اليوم المقترحة."
          icon={Layers3}
        />
        <StatCard
          label="التغطية آخر 14 يومًا"
          value={`${toDigitSystem(analytics.metrics.reviewCoverage14Days, data.settings.numerals)}%`}
          hint="كم صفحة محفوظة مرّت عليها مراجعة حديثة."
          icon={Activity}
        />
        <StatCard
          label="صفحات حرجة"
          value={toDigitSystem(analytics.metrics.totalCriticalPages, data.settings.numerals)}
          hint="كل صفحة تتجاوز الهامش الآمن ترتفع هنا."
          icon={AlertTriangle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>حالة المشروع الحالية</CardTitle>
          <CardDescription>
            إذا استمر المتوسط الحالي فالمسار {dashboard.projectHealth === "steady" ? "مريح" : dashboard.projectHealth === "busy" ? "نشط لكنه يحتاج ضبطًا" : "يحتاج تدخلًا سريعًا"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">آخر جلسة</p>
            <p className="mt-2 font-semibold">{dashboard.lastSession?.optionalSurahLabel ?? "غير محدد"}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{dashboard.lastSession?.notes ?? "لا توجد ملاحظات."}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">الوضع المختار اليوم</p>
            <p className="mt-2 font-semibold">{reviewEngine.recommendedMode === "light" ? "خفيف" : reviewEngine.recommendedMode === "normal" ? "عادي" : "موسع"}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{reviewEngine.todayReviewPlan[reviewEngine.recommendedMode].explanation[0]}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">الوقفات المكتملة</p>
            <p className="mt-2 font-semibold">{toDigitSystem(analytics.metrics.completedStops, data.settings.numerals)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">تدل على أن الخطة لا تسير دون محطات تثبيت.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
