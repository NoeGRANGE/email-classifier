"use client";

import { useTranslations } from "@/i18n/use-translations";
import LanguageSwitcher from "@/components/language-switcher";

export default function OrganisationPage() {
  const { t } = useTranslations("organisation");
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
        <h1>{t("title")}</h1>
        <LanguageSwitcher />
      </div>
      here
    </main>
  );
}
