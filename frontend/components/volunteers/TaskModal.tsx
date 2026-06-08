"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  volunteerId: string;
}

export function TaskModal({ open, onOpenChange, onSuccess, volunteerId }: TaskModalProps) {
  const t = useTranslations("volunteers");
  const [loading, setLoading] = useState(false);
  
  // Default to 30 days from now
  const defaultDueDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: defaultDueDate,
    householdId: "" // Optional
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("عنوان المهمة مطلوب");
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.householdId) delete dataToSubmit.householdId;

      await api.post(`/volunteers/${volunteerId}/tasks`, dataToSubmit);
      toast.success("تم إسناد المهمة بنجاح");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: defaultDueDate,
        householdId: ""
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء حفظ المهمة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("tasks.assignNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("tasks.taskTitle")} *</Label>
            <Input 
              value={formData.title} 
              onChange={e => handleChange("title", e.target.value)} 
              placeholder={t("tasks.taskTitle")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("tasks.description")}</Label>
            <Textarea 
              value={formData.description} 
              onChange={e => handleChange("description", e.target.value)} 
              placeholder="تفاصيل المهمة المطلوب إنجازها..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("tasks.priority")}</Label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.priority}
                onChange={e => handleChange("priority", e.target.value)}
              >
                <option value="LOW">{t("tasks.priorityLevels.LOW")}</option>
                <option value="MEDIUM">{t("tasks.priorityLevels.MEDIUM")}</option>
                <option value="HIGH">{t("tasks.priorityLevels.HIGH")}</option>
                <option value="URGENT">{t("tasks.priorityLevels.URGENT")}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>{t("tasks.dueDate")}</Label>
              <Input 
                type="date"
                value={formData.dueDate} 
                onChange={e => handleChange("dueDate", e.target.value)} 
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("tasks.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الإسناد..." : t("tasks.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
