"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpenText,
  Compass,
  HelpCircle,
  ListChecks,
  Route,
  Search,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHifzData } from "@/hooks/use-hifz-data";
import {
  AUTO_CALCULATIONS,
  DAILY_FLOW,
  GLOSSARY,
  GUIDE_FAQS,
  QUICK_ACTIONS,
} from "@/features/guide/content";
import { PageInspector } from "@/features/guide/page-inspector";
import { toDigitSystem } from "@/utils/pages";

export function GuidePage() {
  const { data, derived } = useHifzData();
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return GUIDE_FAQS;
    }

    return GUIDE_FAQS.filter((item) =>
      `${item.question} ${item.answer}`.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="الدليل"
        title="شرح البرنامج بالكامل داخل التطبيق"
        description="هذه الصفحة صُممت لتكون مرجع المستخدم: كيف يعمل البرنامج، كيف تستخدمه يوميًا، كيف تفهم الأرقام، وكيف تجد إجابات سريعة لأي سؤال شائع."
      />

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5 p-6 md:p-8">
            <Badge variant="accent">مرجع الاستخدام اليومي</Badge>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              التطبيق يسير بهذا الترتيب: تسجّل، فيحلّل، ثم يرشّح، ثم يوضح
            </h2>
            <p className="max-w-3xl text-sm leading-8 text-[var(--muted-foreground)] md:text-base">
              أنت تُدخل الجلسات والاختبارات والملاحظات. بعدها يحسب التطبيق الصفحة الحالية، وقوة كل صفحة، والصفحات الضعيفة والحرجة، وحجم مراجعة اليوم، والتقارير. لا يوجد شيء سحري مخفي: كل شيء مبني على إدخالك أنت.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">بياناتك</p>
                <p className="mt-2 text-xl font-semibold">جلسات + اختبارات + تجويد</p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">المحرك</p>
                <p className="mt-2 text-xl font-semibold">مراجعة + قوة + أولويات</p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">المخرجات</p>
                <p className="mt-2 text-xl font-semibold">لوحات + رسوم + تقارير</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border)] bg-[rgba(255,255,255,0.55)] p-6 xl:border-r xl:border-t-0">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">مكانك الآن باختصار</p>
                <p className="mt-2 text-2xl font-semibold">
                  الصفحة {toDigitSystem(derived.dashboard.currentPage, data.settings.numerals)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  {derived.dashboard.currentSurah} | المقطع {derived.dashboard.currentSegment?.label ?? "غير محدد"} | المتبقي {toDigitSystem(derived.dashboard.remainingPages, data.settings.numerals)} صفحة
                </p>
              </div>
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-sm text-[var(--muted-foreground)]">إذا كنت مشغولًا</p>
                <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                  استخدم فقط: الرئيسية، مراجعة اليوم، والجلسات. هذا يكفي لتشغيل البرنامج بشكل ممتاز.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href={item.href}>{item.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-strong)]" />
            <CardTitle>أين أجد الأدوات الجديدة؟</CardTitle>
          </div>
          <CardDescription>هذه الإضافات الجديدة تساعدك على اتخاذ القرار بسرعة بدل التنقل العشوائي بين الصفحات.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">زر ماذا أفعل الآن؟</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              تجده في الصفحة الرئيسية، ويعطيك أفضل خطوة تالية مع سببها والشاشة المناسبة لها.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">الصفحات الضعيفة</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              صفحة مستقلة تجمع الصفحات الضعيفة والحرجة والمتأخرة مع علاج مقترح لكل صفحة.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">التخطيط الأسبوعي</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              صفحة تعرض لك الأيام السبعة القادمة وتوزيع الحفظ والمراجعة والاختبارات عليها.
            </p>
          </div>
        </CardContent>
      </Card>

      <PageInspector />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[var(--accent-strong)]" />
              <CardTitle>كيف تستخدم البرنامج يوميًا؟</CardTitle>
            </div>
            <CardDescription>مسار بسيط ومناسب حتى لو أردت أقل قدر من التعقيد.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAILY_FLOW.map((step) => (
              <div key={step.title} className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{step.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-600" />
              <CardTitle>ما الذي يحسبه البرنامج تلقائيًا؟</CardTitle>
            </div>
            <CardDescription>هذه أهم الأمور التي يشتقها التطبيق من بياناتك بعد كل تعديل.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {AUTO_CALCULATIONS.map((item) => (
              <div key={item.title} className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[var(--accent-strong)]" />
                <CardTitle>الأسئلة الشائعة</CardTitle>
              </div>
              <CardDescription>
                ابحث في الأسئلة أو تصفحها يدويًا. هذه الصفحة مخصصة لشرح الاستخدام بلغة واضحة جدًا للمستخدم.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                className="pr-11"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث: حفظ، مراجعة، تكرار، وقفة..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredFaqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <summary className="cursor-pointer list-none text-base font-semibold">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-8 text-[var(--muted-foreground)]">{item.answer}</p>
            </details>
          ))}
          {!filteredFaqs.length ? (
            <div className="rounded-[22px] bg-[var(--surface-soft)] p-5 text-sm text-[var(--muted-foreground)]">
              لا توجد نتيجة مطابقة. جرّب كلمات مثل: حفظ، مراجعة، صفحة، تكرار، رمضان، وقفة.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpenText className="h-4 w-4 text-[var(--accent-strong)]" />
            <CardTitle>قاموس سريع للمصطلحات</CardTitle>
          </div>
          <CardDescription>حتى لا تبقى أي كلمة في الواجهة غامضة على المستخدم.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GLOSSARY.map((item) => (
            <div key={item.term} className="rounded-[20px] bg-[var(--surface-soft)] p-4">
              <h3 className="font-semibold">{item.term}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.meaning}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            <CardTitle>اقتراحات استخدام ممتازة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">إذا أردت البساطة</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              سجّل الجلسات فقط، واترك البرنامج يحسب الصفحة الحالية، والضعف، وحجم المراجعة، والتقارير.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">إذا أردت الدقة العالية</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              اجعل الجلسات أصغر حجمًا، وأدخل الصفحات الضعيفة والملاحظات والمعلم والاختبارات بانتظام.
            </p>
          </div>
          <div className="rounded-[20px] border border-[var(--border)] p-4">
            <h3 className="font-semibold">إذا تغيّر نظامك</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              عدّل الأيام والوقفات وطول الدورة من الإعدادات بدل الاستمرار على إعدادات لم تعد تناسبك.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
