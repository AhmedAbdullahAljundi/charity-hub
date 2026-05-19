"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { useWizardStore } from "@/lib/stores/wizardStore";
import { useHouseholdStore } from "@/lib/stores/householdStore";
import { Loader2 } from "lucide-react";

export default function EditHouseholdWizardPage() {
  const params = useParams();
  const id = params.id as string;
  const loadFromHousehold = useWizardStore((s) => s.loadFromHousehold);
  const fetchOne = useHouseholdStore((s) => s.fetchOne);
  const loading = useHouseholdStore((s) => s.loading);

  useEffect(() => {
    if (!id) return;
    void fetchOne(id).then(loadFromHousehold);
  }, [id, fetchOne, loadFromHousehold]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <WizardShell householdId={id} />;
}
