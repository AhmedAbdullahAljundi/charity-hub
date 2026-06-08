"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/stores/authStore";
import { useScoringStore } from "@/lib/stores/scoringStore";
import { useWizardStore } from "@/lib/stores/wizardStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertTriangle, Play, RefreshCw, Calculator, ShieldAlert, Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MedicalSummaryWidget } from "../../medical/MedicalSummaryWidget";
import { CATEGORY_LABELS } from "@/lib/disbursement/types";

export const getCategoryColorClass = (label: string) => {
  if (!label) return "";
  if (label.includes("أيتام")) return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold focus:text-purple-700 dark:focus:text-purple-300 focus:bg-purple-100 dark:focus:bg-purple-900/40";
  if (label.includes("مطلقات")) return "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 font-semibold focus:text-pink-700 dark:focus:text-pink-300 focus:bg-pink-100 dark:focus:bg-pink-900/40";
  if (label.includes("علم")) return "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-semibold focus:text-sky-700 dark:focus:text-sky-300 focus:bg-sky-100 dark:focus:bg-sky-900/40";
  if (label.includes("علاج") || label.includes("مرض") || label.includes("طبية")) return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 font-semibold focus:text-yellow-700 dark:focus:text-yellow-300 focus:bg-yellow-100 dark:focus:bg-yellow-900/40";
  if (label.includes("إعاق")) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold focus:text-indigo-700 dark:focus:text-indigo-300 focus:bg-indigo-100 dark:focus:bg-indigo-900/40";
  if (label.includes("دعم خارجي")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold focus:text-emerald-700 dark:focus:text-emerald-300 focus:bg-emerald-100 dark:focus:bg-emerald-900/40";
  if (label.includes("موسمية")) return "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 font-semibold focus:text-teal-700 dark:focus:text-teal-300 focus:bg-teal-100 dark:focus:bg-teal-900/40";
  if (label.includes("مساكين") || label.includes("فقراء")) return "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-semibold focus:text-orange-700 dark:focus:text-orange-300 focus:bg-orange-100 dark:focus:bg-orange-900/40";
  if (label.includes("منفردون")) return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-100 dark:focus:bg-rose-900/40";
  if (label.includes("سجناء")) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold focus:text-slate-700 dark:focus:text-slate-300 focus:bg-slate-200 dark:focus:bg-slate-700";
  if (label.includes("مساعدات")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-semibold focus:text-amber-800 dark:focus:text-amber-300 focus:bg-amber-200 dark:focus:bg-amber-900/40";
  if (label.includes("مسنون")) return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 font-semibold focus:text-teal-800 dark:focus:text-teal-300 focus:bg-teal-200 dark:focus:bg-teal-900/40";
  if (label.includes("هجر")) return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 font-semibold focus:text-pink-800 dark:focus:text-pink-300 focus:bg-pink-200 dark:focus:bg-pink-900/40";
  
  return "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold focus:bg-slate-100 dark:focus:bg-slate-700";
};

/* ─────────── Arabic Labels ─────────── */

const ELIGIBILITY_COLORS: Record<string, string> = {
 CRITICAL: "text-rose-600 bg-rose-50 border-rose-200",
 HIGH_NEED: "text-amber-600 bg-amber-50 border-amber-200",
 MODERATE_NEED: "text-orange-500 bg-orange-50 border-orange-200",
 LOW_NEED: "text-blue-600 bg-blue-50 border-blue-200",
 NOT_ELIGIBLE: "text-slate-600 bg-slate-50 border-slate-200",
};

const ELIGIBILITY_KEYS: string[] = ["CRITICAL", "HIGH_NEED", "MODERATE_NEED", "LOW_NEED", "NOT_ELIGIBLE"];

const LAYER_KEYS = ['L1_HEAD', 'L2_DEPENDENTS', 'L3_STUDENTS', 'L4_VULNERABILITY', 'L5_BURDENS', 'L5B_HOUSING', 'L6_HEALTH', 'L7_CORRECTIONS', 'L8_INCOME', 'FE_FRAUD'];

const LAYER_FALLBACK_PATTERNS: [RegExp, string][] = [
 [/head/i, 'L1_HEAD'],
 [/depend/i, 'L2_DEPENDENTS'],
 [/student/i, 'L3_STUDENTS'],
 [/vuln/i, 'L4_VULNERABILITY'],
 [/burden/i, 'L5_BURDENS'],
 [/hous/i, 'L5B_HOUSING'],
 [/health|disease|disab/i, 'L6_HEALTH'],
 [/correct/i, 'L7_CORRECTIONS'],
 [/income/i, 'L8_INCOME'],
 [/fraud|fe/i, 'FE_FRAUD'],
];

/** Maps any layerId variant to readable label via i18n */
function getLayerLabel(id: string, t: (key: string) => string): string {
 if (!id) return id;
 // Try exact match first
 if (LAYER_KEYS.includes(id)) return t(`wizard.evaluation.layers.${id}`);
 
 // Try matching by prefix (L1, L2, L5B, FE, etc.)
 for (const key of LAYER_KEYS) {
 const prefix = key.split('_')[0];
 if (id.toUpperCase() === prefix.toUpperCase()) {
 return t(`wizard.evaluation.layers.${key}`);
 }
 }
 
 // Fallback patterns
 for (const [pattern, key] of LAYER_FALLBACK_PATTERNS) {
 if (pattern.test(id)) return t(`wizard.evaluation.layers.${key}`);
 }
 return id;
}

/** Translates warning/factor keys via i18n */
const WARNING_KEYS = ['LOW_VERIFICATION_PENALTY', 'LOW_CONFIDENCE_REVIEW', 'MISSING_HEAD_DATA', 'INCOME_MISMATCH', 'NO_INCOME_SOURCES', 'HIGH_INCOME_WARNING', 'MISSING_NID'];

/** Translates factor keys to Arabic */
const FACTOR_LABELS: Record<string, string> = {
 // Head
 head_age_lt45: 'عمر العائل (أقل من 45)',
 head_age_45_55: 'عمر العائل (45-55)',
 head_age_55_65: 'عمر العائل (55-65)',
 head_age_gt65: 'عمر العائل (أكبر من 65)',
 // Dependents
 dependent_age_lt45: 'معال (أقل من 45)',
 dependent_age_45_55: 'معال (45-55)',
 dependent_age_55_65: 'معال (55-65)',
 dependent_age_gt65: 'معال (أكبر من 65)',
 // Students
 student_primary: 'طالب ابتدائي',
 student_preparatory: 'طالب إعدادي',
 student_secondary: 'طالب ثانوي',
 student_university: 'طالب جامعي',
 // Vulnerability
 no_provider: 'بلا عائل',
 orphan: 'يتيم',
 prison: 'سجين',
 displaced: 'مشتت',
 // Corrections
 correction_head_employment: 'تصحيح عمل العائل',
 correction_son_employment: 'تصحيح عمل الابن',
 correction_son_contributor: 'تصحيح مساهمة الابن',
 family_support: 'دعم عائلي',
 food_assistance: 'مساعدات غذائية',
 bank_assets: 'أصول بنكية/عينية',
 // Income
 income_low_verify: 'ضعف التوثيق',
 income_divisor_score: 'تقييم مستوى الدخل',
 // Health
 disease_treatment: 'تكلفة علاج مرض',
 disease_followup: 'متابعة مرض',
 disease_work_impact: 'تأثير مرض على العمل',
 disability_work_impact: 'تأثير إعاقة على العمل',
 disability_companion: 'مرافق إعاقة',
 disability_treatment: 'تكلفة علاج إعاقة',
 // Burdens
 bride: 'عروسة',
 son_prison: 'ابن مسجون',
 debt: 'ديون',
 surgery: 'عمليات جراحية',
 housing_rented: 'سكن إيجار',
 housing_shared: 'سكن مشترك',
 // Alimony
 alimony_informal_sufficient: 'نفقة ودية مجزئة',
 alimony_informal_insufficient: 'نفقة ودية غير مجزئة',
};

function translateWarning(w: string, t: (key: string) => string): string {
 if (WARNING_KEYS.includes(w)) return t(`wizard.evaluation.warnings_labels.${w}`);
 return w.replace(/_/g, ' ');
}

function getFactorLabel(f: any, t: (key: string) => string, tRules: any): string {
  if (typeof f === 'string') {
    if (tRules.has(f)) {
      return tRules(f);
    }
    return FACTOR_LABELS[f] || f.replace(/_/g, ' ');
  }
  
  let ruleId = f.id || f.ruleId || f.factorKey;
  if (ruleId) {
    if (ruleId.startsWith("burden_person_prisoner_")) {
      const nameMatch = f.label?.match(/Prisoner\s+(.*?)\s*:/i);
      const name = nameMatch ? nameMatch[1] : "";
      return name ? `${tRules("burden_son_in_prison")} (${name})` : tRules("burden_son_in_prison");
    }
    if (ruleId.startsWith("burden_person_bride_")) {
      const nameMatch = f.label?.match(/Bride\s+(.*?)\s*:/i);
      const name = nameMatch ? nameMatch[1] : "";
      return name ? `${tRules("burden_bride")} (${name})` : tRules("burden_bride");
    }
    if (ruleId.startsWith("disease_")) {
      const diseaseName = f.label || ruleId.split("_").slice(2).join("_");
      return `${tRules("disease_treatment")} (${diseaseName})`;
    }
    if (ruleId.startsWith("disability_")) {
      const desc = f.label || "";
      return desc ? `${tRules("disability_work_impact")} (${desc})` : tRules("disability_work_impact");
    }
    
    if (tRules.has(ruleId)) {
      return tRules(ruleId);
    }
  }

  const key = f.factorKey || f.ruleId || f.labelKey || f.key || f.label || f.name || f.id || '';
  if (FACTOR_LABELS[key]) return FACTOR_LABELS[key];
  for (const [mapKey, label] of Object.entries(FACTOR_LABELS)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return label;
  }
  if (typeof key === 'string' && key.length > 0) {
    if (/^[a-z_]+$/.test(key)) return key.replace(/_/g, ' ');
    const match = key.match(/^([a-z_]+)/);
    if (match && FACTOR_LABELS[match[1]]) return FACTOR_LABELS[match[1]];
  }
  if (f.layerId) {
    const layerName = getLayerLabel(f.layerId, t);
    return `${layerName}`;
  }
  return f.label || f.name || key || f.id;
}

function getFactorValue(f: any): number | null {
 const v = f.value ?? f.score ?? f.weight ?? f.contribution;
 return v !== undefined && v !== null ? Number(v) : null;
}

/* ─────────── Component ─────────── */

export function EvaluationStep() {
 const t = useTranslations("households");
 const tRules = useTranslations("rules");
 const user = useAuthStore((s) => s.user);
 const householdId = useWizardStore((s) => s.householdId);

 const liveScore = useScoringStore((s) => s.liveScore);
 const isCalculating = useScoringStore((s) => s.isCalculating);
  const calculate = useScoringStore((s) => s.calculate);

 const [decision, setDecision] = useState({
 humanDecision: "",
 categoryClass: "",
 reviewStatus: "PENDING",
 decisionNote: "",
 });
 const [isDecisionSaved, setIsDecisionSaved] = useState(false);
  const [layerOverrides, setLayerOverrides] = useState<Record<string, number>>({});
  const [localSimResult, setLocalSimResult] = useState<{ 
    originalPct: number; 
    simPct: number; 
    delta: number;
    origEligibility: string;
    simEligibility: string;
  } | null>(null);

  // Initialize overrides with current score
  useEffect(() => {
    if (liveScore?.layerBreakdown) {
      const overrides: Record<string, number> = {};
      liveScore.layerBreakdown.forEach((l: any) => {
        overrides[l.layerId] = Number(l.cappedScore);
      });
      // Ensure all 9 layers exist even if missing
      LAYER_KEYS.forEach(k => {
        if (overrides[k] === undefined) overrides[k] = 0;
      });
      setLayerOverrides(overrides);
    }
  }, [liveScore]);

  // Auto-set humanDecision based on categoryClass
  useEffect(() => {
    if (!decision.categoryClass || !liveScore) return;

    let autoDecision = decision.humanDecision;
    const cat = decision.categoryClass;
    const pct = Number(liveScore.normalizedPercent || 0);

    const monthlyCashCats = [
      "كفالة أيتام", "أيتام",
      "ملف إعاقة", "إعاقة",
      "طلاب علم", "طالب علم",
      "أسر سجناء",
      "مساعدات",
      "منفردون",
      "كبار سن",
      "مسنون",
      "مطلقات",
      "مساكين",
      "فقراء",
      "حالات هجر",
      "دعم خارجي"
    ];

    if (monthlyCashCats.includes(cat)) {
      autoDecision = "MONTHLY_CASH";
    } else if (cat === "علاج شهري" || cat === "أمراض مزمنة") {
      autoDecision = "MONTHLY_MEDICAL";
    } else if (cat === "لا يستحق المساعدة") {
      autoDecision = "NONE";
    } else if (cat === "مساعدات موسمية") {
      if (pct >= 40) {
        autoDecision = "SEASONAL_MIXED";
      } else if (pct >= 10) {
        autoDecision = "GOODS_ONLY";
      } else {
        autoDecision = "NONE";
      }
    }

    if (autoDecision !== decision.humanDecision && autoDecision !== "") {
      setDecision(prev => ({ ...prev, humanDecision: autoDecision }));
    }
  }, [decision.categoryClass, liveScore]);

  const getEligibilityLevel = (pct: number) => {
    if (pct >= 80) return "CRITICAL";
    if (pct >= 60) return "HIGH_NEED";
    if (pct >= 40) return "MODERATE_NEED";
    if (pct >= 20) return "LOW_NEED";
    return "NOT_ELIGIBLE";
  };

  const runLocalSimulation = () => {
    if (!liveScore) return;
    const origPct = Number(liveScore.normalizedPercent);
    // User requested the weights NOT be modified, meaning THEORETICAL_MAX is 15.0
    // So percentage is sum / 15.0 * 100
    const sum = LAYER_KEYS.reduce((acc, key) => acc + (Number(layerOverrides[key]) || 0), 0);
    const simPct = Math.min(100, Math.max(0, (sum / 15.0) * 100));
    setLocalSimResult({
      originalPct: origPct,
      simPct: simPct,
      delta: simPct - origPct,
      origEligibility: liveScore.systemRecommendation,
      simEligibility: getEligibilityLevel(simPct)
    });
  };

 const handleCalculate = async () => {
 if (householdId) await calculate(householdId);
 };

  const submitDecision = async () => {
    if (!householdId) return;
    const { decideScore } = await import("@/lib/api/scoring-api");
    try {
      const assistanceTypeMap: Record<string, string> = {
        MONTHLY_CASH: "نقدية شهرية",
        MONTHLY_MEDICAL: "مساعدة طبية",
        SEASONAL_MIXED: "موسمية/عينية",
        GOODS_ONLY: "مواد عينية",
        NONE: "لا مساعدة"
      };

      const assistanceText = decision.humanDecision 
        ? `[نوع المساعدة: ${assistanceTypeMap[decision.humanDecision] || decision.humanDecision}] ` 
        : "";

      const payload = {
        humanDecision: decision.reviewStatus, // Maps APPROVED, REJECTED etc.
        reviewStatus: "DECIDED",              // Enforced by backend enum
        categoryClass: decision.categoryClass,
        assistanceType: decision.humanDecision,
        decisionNote: `${assistanceText}${decision.decisionNote}`.trim()
      };

      await decideScore(householdId, payload);
      setIsDecisionSaved(true);
    } catch (e) {
      console.error("Decision failed", e);
    }
  };

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col" >
<div className="flex-1 overflow-y-auto">
 {/* ══════════════════════════════════════════════════
 القسم 1: التقييم التلقائي
 ══════════════════════════════════════════════════ */}
 <section className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden">
 <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
 <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
 <BarChart3 className="w-5 h-5 text-primary" /> {t("wizard.evaluation.autoEvaluation")}
 </h3>
 <Button onClick={handleCalculate} disabled={!householdId || isCalculating} variant="outline" size="sm">
 {isCalculating ? <RefreshCw className="w-4 h-4 me-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 me-1.5" />}
 {liveScore ? t("wizard.evaluation.recalculate") : t("wizard.evaluation.calculateScore")}
 </Button>
 </div>

 {!liveScore ? (
 <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
 <Calculator className="w-12 h-12 text-muted-foreground/20" />
 <p className="text-sm text-muted-foreground">{t("wizard.evaluation.notCalculated")}</p>
 </div>
 ) : (
 <div className="p-4 space-y-5">

 {/* Score Summary Row */}
 <div className="flex items-center gap-5 flex-wrap">
 {/* Circle */}
 <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
 <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
 <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="2.5" />
 <motion.circle
 cx="18" cy="18" r="15" fill="none"
 className="stroke-primary"
 strokeWidth="2.5"
 strokeLinecap="round"
 strokeDasharray="94.25"
 initial={{ strokeDashoffset: 94.25 }}
 animate={{ strokeDashoffset: 94.25 - (94.25 * Number(liveScore.normalizedPercent) / 100) }}
 transition={{ duration: 1, delay: 0.2 }}
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-xl font-bold">{Math.round(Number(liveScore.normalizedPercent))}%</span>
 </div>
 </div>

 {/* Info */}
 <div className="flex flex-col gap-1.5">
 <Badge className={cn("text-sm px-3 py-1 w-fit", ELIGIBILITY_COLORS[liveScore.systemRecommendation] || "")}>
 {t(`wizard.evaluation.eligibility.${liveScore.systemRecommendation}`) || liveScore.systemRecommendation}
 </Badge>
 {liveScore.scoreDelta !== null && liveScore.scoreDelta !== undefined && (
 <span className={cn("text-xs font-medium", Number(liveScore.scoreDelta) >= 0 ? "text-emerald-600" : "text-rose-600")}>
 {Number(liveScore.scoreDelta) >= 0 ? "▲" : "▼"} {Number(liveScore.scoreDelta) > 0 ? "+" : ""}{Number(liveScore.scoreDelta).toFixed(1)} {t("wizard.evaluation.fromLastScore")}
 </span>
 )}
  <span className="text-xs text-muted-foreground">
  {t("wizard.evaluation.calculatedAt")}: {liveScore.calculatedAt ? new Date(liveScore.calculatedAt).toLocaleString("ar-EG", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
  </span>
 </div>

 {/* Warnings (compact) */}
 {liveScore.warnings && liveScore.warnings.length > 0 && (
 <div className="mr-auto bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg px-3 py-2 max-w-sm">
 <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 flex items-center gap-1 mb-1">
 <AlertTriangle className="w-3 h-3" /> تنبيهات ({liveScore.warnings.length})
 </h4>
 <ul className="space-y-0.5">
 {liveScore.warnings.map((w: string, i: number) => (
 <li key={i} className="text-xs text-amber-700 dark:text-amber-400/80">{translateWarning(w, t)}</li>
 ))}
 </ul>
 </div>
 )}
 </div>

  {/* Layer Breakdown Table */}
  <div className="space-y-2.5">
  <div className="flex items-center justify-between">
    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("wizard.evaluation.layerBreakdown")}</h4>
  </div>
  <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 max-h-64 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 shadow-inner">
  {liveScore.layerBreakdown?.map((layer: any, index: number) => {
  const score = Number(layer.score);
  const capVal = Number(layer.cap);
  const cap = isNaN(capVal) || capVal === 0 ? 1 : capVal; // Safe cap
  const isNeg = score < 0 || cap < 0;
  const pct = Math.min(100, (Math.abs(score) / Math.abs(cap)) * 100);
  const barColor = isNeg ? 'bg-rose-500' : pct > 60 ? 'bg-orange-500' : pct > 30 ? 'bg-amber-400' : 'bg-emerald-500';
  
  const isLastOdd = index === liveScore.layerBreakdown.length - 1 && liveScore.layerBreakdown.length % 2 !== 0;

  return (
  <div key={layer.layerId} className={cn("group flex flex-col gap-2 p-2.5 bg-white dark:bg-slate-950 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-all duration-200 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm", isLastOdd ? "md:col-span-2" : "")}>
  <div className="flex justify-between items-center">
  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs truncate" title={getLayerLabel(layer.layerId, t)}>{getLayerLabel(layer.layerId, t)}</span>
  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide", isNeg ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300")}>
  {Math.round(pct)}%
  </span>
  </div>
  <div className="w-full bg-slate-100/80 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden flex shadow-inner">
  <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)} style={{ width: `${pct}%` }} />
  </div>
  </div>
  );
  })}
  </div>
  </div>
  </div>
  )}
  </section>

 {/* ══════════════════════════════════════════════════
 القسم 2: المؤشرات والتوصيات
 ══════════════════════════════════════════════════ */}
 {liveScore && (
 <section className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden mt-6">
 <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
 <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
 <Activity className="w-5 h-5 text-indigo-500" /> {t("wizard.evaluation.indicatorsAndRecommendations")}
 </h3>
 </div>
 <div className="p-4">
 <div className="grid md:grid-cols-2 gap-4">
 {/* Positive Factors */}
 <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 p-4">
 <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-500 flex items-center gap-1.5 mb-3">
 <TrendingUp className="w-4 h-4" /> {t("wizard.evaluation.positiveFactors")}
 </h4>
 {liveScore.topPositiveFactors && liveScore.topPositiveFactors.length > 0 ? (
 <div className="space-y-1.5">
 {liveScore.topPositiveFactors.map((f: any, i: number) => {
 const val = getFactorValue(f);
 return (
 <div key={i} className="flex justify-between items-center bg-white/70 dark:bg-slate-950/50 rounded-lg px-3 py-1.5 border border-emerald-100/50 dark:border-emerald-900/30">
 <span className="text-sm text-emerald-900 dark:text-emerald-100/80">{getFactorLabel(f, t, tRules)}</span>
 {val !== null && (
 <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
 +{Math.abs(val).toFixed(2)}
 </span>
 )}
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 italic">{t("wizard.evaluation.noPositiveFactors")}</p>
 )}
 </div>

 {/* Negative Factors */}
 <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50 p-4">
 <h4 className="text-sm font-bold text-rose-800 dark:text-rose-500 flex items-center gap-1.5 mb-3">
 <TrendingDown className="w-4 h-4" /> {t("wizard.evaluation.negativeFactors")}
 </h4>
 {liveScore.topNegativeFactors && liveScore.topNegativeFactors.length > 0 ? (
 <div className="space-y-1.5">
 {liveScore.topNegativeFactors.map((f: any, i: number) => {
 const val = getFactorValue(f);
 return (
 <div key={i} className="flex justify-between items-center bg-white/70 dark:bg-slate-950/50 rounded-lg px-3 py-1.5 border border-rose-100/50 dark:border-rose-900/30">
 <span className="text-sm text-rose-900 dark:text-rose-100/80">{getFactorLabel(f, t, tRules)}</span>
 {val !== null && (
 <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
 {val.toFixed(2)}
 </span>
 )}
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-sm text-rose-600/70 dark:text-rose-400/70 italic">{t("wizard.evaluation.noNegativeFactors")}</p>
 )}
 </div>
 </div>

 {/* Recommendations */}
 {liveScore.recommendations && liveScore.recommendations.length > 0 && (
 <div className="mt-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50 p-4">
 <h4 className="text-sm font-bold text-blue-800 dark:text-blue-500 flex items-center gap-1.5 mb-2">
 <CheckCircle2 className="w-4 h-4" /> {t("wizard.evaluation.systemRecommendations")}
 </h4>
 <ul className="space-y-1">
 {liveScore.recommendations.map((r: string, i: number) => (
 <li key={i} className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
 <span className="text-blue-400 mt-0.5">•</span>
 <span>{r}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </section>
 )}

  {/* Medical Summary Widget */}
  {householdId && (
    <div className="mt-4">
      <MedicalSummaryWidget householdId={householdId} />
    </div>
  )}

 {/* ══════════════════════════════════════════════════
 القسم 3: قرار اللجنة
 ══════════════════════════════════════════════════ */}
 {liveScore && (
 <section className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden mt-6">
 <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-950/20">
 <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
 <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-500" /> {t("wizard.evaluation.committeeDecision")}
 </h3>
 </div>

 <div className="p-4">
 {isDecisionSaved ? (
 <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-500">
 <CheckCircle2 className="w-5 h-5 shrink-0" />
 <div>
 <p className="font-bold">✓ {t("wizard.evaluation.decisionSaved")}</p>
 <p className="text-sm opacity-90 mt-1 dark:text-emerald-400/80">{t("wizard.evaluation.decisionSavedDesc")}</p>
 </div>
 </div>
 ) : (
 <div className="grid gap-5 md:grid-cols-3 sm:grid-cols-2">
 <div className="space-y-2">
 <Label className="text-sm font-semibold">{t("wizard.evaluation.decisionType")}</Label>
 <Select value={decision.humanDecision} onValueChange={(v) => setDecision({ ...decision, humanDecision: v })}>
 <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="MONTHLY_CASH">{t("wizard.evaluation.decisionOptions.cash")}</SelectItem>
 <SelectItem value="MONTHLY_MEDICAL">{t("wizard.evaluation.decisionOptions.medical")}</SelectItem>
 <SelectItem value="SEASONAL_MIXED">{t("wizard.evaluation.decisionOptions.mixed")}</SelectItem>
 <SelectItem value="GOODS_ONLY">{t("wizard.evaluation.decisionOptions.goods")}</SelectItem>
 <SelectItem value="NONE">{t("wizard.evaluation.decisionOptions.none")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label className="text-sm font-semibold">{t("wizard.evaluation.categoryClass")}</Label>
 <Select value={decision.categoryClass} onValueChange={(v) => setDecision({ ...decision, categoryClass: v })}>
 <SelectTrigger className={cn(getCategoryColorClass(CATEGORY_LABELS[decision.categoryClass as keyof typeof CATEGORY_LABELS] || decision.categoryClass))}>
   <SelectValue placeholder="" />
 </SelectTrigger>
 <SelectContent className="w-[500px]">
  <div className="grid grid-cols-3 gap-2 p-1">
  {Object.entries(CATEGORY_LABELS).map(([code, label]) => {
    const colorClass = getCategoryColorClass(label);
    return (
      <SelectItem key={code} value={code} className={cn("cursor-pointer font-medium border border-transparent shadow-sm", colorClass)}>
        {label}
      </SelectItem>
    );
  })}
  <SelectItem value="لا يستحق المساعدة" className="text-rose-600 dark:text-rose-400 font-bold focus:text-rose-700 dark:focus:text-rose-300 col-span-3 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">لا يستحق المساعدة</SelectItem>
  </div>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label className="text-sm font-semibold">{t("wizard.evaluation.reviewStatus")}</Label>
 <Select value={decision.reviewStatus} onValueChange={(v) => setDecision({ ...decision, reviewStatus: v })}>
 <SelectTrigger><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="APPROVED">{t("wizard.evaluation.statusOptions.approved")}</SelectItem>
 <SelectItem value="REJECTED">{t("wizard.evaluation.statusOptions.rejected")}</SelectItem>
 <SelectItem value="NEEDS_REVIEW">{t("wizard.evaluation.statusOptions.needsReview")}</SelectItem>
 <SelectItem value="ESCALATED">{t("wizard.evaluation.statusOptions.escalated")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2 md:col-span-3 sm:col-span-2">
 <Label className="text-sm font-semibold">{t("wizard.evaluation.decisionNote")}</Label>
 <Textarea
 className="resize-none min-h-[80px]"
 placeholder={t("wizard.evaluation.decisionNotePlaceholder")}
 value={decision.decisionNote}
 onChange={(e) => setDecision({ ...decision, decisionNote: e.target.value })}
 />
 </div>

 <div className="sm:col-span-2 flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button onClick={submitDecision} disabled={!decision.humanDecision || !decision.categoryClass} className="min-w-[200px]">
 {t("wizard.evaluation.submitDecision")}
 </Button>
 </div>
 </div>
 )}
 </div>
 </section>
 )}

 {/* ══════════════════════════════════════════════════
 المحاكاة (ماذا لو)
 ══════════════════════════════════════════════════ */}
 {liveScore && user?.role === 'ADMIN' && (
  <section className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden mt-6">
  <div className="flex items-center justify-between p-4 border-b bg-indigo-50/30 dark:bg-indigo-950/20">
    <div className="flex items-center gap-2">
      <Play className="w-5 h-5 text-indigo-500" />
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t("wizard.evaluation.simulation.title")}</h3>
    </div>
    <Badge variant="outline" className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-medium">
    ميزة لمدير النظام فقط
    </Badge>
  </div>
  <div className="p-4 space-y-4">

 <p className="text-xs text-muted-foreground">{t("wizard.evaluation.simulation.disclaimer")}</p>

 <div className="bg-muted/20 p-3 rounded-xl border">
 <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
 {LAYER_KEYS.map(layerId => (
 <div key={layerId} className="space-y-1">
 <Label className="text-[11px] truncate" title={getLayerLabel(layerId, t)}>{getLayerLabel(layerId, t)}</Label>
 <Input 
 type="number" 
 step="0.01"
 className="h-8 text-xs font-mono"
 value={Number.isNaN(layerOverrides[layerId]) ? "" : (layerOverrides[layerId] ?? "")}
 onChange={(e) => setLayerOverrides({...layerOverrides, [layerId]: parseFloat(e.target.value)})}
 />
 </div>
 ))}
 </div>
 <div className="mt-4 flex justify-end">
 <Button variant="secondary" onClick={runLocalSimulation} size="sm" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
 {t("wizard.evaluation.simulation.run")}
 </Button>
 </div>
 </div>

 {localSimResult && (
 <div className="p-4 border-2 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl space-y-3 max-h-48 overflow-y-auto">
 <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-400">{t("wizard.evaluation.simulation.results")}</h4>

 <div className="flex items-center gap-3">
 <div className="flex-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center relative">
 <p className="text-[10px] text-muted-foreground mb-0.5">{t("wizard.evaluation.simulation.original")}</p>
 <p className="text-lg font-bold mb-1 dark:text-slate-200">{Math.round(localSimResult.originalPct)}%</p>
 <Badge className={cn("text-[10px] px-2 py-0 font-normal", ELIGIBILITY_COLORS[localSimResult.origEligibility] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300")}>
 {t(`wizard.evaluation.eligibility.${localSimResult.origEligibility}`) || localSimResult.origEligibility}
 </Badge>
 </div>
 <span className="text-lg text-muted-foreground">→</span>
 <div className="flex-1 bg-indigo-100 p-2.5 rounded-lg border border-indigo-200 text-center relative">
 <p className="text-[10px] text-indigo-600 mb-0.5">{t("wizard.evaluation.simulation.simulated")}</p>
 <p className="text-lg font-bold text-indigo-900 mb-1">{Math.round(localSimResult.simPct)}%</p>
 <Badge className={cn("text-[10px] px-2 py-0 font-normal", ELIGIBILITY_COLORS[localSimResult.simEligibility] || "bg-slate-100 text-slate-800")}>
 {t(`wizard.evaluation.eligibility.${localSimResult.simEligibility}`) || localSimResult.simEligibility}
 </Badge>
 </div>
 <div className="flex-1 bg-white p-2.5 rounded-lg border text-center flex flex-col justify-center">
 <p className="text-[10px] text-muted-foreground mb-0.5">{t("wizard.evaluation.simulation.difference")}</p>
 <p className={cn("text-lg font-bold", localSimResult.delta > 0 ? "text-emerald-600" : localSimResult.delta < 0 ? "text-rose-600" : "text-slate-600")}>
 {localSimResult.delta > 0 ? "+" : ""}{localSimResult.delta.toFixed(1)}
 </p>
 </div>
 </div>
 </div>
 )}

 </div>
 </section>
 )}

 </div></div>
 );
}
