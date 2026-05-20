"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useWizardStore } from "@/lib/stores/wizardStore";
import api from "@/lib/api/client";
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function extractNationalIdInfo(nid: string) {
  if (!/^[23]\d{13}$/.test(nid)) return null;
  const century = nid[0] === "2" ? 1900 : 2000;
  const year = century + parseInt(nid.substring(1, 3));
  const month = parseInt(nid.substring(3, 5));
  const day = parseInt(nid.substring(5, 7));
  const genderDigit = parseInt(nid.substring(12, 13));
  const gender = genderDigit % 2 === 0 ? "أنثى" : "ذكر";
  
  const birthDate = new Date(year, month - 1, day);
  let age = new Date().getFullYear() - birthDate.getFullYear();
  const m = new Date().getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
    age--;
  }
  return { gender, age, birthDate };
}

export function BasicInfoStep() {
  const fd = useWizardStore((s) => s.formData);
  const setField = useWizardStore((s) => s.setField);
  const householdId = useWizardStore((s) => s.householdId);

  // Suggested Code State
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);

  // Phone errors
  const [primaryPhoneError, setPrimaryPhoneError] = useState<string | null>(null);
  const [nidError, setNidError] = useState<string | null>(null);

  useEffect(() => {
    if (!fd.code && !householdId) {
      // Suggest code logic. We assume the API can give us the last code.
      // Since there's no specific endpoint mentioned, we'll try fetching list and taking first.
      api.get("/households?limit=1&sort=code&order=desc")
        .then((res) => {
          const lastHousehold = res.data?.data?.list?.[0];
          if (lastHousehold?.code) {
            const lastCode = parseInt(lastHousehold.code, 10);
            if (!isNaN(lastCode)) {
              setSuggestedCode(String(lastCode + 1));
            }
          } else {
            setSuggestedCode("1000"); // default starting code
          }
        })
        .catch(() => setSuggestedCode("1000"));
    }
  }, [fd.code, householdId]);

  useEffect(() => {
    if (!fd.registrationDate && !householdId) {
      const today = new Date().toISOString().split("T")[0];
      setField("registrationDate", today);
    }
  }, [fd.registrationDate, householdId, setField]);

  const checkCodeUnique = async (code: string) => {
    if (!code) return;
    setIsCheckingCode(true);
    setCodeError(null);
    setCodeSuccess(null);
    try {
      const res = await api.get(`/households?search=${code}`);
      const list = res.data?.data?.list || [];
      const match = list.find((h: any) => h.code === code && h.id !== householdId);
      if (match) {
        setCodeError("رقم القيد مستخدم بالفعل لأسرة أخرى.");
      } else {
        setCodeSuccess("رقم القيد متاح.");
      }
    } catch {
      setCodeError("حدث خطأ أثناء التحقق من الرقم.");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const validateNid = (val: string) => {
    if (!val) {
      setNidError(null);
      return;
    }
    if (!/^[23]\d{13}$/.test(val)) {
      setNidError("الرقم القومي غير صحيح (يجب أن يتكون من 14 رقماً ويبدأ بـ 2 أو 3)");
    } else {
      setNidError(null);
    }
  };

  const validatePhone = (val: string, setter: (e: string | null) => void) => {
    if (!val) {
      setter(null);
      return;
    }
    if (!/^01[0125]\d{8}$/.test(val)) {
      setter("رقم الموبايل غير صحيح (يجب أن يبدأ بـ 01 ويكون 11 رقماً)");
    } else {
      setter(null);
    }
  };

  const head = fd.head ?? {};
  const nidInfo = head.nationalId ? extractNationalIdInfo(head.nationalId) : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
      
      {/* SECTION 1: رقم القيد */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">1. رقم القيد (الكود)</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>رقم القيد <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fd.code ?? ""}
                onChange={(e) => {
                  setField("code", e.target.value);
                  setCodeError(null);
                  setCodeSuccess(null);
                }}
                onBlur={(e) => checkCodeUnique(e.target.value)}
                placeholder="مثال: 1245"
              />
              {isCheckingCode && <Loader2 className="h-5 w-5 animate-spin mt-2 text-muted-foreground" />}
            </div>
            {codeError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{codeError}</p>}
            {codeSuccess && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{codeSuccess}</p>}
          </div>
          
          {!fd.code && suggestedCode && (
            <div className="space-y-2 flex flex-col justify-end">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">الرقم المقترح: {suggestedCode}</span>
                <Button variant="outline" size="sm" onClick={() => {
                  setField("code", suggestedCode);
                  checkCodeUnique(suggestedCode);
                }}>
                  استخدم هذا الرقم
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: الحالة الاجتماعية */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">2. الحالة الاجتماعية لربة الأسرة</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>الحالة الاجتماعية</Label>
            <Select value={fd.socialStatus ?? ""} onValueChange={(v) => {
              setField("socialStatus", v);
              // Reset some fields if changed
              if (v !== "MARRIED" && v !== "DIVORCED") setField("head.residencyStatus", null);
            }}>
              <SelectTrigger><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MARRIED">متزوجة</SelectItem>
                <SelectItem value="DIVORCED">مطلقة</SelectItem>
                <SelectItem value="WIDOWED">أرملة</SelectItem>
                <SelectItem value="SINGLE_OTHER">عزباء / أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(fd.socialStatus === "MARRIED" || fd.socialStatus === "DIVORCED" || fd.socialStatus === "WIDOWED") && (
          <div className="bg-muted/30 border rounded-xl p-4 space-y-4 mt-4">
            <h4 className="font-medium text-primary mb-2">بيانات الزوج</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>اسم الزوج <span className="text-destructive">*</span></Label>
                <Input value={head.name ?? ""} onChange={(e) => setField("head.name", e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>الرقم القومي للزوج <span className="text-destructive">*</span></Label>
                <Input 
                  value={head.nationalId ?? ""} 
                  onChange={(e) => {
                    setField("head.nationalId", e.target.value);
                    validateNid(e.target.value);
                  }}
                  maxLength={14}
                />
                {nidError ? (
                  <p className="text-xs text-destructive">{nidError}</p>
                ) : nidInfo ? (
                  <p className="text-xs text-muted-foreground flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{nidInfo.gender}</Badge>
                    <Badge variant="outline" className="text-[10px]">{nidInfo.age} سنة</Badge>
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>حالة الزوج <span className="text-destructive">*</span></Label>
                <Select 
                  value={head.residencyStatus ?? "RESIDENT"} 
                  onValueChange={(v) => setField("head.residencyStatus", v)}
                >
                  <SelectTrigger><SelectValue placeholder="اختر حالة الزوج" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIDENT">مقيم</SelectItem>
                    <SelectItem value="ABSENT_OTHER">غائب مؤقت / مفقود</SelectItem>
                    <SelectItem value="ABSENT_PRISON">في السجن</SelectItem>
                    <SelectItem value="ABSENT_DEATH">متوفى</SelectItem>
                    <SelectItem value="ABSENT_DIVORCE">مطلقة منه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* IF مطلقة */}
            {fd.socialStatus === "DIVORCED" && (
              <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t mt-4">
                <div className="space-y-2">
                  <Label>سنة الطلاق</Label>
                  <Input type="number" placeholder="YYYY" value={fd.divorceYear ?? ""} onChange={(e) => setField("divorceYear", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>رقم وثيقة الطلاق</Label>
                  <Input value={fd.divorceDocNumber ?? ""} onChange={(e) => setField("divorceDocNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>عدد مرات الزواج</Label>
                  <Input type="number" min="1" value={fd.marriageCount ?? ""} onChange={(e) => setField("marriageCount", parseInt(e.target.value) || "")} />
                </div>
                <div className="col-span-full">
                  <p className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 p-2 rounded w-fit">
                    <Info className="h-4 w-4" />
                    ملاحظة هامة: يجب تجديد البحث كل سنة من تاريخ آخر بحث.
                  </p>
                </div>
              </div>
            )}

            {/* IF أرملة */}
            {fd.socialStatus === "WIDOWED" && (
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t mt-4">
                <div className="space-y-2">
                  <Label>رقم شهادة الوفاة</Label>
                  <Input value={fd.deathCertNumber ?? ""} onChange={(e) => setField("deathCertNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الوفاة</Label>
                  <Input type="date" value={fd.deathDate ?? ""} onChange={(e) => setField("deathDate", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: بيانات التواصل */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">3. بيانات التواصل</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>رقم الموبايل الأساسي <span className="text-destructive">*</span></Label>
            <Input 
              dir="ltr"
              className="text-right"
              placeholder="01XXXXXXXXX"
              value={fd.primaryPhone ?? ""} 
              onChange={(e) => {
                setField("primaryPhone", e.target.value);
                validatePhone(e.target.value, setPrimaryPhoneError);
              }} 
            />
            {primaryPhoneError && <p className="text-xs text-destructive">{primaryPhoneError}</p>}
          </div>

          <div className="space-y-2">
            <Label>رقم موبايل ثانٍ (اختياري)</Label>
            <Input 
              dir="ltr"
              className="text-right"
              placeholder="01XXXXXXXXX"
              value={fd.secondaryPhone ?? ""} 
              onChange={(e) => setField("secondaryPhone", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>رقم الواتساب (اختياري)</Label>
            <Input 
              dir="ltr"
              className="text-right"
              placeholder="01XXXXXXXXX"
              value={fd.whatsappPhone ?? ""} 
              onChange={(e) => setField("whatsappPhone", e.target.value)} 
            />
            {fd.whatsappPhone && /^01[0125]\d{8}$/.test(fd.whatsappPhone) && (
              <a 
                href={`https://wa.me/+20${fd.whatsappPhone.substring(1)}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1"
              >
                فتح محادثة: wa.me/+20{fd.whatsappPhone.substring(1)}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: العنوان */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">4. بيانات العنوان بالتفصيل</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>المحافظة</Label>
            <Select value={fd.governorate ?? ""} onValueChange={(v) => setField("governorate", v)}>
              <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CAIRO">القاهرة</SelectItem>
                <SelectItem value="GIZA">الجيزة</SelectItem>
                <SelectItem value="ALEXANDRIA">الإسكندرية</SelectItem>
                <SelectItem value="QALYUBIA">القليوبية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>المركز / الحي</Label>
            <Input value={fd.district ?? ""} onChange={(e) => setField("district", e.target.value)} placeholder="مثال: شبرا الخيمة" />
          </div>

          <div className="space-y-2">
            <Label>القرية / الحي</Label>
            <Input value={fd.village ?? ""} onChange={(e) => setField("village", e.target.value)} placeholder="مثال: بهتيم" />
          </div>

          <div className="space-y-2">
            <Label>رقم / اسم المنطقة</Label>
            <Input value={fd.addressRegion ?? ""} onChange={(e) => setField("addressRegion", e.target.value)} placeholder="مثال: المنطقة الرابعة" />
          </div>

          <div className="space-y-2">
            <Label>اسم الشارع</Label>
            <Input value={fd.addressStreet ?? ""} onChange={(e) => setField("addressStreet", e.target.value)} placeholder="مثال: شارع المحطة" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>مكان البيت في الشارع (تفصيلي)</Label>
            <Input value={fd.addressDetails ?? ""} onChange={(e) => setField("addressDetails", e.target.value)} placeholder="مثال: بجوار المسجد، الدور الثاني" />
          </div>
        </div>
      </section>

      {/* SECTION 5: إعدادات البحث */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">5. إعدادات البحث وتوجيه المساعدات</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3 border rounded-xl p-4 bg-muted/10">
            <Label className="text-base">نوع البحث</Label>
            <RadioGroup 
              value={fd.searchType ?? "DESK"} 
              onValueChange={(v) => setField("searchType", v)}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="DESK" id="desk" />
                <Label htmlFor="desk">بحث مكتبي</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="FIELD" id="field" />
                <Label htmlFor="field">بحث ميداني</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4 border rounded-xl p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <Label>حالة تعفف</Label>
                <p className="text-xs text-muted-foreground mt-1">يمنع إجراء البحث الميداني المباشر احتراماً للأسرة.</p>
              </div>
              <Switch checked={fd.isModest ?? false} onCheckedChange={(v) => setField("isModest", v)} />
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label>تعامل من خلال المقر</Label>
                <p className="text-xs text-muted-foreground mt-1">تفضيل التواصل وتقديم المساعدات من خلال المقر مباشرة.</p>
              </div>
              <Switch checked={fd.officeDealings ?? false} onCheckedChange={(v) => setField("officeDealings", v)} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: الملاحظات */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">6. الملاحظات</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>ملاحظات عامة</Label>
            <Textarea 
              value={fd.notes ?? ""} 
              onChange={(e) => setField("notes", e.target.value)} 
              placeholder="أي تفاصيل أو ملاحظات عامة حول الأسرة..."
              className="h-24 resize-none"
            />
          </div>
          <div className="space-y-2 relative">
            <Label>ملاحظات ميدانية</Label>
            <Textarea 
              value={fd.fieldNotes ?? ""} 
              onChange={(e) => setField("fieldNotes", e.target.value)} 
              placeholder="ملاحظات تتعلق بالبحث الميداني..."
              className="h-24 resize-none border-dashed"
            />
            <div className="mt-1">
              <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                قيد الإنشاء — سيُربط بموديول البحث الميداني قريباً
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: تاريخ التسجيل */}
      <section className="space-y-4">
        <div className="space-y-2 w-full sm:w-64">
          <Label>تاريخ التسجيل</Label>
          <Input 
            type="date" 
            value={fd.registrationDate ?? ""} 
            onChange={(e) => setField("registrationDate", e.target.value)} 
            readOnly={!!householdId} // read-only after first save
            className={householdId ? "bg-muted cursor-not-allowed" : ""}
          />
        </div>
      </section>

    </div>
  );
}
