import * as React from "react";
import { getServerTranslator } from "@/i18n/translation-loader";
import { Locale } from "@/i18n/I18n-provider";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getServerTranslator(locale, ["sign-in"]);
  return <h1>{t("title")}</h1>;
}
