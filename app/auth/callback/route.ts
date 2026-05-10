import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types";

import { getSupabaseEnv } from "@/lib/supabase/env";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(errorDescription)}`, requestUrl.origin),
    );
  }

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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent(error.message)}`, requestUrl.origin),
      );
    }
  }

  return response;
}
