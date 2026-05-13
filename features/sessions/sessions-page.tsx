"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { SessionType } from "@/types";
import { formatDateLabel } from "@/utils/date";
import { formatMinutes, SESSION_TYPE_LABELS, toDigitSystem } from "@/utils/pages";

export function SessionsPage() {
  const { data, removeSession } = useHifzData();
  const [search, setSearch] = useState("");
  const [sessionType, setSessionType] = useState<SessionType | "all">("all");

  const sessions = useMemo(() => {
    return [...data.sessions]
      .sort((left, right) => right.date.localeCompare(left.date))
      .filter((session) => {
        const matchesType = sessionType === "all" || session.sessionType === sessionType;
        const haystack = [
          session.notes,
          session.optionalSurahLabel,
          session.tags.join(" "),
          session.startPage,
          session.endPage,
        ]
          .join(" ")
          .toLowerCase();

        return matchesType && haystack.includes(search.toLowerCase());
      });
  }, [data.sessions, search, sessionType]);

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="الجلسات"
        title="كل ما تم فعله زمنيًا"
        description="هنا تدير جلسات الحفظ والمراجعة والاختبارات والوقفات من مكان واحد مع بحث وتصفية وتعديل سريع."
        action={
          <SessionFormDialog>
            <Button>إضافة جلسة</Button>
          </SessionFormDialog>
        }
      />

      <Card>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-[1fr,220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              className="pr-11"
              placeholder="ابحث في الملاحظات، الوسوم، أو الصفحات"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
            value={sessionType}
            onChange={(event) => setSessionType(event.target.value as SessionType | "all")}
          >
            <option value="all">كل الأنواع</option>
            {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {sessions.length ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={`${session.id}-${session.updatedAt}`}>
              <CardContent className="pt-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">{SESSION_TYPE_LABELS[session.sessionType]}</Badge>
                      <Badge>{formatDateLabel(session.date, "EEEE d MMM")}</Badge>
                      {session.tested ? <Badge variant="warning">دخلت اختبارًا</Badge> : null}
                      {session.withTeacher ? <Badge variant="success">مع معلّم</Badge> : null}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        ص {toDigitSystem(session.startPage, data.settings.numerals)} - {toDigitSystem(session.endPage, data.settings.numerals)}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">
                        {session.notes || "لا توجد ملاحظات."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-[var(--muted-foreground)]">
                      <span>{toDigitSystem(session.pagesCount, data.settings.numerals)} صفحات</span>
                      <span>•</span>
                      <span>{formatMinutes(session.durationMinutes, data.settings.numerals)}</span>
                      <span>•</span>
                      <span>تكرار {toDigitSystem(session.repetitions, data.settings.numerals)}</span>
                      <span>•</span>
                      <span>جودة {toDigitSystem(session.qualityRating, data.settings.numerals)}/5</span>
                    </div>
                    {session.tags.length ? (
                      <div className="flex flex-wrap gap-2">
                        {session.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <SessionFormDialog session={session}>
                      <Button variant="secondary">تعديل</Button>
                    </SessionFormDialog>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        removeSession(session.id);
                        toast.success("تم حذف الجلسة.");
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
      ) : (
        <EmptyState
          title="لا توجد جلسات مطابقة"
          description="جرّب توسيع البحث أو غيّر الفلتر، أو أضف جلسة جديدة لتبدأ السجل الزمني."
          icon={Search}
        />
      )}
    </div>
  );
}
