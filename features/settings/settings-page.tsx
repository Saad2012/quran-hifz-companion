"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Cloud, Download, LockKeyhole, LogIn, LogOut, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthSession } from "@/hooks/use-supabase-auth";
import { useHifzData } from "@/hooks/use-hifz-data";
import { persistedAppDataSchema, settingsSchema } from "@/lib/schemas";
import { UserSettings } from "@/types";
import { THEME_LABELS, WEEKDAY_LABELS } from "@/utils/pages";

const AVAILABLE_CHARTS = [
  { id: "cumulative", label: "التراكم" },
  { id: "weekly", label: "أسبوعي" },
  { id: "heatmap", label: "Heatmap" },
  { id: "coverage", label: "التغطية" },
  { id: "forecast", label: "التوقعات" },
  { id: "tests", label: "الاختبارات" },
];

export function SettingsPage() {
  const { cloudSync, data, updateSettings, importData, resetProject, syncNow } = useHifzData();
  const { isConfigured, user, signOut } = useAuthSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResettingProject, setIsResettingProject] = useState(false);
  const form = useForm<UserSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: data.settings,
  });

  useEffect(() => {
    form.reset(data.settings);
  }, [data.settings, form]);

  const memorizationDays = useWatch({ control: form.control, name: "newMemorizationDays" }) ?? [];
  const reviewDays = useWatch({ control: form.control, name: "reviewDays" }) ?? [];
  const preferredCharts = useWatch({ control: form.control, name: "preferredCharts" }) ?? [];
  const ramadanReviewOnly = useWatch({ control: form.control, name: "ramadanReviewOnly" }) ?? false;
  const stopEnabled = useWatch({ control: form.control, name: "stopEnabled" }) ?? false;
  const quickModeEnabled = useWatch({ control: form.control, name: "quickModeEnabled" }) ?? false;

  const toggleDay = (field: "newMemorizationDays" | "reviewDays", day: number) => {
    const current = field === "newMemorizationDays" ? memorizationDays : reviewDays;
    const next = current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((left, right) => left - right);
    form.setValue(field, next, { shouldDirty: true });
  };

  const toggleChart = (chartId: string) => {
    const next = preferredCharts.includes(chartId)
      ? preferredCharts.filter((item) => item !== chartId)
      : [...preferredCharts, chartId];

    form.setValue("preferredCharts", next, { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit((values) => {
    updateSettings(values);
    toast.success("تم حفظ الإعدادات.");
  });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quran-hifz-companion-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = persistedAppDataSchema.parse(parsed);
      importData(payload);
      toast.success("تم استيراد البيانات بنجاح.");
    } catch {
      toast.error("ملف الاستيراد غير صالح.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-8 pb-24 xl:pb-8">
      <PageHeader
        eyebrow="الإعدادات"
        title="خطة مرنة قابلة للتبديل"
        description="يمكنك تعديل أيام الحفظ والمراجعة، عتبة الغياب، الوقفات، طريقة التوزيع، المظهر، والتخزين المحلي من هنا."
      />

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الخطة</CardTitle>
              <CardDescription>هذه الإعدادات تغيّر سلوك المحرك مباشرة.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="targetYears">المدة المستهدفة بالسنوات</Label>
                <Input id="targetYears" type="number" {...form.register("targetYears", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="maxDaysWithoutReview">أقصى غياب للصفحة عن المراجعة</Label>
                <Input id="maxDaysWithoutReview" type="number" {...form.register("maxDaysWithoutReview", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="stopLengthDays">عدد أيام الوقفة</Label>
                <Input id="stopLengthDays" type="number" {...form.register("stopLengthDays", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="reviewSplitMethod">طريقة تقسيم المراجعة</Label>
                <select
                  id="reviewSplitMethod"
                  className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                  {...form.register("reviewSplitMethod")}
                >
                  <option value="auto">تلقائي</option>
                  <option value="weekly">أسبوعي دائمًا</option>
                  <option value="fortnightly">كل 14 يومًا</option>
                </select>
              </div>
              <div className="md:col-span-2 grid gap-3">
                <div className="flex items-center justify-between rounded-[22px] bg-[var(--surface-soft)] px-4 py-3">
                  <div>
                    <p className="font-medium">رمضان مراجعة فقط</p>
                    <p className="text-sm text-[var(--muted-foreground)]">يحوّل الجلسات الرمضانية إلى مراجعة بدل التوسع في الحفظ.</p>
                  </div>
                  <Switch checked={ramadanReviewOnly} onCheckedChange={(value) => form.setValue("ramadanReviewOnly", value)} />
                </div>
                <div className="flex items-center justify-between rounded-[22px] bg-[var(--surface-soft)] px-4 py-3">
                  <div>
                    <p className="font-medium">تفعيل الوقفات</p>
                    <p className="text-sm text-[var(--muted-foreground)]">يمكن تعطيل مفهوم الوقفات مؤقتًا إن لم تحتجه.</p>
                  </div>
                  <Switch checked={stopEnabled} onCheckedChange={(value) => form.setValue("stopEnabled", value)} />
                </div>
                <div className="flex items-center justify-between rounded-[22px] bg-[var(--surface-soft)] px-4 py-3">
                  <div>
                    <p className="font-medium">الوضع السريع</p>
                    <p className="text-sm text-[var(--muted-foreground)]">يهيئ التطبيق لقرارات أسرع وتقليل التفاصيل عند الحاجة.</p>
                  </div>
                  <Switch checked={quickModeEnabled} onCheckedChange={(value) => form.setValue("quickModeEnabled", value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>أيام الحفظ والمراجعة</CardTitle>
              <CardDescription>بدّل الأيام كيفما تشاء بدون كسر بنية التطبيق.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium">أيام الحفظ</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm ${memorizationDays.includes(index) ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-soft)] text-[var(--foreground)]"}`}
                      onClick={() => toggleDay("newMemorizationDays", index)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">أيام المراجعة</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm ${reviewDays.includes(index) ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-soft)] text-[var(--foreground)]"}`}
                      onClick={() => toggleDay("reviewDays", index)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>المظهر والعرض</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="theme">الثيم</Label>
                <select
                  id="theme"
                  className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                  {...form.register("theme")}
                >
                  {Object.entries(THEME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="numerals">شكل الأرقام</Label>
                <select
                  id="numerals"
                  className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                  {...form.register("numerals")}
                >
                  <option value="arabic-indic">عربية هندية</option>
                  <option value="latin">لاتينية</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <p className="mb-3 text-sm font-medium">الرسوم المفضلة</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CHARTS.map((chart) => (
                    <button
                      key={chart.id}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm ${preferredCharts.includes(chart.id) ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-soft)] text-[var(--foreground)]"}`}
                      onClick={() => toggleChart(chart.id)}
                    >
                      {chart.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الحساب والمزامنة</CardTitle>
              <CardDescription>
                تسجيل الدخول يفعّل النسخة السحابية ويحفظ مشروعك بين أجهزتك بدون فقدان النسخة
                المحلية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {user?.email ?? (isConfigured ? "غير مسجّل" : "الوضع المحلي فقط")}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      {cloudSync.message}
                    </p>
                  </div>
                  <Cloud className="mt-1 h-5 w-5 text-[var(--accent-strong)]" />
                </div>
                {cloudSync.lastSyncedAt ? (
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    آخر مزامنة: {new Date(cloudSync.lastSyncedAt).toLocaleString("ar-SA")}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                {isConfigured ? (
                  user ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          void syncNow().then((success) => {
                            if (success) {
                              toast.success("تمت مزامنة بياناتك بنجاح.");
                            } else {
                              toast.error("تعذر إكمال المزامنة الآن.");
                            }
                          });
                        }}
                        disabled={cloudSync.isSyncing}
                      >
                        <Cloud className="h-4 w-4" />
                        {cloudSync.isSyncing ? "جاري المزامنة..." : "مزامنة الآن"}
                      </Button>
                      <Button asChild type="button" variant="secondary">
                        <Link href="/reset-password">
                          <LockKeyhole className="h-4 w-4" />
                          تغيير كلمة المرور
                        </Link>
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => void signOut()}>
                        <LogOut className="h-4 w-4" />
                        تسجيل الخروج
                      </Button>
                    </>
                  ) : (
                    <Button asChild type="button">
                      <Link href="/login">
                        <LogIn className="h-4 w-4" />
                        تسجيل الدخول
                      </Link>
                    </Button>
                  )
                ) : (
                  <div className="text-sm leading-7 text-[var(--muted-foreground)]">
                    أضف متغيرات Supabase في بيئة التشغيل لتفعيل الدخول والمزامنة السحابية.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>البيانات المحلية</CardTitle>
              <CardDescription>النسخة المحلية تبقى الأساس، ويمكن تصديرها أو استيرادها حتى مع وجود مزامنة سحابية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={exportData}>
                  <Download className="h-4 w-4" />
                  تصدير البيانات
                </Button>
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  استيراد البيانات
                </Button>
                <input ref={fileRef} hidden type="file" accept="application/json" onChange={importFile} />
              </div>
              <div className="rounded-[22px] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--muted-foreground)]">
                <p>طبقة التخزين الحالية موجودة في `lib/persistence` ويمكن لاحقًا استبدالها بمزوّد قاعدة بيانات أو مزامنة سحابية.</p>
                <p>صيغة الاستيراد والتصدير تستخدم نفس schema الموثقة في `lib/schemas.ts`.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-200 bg-rose-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
                تصفير المشروع
              </CardTitle>
              <CardDescription>
                هذا الإجراء يبدأ المشروع من الصفر: يمسح الجلسات والاختبارات وملاحظات التجويد
                والوقفات الحالية، مع الإبقاء على إعداداتك العامة كما هي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] bg-white/80 p-4 text-sm leading-7 text-rose-700">
                <p>
                  إذا كنت مسجلًا الدخول فسيتم تحديث النسخة السحابية أيضًا، وبالتالي ستظهر
                  البداية الجديدة نفسها على Vercel وNetlify وأجهزتك الأخرى.
                </p>
              </div>
              <Button type="button" variant="destructive" onClick={() => setResetDialogOpen(true)}>
                <RefreshCcw className="h-4 w-4" />
                تصفير المشروع والبدء من جديد
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit">حفظ الإعدادات</Button>
        </div>
      </form>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد تصفير المشروع</DialogTitle>
            <DialogDescription>
              سيتم مسح كل نشاط المشروع الحالي والبدء من الصفر، بينما تبقى إعداداتك العامة
              مثل الأيام والثيم والأرقام محفوظة.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-[22px] bg-rose-50 p-4 text-sm leading-7 text-rose-700">
            <p>الإجراء يشمل الجلسات والاختبارات وملاحظات التجويد والوقفات، ولا يمكن التراجع عنه إلا عبر ملف تصدير سابق.</p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setResetDialogOpen(false)}
              disabled={isResettingProject}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isResettingProject}
              onClick={() => {
                setIsResettingProject(true);
                void resetProject({ preserveSettings: true }).then((success) => {
                  setIsResettingProject(false);

                  if (success) {
                    setResetDialogOpen(false);
                    toast.success("تم تصفير المشروع والبدء من جديد.");
                    return;
                  }

                  toast.error("تم التصفير محليًا، لكن تحديث النسخة السحابية لم يكتمل الآن.");
                });
              }}
            >
              {isResettingProject ? "جاري التصفير..." : "نعم، صفّر المشروع"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
