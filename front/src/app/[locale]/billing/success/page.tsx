import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/I18n-provider";
import { getServerTranslator } from "@/i18n/translation-loader";

import styles from "../status.module.css";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function BillingSuccessPage({ params }: PageProps) {
  const { locale: maybeLocale } = await params;
  const locale = (maybeLocale ?? "en") as Locale;
  const { t } = await getServerTranslator(locale, "billing");

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {t("billing.success.title", "Thank you for upgrading")}
        </h1>
        <p className={styles.description}>
          {t(
            "billing.success.description",
            "We have received your payment. Stripe is finalising your subscription; this may take a moment."
          )}
        </p>
        <p className={styles.description}>
          {t(
            "billing.success.next_steps",
            "Feel free to close this tab or head back to the dashboard while we refresh your billing status."
          )}
        </p>
        <div className={styles.actions}>
          <Button asChild>
            <Link href={`/${locale}/subscriptions`}>
              {t("billing.status.back_to_dashboard", "Back to dashboard")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
