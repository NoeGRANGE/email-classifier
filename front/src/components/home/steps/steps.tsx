"use client";

import { useMemo } from "react";

import { useTranslations } from "@/i18n/use-translations";

import { StepIllustration } from "./step-illustration";
import { STEP_DEFINITIONS } from "./steps-data";
import { StepsList } from "./steps-list";
import { useRotatingStep } from "./use-rotating-step";
import styles from "./steps.module.css";

const ROTATION_DELAY_MS = 3000;

export default function Steps() {
  const { t } = useTranslations("home");

  const steps = useMemo(
    () =>
      STEP_DEFINITIONS.map((step) => ({
        ...step,
        title: t(step.titleKey, step.titleFallback),
        description: t(step.descriptionKey, step.descriptionFallback),
        imageAlt: t(step.imageAltKey, step.imageAltFallback),
      })),
    [t]
  );

  const { index, setIndex } = useRotatingStep(steps.length, ROTATION_DELAY_MS);
  const activeStep = steps[index] ?? steps[0];

  return (
    <section
      className={styles.container}
      aria-labelledby="steps-title"
      data-testid="home-steps"
    >
      <p className={styles.eyebrow}>{t("steps.eyebrow", "How it works")}</p>
      <h2 id="steps-title" className={styles.title}>
        {t("steps.title", "Just 3 steps to get started")}
      </h2>
      <p className={styles.subtitle}>
        {t(
          "steps.subtitle",
          "Go from raw emails to automated actions without wasting time."
        )}
      </p>
      <div className={styles.stepsListContainer}>
        <StepsList
          delay={ROTATION_DELAY_MS}
          steps={steps}
          activeStepId={activeStep?.id ?? steps[0]?.id}
          onSelect={setIndex}
        />

        {activeStep ? <StepIllustration step={activeStep} /> : null}
      </div>
    </section>
  );
}
