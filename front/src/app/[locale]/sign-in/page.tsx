"use client";

import AuthButtons from "@/components/auth-buttons";
import { useTranslations } from "@/i18n/use-translations";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function SignInPage() {
  const { t } = useTranslations("sign-in");
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
        <h1>{t("title", "Login")}</h1>
        <LanguageSwitcher />
      </div>
      <AuthButtons mode="sign-in" />
    </main>
  );
}
