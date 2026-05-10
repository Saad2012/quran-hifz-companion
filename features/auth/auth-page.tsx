"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

import { AuthShell } from "./auth-shell";

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
    <AuthShell
      cardTitle="تسجيل الدخول"
      cardDescription="أدخل بريدك وكلمة المرور. يمكنك أيضًا إنشاء حساب جديد من نفس المكان."
      message={initialMessage}
    >
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
          <div className="flex items-center justify-between gap-3 text-sm">
            <Link
              href="/forgot-password"
              className="text-[var(--accent-strong)] underline-offset-4 hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
            <span className="text-[var(--muted-foreground)]">سنرسل لك رابط استعادة آمن</span>
          </div>
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
    </AuthShell>
  );
}
