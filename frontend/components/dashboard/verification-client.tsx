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
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShieldCheck, TrendingDown, Inbox } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

export function VerificationClient() {
  const user = useAuthStore((s) => s.user);
  const t = useTranslations("verification");
  const locale = useLocale();
  const canVerify = user?.role === "ADMIN" || user?.role === "SUPERVISOR";
 
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
      toast.success(t("toastSuccess"));
      await fetchData();
    } catch (e) {
      console.error(e);
      toast.error(t("toastError"));
    }
  };

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkVerifyIncome(selectedIds, verifyNote);
      setBulkVerifyModal(false);
      setSelectedIds([]);
      setVerifyNote("");
      toast.success(t("toastSuccess"));
      await fetchData();
    } catch (e) {
      console.error(e);
      toast.error(t("toastError"));
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
      case "VERIFIED": return <Badge className="bg-emerald-500 hover:bg-emerald-600">{t("statusVerified")} ✓</Badge>;
      case "PENDING": return <Badge className="bg-amber-500 hover:bg-amber-600">{t("statusPending")}</Badge>;
      case "UNVERIFIED": return <Badge className="bg-slate-400 hover:bg-slate-500">{t("statusUnverified")}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

 // Extract unique regions for dropdown
 const uniqueRegions = Array.from(new Set(list.map((i: any) => i.household?.governorate).filter(Boolean)));

 return (
 <div className="space-y-6" >
 
 {/* TOP STATS ROW */}
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("statLowSources")}</CardTitle>
          <AlertCircle className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.unverifiedCount ?? 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("statNoPension")}</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.unverifiedPensionCount ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("statPenalty")}</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">-{stats?.totalPenaltyApplied?.toFixed(1) ?? "0.0"}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("penaltyNote")}
          </p>
        </CardContent>
      </Card>
    </div>

 {/* FILTERS & ACTIONS */}
    <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-card p-4 rounded-xl border">
      <div className="flex flex-wrap gap-4 w-full sm:w-auto">
        <div className="space-y-1.5 w-32">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder={t("filterStatus")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filterAll")}</SelectItem>
              <SelectItem value="UNVERIFIED">{t("statusUnverified")}</SelectItem>
              <SelectItem value="PENDING">{t("statusPending")}</SelectItem>
              <SelectItem value="VERIFIED">{t("statusVerified")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 w-40">
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger><SelectValue placeholder={t("filterChannel")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filterAll")}</SelectItem>
              <SelectItem value="PENSION">{t("channels.PENSION")}</SelectItem>
              <SelectItem value="TAKAFUL_KARAMA">{t("channels.TAKAFUL_KARAMA")}</SelectItem>
              <SelectItem value="CHARITY_1">{t("channels.CHARITY_1")}</SelectItem>
              <SelectItem value="CHARITY_2">{t("channels.CHARITY_2")}</SelectItem>
              <SelectItem value="CHARITY_3">{t("channels.CHARITY_3")}</SelectItem>
              <SelectItem value="DONOR_1">{t("channels.DONOR_1")}</SelectItem>
              <SelectItem value="DONOR_2">{t("channels.DONOR_2")}</SelectItem>
              <SelectItem value="ALIMONY">{t("channels.ALIMONY")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 w-40">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger><SelectValue placeholder={t("filterRegion")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filterAll")}</SelectItem>
              {uniqueRegions.map((region) => (
                <SelectItem key={String(region)} value={String(region)}>{String(region)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {canVerify && selectedIds.length > 0 && (
        <Button onClick={() => setBulkVerifyModal(true)} className="w-full sm:w-auto">
          <ShieldCheck className="w-4 h-4 me-2" /> {t("btnBulkVerify")} ({selectedIds.length})
        </Button>
      )}
    </div>

 {/* TABLE */}
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {canVerify && (
              <TableHead className="w-[50px] ltr:text-left rtl:text-right">
                <Checkbox checked={selectedIds.length === list.length && list.length > 0} onCheckedChange={toggleSelectAll} />
              </TableHead>
            )}
            <TableHead className="ltr:text-left rtl:text-right">{t("colCode")}</TableHead>
            <TableHead className="ltr:text-left rtl:text-right">{t("colRegion")}</TableHead>
            <TableHead className="ltr:text-left rtl:text-right">{t("colChannel")}</TableHead>
            <TableHead className="ltr:text-left rtl:text-right">{t("colAmount")}</TableHead>
            <TableHead className="ltr:text-left rtl:text-right">{t("colStatus")}</TableHead>
            <TableHead className="ltr:text-left rtl:text-right">{t("colUpdated")}</TableHead>
            <TableHead className="ltr:text-left rtl:text-right">{t("colActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {canVerify && <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>}
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16 rounded" /></TableCell>
              </TableRow>
            ))
          ) : list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Inbox className="h-10 w-10 opacity-20" />
                  <p>{t("emptyState")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            list.map((item) => (
              <TableRow key={item.id}>
                {canVerify && (
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                  </TableCell>
                )}
                <TableCell className="font-mono">{item.household?.code}</TableCell>
                <TableCell>{item.household?.governorate}</TableCell>
                <TableCell>{t(`channels.${item.channel}` as any) || item.channel}</TableCell>
                <TableCell className="font-mono">{item.amount} {locale === "ar" ? "ج.م" : "EGP"}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}</TableCell>
                <TableCell>
                  {item.status !== "VERIFIED" && canVerify && (
                    <Button variant="outline" size="sm" onClick={() => setSingleVerifyModal({ open: true, householdId: item.householdId, incomeId: item.id })}>
                      {t("btnVerify")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    <Dialog open={!!singleVerifyModal} onOpenChange={(v) => !v && setSingleVerifyModal(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modalTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder={t("modalNote")} 
            value={verifyNote}
            onChange={(e) => setVerifyNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSingleVerifyModal(null)}>{t("modalCancel")}</Button>
          <Button onClick={handleSingleVerify}>{t("modalConfirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* BULK VERIFY MODAL */}
    <Dialog open={bulkVerifyModal} onOpenChange={setBulkVerifyModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modalTitle")} ({selectedIds.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder={t("modalNote")} 
            value={verifyNote}
            onChange={(e) => setVerifyNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBulkVerifyModal(false)}>{t("modalCancel")}</Button>
          <Button onClick={handleBulkVerify}>{t("modalConfirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

 </div>
 );
}
