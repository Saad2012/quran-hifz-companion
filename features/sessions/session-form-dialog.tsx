"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Session } from "@/types";
import { SESSION_TYPE_LABELS } from "@/utils/pages";
import {
  SESSION_REPETITIONS_MAX,
  createSessionFormDefaults,
  createSessionRecord,
  SessionFormValues,
  SessionSubmitValues,
  sessionFormSchema,
} from "@/lib/session-form";

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
  const defaultValues = useMemo<SessionFormValues>(
    () => createSessionFormDefaults({ session, preset }),
    [preset, session],
  );

  const form = useForm<SessionFormValues, unknown, SessionSubmitValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const onSubmit = form.handleSubmit((values) => {
    const record = createSessionRecord(values, session);

    if (session) {
      updateSession(record);
      toast.success("تم تحديث الجلسة بنجاح.");
    } else {
      addSession(record);
      toast.success("تمت إضافة الجلسة بنجاح.");
    }

    form.reset(createSessionFormDefaults({ session: record }));
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          form.reset(defaultValues);
        }
      }}
    >
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
            <Input id="startPage" type="number" min={1} max={604} {...form.register("startPage")} />
          </div>
          <div>
            <Label htmlFor="endPage">إلى صفحة</Label>
            <Input id="endPage" type="number" min={1} max={604} {...form.register("endPage")} />
          </div>
          <div>
            <Label htmlFor="durationMinutes">المدة بالدقائق</Label>
            <Input id="durationMinutes" type="number" min={0} max={600} {...form.register("durationMinutes")} />
          </div>
          <div>
            <Label htmlFor="repetitions">عدد التكرارات</Label>
            <Input
              id="repetitions"
              type="number"
              min={0}
              max={SESSION_REPETITIONS_MAX}
              {...form.register("repetitions")}
            />
          </div>
          <div>
            <Label htmlFor="qualityRating">تقييم الجودة 1-5</Label>
            <Input id="qualityRating" type="number" min={1} max={5} {...form.register("qualityRating")} />
          </div>
          <div>
            <Label htmlFor="difficultyRating">تقييم الصعوبة 1-5</Label>
            <Input id="difficultyRating" type="number" min={1} max={5} {...form.register("difficultyRating")} />
          </div>
          <div>
            <Label htmlFor="optionalSurahLabel">اسم السورة تقريبيًا</Label>
            <Input id="optionalSurahLabel" {...form.register("optionalSurahLabel")} />
          </div>
          <div>
            <Label htmlFor="optionalJuzApprox">الجزء تقريبيًا</Label>
            <Input id="optionalJuzApprox" type="number" min={1} max={30} {...form.register("optionalJuzApprox")} />
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
