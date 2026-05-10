"use client";

import { useMemo, useState } from "react";
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
import { Session, SessionType } from "@/types";
import { SESSION_TYPE_LABELS } from "@/utils/pages";

const formSchema = z
  .object({
    date: z.string().min(1),
    sessionType: z.enum(["memorization", "review", "test", "stop", "ramadan", "tajweed", "mixed"]),
    startPage: z.coerce.number().int().min(1).max(604),
    endPage: z.coerce.number().int().min(1).max(604),
    durationMinutes: z.coerce.number().int().min(0).max(600),
    repetitions: z.coerce.number().int().min(0).max(60),
    qualityRating: z.coerce.number().int().min(1).max(5),
    difficultyRating: z.coerce.number().int().min(1).max(5),
    withTeacher: z.boolean(),
    tested: z.boolean(),
    reviewedFromMemory: z.boolean(),
    optionalSurahLabel: z.string().optional(),
    optionalJuzApprox: z.string().optional(),
    notes: z.string(),
    weakPagesText: z.string().optional(),
    tagsText: z.string().optional(),
  })
  .refine((value) => value.endPage >= value.startPage, {
    path: ["endPage"],
    message: "نهاية الصفحات يجب أن تكون بعد البداية.",
  });

type FormValues = z.input<typeof formSchema>;
type SubmitValues = z.output<typeof formSchema>;

function parseNumbers(value?: string) {
  return (value ?? "")
    .split(/[,\s،]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 604);
}

function parseTags(value?: string) {
  return (value ?? "")
    .split(/[,\n،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
}

export function SessionFormDialog({
  children,
  session,
  preset,
}: {
  children: React.ReactNode;
  session?: Session;
  preset?: Partial<Session>;
}) {
  const { addSession, updateSession } = useHifzData();
  const [open, setOpen] = useState(false);
  const defaultValues = useMemo<FormValues>(
    () => ({
      date: session?.date ?? preset?.date ?? new Date().toISOString().slice(0, 10),
      sessionType: (session?.sessionType ?? preset?.sessionType ?? "review") as SessionType,
      startPage: session?.startPage ?? preset?.startPage ?? 1,
      endPage: session?.endPage ?? preset?.endPage ?? 1,
      durationMinutes: session?.durationMinutes ?? preset?.durationMinutes ?? 30,
      repetitions: session?.repetitions ?? preset?.repetitions ?? 3,
      qualityRating: session?.qualityRating ?? preset?.qualityRating ?? 4,
      difficultyRating: session?.difficultyRating ?? preset?.difficultyRating ?? 2,
      withTeacher: session?.withTeacher ?? preset?.withTeacher ?? false,
      tested: session?.tested ?? preset?.tested ?? false,
      reviewedFromMemory: session?.reviewedFromMemory ?? preset?.reviewedFromMemory ?? true,
      optionalSurahLabel: session?.optionalSurahLabel ?? preset?.optionalSurahLabel ?? "",
      optionalJuzApprox: String(session?.optionalJuzApprox ?? preset?.optionalJuzApprox ?? ""),
      notes: session?.notes ?? preset?.notes ?? "",
      weakPagesText: session?.weakPagesDiscovered?.join("، ") ?? preset?.weakPagesDiscovered?.join("، ") ?? "",
      tagsText: session?.tags?.join("، ") ?? preset?.tags?.join("، ") ?? "",
    }),
    [preset, session],
  );

  const form = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    const nowStamp = new Date().toISOString();
    const record: Session = {
      id: session?.id ?? createSessionId(),
      date: values.date,
      sessionType: values.sessionType,
      startPage: values.startPage,
      endPage: values.endPage,
      pagesCount: values.endPage - values.startPage + 1,
      durationMinutes: values.durationMinutes,
      repetitions: values.repetitions,
      qualityRating: values.qualityRating,
      difficultyRating: values.difficultyRating,
      withTeacher: values.withTeacher,
      tested: values.tested,
      optionalSurahLabel: values.optionalSurahLabel || undefined,
      optionalJuzApprox: values.optionalJuzApprox ? Number(values.optionalJuzApprox) : undefined,
      notes: values.notes,
      weakPagesDiscovered: parseNumbers(values.weakPagesText),
      tags: parseTags(values.tagsText),
      reviewedFromMemory: values.reviewedFromMemory,
      createdAt: session?.createdAt ?? nowStamp,
      updatedAt: nowStamp,
    };

    if (session) {
      updateSession(record);
      toast.success("تم تحديث الجلسة بنجاح.");
    } else {
      addSession(record);
      toast.success("تمت إضافة الجلسة بنجاح.");
    }

    setOpen(false);
    form.reset(defaultValues);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session ? "تعديل الجلسة" : "جلسة جديدة"}</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الجلسة بدقة حتى تصبح المراجعة والتحليلات أوثق مع الوقت.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="date">التاريخ</Label>
            <Input id="date" type="date" {...form.register("date")} />
          </div>
          <div>
            <Label htmlFor="sessionType">نوع الجلسة</Label>
            <select
              id="sessionType"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              {...form.register("sessionType")}
            >
              {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="startPage">من صفحة</Label>
            <Input id="startPage" type="number" {...form.register("startPage")} />
          </div>
          <div>
            <Label htmlFor="endPage">إلى صفحة</Label>
            <Input id="endPage" type="number" {...form.register("endPage")} />
          </div>
          <div>
            <Label htmlFor="durationMinutes">المدة بالدقائق</Label>
            <Input id="durationMinutes" type="number" {...form.register("durationMinutes")} />
          </div>
          <div>
            <Label htmlFor="repetitions">عدد التكرارات</Label>
            <Input id="repetitions" type="number" {...form.register("repetitions")} />
          </div>
          <div>
            <Label htmlFor="qualityRating">تقييم الجودة 1-5</Label>
            <Input id="qualityRating" type="number" {...form.register("qualityRating")} />
          </div>
          <div>
            <Label htmlFor="difficultyRating">تقييم الصعوبة 1-5</Label>
            <Input id="difficultyRating" type="number" {...form.register("difficultyRating")} />
          </div>
          <div>
            <Label htmlFor="optionalSurahLabel">اسم السورة تقريبيًا</Label>
            <Input id="optionalSurahLabel" {...form.register("optionalSurahLabel")} />
          </div>
          <div>
            <Label htmlFor="optionalJuzApprox">الجزء تقريبيًا</Label>
            <Input id="optionalJuzApprox" type="number" {...form.register("optionalJuzApprox")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="weakPagesText">الصفحات الضعيفة المكتشفة</Label>
            <Input id="weakPagesText" placeholder="مثال: 34، 35، 41" {...form.register("weakPagesText")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tagsText">الوسوم</Label>
            <Input id="tagsText" placeholder="مثال: معلّم، صباح، تثبيت" {...form.register("tagsText")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>
          <div className="flex flex-wrap items-center gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("withTeacher")} />
              مع معلّم
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("tested")} />
              فيها اختبار
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("reviewedFromMemory")} />
              من الذاكرة
            </label>
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">{session ? "حفظ التعديل" : "إضافة الجلسة"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
