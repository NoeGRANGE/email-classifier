import * as React from "react";

import styles from "./configuration-header.module.css";

type Props = {
  name: string;
};

export default function ConfigurationHeader({ name }: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{name}</h1>
    </header>
  );
}
