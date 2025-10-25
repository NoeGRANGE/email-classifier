"use client";

import { useTranslations } from "@/i18n/use-translations";

import styles from "./screen.module.css";
import Steps from "./steps";
import TopBar from "./top-bar";
import { Button } from "../ui/button";
import AppSchema from "./schema/schema";

export default function HomeScreen() {
  const { t } = useTranslations("home");

  const moveToSubscription = () => {
    const locale = window.location.pathname.split("/")[1] || "en";
    window.location.href = `/${locale}/sign-up`;
  };

  return (
    <div className={styles.wrapper}>
      <TopBar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {t("hero.title", "The smart way to triage your inbox")}
          </h1>
          <p className={styles.heroSubtitle}>
            {t(
              "hero.subtitle",
              "Automate email classification and keep your focus on building your startup."
            )}
          </p>
          <Button
            className={styles.getStartedButton}
            onClick={moveToSubscription}
          >
            {t("hero.cta", "Get Started for free")}
          </Button>
        </section>
        <AppSchema />
        <Steps />
      </main>
    </div>
  );
}
