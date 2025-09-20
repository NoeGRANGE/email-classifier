"use client";

import AuthButtons from "@/components/auth-buttons";
import { useTranslations } from "@/i18n/use-translations";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function SignUpPage() {
  const { t } = useTranslations("sign-up");
  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1>{t("title", "Create your account")}</h1>
        <LanguageSwitcher />
      </div>
      <AuthButtons mode="sign-up" />
    </main>
  );
}
