import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types";

import { getSafeAuthRedirectPath } from "@/lib/supabase/auth-redirect";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = getSafeAuthRedirectPath(
    requestUrl.searchParams.get("next"),
    requestUrl.origin,
    type === "recovery" ? "/reset-password" : "/",
  );

  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();
  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return response;
    }

    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(error.message)}`, requestUrl.origin),
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?message=" +
        encodeURIComponent("رابط التحقق غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا."),
      requestUrl.origin,
    ),
  );
}
