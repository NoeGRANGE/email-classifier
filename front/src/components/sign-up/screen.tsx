"use client";

import Link from "next/link";

import AuthCard from "@/components/auth/auth-card";
import EmailAuthForm from "@/components/auth/email-auth-form";
import { useTranslations } from "@/i18n/use-translations";

export default function SignUpScreen() {
  const { t, locale } = useTranslations("auth");

  return (
    <AuthCard
      title={t("heading_sign_up")}
      footer={
        <span>
          {t("already_user")}
          <Link href={`/${locale}/sign-in`}>{t("go_to_sign_in")}</Link>
        </span>
      }
    >
      <EmailAuthForm mode="sign-up" />
    </AuthCard>
  );
}
