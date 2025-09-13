"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { apiRegister, apiLogin } from "@/lib/api";
import { useI18n } from "@/i18n/I18n-provider";

export default function AuthCallback() {
  const router = useRouter();
  const { locale } = useI18n();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) throw error || new Error("No session");
        const accessToken = data.session.access_token;
        const refreshToken = data.session.refresh_token || undefined;
        const url = new URL(window.location.href);
        const mode = url.searchParams.get("mode") || "sign-in";
        if (mode === "sign-up") {
          await apiRegister(accessToken, refreshToken);
        } else {
          await apiLogin(accessToken, refreshToken);
        }
        if (!active) return;
        router.replace(`/${locale}`);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Unexpected error");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <main>
        <h1>Authentication error</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <p>Signing you in…</p>
    </main>
  );
}
