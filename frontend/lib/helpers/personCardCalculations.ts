import { Disease, Disability } from "@/lib/types/api";

// Assuming standard weight values for UI display since they are not exported in frontend.
export const WEIGHTS = {
  CORRECTIONS: {
    NONE: 0,
    WEAK: -0.5,
    SEASONAL: -1.0,
    REGULAR: -1.5,
    ABROAD_WEAK: -2.5,
    ABROAD_MEDIUM: -3.0,
    ABROAD_REGULAR: -3.5,
  } as Record<string, number>,
  DEPENDENT_CORRECTIONS: {
    NONE: 0,
    WEAK: -0.2,
    UNSTABLE: -0.4,
    SUFFICIENT: -0.6,
  } as Record<string, number>,
};

export const EDUCATION_MULTIPLIER = {
  ILLITERATE: 1.0,
  MEDIUM: 1.3,
  HIGHER_LIMITED: 1.6,
  HIGHER_STABLE: 2.0,
} as Record<string, number>;

export function getWorkCorrectionPercent(
  employmentType: string,
  educationLevel: string,
  isDependent: boolean = false
): number {
  if (!employmentType || employmentType === "NONE") return 0;
  
  const correctionMap = isDependent ? WEIGHTS.DEPENDENT_CORRECTIONS : WEIGHTS.CORRECTIONS;
  const rawCorrection = correctionMap[employmentType] || (isDependent ? -0.2 : -0.5);
  const multiplier = EDUCATION_MULTIPLIER[educationLevel] || 1.0;
  
  const absValue = Math.abs(rawCorrection * multiplier);
  // divide by 10 because floor is -10
  const percentage = Math.min(100, Math.round((absValue / 10) * 100));
  
  return percentage;
}

export function getEducationPercent(
  educationLevel: string,
  studentData?: { academicRating?: number; quranLevel?: number } | null
): number {
  if (studentData && typeof studentData.academicRating === 'number') {
    const academicScore = studentData.academicRating || 0;
    const quranScore = studentData.quranLevel || 0;
    return Math.round((academicScore * 2 + quranScore) / 3);
  }
  
  switch (educationLevel) {
    case "ILLITERATE": return 10;
    case "MEDIUM": return 45;
    case "HIGHER_LIMITED": return 70;
    case "HIGHER_STABLE": return 95;
    default: return 10;
  }
}

export function getDiseasePercent(
  diseases: any[]
): number {
  if (!diseases || diseases.length === 0) return 0;
  
  let totalPoints = 0;
  
  diseases.forEach((disease, index) => {
    // Dummy standard points, adapting from the formula: diseasePoints = Σ (treatmentCost + followup + workImpact)
    // maxPerDisease = 0.6 + 0.5 + 0.6 = 1.7
    let points = 0;
    
    // treatment
    if (disease.treatmentCost === "VERY_EXPENSIVE") points += 0.6;
    else if (disease.treatmentCost === "PERIODIC_EXPENSIVE") points += 0.4;
    else if (disease.treatmentCost === "PERIODIC_CHEAP") points += 0.2;
    
    // followup
    if (disease.followup === "EXPENSIVE") points += 0.5;
    else if (disease.followup === "REGULAR") points += 0.3;
    
    // work impact
    if (disease.workImpact === "CANNOT_WORK") points += 0.6;
    else if (disease.workImpact === "MAJOR_WORKS") points += 0.4;
    else if (disease.workImpact === "MINOR") points += 0.2;
    
    if (points === 0) points = 1.0; // fallback if enum mismatch
    
    if (index >= 2) {
      points *= 0.5; // diminishing returns
    }
    
    totalPoints += points;
  });
  
  const percentage = Math.min(100, Math.round((totalPoints / 1.7) * 100));
  return percentage;
}

export function getDisabilityPercent(
  disabilities: any[]
): number {
  if (!disabilities || disabilities.length === 0) return 0;
  
  let totalPoints = 0;
  
  disabilities.forEach((disability, index) => {
    // maxPerDisability = 0.7 + 0.4 + 0.6 = 1.7
    let points = 0;
    
    // work impact
    if (disability.workImpact === "CANNOT_WORK") points += 0.7;
    else if (disability.workImpact === "SPECIAL_WORK") points += 0.4;
    else if (disability.workImpact === "LIMITED") points += 0.2;
    
    // companion
    if (disability.companion === "FULLY_DEPENDENT") points += 0.4;
    else if (disability.companion === "OUTSIDE_ONLY") points += 0.2;
    
    // treatment cost
    if (disability.treatmentCost === "VERY_EXPENSIVE") points += 0.6;
    else if (disability.treatmentCost === "PERIODIC_EXPENSIVE") points += 0.4;
    else if (disability.treatmentCost === "PERIODIC_CHEAP") points += 0.2;
    
    if (points === 0) points = 1.0; // fallback
    
    if (index >= 2) {
      points *= 0.5;
    }
    
    totalPoints += points;
  });
  
  const percentage = Math.min(100, Math.round((totalPoints / 1.7) * 100));
  return percentage;
}
