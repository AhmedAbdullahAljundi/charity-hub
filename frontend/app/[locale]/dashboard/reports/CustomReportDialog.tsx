"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Settings2 } from "lucide-react";
import api from "@/lib/api/client";

const ENTITY_COLUMNS: Record<string, { key: string; label: string }[]> = {
  households: [
    { key: "familyName", label: "اسم الأسرة" },
    { key: "governorate", label: "المحافظة" },
    { key: "district", label: "المركز" },
    { key: "village", label: "القرية" },
    { key: "primaryPhone", label: "رقم الهاتف" },
    { key: "housingType", label: "نوع السكن" },
    { key: "bankAssetGrade", label: "درجة الأصول" },
    { key: "socialStatus", label: "الحالة الاجتماعية" },
  ],
  persons: [
    { key: "name", label: "الاسم الكامل" },
    { key: "nationalId", label: "الرقم القومي" },
    { key: "gender", label: "الجنس" },
    { key: "role", label: "الدور في الأسرة" },
    { key: "isOrphan", label: "يتيم؟" },
    { key: "isStudent", label: "طالب؟" },
  ]
};

export function CustomReportDialog() {
  const [open, setOpen] = useState(false);
  const [entity, setEntity] = useState<"households" | "persons">("households");
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCol = (key: string) => {
    setSelectedCols(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    if (selectedCols.length === 0) {
      alert("الرجاء تحديد عمود واحد على الأقل.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post("/analytics/export/custom", {
        entity,
        columns: selectedCols,
        filter: {}
      }, { responseType: 'blob' });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Custom_Report_${entity}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpen(false);
    } catch (err) {
      alert("حدث خطأ أثناء تصدير التقرير المخصص.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Settings2 className="w-4 h-4" />
          تخصيص تقرير جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>بناء تقرير مخصص</DialogTitle>
          <DialogDescription>
            اختر نوع البيانات والأعمدة التي تريد تضمينها في الإكسيل.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>نوع الكيان</Label>
            <Select value={entity} onValueChange={(val: any) => { setEntity(val); setSelectedCols([]); }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الكيان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="households">الأسر (Households)</SelectItem>
                <SelectItem value="persons">الأفراد (Persons)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الأعمدة المطلوبة</Label>
            <div className="grid grid-cols-2 gap-3 p-3 border rounded-md bg-muted/30">
              {ENTITY_COLUMNS[entity].map(col => (
                <div key={col.key} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id={`col-${col.key}`} 
                    checked={selectedCols.includes(col.key)}
                    onCheckedChange={() => toggleCol(col.key)}
                  />
                  <label 
                    htmlFor={`col-${col.key}`} 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleExport} disabled={loading || selectedCols.length === 0} className="gap-2">
            <FileDown className="w-4 h-4" />
            {loading ? "جاري التصدير..." : "تصدير الإكسيل"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
