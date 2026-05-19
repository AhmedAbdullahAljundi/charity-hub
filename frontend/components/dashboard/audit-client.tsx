"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAuditLogs } from "@/lib/api/audit-api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AuditClient() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [householdCode, setHouseholdCode] = useState("");

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.startDate = new Date(dateFrom).toISOString();
      if (dateTo) params.endDate = new Date(dateTo).toISOString();
      if (actionFilter !== "ALL") params.action = actionFilter;
      if (entityFilter !== "ALL") params.entity = entityFilter;
      if (householdCode) params.householdCode = householdCode;
      
      params.limit = 50;

      const data = await getAuditLogs(params);
      setLogs(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [dateFrom, dateTo, actionFilter, entityFilter, householdCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLogs();
  }, [fetchLogs]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = () => {
    if (logs.length === 0) return;
    const headers = ["Date", "User", "Action", "Entity", "Household Code", "Changes"];
    const csvRows = [headers.join(",")];
    
    for (const log of logs) {
      const date = new Date(log.createdAt).toLocaleString("en-GB");
      const user = log.user?.name || log.userId;
      const changesStr = log.changes ? JSON.stringify(log.changes).replace(/"/g, '""') : "";
      csvRows.push(`"${date}","${user}","${log.action}","${log.entity}","${log.household?.code || ''}","${changesStr}"`);
    }

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const formatValue = (val: any) => {
    if (typeof val === "object" && val !== null) {
      return <pre className="text-xs">{JSON.stringify(val, null, 2)}</pre>;
    }
    return String(val ?? "N/A");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-xl border">
        <div className="space-y-1.5 w-36">
          <span className="text-xs font-medium">من تاريخ</span>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5 w-36">
          <span className="text-xs font-medium">إلى تاريخ</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="space-y-1.5 w-40">
          <span className="text-xs font-medium">نوع الإجراء</span>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">الكل</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="VERIFY_INCOME">VERIFY</SelectItem>
              <SelectItem value="DECIDE_SCORE">DECIDE</SelectItem>
              <SelectItem value="OVERRIDE_RULE">RULE_OVERRIDE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 w-40">
          <span className="text-xs font-medium">الكيان</span>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">الكل</SelectItem>
              <SelectItem value="Household">Household</SelectItem>
              <SelectItem value="Person">Person</SelectItem>
              <SelectItem value="IncomeSource">IncomeSource</SelectItem>
              <SelectItem value="RuleOverride">RuleOverride</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 w-40">
          <span className="text-xs font-medium">رقم قيد الأسرة</span>
          <Input placeholder="بحث برقم القيد..." value={householdCode} onChange={(e) => setHouseholdCode(e.target.value)} />
        </div>
        <div className="mr-auto">
          <Button variant="outline" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="h-4 w-4 me-2" /> تصدير CSV
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-right">التوقيت</TableHead>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الإجراء</TableHead>
              <TableHead className="text-right">الكيان</TableHead>
              <TableHead className="text-right">الأسرة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد سجلات مطابقة</TableCell></TableRow>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedRows[log.id];
                return (
                  <React.Fragment key={log.id}>
                    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(log.id)}>
                      <TableCell>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="text-xs">{new Date(log.createdAt).toLocaleString("ar-EG")}</TableCell>
                      <TableCell>{log.user?.name ?? log.userId}</TableCell>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell className="font-mono text-sm">{log.entity}</TableCell>
                      <TableCell className="font-mono">{log.household?.code ?? "-"}</TableCell>
                    </TableRow>
                    <AnimatePresence>
                      {isExpanded && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={6} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 space-y-4">
                                {Array.isArray(log.changes) && log.changes.length > 0 ? (
                                  <div className="grid gap-4 md:grid-cols-2">
                                    {log.changes.map((change: any, idx: number) => (
                                      <Card key={idx} className="shadow-none">
                                        <CardContent className="p-4">
                                          <div className="font-medium mb-2 font-mono text-sm">الحقل: {change.fieldName}</div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-rose-50 border border-rose-100 rounded-md p-2">
                                              <div className="text-xs text-rose-500 font-bold mb-1">قبل التعديل</div>
                                              <div className="text-rose-900 break-words">{formatValue(change.before)}</div>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-md p-2">
                                              <div className="text-xs text-emerald-500 font-bold mb-1">بعد التعديل</div>
                                              <div className="text-emerald-900 break-words">{formatValue(change.after)}</div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground text-sm">لا توجد تفاصيل دقيقة مسجلة.</div>
                                )}
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground text-left px-2">إجمالي النتائج: {total}</div>
    </div>
  );
}
