/** Map PMT classification → shadcn Badge variant */
export type DashboardBadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function classificationBadgeVariant(classification: string | null | undefined): DashboardBadgeVariant {
  switch (classification) {
    case "VERY_FRAGILE":
    case "FRAGILE":
      return "destructive";
    case "WEAK":
      return "secondary";
    case "MODERATE":
    case "OUT_OF_PRIORITY":
      return "outline";
    default:
      return "outline";
  }
}
