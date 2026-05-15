import type { AppLocale } from "@/lib/i18n/locales";

export type Bilingual = { nameAr?: string | null; nameEn?: string | null };

/** Prefer localized field; fallback to other language then placeholder. */
export function pickLocalizedField(locale: AppLocale, v: Bilingual, fallback = "—"): string {
  const primary = locale === "ar" ? v.nameAr : v.nameEn;
  const secondary = locale === "ar" ? v.nameEn : v.nameAr;
  const s = (primary || secondary || "").trim();
  return s || fallback;
}
