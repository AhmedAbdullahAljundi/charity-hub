import type { LabeledValue } from "@/lib/stores/constants";

/** Translate a store `LabeledValue` via `families.dictionaries.<group>.<key>` */
export function dictLabel(
  t: (key: string) => string,
  group: string,
  item: LabeledValue
): string {
  return t(`dictionaries.${group}.${item.key}` as "dictionaries.incomeSources.daily_work");
}
