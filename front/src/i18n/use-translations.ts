"use client";

import { useEffect, useMemo, useState } from "react";

import { useI18n } from "./I18n-provider";
import {
  createTranslator,
  loadNamespaces,
  type TranslationDict,
} from "./translation-loader";

export function useTranslations(namespaces: string | string[]) {
  const { locale } = useI18n();
  const [dict, setDict] = useState<TranslationDict>({});

  const namespaceList = useMemo(
    () => (Array.isArray(namespaces) ? namespaces : [namespaces]),
    [namespaces]
  );

  useEffect(() => {
    let mounted = true;
    loadNamespaces(locale, namespaceList)
      .then((merged) => {
        if (mounted) setDict(merged);
      })
      .catch(() => {
        if (mounted) setDict({});
      });
    return () => {
      mounted = false;
    };
  }, [locale, namespaceList]);

  const t = useMemo(() => createTranslator(dict), [dict]);

  return { t, locale, dict };
}
