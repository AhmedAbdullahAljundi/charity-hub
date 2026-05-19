"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useWizardStore } from "@/lib/stores/wizardStore";
import { cn } from "@/lib/utils";

export function AutosaveIndicator() {
  const t = useTranslations("scoring.wizard");
  const status = useWizardStore((s) => s.autosaveStatus);
  const lastSavedAt = useWizardStore((s) => s.lastSavedAt);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!lastSavedAt) return;
    const tick = () => setSeconds(Math.floor((Date.now() - lastSavedAt.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        status === "error" && "text-destructive",
        status === "synced" && "text-emerald-600",
        status === "saving" && "text-muted-foreground"
      )}
    >
      {status === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "synced" && <Check className="h-3 w-3" />}
      {status === "error" && <AlertCircle className="h-3 w-3" />}
      {status === "saving" && t("saving")}
      {status === "synced" && lastSavedAt && t("savedAgo", { seconds })}
      {status === "synced" && !lastSavedAt && t("saved")}
      {status === "error" && t("error")}
    </span>
  );
}
