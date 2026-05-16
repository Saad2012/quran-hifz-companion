"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookMarked,
  CalendarDays,
  CircleHelp,
  ClipboardCheck,
  Cloud,
  CloudOff,
  LayoutDashboard,
  LogOut,
  Menu,
  PlayCircle,
  ScrollText,
  Settings2,
  ShieldAlert,
  Sparkles,
  TestTube2,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthSession } from "@/hooks/use-supabase-auth";
import { useHifzData } from "@/hooks/use-hifz-data";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/new-design", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/new-design/sessions", label: "الجلسات", icon: ScrollText },
  { href: "/new-design/review", label: "مراجعة اليوم", icon: Sparkles },
  { href: "/new-design/focus", label: "وضع التركيز", icon: PlayCircle },
  { href: "/new-design/planner", label: "التخطيط", icon: CalendarDays },
  { href: "/new-design/weak-pages", label: "الصفحات الضعيفة", icon: ShieldAlert },
  { href: "/new-design/segments", label: "المقاطع", icon: BookMarked },
  { href: "/new-design/tests", label: "الاختبارات", icon: ClipboardCheck },
  { href: "/new-design/tajweed", label: "التجويد", icon: Waves },
  { href: "/new-design/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/new-design/reports", label: "التقارير", icon: TestTube2 },
  { href: "/new-design/guide", label: "الدليل", icon: CircleHelp },
  { href: "/new-design/settings", label: "الإعدادات", icon: Settings2 },
];

const MOBILE_PRIMARY_ITEMS = NAV_ITEMS.filter((item) =>
  ["/new-design", "/new-design/review", "/new-design/focus", "/new-design/sessions"].includes(item.href),
);
const MOBILE_MORE_ITEMS = NAV_ITEMS.filter(
  (item) => !MOBILE_PRIMARY_ITEMS.some((primary) => primary.href === item.href),
);

export function NewDesignShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cloudSync } = useHifzData();
  const { isConfigured, user, signOut } = useAuthSession();

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#1d2a24]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-l border-[#d8d2c4] bg-[#fffdf9] p-5 xl:block">
          <p className="text-xs text-[#5d6d64]">التصميم الجديد</p>
          <h2 className="mt-1 text-xl font-bold">رفيق حفظ القرآن</h2>
          <div className="mt-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                    active ? "bg-[#0f5f44] text-white" : "text-[#3c5146] hover:bg-[#eef4f0]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-[#d8d2c4] bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">الحساب والمزامنة</p>
                <p className="mt-1 text-xs text-[#5c6d63]">{user?.email ?? (isConfigured ? "لم يتم تسجيل الدخول بعد." : "الوضع المحلي فقط.")}</p>
              </div>
              {cloudSync.isConfigured && cloudSync.isAuthenticated ? <Cloud className="h-4 w-4 text-[#0f5f44]" /> : <CloudOff className="h-4 w-4 text-[#76877d]" />}
            </div>
            <p className="mt-2 text-xs text-[#5c6d63]">{cloudSync.message}</p>
            <div className="mt-3 flex gap-2">
              {cloudSync.isConfigured ? user ? (
                <Button type="button" size="sm" variant="secondary" onClick={() => void signOut()}><LogOut className="h-4 w-4" />خروج</Button>
              ) : (
                <Button asChild size="sm" variant="secondary"><Link href="/login">دخول</Link></Button>
              ) : (
                <Button asChild size="sm" variant="secondary"><Link href="/settings">تفاصيل</Link></Button>
              )}
            </div>
          </div>

          <Link href="/" className="mt-4 inline-flex rounded-lg border border-[#c7b89a] bg-[#f7efdf] px-3 py-2 text-sm">العودة للتصميم الحالي</Link>
          <Link href="/new-design/preview" className="mt-2 inline-flex rounded-lg border border-[#d8d2c4] px-3 py-2 text-sm">عرض صفحة الهوية</Link>
        </aside>

        <div className="min-w-0 flex-1 pb-24 xl:pb-0">
          <header className="sticky top-0 z-10 border-b border-[#d8d2c4] bg-[#fffdf9]/85 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-base font-semibold">التصميم الجديد (تجريبي)</h1>
              <Link href="/" className="rounded-lg border border-[#c7b89a] bg-[#f7efdf] px-3 py-1.5 text-sm">التصميم الحالي</Link>
            </div>
          </header>
          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-2 rounded-[28px] border border-[#d8d2c4] bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl xl:hidden">
        {MOBILE_PRIMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px]", active ? "bg-[#0f5f44] text-white" : "text-[#5f7067]")}>
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger asChild>
            <button type="button" className={cn("flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px]", MOBILE_MORE_ITEMS.some((item) => pathname === item.href) ? "bg-[#0f5f44] text-white" : "text-[#5f7067]")}>
              <Menu className="mb-1 h-4 w-4" />المزيد
            </button>
          </DialogTrigger>
          <DialogContent className="top-auto bottom-3 right-1/2 max-h-[82vh] w-[min(94vw,720px)] translate-x-1/2 translate-y-0 overflow-y-auto rounded-[30px] p-5">
            <DialogHeader>
              <DialogTitle>كل أقسام المشروع</DialogTitle>
              <DialogDescription>وصول سريع لبقية الصفحات داخل التصميم الجديد.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 sm:grid-cols-2">
              {MOBILE_MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition", active ? "border-[#0f5f44] bg-[#edf3ef]" : "border-[#d8d2c4] bg-white")}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  );
}
