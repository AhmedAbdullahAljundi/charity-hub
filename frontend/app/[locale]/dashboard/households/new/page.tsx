"use client";

import { useEffect } from "react";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { useWizardStore } from "@/lib/stores/wizardStore";
import { useScoringStore } from "@/lib/stores/scoringStore";

export default function NewHouseholdWizardPage() {
  const resetWizard = useWizardStore((s) => s.resetWizard);
  const clearScoring = useScoringStore((s) => s.clear);

  useEffect(() => {
    resetWizard();
    clearScoring();
  }, [resetWizard, clearScoring]);

  return <WizardShell />;
}
