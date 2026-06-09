/** Map PMT classification / EligibilityLevel / HumanDecision → shadcn Badge variant */
export type DashboardBadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function classificationBadgeVariant(classification: string | null | undefined): DashboardBadgeVariant {
  switch (classification) {
    case "VERY_FRAGILE":
    case "FRAGILE":
    case "CRITICAL":
    case "REJECTED":
      return "destructive";
    case "HIGH_NEED":
    case "WEAK":
      return "secondary";
    case "MODERATE":
    case "MODERATE_NEED":
    case "OUT_OF_PRIORITY":
    case "LOW_NEED":
    case "NOT_ELIGIBLE":
    case "APPROVED":
      return "outline";
    case "PENDING":
    case "NEEDS_REVIEW":
    case "ESCALATED":
      return "default";
    default:
      return "outline";
  }
}
