import Image from "next/image";

import type { StepWithContent } from "./steps-data";
import styles from "./step-illustration.module.css";

type StepIllustrationProps = {
  step: StepWithContent;
};

export function StepIllustration({ step }: StepIllustrationProps) {
  return (
    <figure className={styles.illustration}>
      <div className={styles.illustrationInner}>
        <Image
          src={step.imageSrc}
          alt={step.imageAlt}
          width={640}
          height={480}
          className={styles.illustrationImage}
          sizes="(max-width: 1024px) 96vw, 540px"
          priority
        />
      </div>
      <figcaption className={styles.illustrationCaption}>
        {step.title}
      </figcaption>
    </figure>
  );
}
