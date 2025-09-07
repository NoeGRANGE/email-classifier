"use client";

import { supabase } from "@/lib/supabaseClient";

interface Props {
  mode?: "sign-in" | "sign-up";
}

export default function AuthButtons({ mode = "sign-in" }: Props) {
  async function signInWith(provider: string) {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }

  return (
    <div>
      <h1>{mode === "sign-up" ? "Create your account" : "Sign in"}</h1>
      <div>
        <button onClick={() => signInWith("google")}>Continue with Google</button>
        <button onClick={() => signInWith("github")}>Continue with GitHub</button>
        <button onClick={() => signInWith("azure")}>Continue with Microsoft</button>
      </div>
    </div>
  );
}
