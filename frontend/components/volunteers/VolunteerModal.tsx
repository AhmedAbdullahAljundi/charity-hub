"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { useLocale } from "next-intl";

interface VolunteerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  volunteer?: any; // If passed, it's edit mode
}

const SPECIALTY_OPTIONS = [
  "FIELD_RESEARCH",
  "DATA_ENTRY",
  "MEDICAL",
  "EDUCATION",
  "GENERAL"
];

export function VolunteerModal({ open, onOpenChange, onSuccess, volunteer }: VolunteerModalProps) {
  const t = useTranslations("volunteers");
  const locale = useLocale();
  const isEdit = !!volunteer;

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const defaultForm = {
    name: "",
    nationalId: "",
    phone: "",
    whatsapp: "",
    imageUrl: "",
    address: "",
    assignedArea: "",
    specialties: ["GENERAL"],
    status: "ACTIVE"
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (open) {
      if (volunteer) {
        setFormData({
          name: volunteer.name || "",
          nationalId: volunteer.nationalId || "",
          phone: volunteer.phone || "",
          whatsapp: volunteer.whatsapp || "",
          imageUrl: volunteer.imageUrl || "",
          address: volunteer.address || "",
          assignedArea: volunteer.assignedArea || "",
          specialties: volunteer.specialties || ["GENERAL"],
          status: volunteer.status || "ACTIVE"
        });
        setImagePreview(volunteer.imageUrl || null);
      } else {
        setFormData(defaultForm);
        setImagePreview(null);
      }
    }
  }, [open, volunteer]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFormData(prev => {
      let updated = [...prev.specialties];
      if (checked && !updated.includes(specialty)) updated.push(specialty);
      if (!checked) updated = updated.filter(s => s !== specialty);
      return { ...prev, specialties: updated };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن لا يتجاوز 2 ميجابايت");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        handleChange("imageUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("الاسم مطلوب");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/volunteers/${volunteer.id}`, formData);
        toast.success("تم تعديل بيانات المتطوع بنجاح");
      } else {
        await api.post("/volunteers", formData);
        toast.success("تم إضافة المتطوع بنجاح");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editVolunteer") : t("addVolunteer")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("name")} *</Label>
              <Input 
                value={formData.name} 
                onChange={e => handleChange("name", e.target.value)} 
                placeholder={t("name")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("nationalId")}</Label>
              <Input 
                value={formData.nationalId} 
                onChange={e => handleChange("nationalId", e.target.value)} 
                dir="ltr"
                placeholder="00000000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input 
                value={formData.phone} 
                onChange={e => handleChange("phone", e.target.value)} 
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("whatsapp")}</Label>
              <Input 
                value={formData.whatsapp} 
                onChange={e => handleChange("whatsapp", e.target.value)} 
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("assignedArea")}</Label>
              <Input 
                value={formData.assignedArea} 
                onChange={e => handleChange("assignedArea", e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t("statusLabel")}</Label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={e => handleChange("status", e.target.value)}
              >
                <option value="ACTIVE">{t("status.ACTIVE")}</option>
                <option value="INACTIVE">{t("status.INACTIVE")}</option>
                <option value="SUSPENDED">{t("status.SUSPENDED")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>صورة المتطوع (اختياري)</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-border shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Input 
                type="file"
                accept="image/*"
                onChange={handleImageUpload} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("address")}</Label>
            <Input 
              value={formData.address} 
              onChange={e => handleChange("address", e.target.value)} 
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label>{t("specialties")}</Label>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-border">
              {SPECIALTY_OPTIONS.map(opt => (
                <div key={opt} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id={`spec-${opt}`}
                    checked={formData.specialties.includes(opt)}
                    onCheckedChange={(checked) => handleSpecialtyChange(opt, checked as boolean)}
                  />
                  <Label htmlFor={`spec-${opt}`} className="cursor-pointer text-sm font-normal">
                    {t(`specialty.${opt}` as any)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ بيانات المتطوع"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
