import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/I18n-provider";
import { getServerTranslator } from "@/i18n/translation-loader";

import styles from "../status.module.css";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function BillingCancelledPage({ params }: PageProps) {
  const { locale: maybeLocale } = await params;
  const locale = (maybeLocale ?? "en") as Locale;
  const { t } = await getServerTranslator(locale, "billing");

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {t("billing.cancelled.title", "Checkout cancelled")}
        </h1>
        <p className={styles.description}>
          {t(
            "billing.cancelled.description",
            "No charges were made. You can restart checkout whenever you are ready."
          )}
        </p>
        <p className={styles.description}>
          {t(
            "billing.cancelled.next_steps",
            "If this was accidental, return to the subscriptions page to try again."
          )}
        </p>
        <div className={styles.actions}>
          <Button asChild variant="outline">
            <Link href={`/${locale}/subscriptions`}>
              {t("billing.status.back_to_dashboard", "Back to dashboard")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
