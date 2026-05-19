"use client";

import { useState } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Play, RefreshCw, Calculator, ShieldAlert, Heart, Activity } from "lucide-react";
import { motion } from "framer-motion";

const ELIGIBILITY_COLORS: Record<string, string> = {
  CRITICAL: "text-rose-600 bg-rose-50 border-rose-200",
  HIGH_NEED: "text-amber-600 bg-amber-50 border-amber-200",
  MODERATE_NEED: "text-orange-500 bg-orange-50 border-orange-200",
  LOW_NEED: "text-blue-600 bg-blue-50 border-blue-200",
  NOT_ELIGIBLE: "text-slate-600 bg-slate-50 border-slate-200",
};

const ELIGIBILITY_LABELS: Record<string, string> = {
  CRITICAL: "حرجة جداً",
  HIGH_NEED: "احتياج عالي",
  MODERATE_NEED: "احتياج متوسط",
  LOW_NEED: "احتياج منخفض",
  NOT_ELIGIBLE: "غير مستحق",
};

export function EvaluationStep() {
  const user = useAuthStore((s) => s.user);
  const householdId = useWizardStore((s) => s.householdId);
  
  const liveScore = useScoringStore((s) => s.liveScore);
  const isCalculating = useScoringStore((s) => s.isCalculating);
  const calculate = useScoringStore((s) => s.calculate);
  const simulate = useScoringStore((s) => s.simulate);
  const simulationResult = useScoringStore((s) => s.simulationResult);

  const [decision, setDecision] = useState({
    humanDecision: "",
    categoryClass: "",
    reviewStatus: "PENDING",
    decisionNote: "",
  });
  const [isDecisionSaved, setIsDecisionSaved] = useState(false);

  const [simFields, setSimFields] = useState({
    housingType: "RENTED",
    totalIncome: "",
    employmentType: "REGULAR",
  });

  const handleCalculate = async () => {
    if (householdId) await calculate(householdId);
  };

  const submitDecision = async () => {
    if (!householdId) return;
    const { decideScore } = await import("@/lib/api/scoring-api");
    try {
      await decideScore(householdId, decision);
      setIsDecisionSaved(true);
    } catch (e) {
      console.error("Decision failed", e);
    }
  };

  const runSimulation = async () => {
    if (!householdId) return;
    const modifications = [];
    if (simFields.housingType) modifications.push({ field: "housingType", value: simFields.housingType });
    if (simFields.totalIncome) modifications.push({ field: "totalIncome", value: Number(simFields.totalIncome) });
    if (simFields.employmentType) modifications.push({ field: "employmentType", value: simFields.employmentType });
    await simulate(householdId, modifications);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
      
      {/* PART 1: نتيجة النظام */}
      <section className="bg-card border rounded-xl p-6 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> نتيجة النظام (System Evaluation)
        </h3>

        {!liveScore ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <Calculator className="w-16 h-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">لم يتم حساب التقييم بعد لهذه الأسرة.</p>
            <Button onClick={handleCalculate} disabled={!householdId || isCalculating} size="lg">
              {isCalculating ? <RefreshCw className="w-5 h-5 me-2 animate-spin" /> : <Calculator className="w-5 h-5 me-2" />}
              احسب النتيجة الآن
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-6">
              
              <div className="flex items-center gap-6 p-4 bg-muted/10 rounded-xl border border-primary/10">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="16" fill="none"
                      className="stroke-primary"
                      strokeWidth="3"
                      strokeDasharray="100"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - Number(liveScore.normalizedPercent) }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{Math.round(Number(liveScore.normalizedPercent))}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge className={`text-sm px-3 py-1 ${ELIGIBILITY_COLORS[liveScore.systemRecommendation] || ""}`}>
                    {ELIGIBILITY_LABELS[liveScore.systemRecommendation] || liveScore.systemRecommendation}
                  </Badge>
                  {liveScore.scoreDelta !== null && liveScore.scoreDelta !== undefined && (
                    <div className={`text-xs font-medium ${Number(liveScore.scoreDelta) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {Number(liveScore.scoreDelta) >= 0 ? "▲" : "▼"} {Number(liveScore.scoreDelta) > 0 ? "+" : ""}{Number(liveScore.scoreDelta).toFixed(1)} عن آخر تقييم
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">تاريخ الحساب: {new Date(liveScore.calculatedAt ?? "").toLocaleDateString("ar-EG")}</p>
                </div>

                <div className="ms-auto">
                  <Button onClick={handleCalculate} disabled={isCalculating} variant="outline" size="sm">
                    {isCalculating ? <RefreshCw className="w-4 h-4 me-2 animate-spin" /> : <RefreshCw className="w-4 h-4 me-2" />}
                    أعد الحساب
                  </Button>
                </div>
              </div>

              {/* Layer Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">تفصيل الطبقات (Layer Breakdown)</h4>
                <div className="space-y-2">
                  {liveScore.layerBreakdown?.map((layer) => (
                    <div key={layer.layerId} className="flex items-center gap-4 text-sm bg-muted/20 p-2 rounded-lg border">
                      <div className="w-32 font-medium">{layer.layerId}</div>
                      <div className="w-16 font-mono text-right">{Number(layer.score).toFixed(1)}</div>
                      <div className="w-16 font-mono text-muted-foreground">/ {layer.cap}</div>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${Math.min(100, (Number(layer.score) / Number(layer.cap)) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-6">
              
              {/* Warnings & Recs */}
              {liveScore.warnings && liveScore.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-rose-700 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> تحذيرات النظام</h4>
                  <div className="flex flex-col gap-1">
                    {liveScore.warnings.map((w, i) => (
                      <Badge key={i} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 justify-start h-auto text-wrap text-right">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {liveScore.recommendations && liveScore.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> التوصيات</h4>
                  <div className="flex flex-col gap-1">
                    {liveScore.recommendations.map((r, i) => (
                      <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 justify-start h-auto text-wrap text-right">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Factors */}
              <div className="grid gap-4">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <h5 className="text-xs font-bold text-emerald-800 mb-2">أعلى عوامل إيجابية</h5>
                  <ul className="text-xs space-y-1 text-emerald-700 list-disc list-inside">
                    {liveScore.topPositiveFactors?.map((f: any, i) => <li key={i}>{f.name ?? String(f)}</li>) || <li>لا يوجد</li>}
                  </ul>
                </div>
                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                  <h5 className="text-xs font-bold text-rose-800 mb-2">أعلى عوامل سلبية</h5>
                  <ul className="text-xs space-y-1 text-rose-700 list-disc list-inside">
                    {liveScore.topNegativeFactors?.map((f: any, i) => <li key={i}>{f.name ?? String(f)}</li>) || <li>لا يوجد</li>}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </section>

      {/* PART 2: قرار اللجنة */}
      {user?.role === "SUPERVISOR" && liveScore && (
        <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> قرار اللجنة (Committee Decision)
          </h3>

          {isDecisionSaved ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-bold">✓ تم اتخاذ القرار وتسجيله بنجاح</p>
                <p className="text-sm opacity-90 mt-1">تُعرض هذه الأسرة الآن في لوحة المتابعة الميدانية بناءً على قرارك.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع المساعدة المقررة</Label>
                <Select value={decision.humanDecision} onValueChange={(v) => setDecision({ ...decision, humanDecision: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر المساعدة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY_CASH">مساعدة نقدية شهرية</SelectItem>
                    <SelectItem value="MONTHLY_MEDICAL">علاجية شهرية</SelectItem>
                    <SelectItem value="SEASONAL_MEDICAL">علاجية موسمية</SelectItem>
                    <SelectItem value="SEASONAL_CASH">عطاء ومال موسمي</SelectItem>
                    <SelectItem value="ALL_SEASONAL">علاجية ومالية وعطائية موسمية</SelectItem>
                    <SelectItem value="GOODS_ONLY">عطائية فقط</SelectItem>
                    <SelectItem value="NONE">لا يستحق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>تصنيف الفئة</Label>
                <Select value={decision.categoryClass} onValueChange={(v) => setDecision({ ...decision, categoryClass: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POOR">فقراء</SelectItem>
                    <SelectItem value="VERY_POOR">مساكين</SelectItem>
                    <SelectItem value="PRISONERS_FAM">أسر سجناء</SelectItem>
                    <SelectItem value="ORPHANS">أيتام</SelectItem>
                    <SelectItem value="ELDERLY">مسنون</SelectItem>
                    <SelectItem value="DISABLED">ذوو إعاقة</SelectItem>
                    <SelectItem value="OTHER">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>قرار النظام للمتابعة</Label>
                <Select value={decision.reviewStatus} onValueChange={(v) => setDecision({ ...decision, reviewStatus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">موافقة</SelectItem>
                    <SelectItem value="REJECTED">رفض</SelectItem>
                    <SelectItem value="NEEDS_REVIEW">يحتاج مراجعة</SelectItem>
                    <SelectItem value="ESCALATED">تصعيد للمشرف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>ملاحظة القرار</Label>
                <Textarea 
                  placeholder="اكتب أسباب وحيثيات القرار هنا..." 
                  value={decision.decisionNote} 
                  onChange={(e) => setDecision({ ...decision, decisionNote: e.target.value })} 
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-4 border-t">
                <Button onClick={submitDecision} disabled={!decision.humanDecision || !decision.categoryClass} className="w-full sm:w-auto">
                  تسجيل القرار واعتماده
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* PART 3: ماذا لو؟ */}
      {liveScore && (
        <section>
          <Accordion type="single" collapsible className="bg-card border rounded-xl px-4">
            <AccordionItem value="sim" className="border-none">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4 flex gap-2">
                <Play className="w-5 h-5 text-indigo-500" />
                محاكاة — ماذا لو تغيرت البيانات؟
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 pb-6">
                
                <p className="text-sm text-muted-foreground mb-4">هذه المحاكاة لا تُحفظ ولا تؤثر على البيانات الفعلية في قاعدة البيانات.</p>
                
                <div className="grid gap-4 sm:grid-cols-3 bg-muted/20 p-4 rounded-xl border">
                  <div className="space-y-2">
                    <Label className="text-xs">نوع السكن الافتراضي</Label>
                    <Select value={simFields.housingType} onValueChange={(v) => setSimFields({ ...simFields, housingType: v })}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNED">ملك (0.0)</SelectItem>
                        <SelectItem value="SHARED">مشترك (0.3)</SelectItem>
                        <SelectItem value="DONATED_RENT">متبرع به (0.4)</SelectItem>
                        <SelectItem value="RENTED">إيجار (0.7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">دخل افتراضي بديل (جنيه)</Label>
                    <Input className="h-8 text-xs bg-white dark:bg-black" type="number" placeholder="مثال: 3000" value={simFields.totalIncome} onChange={(e) => setSimFields({ ...simFields, totalIncome: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">نوع عمل العائل</Label>
                    <Select value={simFields.employmentType} onValueChange={(v) => setSimFields({ ...simFields, employmentType: v })}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يعمل</SelectItem>
                        <SelectItem value="WEAK">يومية ضعيفة</SelectItem>
                        <SelectItem value="SEASONAL">موسمي</SelectItem>
                        <SelectItem value="REGULAR">منتظم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <Button variant="secondary" onClick={runSimulation} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300">
                      شاهد التأثير (بدون حفظ)
                    </Button>
                  </div>
                </div>

                {simulationResult && (
                  <div className="mt-4 p-4 border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl space-y-4">
                    <h4 className="font-bold text-indigo-800 dark:text-indigo-400">نتائج المحاكاة</h4>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white dark:bg-black p-3 rounded-lg border text-center">
                        <p className="text-xs text-muted-foreground mb-1">الدرجة الأصلية</p>
                        <p className="text-xl font-bold">{Math.round(simulationResult.originalScore.normalizedPercent)}%</p>
                      </div>
                      <div className="text-2xl text-muted-foreground">→</div>
                      <div className="flex-1 bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg border border-indigo-200 text-center">
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-1">الدرجة المحاكاة</p>
                        <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{Math.round(simulationResult.simulatedScore.normalizedPercent)}%</p>
                      </div>
                      <div className="flex-1 bg-white dark:bg-black p-3 rounded-lg border text-center">
                        <p className="text-xs text-muted-foreground mb-1">الفرق</p>
                        <p className={`text-xl font-bold ${simulationResult.scoreDelta > 0 ? "text-emerald-600" : simulationResult.scoreDelta < 0 ? "text-rose-600" : "text-slate-600"}`}>
                          {simulationResult.scoreDelta > 0 ? "+" : ""}{simulationResult.scoreDelta.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold">الطبقات المتأثرة:</p>
                      {simulationResult.affectedLayers.map((l, i) => (
                        <div key={i} className="text-xs flex justify-between bg-white/50 dark:bg-black/50 p-2 rounded">
                          <span className="font-medium">{l.layerId}</span>
                          <span className="text-muted-foreground">{l.before} → <span className="font-bold text-foreground">{l.after}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}

    </div>
  );
}
