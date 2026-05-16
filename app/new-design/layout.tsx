import { redirect } from "next/navigation";
import { NewDesignShell } from "@/components/layout/new-design-shell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewDesignLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }
  return <NewDesignShell>{children}</NewDesignShell>;
}
