"use client";
import Link from "next/link";
import { useMemo } from "react";
import classnames from "classnames";
import { useI18n } from "@/i18n/I18n-provider";
import styles from "./app-brand-link.module.css";

type AppBrandLinkProps = {
  className?: string;
  label?: string;
  fallbackLabel?: string;
};

export function AppBrandLink({
  className,
  label,
  fallbackLabel = "LinBolt",
}: AppBrandLinkProps) {
  const { locale } = useI18n();

  const href = useMemo(() => {
    const normalized = `/${locale ?? ""}`.replace(/\/+/g, "/");
    return normalized || "/";
  }, [locale]);

  return (
    <Link href={href} className={classnames(styles.brand, className)}>
      {label ?? fallbackLabel}
    </Link>
  );
}
