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
import { StopSession } from "@/types";

const formSchema = z.object({
  segmentId: z.string().min(1),
  plannedStart: z.string().min(1),
  plannedEnd: z.string().min(1),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  completed: z.boolean(),
  notes: z.string(),
});

type FormValues = z.input<typeof formSchema>;
type SubmitValues = z.output<typeof formSchema>;

export function StopSessionDialog({
  children,
  stop,
}: {
  children: React.ReactNode;
  stop?: StopSession;
}) {
  const { data, addStopSession, updateStopSession } = useHifzData();
  const [open, setOpen] = useState(false);
  const generatedId = useId();

  const defaultValues = useMemo<FormValues>(
    () => ({
      segmentId: stop?.segmentId ?? data.segments[0]?.id ?? "segment-1",
      plannedStart: stop?.plannedStart ?? new Date().toISOString().slice(0, 10),
      plannedEnd: stop?.plannedEnd ?? new Date().toISOString().slice(0, 10),
      actualStart: stop?.actualStart ?? "",
      actualEnd: stop?.actualEnd ?? "",
      completed: stop?.completed ?? false,
      notes: stop?.notes ?? "",
    }),
    [data.segments, stop],
  );

  const form = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    const nextStop: StopSession = {
      id: stop?.id ?? `stop-${generatedId.replace(/:/g, "")}`,
      segmentId: values.segmentId,
      plannedStart: values.plannedStart,
      plannedEnd: values.plannedEnd,
      actualStart: values.actualStart || undefined,
      actualEnd: values.actualEnd || undefined,
      completed: values.completed,
      notes: values.notes,
    };

    if (stop) {
      updateStopSession(nextStop);
      toast.success("تم تحديث الوقفة.");
    } else {
      addStopSession(nextStop);
      toast.success("تمت إضافة الوقفة.");
    }

    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{stop ? "تعديل الوقفة" : "وقفة جديدة"}</DialogTitle>
          <DialogDescription>أدخل خطة الوقفة وما إذا كانت اكتملت فعليًا أم لا.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="md:col-span-2">
            <Label htmlFor="segmentId">المقطع</Label>
            <select
              id="segmentId"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              {...form.register("segmentId")}
            >
              {data.segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.label} | {segment.startPage} - {segment.endPage}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="plannedStart">البداية المخططة</Label>
            <Input id="plannedStart" type="date" {...form.register("plannedStart")} />
          </div>
          <div>
            <Label htmlFor="plannedEnd">النهاية المخططة</Label>
            <Input id="plannedEnd" type="date" {...form.register("plannedEnd")} />
          </div>
          <div>
            <Label htmlFor="actualStart">البداية الفعلية</Label>
            <Input id="actualStart" type="date" {...form.register("actualStart")} />
          </div>
          <div>
            <Label htmlFor="actualEnd">النهاية الفعلية</Label>
            <Input id="actualEnd" type="date" {...form.register("actualEnd")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="stop-notes">ملاحظات الوقفة</Label>
            <Textarea id="stop-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("completed")} />
              الوقفة مكتملة
            </label>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">{stop ? "حفظ التعديل" : "إضافة الوقفة"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
