"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { AuthUserSummary } from "@/types";

interface SupabaseAuthContextValue {
  isConfigured: boolean;
  isLoading: boolean;
  user: AuthUserSummary | null;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

function mapUser(
  user: {
    id: string;
    email?: string | null;
    last_sign_in_at?: string | null;
  } | null,
): AuthUserSummary | null {
  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    lastSignInAt: user.last_sign_in_at ?? undefined,
  };
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isConfigured = hasSupabaseEnv();
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [user, setUser] = useState<AuthUserSummary | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getBrowserSupabaseClient();
    let mounted = true;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) {
        return;
      }

      setUser(error ? null : mapUser(data.user));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, router]);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      isConfigured,
      isLoading: isConfigured ? isLoading : false,
      user: isConfigured ? user : null,
      async signOut() {
        if (!isConfigured) {
          return;
        }

        const supabase = getBrowserSupabaseClient();
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      },
    }),
    [isConfigured, isLoading, router, user],
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);

  if (!context) {
    throw new Error("useSupabaseAuth must be used inside SupabaseAuthProvider");
  }

  return context;
}
