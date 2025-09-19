"use client";

import * as React from "react";
import { useTranslations } from "@/i18n/use-translations";

type Props = { data: OrganisationData };

export default function OrganisationScreen({ data: _data }: Props) {
  const { t } = useTranslations("organisation");

  return <h1 style={{ marginBottom: 12 }}>{t("title")}</h1>;
}
