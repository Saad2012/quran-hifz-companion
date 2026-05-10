import { AlertCircle, Cloud, LockKeyhole } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
  cardTitle: string;
  cardDescription: string;
  children: React.ReactNode;
  message?: string;
  messageTone?: "warning" | "success";
  workflowTitle?: string;
  workflowSteps?: string[];
}

const VALUE_CARDS = [
  {
    title: "مزامنة فعلية",
    description:
      "أحدث نسخة من بياناتك تُرفع تلقائيًا للسحابة وتعود لك عند الدخول من أي جهاز.",
    icon: Cloud,
  },
  {
    title: "حساب شخصي",
    description:
      "لكل مستخدم نسخة خاصة به فقط، مع صلاحيات قاعدة بيانات تمنع الوصول لبيانات الآخرين.",
    icon: LockKeyhole,
  },
  {
    title: "استرجاع سريع",
    description:
      "إذا تعطل الجهاز أو اختفى التخزين المحلي، تستطيع متابعة مشروعك من آخر نسخة سحابية متاحة.",
    icon: AlertCircle,
  },
];

const MESSAGE_TONE_STYLES = {
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
} as const;

export function AuthShell({
  cardTitle,
  cardDescription,
  children,
  message,
  messageTone = "warning",
  workflowTitle = "كيف يعمل الدخول هنا؟",
  workflowSteps = [
    "تسجّل بحساب بريد إلكتروني وكلمة مرور.",
    "بعد التفعيل، يحمّل التطبيق أحدث نسخة بين جهازك والسحابة.",
    "بعدها تبقى كل تعديلاتك محفوظة محليًا ومرفوعة تلقائيًا أيضًا.",
  ],
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,129,86,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(86,133,159,0.16),transparent_30%),linear-gradient(180deg,var(--background),var(--surface))]" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-[var(--border)] bg-[rgba(255,255,255,0.78)] shadow-[0_24px_80px_rgba(17,24,39,0.12)] backdrop-blur-xl">
            <CardContent className="grid gap-8 p-8 md:p-10">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.32em] text-[var(--muted-foreground)]">
                  QURAN HIFZ COMPANION
                </p>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                    دخول هادئ لمشروع حفظك، مع مزامنة بين أجهزتك
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
                    بعد تسجيل الدخول سيبقى التطبيق local-first في سلوكه، لكنه سيحفظ نسخة
                    سحابية آمنة من تقدمك، جلساتك، اختباراتك، وإعداداتك حتى لا تضيع إذا بدّلت
                    الجهاز أو أعدت تثبيت المتصفح.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {VALUE_CARDS.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-5"
                  >
                    <Icon className="h-5 w-5 text-[var(--accent-strong)]" />
                    <p className="mt-4 text-sm font-semibold">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-[30px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <p className="text-sm font-semibold">{workflowTitle}</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  {workflowSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[rgba(255,255,255,0.9)] shadow-[0_20px_70px_rgba(17,24,39,0.1)] backdrop-blur-xl">
            <CardHeader className="space-y-3 pb-0">
              <CardTitle className="text-2xl">{cardTitle}</CardTitle>
              <CardDescription className="text-sm leading-7">{cardDescription}</CardDescription>
              {message ? (
                <div
                  className={`rounded-[22px] border px-4 py-3 text-sm leading-7 ${MESSAGE_TONE_STYLES[messageTone]}`}
                >
                  {message}
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="pt-6">{children}</CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
