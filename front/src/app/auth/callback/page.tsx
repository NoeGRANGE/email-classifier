"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiRegister } from "@/lib/api";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Exchange the OAuth code for a session (PKCE)
        await supabase.auth.exchangeCodeForSession(window.location.href);
        // Ensure Supabase has processed the URL and a session is set
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) throw error || new Error("No session");
        const accessToken = data.session.access_token;

        // Idempotent: backend returns existing or creates user
        await apiRegister(accessToken);

        if (!active) return;
        router.replace("/");
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
