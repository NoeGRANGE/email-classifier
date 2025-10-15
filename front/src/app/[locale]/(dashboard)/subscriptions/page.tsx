import SubscriptionsScreen from "@/components/subscriptions/screen";
import * as React from "react";
import { headers } from "next/headers";
import * as API from "@/lib/api";
import { ShieldAlert } from "lucide-react";
import styles from "./page.module.css";
import type { Locale } from "@/i18n/I18n-provider";
import { getServerTranslator } from "@/i18n/translation-loader";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function SubscriptionsPage({ params }: PageProps) {
  const { locale: maybeLocale } = await params;
  const locale = (maybeLocale ?? "en") as Locale;
  const { t } = await getServerTranslator(locale, "subscriptions");
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const meRole = await API.getMeRole(cookieHeader);
  if (meRole.role === "owner" || meRole.role === null) {
    return (
      <main>
        <SubscriptionsScreen meRole={meRole} />
      </main>
    );
  } else {
    return (
      <main className={styles.restrictedMain}>
        <div className={styles.restrictedCard} role="alert">
          <ShieldAlert className={styles.restrictedIcon} aria-hidden="true" />
          <div className={styles.restrictedContent}>
            <h1 className={styles.restrictedTitle}>
              {t(
                "subscriptions.restricted.title",
                "Only owners can manage the subscription"
              )}
            </h1>
            <p className={styles.restrictedText}>
              {t(
                "subscriptions.restricted.description",
                "You're already part of an organisation. Ask the owner to update your plan if you need changes."
              )}
            </p>
          </div>
        </div>
      </main>
    );
  }
}
