"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiLogin, apiRegister } from "@/lib/api";
import { supabase } from "@/lib/supabase-client";
import { useTranslations } from "@/i18n/use-translations";

import styles from "./email-auth-form.module.css";

type Translator = (key: string, fallback?: string) => string;

type EmailAuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export default function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const { t, locale } = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const checks = mode === "sign-up" ? passwordChecks(password, t) : [];
  const passwordValid =
    mode === "sign-up" ? checks.every((check) => check.ok) : true;

  const canSubmit =
    !loading &&
    email.length > 0 &&
    password.length > 0 &&
    (mode === "sign-in" ||
      (passwordValid &&
        confirmPassword.length > 0 &&
        password === confirmPassword));

  function passwordChecks(pwd: string, translator: Translator) {
    return [
      { label: translator("pwd_rule_len"), ok: pwd.length >= 8 },
      { label: translator("pwd_rule_lower"), ok: /[a-z]/.test(pwd) },
      { label: translator("pwd_rule_upper"), ok: /[A-Z]/.test(pwd) },
      { label: translator("pwd_rule_number"), ok: /\d/.test(pwd) },
      { label: translator("pwd_rule_special"), ok: /[^A-Za-z0-9]/.test(pwd) },
    ];
  }

  async function redirectAfterSign() {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("inviteToken");
    if (inviteToken) {
      router.replace(`/organisation/accept?inviteToken=${inviteToken}`);
      return;
    }
    const locale = window.location.pathname.split("/")[1];
    router.replace(`/${locale}/subscriptions`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "sign-up") {
        if (!passwordValid) {
          throw new Error(t("err_pwd_requirements"));
        }
        if (password !== confirmPassword) {
          throw new Error(t("err_pwd_mismatch"));
        }

        const redirectTo = `${window.location.origin}/${locale}/auth/callback?mode=${mode}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (signUpError) throw signUpError;

        const accessToken = data.session?.access_token;
        const refreshToken = data.session?.refresh_token || undefined;

        if (accessToken) {
          await apiRegister(accessToken, refreshToken);
          await redirectAfterSign();
          return;
        }

        setInfo(t("info_check_email"));
        setConfirmPassword("");
        setPassword("");
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) throw signInError;

        const accessToken = data.session?.access_token;
        const refreshToken = data.session?.refresh_token || undefined;

        if (!accessToken) {
          throw new Error(t("err_no_session"));
        }

        await apiLogin(accessToken, refreshToken);
        await redirectAfterSign();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || t("err_unexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fields}>
        <Input
          className={styles.input}
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Input
          className={styles.input}
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={
            mode === "sign-in" ? "current-password" : "new-password"
          }
          required
        />
        {mode === "sign-up" ? (
          <>
            <Input
              className={styles.input}
              type="password"
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <div className={styles.passwordHints}>
              {checks.map((check) => {
                const className = [styles.hint, check.ok ? styles.hintOk : ""]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div key={check.label} className={className}>
                    <span className={styles.hintIcon}>
                      {check.ok ? "✓" : "•"}
                    </span>
                    <span>{check.label}</span>
                  </div>
                );
              })}
              {confirmPassword.length > 0 ? (
                <div
                  className={[
                    styles.hint,
                    styles.confirmHint,
                    password === confirmPassword ? styles.hintOk : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className={styles.hintIcon}>
                    {password === confirmPassword ? "✓" : "•"}
                  </span>
                  <span>
                    {password === confirmPassword
                      ? t("pwd_match")
                      : t("pwd_no_match")}
                  </span>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={!canSubmit}
      >
        {loading
          ? mode === "sign-up"
            ? t("loading_sign_up")
            : t("loading_sign_in")
          : mode === "sign-up"
          ? t("submit_sign_up")
          : t("submit_sign_in")}
      </Button>

      {error ? <p className={styles.status}>{error}</p> : null}
      {info ? (
        <p className={`${styles.status} ${styles.statusInfo}`}>{info}</p>
      ) : null}
    </form>
  );
}
