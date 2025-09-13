"use client";

import { useI18n } from "@/i18n/I18n-provider";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(newLocale: string) {
    if (!pathname) return;
    const segments = pathname.split("/").filter(Boolean);
    // Replace first segment (current locale) with the new one
    if (segments.length > 0) {
      segments[0] = newLocale;
    } else {
      segments.push(newLocale);
    }
    const newPath = "/" + segments.join("/");
    setLocale(newLocale as any);
    router.push(newPath);
  }

  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <label htmlFor="locale" style={{ opacity: 0.7 }}>
        Language
      </label>
      <select
        id="locale"
        value={locale}
        onChange={(e) => switchTo(e.target.value)}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
