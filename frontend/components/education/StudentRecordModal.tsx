"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Save, Plus, Trash2, Search, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEducationStore } from "@/lib/stores/educationStore";
import { lookupHouseholdForEducation, getStudentHistory } from "@/lib/api/education-api";
import { STUDENT_LEVELS, QURAN_SURAHS, QURAN_INSTITUTES } from "./constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function StudentRecordModal({
  open,
  onOpenChange,
  onSaved,
  prefillHouseholdId,
  prefillPersonId,
  prefillPersons,
  prefillLevel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (payload?: any) => void;
  prefillHouseholdId?: string;
  prefillPersonId?: string;
  prefillPersons?: any[];
  prefillLevel?: string;
}) {
  const t = useTranslations("education");
  const [loading, setLoading] = useState(false);

  const [householdQuery, setHouseholdQuery] = useState("");
  const [householdResults, setHouseholdResults] = useState<any[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<any>(null);
  
  const [persons, setPersons] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    personId: "",
    academicYear: new Date().getMonth() >= 8 
      ? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` 
      : `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
    studentLevel: prefillLevel || "NONE",
    isSpecialEducation: false,
    gradeYear: "",
    schoolName: "",
    gradeInputType: "LETTER",
    quranJuzCount: "",
    quranLastSurah: "",
    quranTeacher: "",
    quranInstitute: "",
    quranCustomInstitute: "",
    quranGrade: "",
    quranAttendancePercent: "",
    notes: ""
  });

  const [subjects, setSubjects] = useState<{name: string, letterGrade?: string, score?: number, maxScore?: number}[]>([]);

  const [openSurah, setOpenSurah] = useState(false);
  const [otherSurah, setOtherSurah] = useState(false);
  
  const [openInstitute, setOpenInstitute] = useState(false);
  const [otherInstitute, setOtherInstitute] = useState(false);

  const [openSection1, setOpenSection1] = useState(true);
  const [openSection2, setOpenSection2] = useState(false);
  const [openSection3, setOpenSection3] = useState(false);

  const isSection1Complete = !!formData.personId && !!formData.academicYear && !!formData.studentLevel && formData.studentLevel !== "NONE";

  useEffect(() => {
    if (open) {
      if (prefillHouseholdId && prefillPersons) {
        setSelectedHousehold({ id: prefillHouseholdId });
        setPersons(prefillPersons);
        setFormData(f => ({ ...f, personId: prefillPersonId || "", studentLevel: prefillLevel || "NONE" }));
      } else {
        setSelectedHousehold(null);
        setPersons([]);
        setFormData(f => ({ ...f, personId: "", studentLevel: "NONE" }));
      }
    }
  }, [open, prefillHouseholdId, prefillPersonId, prefillPersons, prefillLevel]);

  useEffect(() => {
    if (open && formData.personId) {
      getStudentHistory(formData.personId).then((history) => {
        const existingRecord = history.find((r) => r.academicYear === formData.academicYear);
        if (existingRecord) {
          setEditingId(existingRecord.id);
          setFormData(prev => ({
            ...prev,
            studentLevel: prefillLevel !== undefined ? prefillLevel : (existingRecord.studentLevel || "NONE"),
            isSpecialEducation: existingRecord.isSpecialEducation || false,
            gradeYear: existingRecord.gradeYear?.toString() || "",
            schoolName: existingRecord.schoolName || "",
            gradeInputType: existingRecord.gradeInputType || "LETTER",
            quranJuzCount: existingRecord.quranJuzCount?.toString() || "",
            quranLastSurah: existingRecord.quranLastSurah || "",
            quranTeacher: existingRecord.quranTeacher || "",
            quranInstitute: existingRecord.quranInstitute || "",
            quranCustomInstitute: existingRecord.quranCustomInstitute || "",
            quranGrade: existingRecord.quranGrade?.toString() || "",
            quranAttendancePercent: existingRecord.quranAttendancePercent?.toString() || "",
            notes: existingRecord.notes || "",
          }));
          setSubjects(existingRecord.subjects || []);
        } else {
          setEditingId(null);
        }
      }).catch(console.error);
    }
  }, [open, formData.personId, formData.academicYear, prefillLevel]);

  useEffect(() => {
    if (householdQuery.length >= 2) {
      const delay = setTimeout(() => {
        lookupHouseholdForEducation(householdQuery).then(setHouseholdResults);
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setHouseholdResults([]);
    }
  }, [householdQuery]);

  const selectedLevelConfig = STUDENT_LEVELS.find(l => l.value === formData.studentLevel);
  const quranJuzCountNum = formData.quranJuzCount ? parseFloat(formData.quranJuzCount) : 0;
  const quranProgress = Math.min(100, Math.max(0, ((quranJuzCountNum / 30) * 100))).toFixed(1);

  const { create, update } = useEducationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId) {
      alert("برجاء اختيار الطالب");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        householdId: selectedHousehold?.id || prefillHouseholdId,
        quranJuzCount: formData.quranJuzCount ? parseFloat(formData.quranJuzCount) : null,
        quranGrade: formData.quranGrade ? parseFloat(formData.quranGrade) : null,
        quranAttendancePercent: formData.quranAttendancePercent ? parseInt(formData.quranAttendancePercent) : null,
        quranInstitute: formData.quranInstitute || null,
        subjects
      };
      
      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }
      onSaved(payload);
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.error?.message || e.response?.data?.message || "حدث خطأ أثناء الحفظ. تأكد من صحة البيانات وعدم تكرار السجل للعام الحالي.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    if (subjects.length >= 8) return;
    setSubjects([...subjects, { name: "", score: undefined, maxScore: 100 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "تعديل سجل تعليمي حالي" : "إضافة سجل تعليمي جديد"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
          
          {/* القسم الأول: إثبات القيد التعليمي */}
          <div className="space-y-4">
            <button 
              type="button" 
              onClick={() => setOpenSection1(!openSection1)}
              className="w-full flex items-center justify-between border-b pb-2 text-lg font-bold text-slate-800"
            >
              <span>1. إثبات القيد التعليمي</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSection1 ? "rotate-180" : ""}`} />
            </button>
            
            {openSection1 && (
              <div className="space-y-4 pt-2">
            {!prefillHouseholdId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>البحث عن الأسرة (باسم الأب، الأم، أو رقم القيد)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedHousehold ? selectedHousehold.code : "ابحث عن الأسرة..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="اكتب للبحث..." value={householdQuery} onValueChange={setHouseholdQuery} />
                        <CommandList>
                          <CommandEmpty>لم يتم العثور على أسر.</CommandEmpty>
                          <CommandGroup>
                            {householdResults.map((hh) => (
                              <CommandItem
                                key={hh.id}
                                value={hh.code}
                                onSelect={() => {
                                  setSelectedHousehold(hh);
                                  setPersons(hh.persons);
                                  setFormData(f => ({ ...f, personId: "" }));
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${selectedHousehold?.id === hh.id ? "opacity-100" : "opacity-0"}`} />
                                <div className="flex flex-col">
                                  <span>{hh.code}</span>
                                  <span className="text-xs text-slate-500">{hh.headName} {hh.spouseName ? ` - ${hh.spouseName}` : ""}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>اسم الطالب</Label>
                  <Select value={formData.personId} onValueChange={(v) => setFormData({...formData, personId: v})}>
                    <SelectTrigger><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                    <SelectContent>
                      {persons.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} (السن: {p.age})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>السنة الدراسية</Label>
                <Input required value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label>المرحلة الدراسية</Label>
                <Select value={formData.studentLevel} onValueChange={(v) => setFormData({...formData, studentLevel: v, gradeYear: ""})}>
                  <SelectTrigger><SelectValue placeholder="اختر المرحلة" /></SelectTrigger>
                  <SelectContent>
                    {STUDENT_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center justify-between pt-2 border-t mt-2 border-slate-100">
                  <Label className="text-xs text-blue-800">تعليم خاص</Label>
                  <Switch checked={formData.isSpecialEducation} onCheckedChange={(v) => setFormData({...formData, isSpecialEducation: v})} />
                </div>
              </div>

              {selectedLevelConfig?.hasGrade && (
                <div className="space-y-2">
                  <Label>الصف الدراسي / الفرقة</Label>
                  <Select value={formData.gradeYear} onValueChange={(v) => setFormData({...formData, gradeYear: v})}>
                    <SelectTrigger><SelectValue placeholder="اختر الصف" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: selectedLevelConfig.maxGrade || 0 }).map((_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>الصف {i+1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>اسم المدرسة / المؤسسة</Label>
                <Input value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} placeholder="مثال: مدرسة الإيمان" />
              </div>
            </div>
            </div>
            )}
          </div>

          {/* القسم الثاني: النتائج التعليمية */}
          <div className="space-y-4">
            <button 
              type="button" 
              onClick={() => {
                if (!isSection1Complete) {
                  alert("يرجى ملء بيانات القيد التعليمي أولاً (اسم الطالب والمرحلة والسنة).");
                  return;
                }
                setOpenSection2(!openSection2);
              }}
              className={`w-full flex items-center justify-between border-b pb-2 text-lg font-bold ${!isSection1Complete ? "text-slate-400" : "text-slate-800"}`}
            >
              <div className="flex items-center gap-2">
                <span>2. النتائج التعليمية</span>
                {!isSection1Complete && <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded">مغلق</span>}
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSection2 ? "rotate-180" : ""}`} />
            </button>

            {openSection2 && isSection1Complete && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm">طريقة التقييم:</span>
                <Select value={formData.gradeInputType} onValueChange={(v) => { setFormData({...formData, gradeInputType: v}); setSubjects([]); }}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LETTER">التقديرات</SelectItem>
                    <SelectItem value="NUMERIC">بالدرجات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              {subjects.map((sub, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">المادة</Label>
                    <Input value={sub.name} onChange={e => {
                      const newS = [...subjects]; newS[i].name = e.target.value; setSubjects(newS);
                    }} placeholder="اسم المادة" />
                  </div>
                  
                  {formData.gradeInputType === "LETTER" ? (
                    <div className="w-40 space-y-1">
                      <Label className="text-xs">التقدير</Label>
                      <Select value={sub.letterGrade} onValueChange={v => {
                        const newS = [...subjects]; newS[i].letterGrade = v; setSubjects(newS);
                      }}>
                        <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXCELLENT">ممتاز</SelectItem>
                          <SelectItem value="VERY_GOOD">جيد جداً</SelectItem>
                          <SelectItem value="GOOD">جيد</SelectItem>
                          <SelectItem value="PASS">مقبول</SelectItem>
                          <SelectItem value="FAIL">راسب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">الدرجة</Label>
                        <Input type="number" value={sub.score ?? ""} onChange={e => {
                          const newS = [...subjects]; newS[i].score = parseFloat(e.target.value); setSubjects(newS);
                        }} />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">من (النهاية)</Label>
                        <Input type="number" placeholder="100" value={sub.maxScore ?? ""} onChange={e => {
                          const newS = [...subjects]; newS[i].maxScore = parseFloat(e.target.value); setSubjects(newS);
                        }} />
                      </div>
                    </>
                  )}
                  
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                    setSubjects(subjects.filter((_, idx) => idx !== i));
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button type="button" variant="outline" size="sm" onClick={addSubject} disabled={subjects.length >= 8} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> إضافة مادة (الحد الأقصى 8)
              </Button>
            </div>
            </div>
          )}
          </div>

          {/* القسم الثالث: بيانات القرآن الكريم */}
          <div className="space-y-4">
            <button 
              type="button" 
              onClick={() => setOpenSection3(!openSection3)}
              className="w-full flex items-center justify-between border-b pb-2 text-lg font-bold text-slate-800"
            >
              <span>3. بيانات حفظ القرآن الكريم</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSection3 ? "rotate-180" : ""}`} />
            </button>
            
            {openSection3 && (
              <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عدد الأجزاء المحفوظة (من 30)</Label>
                <Input 
                  type="number" step="0.5" min="0" max="30" 
                  value={formData.quranJuzCount} 
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val !== "" && parseFloat(val) > 30) val = "30";
                    setFormData({...formData, quranJuzCount: val});
                  }} 
                  placeholder="مثال: 7.5"
                />
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${quranProgress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-green-700">{quranProgress}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>السورة الحالية / آخر سورة</Label>
                <div className="flex flex-col gap-2">
                  <Popover open={openSurah} onOpenChange={setOpenSurah}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {otherSurah ? "أخرى..." : (formData.quranLastSurah || "اختر السورة")}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 h-64">
                      <Command>
                        <CommandInput placeholder="ابحث..." />
                        <CommandList>
                          <CommandEmpty>لا توجد سورة.</CommandEmpty>
                          <CommandGroup>
                            {QURAN_SURAHS.map((s) => (
                              <CommandItem key={s} onSelect={() => {
                                setFormData({...formData, quranLastSurah: s});
                                setOtherSurah(false);
                                setOpenSurah(false);
                              }}>
                                <Check className={`mr-2 h-4 w-4 ${formData.quranLastSurah === s ? "opacity-100" : "opacity-0"}`} />
                                {s}
                              </CommandItem>
                            ))}
                            <CommandItem onSelect={() => {
                              setOtherSurah(true);
                              setFormData({...formData, quranLastSurah: ""});
                              setOpenSurah(false);
                            }}>
                              <Check className={`mr-2 h-4 w-4 ${otherSurah ? "opacity-100" : "opacity-0"}`} />
                              أخرى...
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {otherSurah && (
                    <Input className="w-full" value={formData.quranLastSurah} onChange={e => setFormData({...formData, quranLastSurah: e.target.value})} placeholder="اكتب السورة" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>درجة الحفظ</Label>
                <Input type="number" step="0.1" value={formData.quranGrade} onChange={(e) => setFormData({...formData, quranGrade: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label>نسبة الحضور (%)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="من 0 إلى 100"
                  value={formData.quranAttendancePercent} 
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val !== "" && parseInt(val) > 100) val = "100";
                    if (val !== "" && parseInt(val) < 0) val = "0";
                    setFormData({...formData, quranAttendancePercent: val});
                  }} 
                />
              </div>

              <div className="space-y-2">
                <Label>المعهد القرآن الكريم</Label>
                <div className="flex flex-col gap-2">
                  <Popover open={openInstitute} onOpenChange={setOpenInstitute}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {otherInstitute ? "معهد آخر" : (formData.quranInstitute ? QURAN_INSTITUTES.find(i => i.value === formData.quranInstitute)?.label : "اختر المعهد")}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {QURAN_INSTITUTES.map((inst) => (
                              <CommandItem key={inst.value} onSelect={() => {
                                setFormData({...formData, quranInstitute: inst.value, quranCustomInstitute: ""});
                                setOtherInstitute(false);
                                setOpenInstitute(false);
                              }}>
                                <Check className={`mr-2 h-4 w-4 ${formData.quranInstitute === inst.value ? "opacity-100" : "opacity-0"}`} />
                                {inst.label}
                              </CommandItem>
                            ))}
                            <CommandItem onSelect={() => {
                              setOtherInstitute(true);
                              setFormData({...formData, quranInstitute: "OTHER"});
                              setOpenInstitute(false);
                            }}>
                              <Check className={`mr-2 h-4 w-4 ${otherInstitute ? "opacity-100" : "opacity-0"}`} />
                              معهد آخر...
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {otherInstitute && (
                    <Input className="w-full" placeholder="اكتب اسم المعهد" value={formData.quranCustomInstitute} onChange={e => setFormData({...formData, quranCustomInstitute: e.target.value})} />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>اسم المحفظ</Label>
                <Input value={formData.quranTeacher} onChange={e => setFormData({...formData, quranTeacher: e.target.value})} placeholder="اسم الشيخ أو المحفظ" />
              </div>
            </div>
            </div>
          )}
          </div>

          <div className="space-y-2">
            <Label>ملاحظات إضافية</Label>
            <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={loading || !formData.personId} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "جاري الحفظ..." : "حفظ السجل الشامل"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
