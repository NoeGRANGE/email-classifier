import React from "react";
import styles from "./progress-line.module.css";
import classnames from "classnames";

type Props = {
  delay: number;
  active?: boolean;
  className?: string;
};

export default function ProgressLine({ className, active, delay }: Props) {
  return (
    <div
      className={classnames(styles.line, className, {
        [styles.active]: active,
      })}
      style={{ "--anim-duration": `${delay}ms` } as React.CSSProperties}
    />
  );
}
