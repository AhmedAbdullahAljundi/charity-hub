"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { 
  getVerificationStats, 
  getVerificationList, 
  verifySingleIncome, 
  bulkVerifyIncome,
  VerificationStats 
} from "@/lib/api/verification-api";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ShieldCheck, TrendingDown, Search, CheckCircle2 } from "lucide-react";

export function VerificationClient() {
  const user = useAuthStore((s) => s.user);
  
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("ALL");
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [singleVerifyModal, setSingleVerifyModal] = useState<{ open: boolean; householdId: string; incomeId: string } | null>(null);
  const [bulkVerifyModal, setBulkVerifyModal] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        getVerificationStats(),
        getVerificationList({
          ...(statusFilter !== "ALL" && { status: statusFilter }),
          ...(channelFilter !== "ALL" && { channel: channelFilter })
        })
      ]);
      setStats(s);
      
      let filteredList = l;
      if (regionFilter !== "ALL") {
        filteredList = l.filter((item: any) => item.household?.governorate === regionFilter);
      }
      setList(filteredList);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [statusFilter, channelFilter, regionFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const handleSingleVerify = async () => {
    if (!singleVerifyModal) return;
    try {
      await verifySingleIncome(singleVerifyModal.householdId, singleVerifyModal.incomeId, verifyNote);
      setSingleVerifyModal(null);
      setVerifyNote("");
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkVerifyIncome(selectedIds, verifyNote);
      setBulkVerifyModal(false);
      setSelectedIds([]);
      setVerifyNote("");
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.length && list.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(i => i.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED": return <Badge className="bg-emerald-500 hover:bg-emerald-600">موثق ✓</Badge>;
      case "PENDING": return <Badge className="bg-amber-500 hover:bg-amber-600">قيد التحقق</Badge>;
      case "UNVERIFIED": return <Badge className="bg-slate-400 hover:bg-slate-500">غير موثق</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Extract unique regions for dropdown
  const uniqueRegions = Array.from(new Set(list.map((i: any) => i.household?.governorate).filter(Boolean)));

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* TOP STATS ROW */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أقل من 3 مصادر</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unverifiedCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              أسرة تعاني من نقص في التوثيق
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معاش غير موثق</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unverifiedPensionCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              يجب مراجعته فوراً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخصم الإلزامي المطبق</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">-{stats?.totalPenaltyApplied?.toFixed(1) ?? "0.0"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              إجمالي خصومات الموثوقية (-2.0 للأسرة)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS & ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-card p-4 rounded-xl border">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="space-y-1.5 w-32">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل الحالات</SelectItem>
                <SelectItem value="UNVERIFIED">غير موثق</SelectItem>
                <SelectItem value="PENDING">قيد التحقق</SelectItem>
                <SelectItem value="VERIFIED">موثق</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-40">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger><SelectValue placeholder="القناة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل القنوات</SelectItem>
                <SelectItem value="PENSION">المعاش التأميني</SelectItem>
                <SelectItem value="SOCIAL_SOLIDARITY">تكافل وكرامة</SelectItem>
                <SelectItem value="CHARITY_1">جمعية خيرية 1</SelectItem>
                <SelectItem value="CHARITY_2">جمعية خيرية 2</SelectItem>
                <SelectItem value="CHARITY_3">جمعية خيرية 3</SelectItem>
                <SelectItem value="DONOR_1">فاعل خير 1</SelectItem>
                <SelectItem value="DONOR_2">فاعل خير 2</SelectItem>
                <SelectItem value="ALIMONY">نفقة رسمية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-40">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger><SelectValue placeholder="المحافظة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل المحافظات</SelectItem>
                {uniqueRegions.map((region) => (
                  <SelectItem key={String(region)} value={String(region)}>{String(region)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {user?.role !== "CASE_WORKER" && selectedIds.length > 0 && (
          <Button onClick={() => setBulkVerifyModal(true)} className="w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 me-2" /> توثيق المحدد ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {user?.role !== "CASE_WORKER" && (
                <TableHead className="w-[50px] text-right">
                  <Checkbox checked={selectedIds.length === list.length && list.length > 0} onCheckedChange={toggleSelectAll} />
                </TableHead>
              )}
              <TableHead className="text-right">رقم القيد</TableHead>
              <TableHead className="text-right">المحافظة</TableHead>
              <TableHead className="text-right">القناة</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">آخر تحديث</TableHead>
              <TableHead className="text-right">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
            ) : list.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد مصادر دخل مطابقة</TableCell></TableRow>
            ) : (
              list.map((item) => (
                <TableRow key={item.id}>
                  {user?.role !== "CASE_WORKER" && (
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                    </TableCell>
                  )}
                  <TableCell className="font-mono">{item.household?.code}</TableCell>
                  <TableCell>{item.household?.governorate}</TableCell>
                  <TableCell>{item.channel}</TableCell>
                  <TableCell className="font-mono">{item.amount}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    {item.status !== "VERIFIED" && (
                      <Button variant="outline" size="sm" onClick={() => setSingleVerifyModal({ open: true, householdId: item.householdId, incomeId: item.id })}>
                        توثيق
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* SINGLE VERIFY MODAL */}
      <Dialog open={!!singleVerifyModal} onOpenChange={(v) => !v && setSingleVerifyModal(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>توثيق مصدر الدخل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="ملاحظات التوثيق (اختياري)..." 
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSingleVerifyModal(null)}>إلغاء</Button>
            <Button onClick={handleSingleVerify}>تأكيد التوثيق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK VERIFY MODAL */}
      <Dialog open={bulkVerifyModal} onOpenChange={setBulkVerifyModal}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>توثيق جماعي ({selectedIds.length} قنوات)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="ملاحظات التوثيق الجماعي (اختياري)..." 
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkVerifyModal(false)}>إلغاء</Button>
            <Button onClick={handleBulkVerify}>تأكيد التوثيق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
