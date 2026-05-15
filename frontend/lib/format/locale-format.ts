import type { AppLocale } from "@/lib/i18n/locales";

const TAG: Record<AppLocale, string> = {
  ar: "ar-EG",
  en: "en-US",
};

export function formatLocaleNumber(
  locale: AppLocale,
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(TAG[locale], options).format(value);
}

export function formatLocaleCurrency(
  locale: AppLocale,
  value: number,
  currency = "EGP"
): string {
  return new Intl.NumberFormat(TAG[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLocaleDate(
  locale: AppLocale,
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(TAG[locale], options).format(d);
}
