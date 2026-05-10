"use client";

import { PauseCircle, ShieldCheck, TimerReset } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StopSessionDialog } from "@/features/segments/stop-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatDateLabel } from "@/utils/date";
import { toDigitSystem } from "@/utils/pages";

export function SegmentsPage() {
  const { data, derived } = useHifzData();
  const currentPage = derived.dashboard.currentPage;
  const currentSegment = data.segments.find(
    (segment) => currentPage >= segment.startPage && currentPage <= segment.endPage,
  );

  if (!data.segments.length) {
    return (
      <EmptyState
        title="لا توجد مقاطع"
        description="أضف تقسيمات المقاطع أو حمّل seed data لبدء العمل."
        icon={PauseCircle}
      />
    );
  }

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="المقاطع والوقفات"
        title="محطات الحفظ والتثبيت"
        description="هذه الشاشة توضّح أين تقف الآن داخل المقاطع، وما الوقفة القادمة، وما الذي ينبغي اختباره قبل الانتقال."
        action={
          <StopSessionDialog>
            <Button>إضافة وقفة</Button>
          </StopSessionDialog>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>المقطع الجاري</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] bg-[var(--surface-soft)] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{currentSegment?.label ?? "غير محدد"}</Badge>
                <Badge>{currentSegment?.startSurah} → {currentSegment?.endSurah}</Badge>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">
                من ص {toDigitSystem(currentSegment?.startPage ?? 1, data.settings.numerals)} إلى ص {toDigitSystem(currentSegment?.endPage ?? 1, data.settings.numerals)}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                آخر صفحة وصلت إليها الآن هي {toDigitSystem(currentPage, data.settings.numerals)}، والوقفة التالية متوقعة بعد هذا المقطع مباشرة.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">المقاطع المكتملة</p>
                <p className="mt-2 text-xl font-semibold">
                  {toDigitSystem(data.segments.filter((segment) => segment.endPage <= currentPage).length, data.settings.numerals)}
                </p>
              </div>
              <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">الوقفات السابقة</p>
                <p className="mt-2 text-xl font-semibold">
                  {toDigitSystem(data.stopSessions.filter((stop) => stop.completed).length, data.settings.numerals)}
                </p>
              </div>
              <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">عدد أيام الوقفة</p>
                <p className="mt-2 text-xl font-semibold">
                  {toDigitSystem(data.settings.stopLengthDays, data.settings.numerals)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تعليمات الوقفة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-[var(--muted-foreground)]">
            <div className="flex gap-3">
              <TimerReset className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
              <p>خفّف الحفظ الجديد أثناء الوقفة، وركّز على إعادة المرور الكامل على المقطع مع الربط بين أوائله وأواخره.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 text-emerald-600" />
              <p>قبل الخروج من الوقفة: اختبر أطراف المقطع، ومواضع التشابه، وبدايات الصفحات التي ظهر فيها ضعف سابقًا.</p>
            </div>
            <div className="flex gap-3">
              <PauseCircle className="mt-1 h-4 w-4 text-amber-600" />
              <p>إذا امتدت الوقفة عن المخطط، فغيّر طول المقطع القادم أو كثافة جلسات المراجعة داخل الأسبوع.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الوقفات الحالية والسابقة</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {data.stopSessions.map((stop) => {
            const segment = data.segments.find((item) => item.id === stop.segmentId);
            return (
              <div key={stop.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant={stop.completed ? "success" : "warning"}>{stop.completed ? "مكتملة" : "مخططة"}</Badge>
                  <Badge>{segment?.label ?? stop.segmentId}</Badge>
                </div>
                <p className="font-semibold">
                  {formatDateLabel(stop.plannedStart)} → {formatDateLabel(stop.plannedEnd)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{stop.notes}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تقدم المقاطع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.segments.map((segment) => {
            const completedPages = derived.pageStates.filter(
              (page) =>
                page.memorized &&
                page.pageNumber >= segment.startPage &&
                page.pageNumber <= segment.endPage,
            ).length;
            const completion = Math.round((completedPages / segment.pagesCount) * 100);

            return (
              <div key={segment.id} className="rounded-[22px] border border-[var(--border)] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{segment.label}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {segment.startSurah} → {segment.endSurah}
                    </p>
                  </div>
                  <Badge>{toDigitSystem(completion, data.settings.numerals)}%</Badge>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-soft)]">
                  <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${completion}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
