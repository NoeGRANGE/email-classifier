"use client";

import Link from "next/link";
import { Building2, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/use-translations";

import styles from "./no-orga.module.css";
import { useParams } from "next/navigation";

const STEP_IDS = ["pick", "create", "invite"] as const;

export default function NoOrganisationPage() {
  const { t } = useTranslations("organisation");
  const { locale } = useParams();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.badge}>
            <Sparkles className={styles.badgeIcon} aria-hidden="true" />
            {t("noOrga.badge", "Getting started")}
          </span>
          <h1 className={styles.title}>
            {t("noOrga.title", "Set up your workspace")}
          </h1>
          <p className={styles.subtitle}>
            {t(
              "noOrga.subtitle",
              "We couldn't find an organisation attached to your account yet. Create one to unlock collaboration, shared inbox triage, and team-level insights."
            )}
          </p>
        </header>

        <section className={styles.highlight}>
          <div className={styles.highlightIcon}>
            <Building2 aria-hidden="true" />
          </div>
          <div className={styles.highlightCopy}>
            <h2>
              {t(
                "noOrga.highlight.title",
                "All your email operations in one place"
              )}
            </h2>
            <p>
              {t(
                "noOrga.highlight.description",
                "Centralise routing rules, categories, and labels so the whole team understands what needs attention next."
              )}
            </p>
          </div>
        </section>

        <section className={styles.content} aria-label="Next steps">
          <ol className={styles.steps}>
            {STEP_IDS.map((step) => (
              <li key={step} className={styles.stepItem}>
                <Users className={styles.stepIcon} aria-hidden="true" />
                <div className={styles.stepCopy}>
                  <span className={styles.stepTitle}>
                    {t(`noOrga.steps.${step}.title`, "Step")}
                  </span>
                  <span className={styles.stepDescription}>
                    {t(`noOrga.steps.${step}.description`, "Description")}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className={styles.actions}>
          <Button preset="primary" asChild>
            <Link href={`/${locale}/subscriptions`}>
              {t("noOrga.actions.primary", "Choose a subscription")}
            </Link>
          </Button>
          {/* TODO: Add link to demo */}
        </footer>
      </div>
    </div>
  );
}
