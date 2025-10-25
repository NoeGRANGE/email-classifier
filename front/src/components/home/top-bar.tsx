"use client";

import Link from "next/link";

import { AppBrandLink } from "@/components/layout/app-brand-link";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/use-translations";

import styles from "./top-bar.module.css";

export default function TopBar() {
  const { t, locale } = useTranslations("home");

  return (
    <header className={styles.topbar}>
      <AppBrandLink />
      <div className={styles.actions}>
        <div className={styles.languageSwitcher}>
          <LanguageSwitcher />
        </div>
        <Button asChild preset="outline" className={styles.loginButton}>
          <Link href={`/${locale}/sign-in`}>
            {t("topbar.sign_in", "Log in")}
          </Link>
        </Button>
      </div>
    </header>
  );
}
