"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Provider } from "@supabase/supabase-js";
import { apiRegister, apiLogin } from "@/lib/api";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  mode?: "sign-in" | "sign-up";
};

export default function AuthButtons({ mode = "sign-in" }: Props) {
  const { t, locale } = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function signInWith(provider: Provider) {
    const redirectTo = `${window.location.origin}/${locale}/auth/callback?mode=${mode}`;
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }

  async function redirectAfterSign() {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("inviteToken");
    if (inviteToken) {
      // get locale from current path
      const locale = window.location.pathname.split("/")[1];
      console.log("locale");
      console.log(locale);

      router.replace(`/organisation/accept?inviteToken=${inviteToken}`);
    }
    router.replace(`/subscriptions`);
  }

  async function onSubmitEmailPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const pwdChecks = passwordChecks(password);
        const pwdValid = pwdChecks.every((c) => c.ok);
        if (!pwdValid) {
          throw new Error(t("err_pwd_requirements"));
        }
        if (password !== confirmPassword) {
          throw new Error(t("err_pwd_mismatch"));
        }
        const redirectTo = `${window.location.origin}/${locale}/auth/callback?mode=${mode}`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        if (data.session?.access_token) {
          await apiRegister(
            data.session.access_token,
            data.session.refresh_token || undefined
          );
          redirectAfterSign();
          return;
        }
        setInfo(t("info_check_email"));
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (!data.session?.access_token) throw new Error(t("err_no_session"));
        console.log("Got session", data);
        await apiLogin(
          data.session.access_token,
          data.session.refresh_token || undefined
        );
        console.log("Logged in, redirecting…");
        redirectAfterSign();
      }
    } catch (err: any) {
      setError(err?.message || t("err_unexpected"));
    } finally {
      setLoading(false);
    }
  }

  function passwordChecks(pwd: string) {
    return [
      { label: t("pwd_rule_len"), ok: pwd.length >= 8 },
      { label: t("pwd_rule_lower"), ok: /[a-z]/.test(pwd) },
      { label: t("pwd_rule_upper"), ok: /[A-Z]/.test(pwd) },
      { label: t("pwd_rule_number"), ok: /\d/.test(pwd) },
      { label: t("pwd_rule_special"), ok: /[^A-Za-z0-9]/.test(pwd) },
    ];
  }

  const checks = mode === "sign-up" ? passwordChecks(password) : [];
  const passwordValid = mode === "sign-up" ? checks.every((c) => c.ok) : true;
  const canSubmit =
    !loading &&
    email.length > 0 &&
    password.length > 0 &&
    (mode === "sign-in" || (passwordValid && password === confirmPassword));

  return (
    <div>
      <h1>
        {mode === "sign-up" ? t("heading_sign_up") : t("heading_sign_in")}
      </h1>

      <form
        onSubmit={onSubmitEmailPassword}
        style={{ marginTop: 12, marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxWidth: 360,
          }}
        >
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === "sign-up" && (
            <>
              <input
                type="password"
                placeholder={t("confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                {checks.map((c) => (
                  <div key={c.label} style={{ color: c.ok ? "green" : "#666" }}>
                    {c.ok ? "✓" : "•"} {c.label}
                  </div>
                ))}
                {confirmPassword && (
                  <div
                    style={{
                      color: password === confirmPassword ? "green" : "crimson",
                    }}
                  >
                    {password === confirmPassword
                      ? t("pwd_match")
                      : t("pwd_no_match")}
                  </div>
                )}
              </div>
            </>
          )}
          <button type="submit" disabled={!canSubmit}>
            {loading
              ? mode === "sign-up"
                ? t("loading_sign_up")
                : t("loading_sign_in")
              : mode === "sign-up"
              ? t("submit_sign_up")
              : t("submit_sign_in")}
          </button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          {info && <p>{info}</p>}
        </div>
      </form>

      <div style={{ margin: "12px 0" }}>
        <span style={{ opacity: 0.7 }}>{t("or_continue_with")}</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => signInWith("google")}>
          {t("continue_google")}
        </button>
        <button onClick={() => signInWith("github")}>
          {t("continue_github")}
        </button>
        <button onClick={() => signInWith("azure")}>
          {t("continue_microsoft")}
        </button>
      </div>
    </div>
  );
}
