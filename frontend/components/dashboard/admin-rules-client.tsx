"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getRules, simulateRule, overrideRule, revertRule } from "@/lib/api/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, ShieldAlert, Undo2, ChevronDown, ChevronUp, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api/client";

export function AdminRulesClient() {
 const [rules, setRules] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 
 // Group rules by layer
 const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});

 // Modals
  const [editModal, setEditModal] = useState<any>(null);
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [simulationResult, setSimulationResult] = useState<{ count: number } | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);

  // History state
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [historyData, setHistoryData] = useState<Record<string, any[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

  const t = useTranslations("ruleEditor");
  const tRules = useTranslations("rules");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const rawData: any = await getRules();
      const data = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.rules || []);
      setRules(data);
      // auto expand all layers by default
      const layers = [...new Set(data.map((r: any) => r.layer))];
      const initialExpanded: Record<string, boolean> = {};
      layers.forEach((layer: any) => {
        initialExpanded[layer] = true;
      });
      setExpandedLayers(initialExpanded);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 void fetchRules();
 }, [fetchRules]);

 const toggleLayer = (layer: string) => {
 setExpandedLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
 };

  const handleSimulate = async () => {
    if (!editModal || !newValue) return;
    try {
      const res = await simulateRule(editModal.id, parseFloat(newValue));
      setSimulationResult({ count: res.affectedHouseholds });
      setHasSimulated(true);
      toast.success(t("toastSimSuccess"));
    } catch (e) {
      console.error(e);
      toast.error(t("toastError"));
    }
  };

  const handleSave = async () => {
    if (!editModal || !newValue || reason.length < 20 || !hasSimulated) return;
    try {
      await overrideRule(editModal.id, {
        value: parseFloat(newValue),
        reason,
        ...(expiryDate && { expiresAt: new Date(expiryDate).toISOString() })
      });
      setEditModal(null);
      toast.success(t("toastSaveSuccess"));
      await fetchRules();
    } catch (e) {
      console.error(e);
      toast.error(t("toastError"));
    }
  };

  const handleRevert = async (ruleId: string) => {
    try {
      await revertRule(ruleId);
      toast.success(t("toastSaveSuccess"));
      await fetchRules();
    } catch (e) {
      console.error(e);
      toast.error(t("toastError"));
    }
  };

  const openEditModal = (rule: any) => {
    setEditModal(rule);
    setNewValue((rule.effectiveValue || rule.defaultValue || "").toString());
    setReason("");
    setExpiryDate("");
    setSimulationResult(null);
    setHasSimulated(false);
  };

  const fetchHistory = async (ruleId: string) => {
    if (historyData[ruleId]) return; // already fetched
    setLoadingHistory(prev => ({ ...prev, [ruleId]: true }));
    try {
      const res = await api.get(`/audit-logs?entity=RuleOverride&entityId=${ruleId}`);
      setHistoryData(prev => ({ ...prev, [ruleId]: res.data?.data || [] }));
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
    setLoadingHistory(prev => ({ ...prev, [ruleId]: false }));
  };

  const toggleHistory = (ruleId: string) => {
    setExpandedHistory(prev => {
      const isExpanded = !prev[ruleId];
      if (isExpanded) {
        fetchHistory(ruleId);
      }
      return { ...prev, [ruleId]: isExpanded };
    });
  };

  const layers = [...new Set(rules.map(r => r.layer))].sort();

 return (
    <div className="space-y-6" >
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {layers.map(layer => {
            const layerRules = rules.filter(r => r.layer === layer);
            const isExpanded = expandedLayers[layer as string];
            
            return (
              <Card key={layer as string}>
                <CardHeader 
                  className="cursor-pointer bg-muted/30 py-3 flex flex-row items-center justify-between"
                  onClick={() => toggleLayer(layer as string)}
                >
                  <CardTitle className="text-lg">{t.has(`layer${layer}` as any) ? t(`layer${layer}` as any) : `Layer ${layer}`}</CardTitle>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </CardHeader>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="ltr:text-left rtl:text-right">{t("colRule")}</TableHead>
                              <TableHead className="ltr:text-left rtl:text-right">{t("colWeight")}</TableHead>
                              <TableHead className="ltr:text-left rtl:text-right">{t("colType")}</TableHead>
                              <TableHead className="ltr:text-left rtl:text-right">{t("colActions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {layerRules.map((rule: any) => (
                              <React.Fragment key={rule.id}>
                                <TableRow>
                                  <TableCell className="font-medium">{rule.id ? (tRules.has(rule.id) ? tRules(rule.id) : rule.id) : "Unknown"}</TableCell>
                                  <TableCell className="font-mono font-semibold">{parseFloat(rule.effectiveValue || rule.defaultValue || 0).toFixed(2)}</TableCell>
                                  <TableCell>
                                    {rule.overridden ? (
                                      <Badge className="bg-amber-500 hover:bg-amber-600">{t("badgeOverridden")}</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-slate-500">{t("typeStatic")}</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {rule.configurable && (
                                      <div className="flex gap-2 items-center">
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(rule)}>
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          {tCommon("actions.edit")}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => toggleHistory(rule.id)}>
                                          <History className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        {rule.overridden && (
                                          <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => handleRevert(rule.id)}>
                                            <Undo2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                                {expandedHistory[rule.id] && (
                                  <TableRow className="bg-muted/10">
                                    <TableCell colSpan={4} className="p-0">
                                      <div className="p-4 bg-muted/5 border-b border-t shadow-inner text-sm space-y-3">
                                        <h4 className="font-semibold text-muted-foreground">{t("historyTitle")}</h4>
                                        {loadingHistory[rule.id] ? (
                                          <div className="text-muted-foreground">Loading...</div>
                                        ) : historyData[rule.id]?.length === 0 ? (
                                          <div className="text-muted-foreground text-xs">{t("historyEmpty")}</div>
                                        ) : (
                                          <Table className="bg-background rounded-md border text-xs">
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>{t("historyDate")}</TableHead>
                                                <TableHead>{t("historyUser")}</TableHead>
                                                <TableHead>{t("historyOld")}</TableHead>
                                                <TableHead>{t("historyNew")}</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {historyData[rule.id]?.map((log: any) => (
                                                <TableRow key={log.id}>
                                                  <TableCell>{new Date(log.createdAt).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}</TableCell>
                                                  <TableCell>{log.user?.firstName} {log.user?.lastName}</TableCell>
                                                  <TableCell className="font-mono text-rose-500 line-through">{log.oldValue?.value}</TableCell>
                                                  <TableCell className="font-mono text-emerald-500 font-bold">{log.newValue?.value}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editModal} onOpenChange={(v) => !v && setEditModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("colRule")}: {editModal?.id ? (tRules.has(editModal.id) ? tRules(editModal.id) : editModal.id) : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>القيمة القديمة</Label>
                <Input value={parseFloat(editModal?.effectiveValue || editModal?.defaultValue || 0).toFixed(2)} disabled />
              </div>
              <div className="space-y-2">
                <Label>القيمة الجديدة</Label>
                <Input type="number" step="0.1" value={newValue} onChange={(e) => {
                  setNewValue(e.target.value);
                  setHasSimulated(false);
                }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>السبب (يجب ألا يقل عن 20 حرف)</Label>
              <Textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                placeholder="اذكر سبب التعديل بوضوح..."
              />
              <p className="text-xs text-muted-foreground">{reason.length}/20 حرف على الأقل</p>
            </div>

            <div className="pt-4 flex gap-2">
              <Button variant="secondary" onClick={handleSimulate} disabled={!newValue}>
                {t("btnSimulate")}
              </Button>
              {simulationResult && (
                <div className={`text-sm px-3 py-2 rounded-md font-medium flex items-center gap-2 ${
                  simulationResult.count > 50 ? 'bg-rose-100 text-rose-700' :
                  simulationResult.count > 10 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                  {t("simTotal")}: {simulationResult.count}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(null)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={reason.length < 20 || !newValue || !hasSimulated}>
              {t("btnSave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
 );
}
