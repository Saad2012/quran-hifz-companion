"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

import { AuthShell } from "./auth-shell";

interface ForgotPasswordPageProps {
  initialMessage?: string;
}

export function ForgotPasswordPage({ initialMessage }: ForgotPasswordPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("أدخل البريد الإلكتروني أولًا.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setLastSentEmail(normalizedEmail);
      toast.success("أرسلنا رابط استعادة كلمة المرور إلى بريدك.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "تعذر إرسال رابط الاستعادة الآن.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      cardTitle="استعادة كلمة المرور"
      cardDescription="أدخل بريدك الإلكتروني وسنرسل لك رابطًا يسمح بفتح شاشة تعيين كلمة مرور جديدة."
      message={initialMessage}
      workflowTitle="كيف تعمل الاستعادة؟"
      workflowSteps={[
        "أدخل البريد الإلكتروني المرتبط بحسابك.",
        "ستصلك رسالة تحتوي على رابط الاستعادة.",
        "بعد فتح الرابط ستنتقل إلى شاشة تعيين كلمة مرور جديدة ثم تعود لمشروعك.",
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recovery-email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pr-10"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {lastSentEmail ? (
          <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-900">
            أُرسل الرابط إلى <span className="font-semibold">{lastSentEmail}</span>. إذا لم تجده،
            فافحص البريد غير المرغوب فيه ثم اطلب الإرسال مرة أخرى عند الحاجة.
          </div>
        ) : (
          <div className="rounded-[22px] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-7 text-[var(--muted-foreground)]">
            سنرسل رابطًا آمنًا لهذا البريد فقط. إذا كان الحساب موجودًا فستصل الرسالة خلال لحظات.
          </div>
        )}

        <Button type="button" className="w-full" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              جاري الإرسال
            </>
          ) : lastSentEmail ? (
            "إرسال الرابط مرة أخرى"
          ) : (
            "إرسال رابط الاستعادة"
          )}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            href="/login"
            className="text-[var(--accent-strong)] underline-offset-4 hover:underline"
          >
            العودة إلى تسجيل الدخول
          </Link>
          <button
            type="button"
            className="text-[var(--muted-foreground)] underline-offset-4 hover:underline"
            onClick={() => router.push("/login")}
          >
            لدي كلمة المرور وأريد الدخول الآن
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
