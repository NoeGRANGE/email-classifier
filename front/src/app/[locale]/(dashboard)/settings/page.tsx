import * as React from "react";
import { getServerTranslator } from "@/i18n/translation-loader";
import { Locale } from "@/i18n/I18n-provider";
import * as API from "@/lib/api";
import { headers } from "next/headers";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getServerTranslator(locale, ["sign-in"]);
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const me = await API.apiMe(cookieHeader).catch(() => null);
  console.log("me", me);
  return <h1>{t("title")}</h1>;
}
