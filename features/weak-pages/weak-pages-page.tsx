"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Search, ShieldAlert, Syringe, TimerReset } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SessionFormDialog } from "@/features/sessions/session-form-dialog";
import { useHifzData } from "@/hooks/use-hifz-data";
import { formatDateLabel } from "@/utils/date";
import { formatPageRange, STATUS_LABELS, toDigitSystem } from "@/utils/pages";

type FilterMode = "all" | "overdue" | "critical" | "weak";

function badgeVariant(status: FilterMode | "overdue" | "critical" | "weak") {
  if (status === "overdue") return "danger";
  if (status === "critical") return "warning";
  if (status === "weak") return "default";
  return "accent";
}

export function WeakPagesPage() {
  const { data, derived } = useHifzData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const insights = derived.weakPageInsights;

  const filteredInsights = useMemo(() => {
    const text = query.trim().toLowerCase();

    return insights.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      const haystack = `${item.pageNumber} ${item.surahLabel} ${item.reasons.join(" ")} ${item.recentSessionNotes.join(" ")}`.toLowerCase();
      return matchesFilter && (!text || haystack.includes(text));
    });
  }, [filter, insights, query]);

  const topRescuePages = insights.slice(0, 6).map((item) => item.pageNumber);

  if (!insights.length) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="الصفحات الضعيفة"
          title="مركز علاج الصفحات الحساسة"
          description="عندما يظهر ضعف أو حرج أو تأخر، ستجده هنا مع سبب واضح وخطوة علاج مقترحة."
          action={
            <Button asChild>
              <Link href="/review">افتح مراجعة اليوم</Link>
            </Button>
          }
        />
        <EmptyState
          title="لا توجد صفحات ضعيفة الآن"
          description="الوضع ممتاز حاليًا. يمكنك التركيز على دورة المراجعة العادية أو الحفظ الجديد بدون وجود طابور ضعف بارز."
          icon={ShieldAlert}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="الصفحات الضعيفة"
        title="مكان واحد لعلاج مواضع الضعف"
        description="هذه الشاشة تجمع الصفحات الضعيفة والحرجة والمتأخرة، وتوضح لك لماذا ظهرت، وما الذي يُستحسن فعله معها الآن."
        action={
          <SessionFormDialog
            preset={{
              sessionType: "review",
              startPage: topRescuePages[0] ?? 1,
              endPage: topRescuePages.at(-1) ?? topRescuePages[0] ?? 1,
            }}
          >
            <Button>جلسة إنقاذ سريعة</Button>
          </SessionFormDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الصفحات الحساسة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{toDigitSystem(insights.length, data.settings.numerals)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>متأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-rose-600">
              {toDigitSystem(insights.filter((item) => item.status === "overdue").length, data.settings.numerals)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>حرجة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">
              {toDigitSystem(insights.filter((item) => item.status === "critical").length, data.settings.numerals)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>أعلى صفحة تكرّر فيها الضعف</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {toDigitSystem(insights[0]?.pageNumber ?? 1, data.settings.numerals)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{insights[0]?.surahLabel ?? "غير متاح"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-[1fr,auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              className="pr-11"
              placeholder="ابحث برقم الصفحة أو السورة أو السبب"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "overdue", "critical", "weak"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`rounded-full px-4 py-2 text-sm ${filter === mode ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-soft)] text-[var(--foreground)]"}`}
                onClick={() => setFilter(mode)}
              >
                {mode === "all"
                  ? "الكل"
                  : mode === "overdue"
                    ? "متأخرة"
                    : mode === "critical"
                      ? "حرجة"
                      : "ضعيفة"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredInsights.map((item) => (
          <Card key={item.pageNumber}>
            <CardContent className="pt-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badgeVariant(item.status)}>{STATUS_LABELS[item.status]}</Badge>
                    <Badge variant="default">ص {toDigitSystem(item.pageNumber, data.settings.numerals)}</Badge>
                    <Badge variant="default">{item.surahLabel}</Badge>
                    <Badge variant="default">الجزء {toDigitSystem(item.juzApprox, data.settings.numerals)}</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      الصفحة {toDigitSystem(item.pageNumber, data.settings.numerals)} | قوة {toDigitSystem(item.strengthScore, data.settings.numerals)}/100
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.recommendedAction}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[20px] bg-[var(--surface-soft)] p-4 text-sm">
                      <p className="text-[var(--muted-foreground)]">آخر مراجعة</p>
                      <p className="mt-2 font-semibold">
                        {item.lastReviewedAt ? formatDateLabel(item.lastReviewedAt, "d MMM yyyy") : "غير موجودة"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        منذ {toDigitSystem(item.daysSinceLastReview, data.settings.numerals)} يومًا
                      </p>
                    </div>
                    <div className="rounded-[20px] bg-[var(--surface-soft)] p-4 text-sm">
                      <p className="text-[var(--muted-foreground)]">مرات المرور</p>
                      <p className="mt-2 font-semibold">{toDigitSystem(item.totalReviewCount, data.settings.numerals)}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">مراجعات واختبارات شملت الصفحة</p>
                    </div>
                    <div className="rounded-[20px] bg-[var(--surface-soft)] p-4 text-sm">
                      <p className="text-[var(--muted-foreground)]">مرات الضعف</p>
                      <p className="mt-2 font-semibold">{toDigitSystem(item.totalWeakCount, data.settings.numerals)}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">كم مرة ظهرت في قوائم الضعف</p>
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--border)] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p className="font-semibold">لماذا هي هنا؟</p>
                    </div>
                    <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      {item.reasons.map((reason) => (
                        <p key={reason}>{reason}</p>
                      ))}
                    </div>
                  </div>
                  {item.recentSessionNotes.length ? (
                    <div className="rounded-[20px] border border-[var(--border)] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <TimerReset className="h-4 w-4 text-[var(--accent-strong)]" />
                        <p className="font-semibold">آخر الملاحظات المرتبطة بها</p>
                      </div>
                      <div className="space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
                        {item.recentSessionNotes.map((note) => (
                          <p key={note}>{note}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex w-full max-w-[260px] flex-col gap-3">
                  <SessionFormDialog
                    preset={{
                      sessionType: "review",
                      startPage: item.pageNumber,
                      endPage: item.pageNumber,
                      notes: `جلسة علاج للصفحة ${item.pageNumber}`,
                    }}
                  >
                    <Button className="w-full">سجّل مراجعة لها</Button>
                  </SessionFormDialog>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/review">أدرجها في مراجعة اليوم</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/tests">سجّل اختبارًا لها</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-emerald-600" />
              باقة علاج سريعة
            </CardTitle>
            <CardDescription>
              إذا أردت خطوة عملية واحدة الآن، فابدأ بهذه الصفحات: {formatPageRange(topRescuePages, data.settings.numerals)}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
