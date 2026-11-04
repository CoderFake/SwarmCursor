import type { DocsLocaleBundle, Lang } from "../types";
import { EN_LOCALE_BUNDLE } from "./en";
import { VI_LOCALE_BUNDLE } from "./vi";

export const DOCS_LOCALES: Record<Lang, DocsLocaleBundle> = {
  en: EN_LOCALE_BUNDLE,
  vi: VI_LOCALE_BUNDLE,
};

export function getDocsLocale(lang: Lang): DocsLocaleBundle {
  return DOCS_LOCALES[lang] ?? VI_LOCALE_BUNDLE;
}
