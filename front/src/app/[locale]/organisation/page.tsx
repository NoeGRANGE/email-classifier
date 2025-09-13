"use client";

import { useTranslations } from "@/i18n/use-translations";
import LanguageSwitcher from "@/components/language-switcher";
import { useSearchParams } from "next/navigation";
import * as API from "@/lib/api";

export default async function OrganisationPage() {
  const { t } = useTranslations("organisation");
  try {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("inviteToken");
    if (inviteToken) await API.joinOrganisation(inviteToken);
  } catch {}
  try {
    const data = await API.getOrganisationData();
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
  } catch {
    return <div>TODO: crash</div>;
  }
}
