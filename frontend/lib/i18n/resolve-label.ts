import type { useTranslations } from "next-intl";

type DomainT = ReturnType<typeof useTranslations<"domain">>;

const VULN_CODES = new Set(["VERY_FRAGILE", "FRAGILE", "WEAK", "MODERATE", "OUT_OF_PRIORITY"]);

/**
 * Resolve a canonical enum/code (e.g. vulnerability `VERY_FRAGILE`) to a localized label.
 * Store/API use codes only; never persist translated strings.
 */
export function vulnerabilityLabel(tDomain: DomainT, code: string): string {
  if (!VULN_CODES.has(code)) return code;
  return tDomain(`vulnerability.${code}` as "vulnerability.VERY_FRAGILE");
}
