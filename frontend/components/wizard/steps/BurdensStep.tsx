"use client";

import { useWizardStore } from "@/lib/stores/wizardStore";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, AlertCircle } from "lucide-react";

export function BurdensStep() {
  const fd = useWizardStore((s) => s.formData);
  const setField = useWizardStore((s) => s.setField);
  
  const burdens = fd.burdens ?? {};
  const diseases = fd.diseases ?? [];
  const disabilities = fd.disabilities ?? [];
  const members = [...(fd.head?.name ? [{ id: fd.head.id, _localKey: "head", name: fd.head.name, role: "HEAD" }] : []), ...(fd.members || [])];

  const updateBurden = (key: string, value: any) => {
    setField("burdens", { ...burdens, [key]: value });
  };

  const addDisease = () => {
    setField("diseases", [
      ...diseases,
      { _localKey: `d-${Date.now()}`, treatmentCost: "NONE", followup: "NONE_OR_RARE", workImpact: "NONE" }
    ]);
  };

  const updateDisease = (idx: number, key: string, value: any) => {
    const next = [...diseases];
    next[idx] = { ...next[idx], [key]: value };
    setField("diseases", next);
  };

  const removeDisease = (idx: number) => {
    setField("diseases", diseases.filter((_, i) => i !== idx));
  };

  const getDiseaseScore = (d: any) => {
    let score = 0;
    if (d.treatmentCost === "PERIODIC_CHEAP") score += 0.2;
    if (d.treatmentCost === "PERIODIC_EXPENSIVE") score += 0.4;
    if (d.treatmentCost === "PERIODIC_VERY_EXPENSIVE") score += 0.6;

    if (d.followup === "PERIODIC_REGULAR") score += 0.3;
    if (d.followup === "PERIODIC_EXPENSIVE") score += 0.5;

    if (d.workImpact === "SLIGHT") score += 0.2;
    if (d.workImpact === "SEVERE_BUT_WORKING") score += 0.4;
    if (d.workImpact === "CANNOT_WORK") score += 0.6;
    return score;
  };

  const addDisability = () => {
    setField("disabilities", [
      ...disabilities,
      { _localKey: `dis-${Date.now()}`, workImpact: "NONE", companion: "NONE", treatmentCost: "NONE" }
    ]);
  };

  const updateDisability = (idx: number, key: string, value: any) => {
    const next = [...disabilities];
    next[idx] = { ...next[idx], [key]: value };
    setField("disabilities", next);
  };

  const removeDisability = (idx: number) => {
    setField("disabilities", disabilities.filter((_, i) => i !== idx));
  };

  const getDisabilityScore = (d: any) => {
    let score = 0;
    if (d.workImpact === "SLIGHT") score += 0.2;
    if (d.workImpact === "REQUIRES_SPECIAL") score += 0.4;
    if (d.workImpact === "CANNOT_WORK") score += 0.7;

    if (d.companion === "OUTSIDE_ONLY") score += 0.2;
    if (d.companion === "FULL_DEPENDENCE") score += 0.4;

    if (d.treatmentCost === "PERIODIC_CHEAP") score += 0.2;
    if (d.treatmentCost === "PERIODIC_EXPENSIVE") score += 0.4;
    if (d.treatmentCost === "PERIODIC_VERY_EXPENSIVE") score += 0.6;
    return score;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
      <Accordion type="multiple" defaultValue={["section-1", "section-2", "section-3"]} className="space-y-4">
        
        {/* SECTION 1: السكن والأعباء الأساسية */}
        <AccordionItem value="section-1" className="bg-card border rounded-xl px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            1. السكن والأعباء الأساسية
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع السكن</Label>
                <Select value={fd.housingType ?? "OWNED"} onValueChange={(v) => setField("housingType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNED">ملك (0.0)</SelectItem>
                    <SelectItem value="SHARED">مشترك مع أسرة أخرى (0.3)</SelectItem>
                    <SelectItem value="DONATED_RENT">إيجار متبرع به (0.4)</SelectItem>
                    <SelectItem value="RENTED">إيجار يدفعه الأسرة (0.7)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/10">
                <Label className="cursor-pointer">الأسرة لا تملك بطاقة تموين (0.4)</Label>
                <Switch checked={!(fd.hasRationCard ?? true)} onCheckedChange={(v) => setField("hasRationCard", !v)} />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 border-t pt-4">
              {/* الديون */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label>توجد ديون مؤثرة؟</Label>
                  <Switch checked={burdens.hasDebt ?? false} onCheckedChange={(v) => updateBurden("hasDebt", v)} />
                </div>
                {burdens.hasDebt && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">درجة الدين</Label>
                    <Select value={burdens.debtGrade ?? "A"} onValueChange={(v) => updateBurden("debtGrade", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A — دين بسيط يُدار (0.2)</SelectItem>
                        <SelectItem value="B">B — دين متوسط (0.4)</SelectItem>
                        <SelectItem value="C">C — دين ثقيل (0.7)</SelectItem>
                        <SelectItem value="D">D — دين حرج جداً (1.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* الإصابات */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label>توجد إصابات مؤثرة؟</Label>
                  <Switch checked={burdens.hasInjury ?? false} onCheckedChange={(v) => updateBurden("hasInjury", v)} />
                </div>
                {burdens.hasInjury && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">درجة الإصابة</Label>
                    <Select value={burdens.injuryGrade ?? "A"} onValueChange={(v) => updateBurden("injuryGrade", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A — إصابة بسيطة (0.2)</SelectItem>
                        <SelectItem value="B">B — إصابة متوسطة (0.4)</SelectItem>
                        <SelectItem value="C">C — إصابة شديدة (0.7)</SelectItem>
                        <SelectItem value="D">D — إصابة حرجة (1.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* العمليات الجراحية */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label>توجد عمليات جراحية؟</Label>
                  <Switch checked={burdens.hasSurgery ?? false} onCheckedChange={(v) => updateBurden("hasSurgery", v)} />
                </div>
                {burdens.hasSurgery && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">درجة العملية</Label>
                    <Select value={burdens.surgeryGrade ?? "A"} onValueChange={(v) => updateBurden("surgeryGrade", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (0.3)</SelectItem>
                        <SelectItem value="B">B (0.5)</SelectItem>
                        <SelectItem value="C">C (0.8)</SelectItem>
                        <SelectItem value="D">D (1.0)</SelectItem>
                        <SelectItem value="E">E — جراحة حرجة جداً (1.5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* SECTION 2: الأمراض المزمنة */}
        <AccordionItem value="section-2" className="bg-card border rounded-xl px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            2. الأمراض المزمنة
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            
            {diseases.map((d, idx) => (
              <div key={d.id ?? d._localKey} className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50" onClick={() => removeDisease(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-6">
                  <div className="space-y-2">
                    <Label className="text-xs">اسم المرض / الوصف</Label>
                    <Input className="h-8 text-sm bg-white dark:bg-black" value={d.name ?? ""} onChange={(e) => updateDisease(idx, "name", e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">الشخص المصاب</Label>
                    <Select value={d.personId ?? ""} onValueChange={(v) => updateDisease(idx, "personId", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue placeholder="اختر الفرد" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id || m._localKey} value={m.id || m._localKey || "unknown"}>{m.name || "بدون اسم"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">تكلفة العلاج</Label>
                    <Select value={d.treatmentCost ?? "NONE"} onValueChange={(v) => updateDisease(idx, "treatmentCost", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يوجد/يسير (0.0)</SelectItem>
                        <SelectItem value="PERIODIC_CHEAP">دوري وغير مكلف (0.2)</SelectItem>
                        <SelectItem value="PERIODIC_EXPENSIVE">دوري ومكلف (0.4)</SelectItem>
                        <SelectItem value="PERIODIC_VERY_EXPENSIVE">دوري ومكلف جداً (0.6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">المتابعة الطبية</Label>
                    <Select value={d.followup ?? "NONE_OR_RARE"} onValueChange={(v) => updateDisease(idx, "followup", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE_OR_RARE">لا يحتاج/متباعدة (0.0)</SelectItem>
                        <SelectItem value="PERIODIC_REGULAR">زيارات دورية منتظمة (0.3)</SelectItem>
                        <SelectItem value="PERIODIC_EXPENSIVE">زيارات دورية مكلفة (0.5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-xs">التأثير على العمل</Label>
                    <Select value={d.workImpact ?? "NONE"} onValueChange={(v) => updateDisease(idx, "workImpact", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يؤثر (0.0)</SelectItem>
                        <SelectItem value="SLIGHT">يحد قليلاً (0.2)</SelectItem>
                        <SelectItem value="SEVERE_BUT_WORKING">يؤثر كثيراً لكن يعمل (0.4)</SelectItem>
                        <SelectItem value="CANNOT_WORK">لا يستطيع العمل (0.6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2 flex items-end justify-end pb-1">
                    <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                      نقاط هذا المرض: {getDiseaseScore(d).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {diseases.length >= 3 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                ⚠️ من الحالة الثالثة فأكثر تُطبَّق قاعدة التناقص ×0.5 تلقائياً من قبل محرك التقييم.
              </div>
            )}

            <Button variant="outline" className="w-full border-dashed" onClick={addDisease}>
              <Plus className="w-4 h-4 me-2" /> إضافة مرض مزمن
            </Button>
            
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 3: الإعاقات */}
        <AccordionItem value="section-3" className="bg-card border rounded-xl px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            3. الإعاقات
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            
            {disabilities.map((d, idx) => (
              <div key={d.id ?? d._localKey} className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-orange-500 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50" onClick={() => removeDisability(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-6">
                  <div className="space-y-2">
                    <Label className="text-xs">وصف الإعاقة</Label>
                    <Input className="h-8 text-sm bg-white dark:bg-black" value={d.description ?? ""} onChange={(e) => updateDisability(idx, "description", e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">الشخص المعاق</Label>
                    <Select value={d.personId ?? ""} onValueChange={(v) => updateDisability(idx, "personId", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue placeholder="اختر الفرد" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id || m._localKey} value={m.id || m._localKey || "unknown"}>{m.name || "بدون اسم"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">التأثير على العمل</Label>
                    <Select value={d.workImpact ?? "NONE"} onValueChange={(v) => updateDisability(idx, "workImpact", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا مانع (0.0)</SelectItem>
                        <SelectItem value="SLIGHT">تحد قليلاً (0.2)</SelectItem>
                        <SelectItem value="REQUIRES_SPECIAL">تتطلب عملاً خاصاً (0.4)</SelectItem>
                        <SelectItem value="CANNOT_WORK">غير قادر إطلاقاً (0.7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">الحاجة لمرافق</Label>
                    <Select value={d.companion ?? "NONE"} onValueChange={(v) => updateDisability(idx, "companion", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يحتاج (0.0)</SelectItem>
                        <SelectItem value="OUTSIDE_ONLY">مرافق خارج المنزل فقط (0.2)</SelectItem>
                        <SelectItem value="FULL_DEPENDENCE">اعتماد كلي على المرافق (0.4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-xs">تكلفة العلاج (أجهزة/علاج)</Label>
                    <Select value={d.treatmentCost ?? "NONE"} onValueChange={(v) => updateDisability(idx, "treatmentCost", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يوجد/يسير (0.0)</SelectItem>
                        <SelectItem value="PERIODIC_CHEAP">دوري وغير مكلف (0.2)</SelectItem>
                        <SelectItem value="PERIODIC_EXPENSIVE">دوري ومكلف (0.4)</SelectItem>
                        <SelectItem value="PERIODIC_VERY_EXPENSIVE">دوري ومكلف جداً (0.6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2 flex items-end justify-end pb-1">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      نقاط هذه الإعاقة: {getDisabilityScore(d).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={addDisability}>
              <Plus className="w-4 h-4 me-2" /> إضافة إعاقة
            </Button>
            
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
