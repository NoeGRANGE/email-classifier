import type { StepId, StepWithContent } from "./steps-data";
import { StepCard } from "./step-card";
import styles from "./steps-list.module.css";

type StepsListProps = {
  delay: number;
  steps: StepWithContent[];
  activeStepId: StepId;
  onSelect: (index: number) => void;
};

export function StepsList({
  steps,
  delay,
  activeStepId,
  onSelect,
}: StepsListProps) {
  return (
    <ol className={styles.stepList}>
      {steps.map((step, index) => (
        <li key={step.id} className={styles.stepListItem}>
          <StepCard
            delay={delay}
            step={step}
            isActive={step.id === activeStepId}
            onSelect={() => onSelect(index)}
          />
        </li>
      ))}
    </ol>
  );
}
