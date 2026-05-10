"use client";

import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { ClipboardCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { ClientChart } from "@/components/charts/client-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/chart-card";
import { TestFormDialog } from "@/features/tests/test-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatDateLabel } from "@/utils/date";
import { formatPageRange, toDigitSystem } from "@/utils/pages";

const TEST_TYPE_LABELS = {
  teacher: "اختبار معلّم",
  self: "اختبار ذاتي",
  random: "اختبار عشوائي",
  segment: "اختبار مقطع",
  ramadan: "اختبار رمضان",
};

export function TestsPage() {
  const { data, derived, removeTestRecord } = useHifzData();
  const latest = data.testRecords.at(-1);
  const previous = data.testRecords.at(-2);
  const improvement = latest && previous ? latest.score - previous.score : 0;
  const weakQueuePages = useMemo(
    () => Array.from(new Set(data.testRecords.flatMap((record) => record.weakPages))).slice(-12),
    [data.testRecords],
  );

  if (!data.testRecords.length) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="الاختبارات"
          title="قياس التثبيت والتحسن"
          description="سجّل أول اختبار لديك ليبدأ التطبيق بمقارنة الأداء والزمن والصفحات الضعيفة."
          action={
            <TestFormDialog>
              <Button>إضافة اختبار</Button>
            </TestFormDialog>
          }
        />
        <EmptyState
          title="لا توجد اختبارات بعد"
          description="ابدأ باختبار مقطع واحد، حتى لو كان قصيرًا، لأن هذا القسم يصبح أقوى كلما تراكمت السجلات."
          icon={ClipboardCheck}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="الاختبارات"
        title="متابعة التحسن عبر الاختبارات"
        description="من هنا ترى الدرجات، الأخطاء، الصفحات التي دخلت قائمة الضعف، ومقارنة الأداء الحالي بالسابق."
        action={
          <TestFormDialog>
            <Button>تسجيل اختبار</Button>
          </TestFormDialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>آخر درجة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{toDigitSystem(Math.round(latest?.score ?? 0), data.settings.numerals)}%</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{latest ? formatDateLabel(latest.date) : "لا توجد بيانات"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>التحسن مقارنة بالسابق</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold ${improvement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {improvement >= 0 ? "+" : ""}
              {toDigitSystem(improvement, data.settings.numerals)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">الفرق بين آخر اختبار والذي قبله مباشرة.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الصفحات التي دخلت طابور الضعف</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{formatPageRange(weakQueuePages, data.settings.numerals)}</p>
          </CardContent>
        </Card>
      </div>

      <ChartCard title="اتجاه درجات الاختبارات" description="رؤية سريعة لمسار التحسن أو التراجع عبر الوقت.">
        <ClientChart className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={derived.analytics.charts.testScoreTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ClientChart>
      </ChartCard>

      <div className="space-y-4">
        {data.testRecords
          .slice()
          .reverse()
          .map((record) => (
            <Card key={record.id}>
              <CardContent className="pt-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="accent">{TEST_TYPE_LABELS[record.type]}</Badge>
                      <Badge>{formatDateLabel(record.date, "EEEE d MMM")}</Badge>
                      <Badge variant={record.score >= 85 ? "success" : record.score >= 75 ? "warning" : "danger"}>
                        {toDigitSystem(record.score, data.settings.numerals)}%
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold">
                      ص {toDigitSystem(record.startPage, data.settings.numerals)} - {toDigitSystem(record.endPage, data.settings.numerals)}
                    </h3>
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{record.notes}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                      <span>الأخطاء: {toDigitSystem(record.errorsCount, data.settings.numerals)}</span>
                      <span>•</span>
                      <span>الضعف: {formatPageRange(record.weakPages, data.settings.numerals)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <TestFormDialog record={record}>
                      <Button variant="secondary">تعديل</Button>
                    </TestFormDialog>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        removeTestRecord(record.id);
                        toast.success("تم حذف الاختبار.");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
