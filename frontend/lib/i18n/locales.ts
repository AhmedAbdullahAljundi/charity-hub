export const LOCALES = ["ar", "en"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "ar";

export function isLocale(x: string | undefined): x is AppLocale {
  return x === "ar" || x === "en";
}

/** `/ar/dashboard` → `/dashboard` */
export function stripLocalePrefix(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) {
      return pathname.slice(`/${l}`.length) || "/";
    }
  }
  return pathname;
}
