"use client";

import { useLocale } from "next-intl";
import { useLayoutEffect } from "react";

/**
 * Keeps `document.documentElement.lang` and `dir` aligned with the active next-intl locale
 * after client-side navigations (root layout SSR uses middleware header + cookie).
 */
export function LocaleDocumentAttributes() {
  const locale = useLocale();

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
