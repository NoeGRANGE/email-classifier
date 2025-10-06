import * as React from "react";

import { Button } from "@/components/ui/button";

import CategoryCard from "./category-card";
import styles from "./categories-section.module.css";

type Props = {
  categories: CategoryDetail[];
  title: string;
  subtitle: string;
  emptyLabel: string;
  createLabel: string;
  createAriaLabel: string;
  onCreateCategory: (category?: CategoryDetail) => void;
};

export default function CategoriesSection({
  categories,
  title,
  subtitle,
  emptyLabel,
  createLabel,
  createAriaLabel,
  onCreateCategory,
}: Props) {
  if (categories.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => onCreateCategory()}
            aria-label={createAriaLabel}
            className={styles.createButton}
          >
            {createLabel}
          </Button>
        </div>
        <p className={styles.empty}>{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => onCreateCategory()}
          aria-label={createAriaLabel}
          className={styles.createButton}
        >
          {createLabel}
        </Button>
      </div>

      <ul className={styles.grid} role="list">
        {categories.map((category) => (
          <li key={category.id} className={styles.item} role="listitem">
            <button
              type="button"
              onClick={() => onCreateCategory(category)}
              className={styles.categoryLink}
              aria-label={category.name}
            >
              <CategoryCard category={category} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
