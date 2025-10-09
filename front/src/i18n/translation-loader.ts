import type { Locale } from "./I18n-provider";

export type TranslationDict = Record<string, string>;

type LoaderFn = () => Promise<any>;

// Register JSON namespaces here so they can be shared by client and server helpers.
const namespaceLoaders: Record<string, LoaderFn> = {
  "sign-in": () => import("@/text/sign-in.json"),
  "sign-up": () => import("@/text/sign-up.json"),
  auth: () => import("@/text/auth.json"),
  dashboard: () => import("@/text/dashboard.json"),
  subscriptions: () => import("@/text/subscriptions.json"),
  organisation: () => import("@/text/organisation.json"),
  emails: () => import("@/text/emails.json"),
  configurations: () => import("@/text/configurations.json"),
  settings: () => import("@/text/settings.json"),
};

export function registerTranslationNamespace(namespace: string, loader: LoaderFn) {
  namespaceLoaders[namespace] = loader;
}

export async function loadNamespace(
  namespace: string,
  locale: Locale
): Promise<TranslationDict> {
  const loader = namespaceLoaders[namespace];
  if (!loader) return {};
  const mod = await loader();
  const data = mod?.default ?? mod;
  return (data?.[locale] as TranslationDict) || {};
}

export async function loadNamespaces(
  locale: Locale,
  namespaces: string[]
): Promise<TranslationDict> {
  const dicts = await Promise.all(namespaces.map((ns) => loadNamespace(ns, locale)));
  return dicts.reduce<TranslationDict>((acc, dict) => Object.assign(acc, dict), {});
}

export function createTranslator(dict: TranslationDict) {
  return (key: string, fallback?: string) => dict[key] ?? fallback ?? key;
}

export async function getServerTranslator(
  locale: Locale,
  namespaces: string | string[]
) {
  const list = Array.isArray(namespaces) ? namespaces : [namespaces];
  const dictionary = await loadNamespaces(locale, list);
  return {
    t: createTranslator(dictionary),
    dictionary,
    locale,
  };
}

export type NamespaceLoaders = typeof namespaceLoaders;
export function getNamespaceLoaders(): NamespaceLoaders {
  return namespaceLoaders;
}
