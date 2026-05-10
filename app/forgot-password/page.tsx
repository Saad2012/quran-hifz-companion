import { redirect } from "next/navigation";

import { ForgotPasswordPage } from "@/features/auth/forgot-password-page";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface ForgotPasswordRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleParam(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

export default async function ForgotPasswordRoute({ searchParams }: ForgotPasswordRouteProps) {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/reset-password");
  }

  const params = await searchParams;

  return <ForgotPasswordPage initialMessage={getSingleParam(params.message)} />;
}
