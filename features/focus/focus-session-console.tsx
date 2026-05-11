"use client";

import { useMemo } from "react";
import { Minus, Pause, Play, RotateCcw, Save, TimerReset } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFocusSession } from "@/hooks/use-focus-session";
import { useHifzData } from "@/hooks/use-hifz-data";
import { Session, SessionType } from "@/types";
import { formatMinutes, SESSION_TYPE_LABELS, toDigitSystem } from "@/utils/pages";

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
  return globalThis.crypto?.randomUUID?.() ?? `focus-session-${Date.now()}`;
}

function formatClock(totalMs: number, numerals: "arabic-indic" | "latin") {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return toDigitSystem(`${hours}:${minutes}:${seconds}`, numerals);
}

export interface FocusPreset {
  id: string;
  label: string;
  helper: string;
  sessionType: SessionType;
  startPage: number;
  endPage: number;
  durationMinutes: number;
  notes: string;
  weakPagesText?: string;
  tagsText?: string;
  optionalSurahLabel?: string;
  optionalJuzApprox?: string;
}

export function FocusSessionConsole({ presets }: { presets: FocusPreset[] }) {
  const { addSession, data } = useHifzData();
  const {
    draft,
    isHydrated,
    elapsedMs,
    elapsedMinutes,
    incrementRepetitions,
    pause,
    resetDraft,
    resetTimer,
    start,
    updateDraft,
    applyPreset,
  } = useFocusSession();

  const effectiveMinutes = useMemo(
    () => Math.max(draft.durationMinutes, elapsedMinutes || 0),
    [draft.durationMinutes, elapsedMinutes],
  );

  if (!isHydrated) {
    return (
      <Card>
        <CardContent className="pt-6">جار تجهيز جلسة التركيز على هذا الجهاز...</CardContent>
      </Card>
    );
  }

  const saveSession = () => {
    if (draft.endPage < draft.startPage) {
      toast.error("تأكد أن نهاية الصفحات بعد البداية.");
      return;
    }

    const nowStamp = new Date().toISOString();
    const record: Session = {
      id: createSessionId(),
      date: draft.date,
      sessionType: draft.sessionType,
      startPage: draft.startPage,
      endPage: draft.endPage,
      pagesCount: draft.endPage - draft.startPage + 1,
      durationMinutes: effectiveMinutes,
      repetitions: draft.repetitions,
      qualityRating: draft.qualityRating,
      difficultyRating: draft.difficultyRating,
      withTeacher: draft.withTeacher,
      tested: draft.tested,
      optionalSurahLabel: draft.optionalSurahLabel || undefined,
      optionalJuzApprox: draft.optionalJuzApprox ? Number(draft.optionalJuzApprox) : undefined,
      notes: draft.notes,
      weakPagesDiscovered: parseNumbers(draft.weakPagesText),
      tags: parseTags(draft.tagsText),
      reviewedFromMemory: draft.reviewedFromMemory,
      createdAt: nowStamp,
      updatedAt: nowStamp,
    };

    addSession(record);
    toast.success("تم حفظ الجلسة من وضع التركيز.");
    resetDraft();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[var(--border)] bg-[rgba(255,255,255,0.55)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>لوحة الجلسة المركزة</CardTitle>
            <CardDescription>
              شغّل المؤقت، عد التكرارات، ثم احفظ الجلسة مباشرة دون التنقل بين نوافذ كثيرة.
            </CardDescription>
          </div>
          <Badge variant="accent">{draft.isRunning ? "الجلسة جارية" : "جاهز للبدء"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[28px] bg-[var(--surface-soft)] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">المؤقت الحالي</p>
                <p className="mt-2 text-4xl font-semibold tracking-[0.08em] md:text-5xl">
                  {formatClock(elapsedMs, data.settings.numerals)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  ستُحفظ الجلسة بمدة {formatMinutes(effectiveMinutes, data.settings.numerals)}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.isRunning ? (
                  <Button type="button" variant="secondary" onClick={pause}>
                    <Pause className="h-4 w-4" />
                    إيقاف مؤقت
                  </Button>
                ) : (
                  <Button type="button" onClick={start}>
                    <Play className="h-4 w-4" />
                    {elapsedMs ? "استئناف" : "ابدأ الآن"}
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={resetTimer}>
                  <TimerReset className="h-4 w-4" />
                  تصفير العداد
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] p-5 md:p-6">
            <p className="text-sm text-[var(--muted-foreground)]">عداد التكرارات</p>
            <p className="mt-2 text-4xl font-semibold md:text-5xl">
              {toDigitSystem(draft.repetitions, data.settings.numerals)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              مناسب جدًا على الهاتف أثناء الترديد أو التسميع.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <Button type="button" variant="secondary" onClick={() => incrementRepetitions(-1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button type="button" onClick={() => incrementRepetitions(1)}>
                +1
              </Button>
              <Button type="button" onClick={() => incrementRepetitions(3)}>
                +3
              </Button>
              <Button type="button" onClick={() => incrementRepetitions(5)}>
                +5
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">تحميل اقتراح جاهز</p>
            <p className="text-xs text-[var(--muted-foreground)]">لتقليل الكتابة والبدء السريع</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-4 text-right transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
                onClick={() =>
                  applyPreset({
                    sessionType: preset.sessionType,
                    startPage: preset.startPage,
                    endPage: preset.endPage,
                    durationMinutes: preset.durationMinutes,
                    notes: preset.notes,
                    weakPagesText: preset.weakPagesText ?? "",
                    tagsText: preset.tagsText ?? "",
                    optionalSurahLabel: preset.optionalSurahLabel ?? "",
                    optionalJuzApprox: preset.optionalJuzApprox ?? "",
                  })
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge>{SESSION_TYPE_LABELS[preset.sessionType]}</Badge>
                  <Badge variant="accent">{formatMinutes(preset.durationMinutes, data.settings.numerals)}</Badge>
                </div>
                <p className="mt-3 font-semibold">{preset.label}</p>
                <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">{preset.helper}</p>
                <p className="mt-3 text-sm">
                  ص {toDigitSystem(preset.startPage, data.settings.numerals)} - {toDigitSystem(preset.endPage, data.settings.numerals)}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="focus-date">التاريخ</Label>
            <Input
              id="focus-date"
              type="date"
              value={draft.date}
              onChange={(event) => updateDraft({ date: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="focus-type">نوع الجلسة</Label>
            <select
              id="focus-type"
              className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
              value={draft.sessionType}
              onChange={(event) => updateDraft({ sessionType: event.target.value as SessionType })}
            >
              {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="focus-start">من صفحة</Label>
            <Input
              id="focus-start"
              type="number"
              value={draft.startPage}
              onChange={(event) => updateDraft({ startPage: Number(event.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="focus-end">إلى صفحة</Label>
            <Input
              id="focus-end"
              type="number"
              value={draft.endPage}
              onChange={(event) => updateDraft({ endPage: Number(event.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="focus-minutes">المدة الافتراضية عند عدم تشغيل المؤقت</Label>
            <Input
              id="focus-minutes"
              type="number"
              value={draft.durationMinutes}
              onChange={(event) => updateDraft({ durationMinutes: Number(event.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="focus-surah">السورة تقريبيًا</Label>
            <Input
              id="focus-surah"
              value={draft.optionalSurahLabel}
              onChange={(event) => updateDraft({ optionalSurahLabel: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="focus-juz">الجزء تقريبيًا</Label>
            <Input
              id="focus-juz"
              value={draft.optionalJuzApprox}
              onChange={(event) => updateDraft({ optionalJuzApprox: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="focus-weak">صفحات الضعف المكتشفة</Label>
            <Input
              id="focus-weak"
              placeholder="مثال: 34، 35"
              value={draft.weakPagesText}
              onChange={(event) => updateDraft({ weakPagesText: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="focus-quality">الجودة 1-5</Label>
            <Input
              id="focus-quality"
              type="number"
              min={1}
              max={5}
              value={draft.qualityRating}
              onChange={(event) => updateDraft({ qualityRating: Number(event.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="focus-difficulty">الصعوبة 1-5</Label>
            <Input
              id="focus-difficulty"
              type="number"
              min={1}
              max={5}
              value={draft.difficultyRating}
              onChange={(event) => updateDraft({ difficultyRating: Number(event.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="focus-tags">وسوم الجلسة</Label>
            <Input
              id="focus-tags"
              placeholder="مثال: تعافٍ، فجري، معلم"
              value={draft.tagsText}
              onChange={(event) => updateDraft({ tagsText: event.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="focus-notes">ملاحظات سريعة</Label>
            <Textarea
              id="focus-notes"
              value={draft.notes}
              onChange={(event) => updateDraft({ notes: event.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.5)] p-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.withTeacher}
              onChange={(event) => updateDraft({ withTeacher: event.target.checked })}
            />
            مع معلّم
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.tested}
              onChange={(event) => updateDraft({ tested: event.target.checked })}
            />
            فيها اختبار
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.reviewedFromMemory}
              onChange={(event) => updateDraft({ reviewedFromMemory: event.target.checked })}
            />
            من الذاكرة
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetDraft}>
            <RotateCcw className="h-4 w-4" />
            مسح لوحة التركيز
          </Button>
          <Button type="button" onClick={saveSession}>
            <Save className="h-4 w-4" />
            حفظ الجلسة الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
