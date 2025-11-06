"use client";

import { Locale, useI18n } from "@/i18n/I18n-provider";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import styles from "./language-switcher.module.css";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(newLocale: string) {
    if (!pathname) return;
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLocale;
    const newPath = "/" + segments.join("/");
    setLocale(newLocale as Locale);
    router.push(newPath);
  }

  return (
    <label
      htmlFor="locale"
      className={styles.container}
      title="Change language"
    >
      <Globe aria-hidden="true" />
      <select
        id="locale"
        aria-label="Change language"
        value={locale}
        onChange={(e) => switchTo(e.target.value)}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </label>
  );
}
