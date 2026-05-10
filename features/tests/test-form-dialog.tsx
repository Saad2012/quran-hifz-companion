"use client";

import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHifzData } from "@/hooks/use-hifz-data";
import { TestRecord, TestType } from "@/types";

const formSchema = z
  .object({
    date: z.string().min(1),
    type: z.enum(["teacher", "self", "random", "segment", "ramadan"]),
    startPage: z.coerce.number().int().min(1).max(604),
    endPage: z.coerce.number().int().min(1).max(604),
    score: z.coerce.number().min(0).max(100),
    notes: z.string(),
    weakPagesText: z.string().optional(),
    errorsCount: z.coerce.number().int().min(0).max(200),
  })
  .refine((value) => value.endPage >= value.startPage, {
    path: ["endPage"],
    message: "نهاية الصفحات يجب أن تكون بعد البداية.",
  });

type FormValues = z.input<typeof formSchema>;
type SubmitValues = z.output<typeof formSchema>;

const TEST_TYPES: Record<TestType, string> = {
  teacher: "اختبار معلّم",
  self: "اختبار ذاتي",
  random: "اختبار عشوائي",
  segment: "اختبار مقطع",
  ramadan: "اختبار رمضان",
};

function parseNumbers(value?: string) {
  return (value ?? "")
    .split(/[,\s،]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 604);
}

export function TestFormDialog({
  children,
  record,
}: {
  children: React.ReactNode;
  record?: TestRecord;
}) {
  const { addTestRecord, updateTestRecord } = useHifzData();
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const defaultValues = useMemo<FormValues>(
    () => ({
      date: record?.date ?? new Date().toISOString().slice(0, 10),
      type: (record?.type ?? "teacher") as TestType,
      startPage: record?.startPage ?? 1,
      endPage: record?.endPage ?? 10,
      score: record?.score ?? 85,
      notes: record?.notes ?? "",
      weakPagesText: record?.weakPages.join("، ") ?? "",
      errorsCount: record?.errorsCount ?? 0,
    }),
    [record],
  );

  const form = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    const nextRecord: TestRecord = {
      id: record?.id ?? `test-${generatedId.replace(/:/g, "")}`,
      date: values.date,
      type: values.type,
      startPage: values.startPage,
      endPage: values.endPage,
      score: values.score,
      notes: values.notes,
      weakPages: parseNumbers(values.weakPagesText),
      errorsCount: values.errorsCount,
    };

    if (record) {
      updateTestRecord(nextRecord);
      toast.success("تم تحديث الاختبار.");
    } else {
      addTestRecord(nextRecord);
      toast.success("تم تسجيل الاختبار.");
    }

    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "تعديل الاختبار" : "تسجيل اختبار"}</DialogTitle>
          <DialogDescription>سجّل الدرجة، الصفحات، والأخطاء حتى نرصد التحسن بوضوح.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="test-date">التاريخ</Label>
            <Input id="test-date" type="date" {...form.register("date")} />
          </div>
          <div>
            <Label htmlFor="test-type">نوع الاختبار</Label>
            <select
              id="test-type"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              {...form.register("type")}
            >
              {Object.entries(TEST_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="test-start">من صفحة</Label>
            <Input id="test-start" type="number" {...form.register("startPage")} />
          </div>
          <div>
            <Label htmlFor="test-end">إلى صفحة</Label>
            <Input id="test-end" type="number" {...form.register("endPage")} />
          </div>
          <div>
            <Label htmlFor="test-score">الدرجة</Label>
            <Input id="test-score" type="number" {...form.register("score")} />
          </div>
          <div>
            <Label htmlFor="test-errors">عدد الأخطاء</Label>
            <Input id="test-errors" type="number" {...form.register("errorsCount")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="test-weak">الصفحات التي دخلت قائمة الضعف</Label>
            <Input id="test-weak" placeholder="مثال: 51، 52" {...form.register("weakPagesText")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="test-notes">ملاحظات</Label>
            <Textarea id="test-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">{record ? "حفظ التعديل" : "تسجيل"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
