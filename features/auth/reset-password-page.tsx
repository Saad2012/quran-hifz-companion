"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSession } from "@/hooks/use-supabase-auth";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

import { AuthShell } from "./auth-shell";

interface ResetPasswordPageProps {
  initialMessage?: string;
}

export function ResetPasswordPage({ initialMessage }: ResetPasswordPageProps) {
  const router = useRouter();
  const { isLoading, user } = useAuthSession();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!password || !confirmPassword) {
      toast.error("أدخل كلمة المرور الجديدة ثم أكدها.");
      return;
    }

    if (password.length < 8) {
      toast.error("اجعل كلمة المرور ثمانية أحرف على الأقل.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("تأكيد كلمة المرور لا يطابق الكلمة الجديدة.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setPassword("");
      setConfirmPassword("");
      toast.success("تم تحديث كلمة المرور بنجاح. جاري فتح مشروعك.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر تحديث كلمة المرور الآن.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      cardTitle="تعيين كلمة مرور جديدة"
      cardDescription="بعد فتح رابط الاستعادة من بريدك، أدخل كلمة المرور الجديدة هنا ليتم تحديث حسابك."
      message={initialMessage}
      workflowTitle="كيف تتم إعادة التعيين؟"
      workflowSteps={[
        "افتح الرابط الذي وصلك في بريدك الإلكتروني.",
        "إذا تم التحقق من الرابط بنجاح ستظهر لك هذه الشاشة مع جلسة مؤقتة آمنة.",
        "أدخل كلمة مرور جديدة ثم تابع مباشرة إلى مشروعك.",
      ]}
    >
      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center">
          <div className="flex items-center gap-3 rounded-[22px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            جاري التحقق من الجلسة
          </div>
        </div>
      ) : user ? (
        <div className="space-y-4">
          <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-[var(--accent-strong)]" />
              <div>
                <p className="font-medium">سيتم تحديث كلمة المرور لهذا الحساب</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-10"
                placeholder="ثمانية أحرف أو أكثر"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="pr-10"
                placeholder="أعد كتابة الكلمة نفسها"
              />
            </div>
          </div>

          <Button type="button" className="w-full" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                جاري تحديث كلمة المرور
              </>
            ) : (
              "حفظ كلمة المرور الجديدة"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--muted-foreground)]">
            هذه الشاشة تحتاج أن تفتحها من رابط الاستعادة الذي وصلك على البريد الإلكتروني، أو
            من جلسة مسجّل دخولها أصلًا.
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild type="button">
              <Link href="/forgot-password">إرسال رابط استعادة جديد</Link>
            </Button>
            <Button asChild type="button" variant="secondary">
              <Link href="/login">العودة إلى تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
