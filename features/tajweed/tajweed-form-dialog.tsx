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
import { TajweedCategory, TajweedNote } from "@/types";
import { TAJWEED_CATEGORY_LABELS } from "@/utils/pages";

const formSchema = z.object({
  date: z.string().min(1),
  category: z.enum(["makharij", "ghunnah", "madd", "waqf", "qalqalah", "sifaat", "ikhfa", "idghaam"]),
  pageNumber: z.coerce.number().int().min(1).max(604),
  severity: z.enum(["low", "medium", "high"]),
  note: z.string().min(1),
  teacherNote: z.string().optional(),
  resolved: z.boolean(),
});

type FormValues = z.input<typeof formSchema>;
type SubmitValues = z.output<typeof formSchema>;

const SEVERITY_LABELS = {
  low: "خفيف",
  medium: "متوسط",
  high: "مرتفع",
};

export function TajweedFormDialog({
  children,
  note,
}: {
  children: React.ReactNode;
  note?: TajweedNote;
}) {
  const { addTajweedNote, updateTajweedNote } = useHifzData();
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const defaultValues = useMemo<FormValues>(
    () => ({
      date: note?.date ?? new Date().toISOString().slice(0, 10),
      category: (note?.category ?? "makharij") as TajweedCategory,
      pageNumber: note?.pageNumber ?? 1,
      severity: note?.severity ?? "medium",
      note: note?.note ?? "",
      teacherNote: note?.teacherNote ?? "",
      resolved: note?.resolved ?? false,
    }),
    [note],
  );

  const form = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    const nextNote: TajweedNote = {
      id: note?.id ?? `tajweed-${generatedId.replace(/:/g, "")}`,
      date: values.date,
      category: values.category,
      pageNumber: values.pageNumber,
      severity: values.severity,
      note: values.note,
      teacherNote: values.teacherNote,
      resolved: values.resolved,
    };

    if (note) {
      updateTajweedNote(nextNote);
      toast.success("تم تحديث الملاحظة التجويدية.");
    } else {
      addTajweedNote(nextNote);
      toast.success("تمت إضافة الملاحظة التجويدية.");
    }

    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{note ? "تعديل ملاحظة تجويد" : "ملاحظة تجويد جديدة"}</DialogTitle>
          <DialogDescription>سجّل الخطأ، شدته، وصف المعلم، وهل تم علاجه أم لا.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="tajweed-date">التاريخ</Label>
            <Input id="tajweed-date" type="date" {...form.register("date")} />
          </div>
          <div>
            <Label htmlFor="tajweed-page">الصفحة</Label>
            <Input id="tajweed-page" type="number" {...form.register("pageNumber")} />
          </div>
          <div>
            <Label htmlFor="tajweed-category">الفئة</Label>
            <select
              id="tajweed-category"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              {...form.register("category")}
            >
              {Object.entries(TAJWEED_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="tajweed-severity">الشدة</Label>
            <select
              id="tajweed-severity"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              {...form.register("severity")}
            >
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tajweed-note">الوصف</Label>
            <Textarea id="tajweed-note" {...form.register("note")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tajweed-teacher-note">ملاحظة المعلم</Label>
            <Textarea id="tajweed-teacher-note" {...form.register("teacherNote")} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("resolved")} />
              تم علاج هذه الملاحظة
            </label>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">{note ? "حفظ التعديل" : "إضافة"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
