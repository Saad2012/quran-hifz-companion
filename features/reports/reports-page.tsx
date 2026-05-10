"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHifzData } from "@/hooks/use-hifz-data";

export function ReportsPage() {
  const { derived } = useHifzData();
  const defaultTab = derived.reports[0]?.id ?? "weekly";

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="التقارير"
        title="تقارير جاهزة للقراءة"
        description="عروض أسبوعية وشهرية ورمضانية ومرتبطة بالوقفات والاختبارات، مع توصيات قصيرة قابلة للتنفيذ."
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {derived.reports.map((report) => (
            <TabsTrigger key={report.id} value={report.id}>
              {report.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {derived.reports.map((report) => (
          <TabsContent key={report.id} value={report.id}>
            <Card>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    <p className="text-sm text-[var(--muted-foreground)]">الفترة</p>
                    <p className="mt-2 font-semibold">{report.periodLabel}</p>
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    <p className="text-sm text-[var(--muted-foreground)]">ما تم حفظه</p>
                    <p className="mt-2 font-semibold">{report.memorized}</p>
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    <p className="text-sm text-[var(--muted-foreground)]">ما تم مراجعته</p>
                    <p className="mt-2 font-semibold">{report.reviewed}</p>
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    <p className="text-sm text-[var(--muted-foreground)]">الاتساق</p>
                    <p className="mt-2 font-semibold">{report.consistency}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-[var(--border)] p-5">
                    <h3 className="mb-3 text-lg font-semibold">مناطق الضعف</h3>
                    <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      {report.weakSpots.length ? report.weakSpots.map((spot) => <p key={spot}>{spot}</p>) : <p>لا توجد مواضع بارزة الآن.</p>}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] p-5">
                    <h3 className="mb-3 text-lg font-semibold">توصيات</h3>
                    <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      {report.recommendations.map((recommendation) => (
                        <p key={recommendation}>{recommendation}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
