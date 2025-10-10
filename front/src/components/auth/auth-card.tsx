"use client";

import type { ReactNode } from "react";
import LanguageSwitcher from "@/components/ui/language-switcher";
import styles from "./auth-card.module.css";

type AuthCardProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function AuthCard({
  title,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${className ?? ""}`.trim()}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <LanguageSwitcher />
        </div>
        <div className={styles.content}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
