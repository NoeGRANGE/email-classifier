"use client";

import { useEffect, useState } from "react";
import { useI18n, type Locale } from "./I18n-provider";

type Dict = Record<string, string>;

// Register JSON namespaces here
const loaders: Record<string, () => Promise<any>> = {
  "sign-in": () => import("@/text/sign-in.json"),
  "sign-up": () => import("@/text/sign-up.json"),
  auth: () => import("@/text/auth.json"),
};

async function loadNamespace(ns: string, locale: Locale): Promise<Dict> {
  const loader = loaders[ns];
  if (!loader) return {};
  const mod = await loader();
  const data = mod.default || mod;
  return (data?.[locale] as Dict) || {};
}

export function useTranslations(ns: string) {
  const { locale } = useI18n();
  const [dict, setDict] = useState<Dict>({});

  useEffect(() => {
    let mounted = true;
    loadNamespace(ns, locale)
      .then((d) => {
        if (mounted) setDict(d);
      })
      .catch(() => {
        if (mounted) setDict({});
      });
    return () => {
      mounted = false;
    };
  }, [ns, locale]);

  function t(key: string, fallback?: string) {
    return dict[key] ?? fallback ?? key;
  }

  return { t, locale };
}
