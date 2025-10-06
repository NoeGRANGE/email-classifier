"use client";

import * as React from "react";

import { useTranslations } from "@/i18n/use-translations";
import styles from "./screen.module.css";
import CategoryUpdateInfos from "./infos";

type Props = {
  category: CategoryDetail;
};

export default function CategoryUpdateScreen({ category }: Props) {
  const { t } = useTranslations("configurations");

  const [name, setName] = React.useState(category.name);
  const [description, setDescription] = React.useState(
    category.description ?? ""
  );
  const title = "Configuration de la catégorie";

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.breadcrumb}>{title}</span>
        <h1 className={styles.title}>{name || category.name}</h1>
      </header>

      <div className={styles.content}>
        <CategoryUpdateInfos
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
        />
      </div>
    </div>
  );
}
