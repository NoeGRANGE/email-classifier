import { cn } from "@/lib/utils";

import type { StepWithContent } from "./steps-data";
import styles from "./step-card.module.css";
import ProgressLine from "@/components/ui/progress-line";

type StepCardProps = {
  delay: number;
  step: StepWithContent;
  isActive: boolean;
  onSelect: () => void;
};

export function StepCard({ step, delay, isActive, onSelect }: StepCardProps) {
  const Icon = step.icon;

  return (
    <button
      type="button"
      className={cn(styles.stepButton, {
        [styles.stepButtonActive]: isActive,
      })}
      onClick={() => {
        if (!isActive) onSelect();
      }}
      aria-pressed={isActive}
    >
      <div className={styles.progressLineWrap}>
        <ProgressLine active={isActive} delay={delay} />
      </div>

      <div className={styles.stepIconWrap}>
        <Icon className={styles.stepIcon} aria-hidden="true" />
      </div>
      <div className={styles.stepContent}>
        <span className={styles.stepTitle}>{step.title}</span>
        <p className={styles.stepDescription}>{step.description}</p>
      </div>
    </button>
  );
}
