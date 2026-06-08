"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import api from "@/lib/api/client";

interface DateRangeFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: "financial" | "periodic";
  title: string;
}

export function DateRangeFilterDialog({ open, onOpenChange, reportType, title }: DateRangeFilterDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      let url = `/analytics/export/${reportType}`;
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url, { responseType: 'blob' });
      
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${reportType}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      onOpenChange(false);
    } catch (err) {
      alert("حدث خطأ أثناء تصدير التقرير.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle>تصدير {title}</DialogTitle>
          <DialogDescription>
            يمكنك تحديد فترة زمنية للتصدير (اختياري). اترك الحقول فارغة لتصدير كافة البيانات.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>من تاريخ (اختياري)</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>إلى تاريخ (اختياري)</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleExport} disabled={loading} className="gap-2">
            <Download className="w-4 h-4" />
            {loading ? "جاري التصدير..." : "تصدير"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
