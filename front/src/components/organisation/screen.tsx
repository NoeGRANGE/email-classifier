"use client";

import * as React from "react";
import LanguageSwitcher from "../language-switcher";
import { useTranslations } from "@/i18n/use-translations";

type Props = { data: OrganisationData };

export default function OrganisationScreen({ data }: Props) {
  const { t } = useTranslations("organisation");

  return (
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
  );
}
