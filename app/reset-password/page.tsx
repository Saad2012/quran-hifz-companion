import { redirect } from "next/navigation";

import { ResetPasswordPage } from "@/features/auth/reset-password-page";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface ResetPasswordRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleParam(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

export default async function ResetPasswordRoute({ searchParams }: ResetPasswordRouteProps) {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const params = await searchParams;

  return <ResetPasswordPage initialMessage={getSingleParam(params.message)} />;
}
