"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "fr";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

type Props = {
  initialLocale: Locale;
  children: React.ReactNode;
};

export function I18nProvider({ initialLocale, children }: Props) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      document.cookie = `locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
      localStorage.setItem("locale", l);
      document.documentElement.lang = l;
    } catch {}
  };

  useEffect(() => {
    // Source of truth is the URL (initialLocale). Keep client state in sync.
    try {
      document.documentElement.lang = locale;
      localStorage.setItem("locale", locale);
      document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
