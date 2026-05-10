"use client";

import { CalendarDays, Clock3, Route } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatDateLabel } from "@/utils/date";
import { formatMinutes, formatPageRange, toDigitSystem } from "@/utils/pages";

function taskTypeLabel(type: string) {
  if (type === "memorization") return "حفظ";
  if (type === "review") return "مراجعة";
  if (type === "test") return "اختبار";
  if (type === "stop") return "وقفة";
  return "خطة";
}

export function PlannerPage() {
  const { data, derived } = useHifzData();
  const planner = derived.weeklyPlanner;
  const today = planner.days[0];
  const firstTask = today?.plannedTasks[0];

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="التخطيط الأسبوعي"
        title="خطة عملية للأيام السبعة القادمة"
        description="هذه الشاشة توزع المراجعة والحفظ على الأسبوع القادم اعتمادًا على أيامك المفعلة، ودورة المراجعة الحالية، وحالة الصفحات الضعيفة والحرجة."
        action={
          firstTask ? (
            <SessionFormDialog
              preset={{
                sessionType: firstTask.type === "memorization" ? "memorization" : "review",
                startPage: firstTask.pageNumbers[0] ?? 1,
                endPage: firstTask.pageNumbers.at(-1) ?? firstTask.pageNumbers[0] ?? 1,
              }}
            >
              <Button>ابدأ تنفيذ خطة اليوم</Button>
            </SessionFormDialog>
          ) : null
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-5 p-6 md:p-8">
            <Badge variant="accent">{planner.weekLabel}</Badge>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              توزيع أسبوعي يوازن بين التقدم والاستقرار
            </h2>
            <p className="max-w-3xl text-sm leading-8 text-[var(--muted-foreground)] md:text-base">
              الفكرة هنا أن ترى الأسبوع كاملًا قبل أن تبدأه: متى تحفظ، متى تراجع، وأين يجب سحب الصفحات الضعيفة حتى لا تتكدس عليك في يوم واحد.
            </p>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">إجمالي الصفحات</p>
                <p className="mt-2 text-2xl font-semibold">
                  {toDigitSystem(planner.totalPlannedPages, data.settings.numerals)}
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">إجمالي الوقت</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatMinutes(planner.totalPlannedMinutes, data.settings.numerals)}
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">أيام المراجعة</p>
                <p className="mt-2 text-2xl font-semibold">
                  {toDigitSystem(planner.reviewDaysCount, data.settings.numerals)}
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">أيام الحفظ</p>
                <p className="mt-2 text-2xl font-semibold">
                  {toDigitSystem(planner.memorizationDaysCount, data.settings.numerals)}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border)] bg-[rgba(255,255,255,0.55)] p-6 xl:border-r xl:border-t-0">
            <div className="space-y-4">
              {planner.highlights.map((highlight) => (
                <div key={highlight} className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-7 text-[var(--foreground)]">
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {planner.days.map((day) => (
          <Card key={day.date} className={day.isToday ? "ring-2 ring-[var(--accent)]" : ""}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[var(--accent-strong)]" />
                    {day.weekdayLabel}
                  </CardTitle>
                  <CardDescription>{formatDateLabel(day.date, "d MMMM yyyy")}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.isToday ? <Badge variant="accent">اليوم</Badge> : null}
                  <Badge variant="default">{day.focusLabel}</Badge>
                  <Badge variant="success">{toDigitSystem(day.totalPages, data.settings.numerals)} صفحات</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {day.plannedTasks.length ? (
                day.plannedTasks.map((task) => (
                  <div key={task.id} className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={task.type === "memorization" ? "accent" : task.type === "test" ? "warning" : "default"}>
                          {taskTypeLabel(task.type)}
                        </Badge>
                        <Badge variant="default">{formatMinutes(task.estimatedMinutes, data.settings.numerals)}</Badge>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{task.reason}</p>
                    <p className="mt-2 text-xs leading-6 text-[var(--muted-foreground)]">
                      الصفحات: {formatPageRange(task.pageNumbers, data.settings.numerals)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-[var(--border)] p-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  هذا اليوم خفيف نسبيًا. يمكن أن تتركه للراحة أو لمراجعة مرنة غير مجدولة.
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <Clock3 className="h-4 w-4" />
                الوقت الكلي لليوم: {formatMinutes(day.totalMinutes, data.settings.numerals)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-4 w-4 text-emerald-600" />
            كيف تقرأ هذه الصفحة؟
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">الحفظ</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              يُوزَّع وفق متوسط جلساتك السابقة وأيام الحفظ المفعلة في الإعدادات.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">المراجعة</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              تأتي من دورة المراجعة الحالية، مع سحب الصفحات الضعيفة والحرجة على أيام الأسبوع.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">الاختبار</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              يضاف تلقائيًا أسبوعيًا عندما يكون الضغط الحرج منخفضًا ويكون الوقت مناسبًا للتثبيت.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
