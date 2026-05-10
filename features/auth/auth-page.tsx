"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Cloud, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

interface AuthPageProps {
  initialMessage?: string;
}

export function AuthPage({ initialMessage }: AuthPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("أدخل البريد الإلكتروني وكلمة المرور أولًا.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getBrowserSupabaseClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }

        toast.success("تم تسجيل الدخول بنجاح. جاري فتح مشروعك.");
        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success("تم إنشاء الحساب وتسجيل دخولك مباشرة.");
        router.replace("/");
        router.refresh();
        return;
      }

      toast.success("تم إنشاء الحساب. افتح رسالة البريد ثم اضغط رابط التفعيل لإكمال الدخول.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر إكمال الطلب. حاول مرة أخرى.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    سحابية آمنة من تقدمك، جلساتك، اختباراتك، وإعداداتك حتى لا تضيع إذا
                    بدّلت الجهاز أو أعدت تثبيت المتصفح.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-5">
                  <Cloud className="h-5 w-5 text-[var(--accent-strong)]" />
                  <p className="mt-4 text-sm font-semibold">مزامنة فعلية</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    أحدث نسخة من بياناتك تُرفع تلقائيًا للسحابة وتعود لك عند الدخول من أي
                    جهاز.
                  </p>
                </div>
                <div className="rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-5">
                  <LockKeyhole className="h-5 w-5 text-[var(--accent-strong)]" />
                  <p className="mt-4 text-sm font-semibold">حساب شخصي</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    لكل مستخدم نسخة خاصة به فقط، مع صلاحيات قاعدة بيانات تمنع الوصول لبيانات
                    الآخرين.
                  </p>
                </div>
                <div className="rounded-[26px] border border-[var(--border)] bg-[var(--card)] p-5">
                  <AlertCircle className="h-5 w-5 text-[var(--accent-strong)]" />
                  <p className="mt-4 text-sm font-semibold">استرجاع سريع</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    إذا تعطل الجهاز أو اختفى التخزين المحلي، تستطيع متابعة مشروعك من آخر
                    نسخة سحابية متاحة.
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <p className="text-sm font-semibold">كيف يعمل الدخول هنا؟</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  <li>تسجّل بحساب بريد إلكتروني وكلمة مرور.</li>
                  <li>بعد التفعيل، يحمّل التطبيق أحدث نسخة بين جهازك والسحابة.</li>
                  <li>بعدها تبقى كل تعديلاتك محفوظة محليًا ومرفوعة تلقائيًا أيضًا.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[rgba(255,255,255,0.9)] shadow-[0_20px_70px_rgba(17,24,39,0.1)] backdrop-blur-xl">
            <CardHeader className="space-y-3 pb-0">
              <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
              <CardDescription className="text-sm leading-7">
                أدخل بريدك وكلمة المرور. يمكنك أيضًا إنشاء حساب جديد من نفس المكان.
              </CardDescription>
              {initialMessage ? (
                <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
                  {initialMessage}
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs
                defaultValue="signin"
                value={mode}
                onValueChange={(value) => setMode(value as "signin" | "signup")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">دخول</TabsTrigger>
                  <TabsTrigger value="signup">حساب جديد</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="pr-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">كلمة المرور</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
                      <Input
                        id="signin-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="pr-10"
                        placeholder="********"
                      />
                    </div>
                  </div>
                  <Button type="button" className="w-full" onClick={submit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        جاري التحقق
                      </>
                    ) : (
                      "دخول إلى المشروع"
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="pr-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="pr-10"
                        placeholder="ثمانية أحرف أو أكثر"
                      />
                    </div>
                  </div>
                  <Button type="button" className="w-full" onClick={submit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        جاري إنشاء الحساب
                      </>
                    ) : (
                      "إنشاء حساب وتفعيل المزامنة"
                    )}
                  </Button>
                  <p className="text-xs leading-6 text-[var(--muted-foreground)]">
                    قد يرسل Supabase رسالة تفعيل إلى بريدك قبل تفعيل الجلسة نهائيًا، بحسب إعدادات
                    المشروع.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
