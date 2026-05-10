"use client";

import { useMemo } from "react";
import { Trash2, Waves } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TajweedFormDialog } from "@/features/tajweed/tajweed-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { TAJWEED_CATEGORY_LABELS, toDigitSystem } from "@/utils/pages";

const SEVERITY_VARIANT = {
  low: "default",
  medium: "warning",
  high: "danger",
} as const;

export function TajweedPage() {
  const { data, removeTajweedNote } = useHifzData();
  const unresolved = data.tajweedNotes.filter((note) => !note.resolved);
  const categories = useMemo(() => {
    return Object.entries(TAJWEED_CATEGORY_LABELS).map(([key, label]) => ({
      label,
      count: data.tajweedNotes.filter((note) => note.category === key).length,
    }));
  }, [data.tajweedNotes]);

  if (!data.tajweedNotes.length) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="التجويد"
          title="تتبع أخطاء التجويد"
          description="سجّل الملاحظات التجويدية من المعلم أو من الاختبار الذاتي لتعرف أين يتكرر الخلل."
          action={
            <TajweedFormDialog>
              <Button>إضافة ملاحظة</Button>
            </TajweedFormDialog>
          }
        />
        <EmptyState
          title="لا توجد ملاحظات تجويدية بعد"
          description="إدخال ملاحظات قليلة بانتظام يكفي لبناء صورة مفيدة عن التحسن التجويدي مع الوقت."
          icon={Waves}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="التجويد"
        title="سجل الأخطاء والتحسن"
        description="تتبع الفئات المتكررة، الصفحات المرتبطة بها، وملاحظات المعلم، مع إمكانية وسم الملاحظة بأنها عولجت."
        action={
          <TajweedFormDialog>
            <Button>إضافة ملاحظة</Button>
          </TajweedFormDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>الملاحظات المفتوحة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{toDigitSystem(unresolved.length, data.settings.numerals)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الأكثر تكرارًا</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{categories.sort((left, right) => right.count - left.count)[0]?.label ?? "لا توجد"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>نسبة المعالَج</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {toDigitSystem(
                Math.round(
                  (data.tajweedNotes.filter((note) => note.resolved).length / data.tajweedNotes.length) * 100,
                ),
                data.settings.numerals,
              )}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الفئات</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <div key={category.label} className="rounded-[20px] bg-[var(--surface-soft)] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">{category.label}</p>
              <p className="mt-2 text-xl font-semibold">{toDigitSystem(category.count, data.settings.numerals)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {data.tajweedNotes
          .slice()
          .reverse()
          .map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="accent">{TAJWEED_CATEGORY_LABELS[note.category]}</Badge>
                      <Badge variant={SEVERITY_VARIANT[note.severity]}>{note.severity === "low" ? "خفيف" : note.severity === "medium" ? "متوسط" : "مرتفع"}</Badge>
                      <Badge>{note.resolved ? "تم علاجه" : "ما زال مفتوحًا"}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold">الصفحة {toDigitSystem(note.pageNumber, data.settings.numerals)}</h3>
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{note.note}</p>
                    {note.teacherNote ? (
                      <p className="rounded-[18px] bg-[var(--surface-soft)] p-3 text-sm leading-7 text-[var(--foreground)]">
                        ملاحظة المعلم: {note.teacherNote}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    <TajweedFormDialog note={note}>
                      <Button variant="secondary">تعديل</Button>
                    </TajweedFormDialog>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        removeTajweedNote(note.id);
                        toast.success("تم حذف الملاحظة.");
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
