"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookMarked,
  CalendarDays,
  CircleHelp,
  Cloud,
  CloudOff,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings2,
  ShieldAlert,
  Sparkles,
  TestTube2,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-supabase-auth";
import { useHifzData } from "@/hooks/use-hifz-data";
import { cn } from "@/utils/cn";
import { formatDateLabel } from "@/utils/date";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/sessions", label: "الجلسات", icon: ScrollText },
  { href: "/review", label: "مراجعة اليوم", icon: Sparkles },
  { href: "/planner", label: "التخطيط الأسبوعي", icon: CalendarDays },
  { href: "/weak-pages", label: "الصفحات الضعيفة", icon: ShieldAlert },
  { href: "/segments", label: "المقاطع", icon: BookMarked },
  { href: "/tests", label: "الاختبارات", icon: ClipboardCheck },
  { href: "/tajweed", label: "التجويد", icon: Waves },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/reports", label: "التقارير", icon: TestTube2 },
  { href: "/guide", label: "الدليل", icon: CircleHelp },
  { href: "/settings", label: "الإعدادات", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cloudSync, derived } = useHifzData();
  const { isConfigured, user, signOut } = useAuthSession();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,138,102,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(87,129,160,0.12),transparent_30%),linear-gradient(180deg,var(--background),var(--surface))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 border-l border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-6 backdrop-blur-xl xl:flex xl:flex-col">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold tracking-[0.32em] text-[var(--muted-foreground)]">QURAN HIFZ COMPANION</p>
            <h2 className="text-2xl font-semibold">رفيق حفظ القرآن</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              لوحة عربية هادئة لمشروع حفظ طويل المدى مع مراجعة، اختبارات، وتقارير.
            </p>
          </div>
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-[0_12px_28px_rgba(20,26,38,0.08)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">حجم المراجعة القادم</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent-strong)]">
              {derived.dashboard.todayReviewPages}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              صفحة مقترحة لمراجعة اليوم مع وضع {derived.reviewEngine.recommendedMode === "light" ? "خفيف" : derived.reviewEngine.recommendedMode === "normal" ? "عادي" : "موسع"}.
            </p>
          </div>
          <div className="mt-4 rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">الحساب والمزامنة</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  {user?.email ?? (isConfigured ? "لم يتم تسجيل الدخول بعد." : "الوضع المحلي فقط.")}
                </p>
              </div>
              {cloudSync.isConfigured && cloudSync.isAuthenticated ? (
                <Cloud className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
              ) : (
                <CloudOff className="mt-1 h-4 w-4 text-[var(--muted-foreground)]" />
              )}
            </div>
            <p className="mt-3 text-xs leading-6 text-[var(--muted-foreground)]">
              {cloudSync.message}
            </p>
            <div className="mt-4 flex gap-2">
              {cloudSync.isConfigured ? (
                user ? (
                  <Button type="button" variant="secondary" size="sm" onClick={() => void signOut()}>
                    <LogOut className="h-4 w-4" />
                    خروج
                  </Button>
                ) : (
                  <Button asChild type="button" variant="secondary" size="sm">
                    <Link href="/login">دخول</Link>
                  </Button>
                )
              ) : (
                <Button asChild type="button" variant="secondary" size="sm">
                  <Link href="/settings">تفاصيل أكثر</Link>
                </Button>
              )}
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(249,247,243,0.7)] px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">اليوم {formatDateLabel(new Date().toISOString().slice(0, 10), "EEEE d MMMM")}</p>
                <h1 className="text-xl font-semibold">المشروع في {derived.dashboard.currentSurah}</h1>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "whitespace-nowrap rounded-full px-4 py-2 text-sm",
                        active ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-soft)] text-[var(--foreground)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-2 rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl xl:hidden">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px]",
                active ? "bg-[var(--accent)] text-white" : "text-[var(--muted-foreground)]",
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
