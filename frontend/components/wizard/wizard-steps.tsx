"use client";

import { BasicInfoStep } from "./steps/BasicInfoStep";
import { PersonsStep } from "./steps/PersonsStep";
import { IncomeStep } from "./steps/IncomeStep";
import { BurdensStep } from "./steps/BurdensStep";
import { EvaluationStep } from "./steps/EvaluationStep";

export function WizardStepContent({ step }: { step: number }) {
  switch (step) {
    case 1:
      return <BasicInfoStep />;
    case 2:
      return <PersonsStep />;
    case 3:
      return <IncomeStep />;
    case 4:
      return <BurdensStep />;
    case 5:
      return <EvaluationStep />;
    default:
      return null;
  }
}
