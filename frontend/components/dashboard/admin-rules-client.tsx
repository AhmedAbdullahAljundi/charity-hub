"use client";

import { useState, useEffect, useCallback } from "react";
import { getRules, simulateRule, overrideRule, revertRule } from "@/lib/api/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, ShieldAlert, Undo2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRules();
      setRules(data);
      // auto expand all layers by default
      const layers = [...new Set(data.map(r => r.layer))];
      const initialExpanded = layers.reduce((acc: any, layer: any) => {
        acc[layer] = true;
        return acc;
      }, {});
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!editModal || !newValue || reason.length < 20) return;
    try {
      await overrideRule(editModal.id, {
        value: parseFloat(newValue),
        reason,
        ...(expiryDate && { expiresAt: new Date(expiryDate).toISOString() })
      });
      setEditModal(null);
      await fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevert = async (ruleId: string) => {
    try {
      await revertRule(ruleId);
      await fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (rule: any) => {
    setEditModal(rule);
    setNewValue(rule.value?.toString() ?? "");
    setReason("");
    setExpiryDate("");
    setSimulationResult(null);
  };

  const layers = [...new Set(rules.map(r => r.layer))].sort();

  return (
    <div className="space-y-6" dir="rtl">
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
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
                  <CardTitle className="text-lg">طبقة {layer as string}</CardTitle>
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
                              <TableHead className="text-right">القاعدة</TableHead>
                              <TableHead className="text-right">القيمة الحالية</TableHead>
                              <TableHead className="text-right">المصدر</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">إجراء</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {layerRules.map(rule => (
                              <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.key}</TableCell>
                                <TableCell className="font-mono">{rule.value}</TableCell>
                                <TableCell>
                                  {rule.isOverridden ? (
                                    <Badge className="bg-amber-500">مُعدَّل</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-slate-500">ثابت</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {!rule.configurable && <Badge variant="secondary" className="bg-slate-100">إلزامي 🔒</Badge>}
                                </TableCell>
                                <TableCell>
                                  {rule.configurable && (
                                    <div className="flex gap-2 items-center">
                                      <Button variant="outline" size="sm" onClick={() => openEditModal(rule)}>
                                        <Edit2 className="h-4 w-4 me-2" /> تعديل
                                      </Button>
                                      {rule.isOverridden && (
                                        <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => handleRevert(rule.id)}>
                                          <Undo2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
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
        <DialogContent dir="rtl" className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل قيمة القاعدة: {editModal?.key}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>القيمة الحالية</Label>
                <Input value={editModal?.value} disabled />
              </div>
              <div className="space-y-2">
                <Label>القيمة الجديدة</Label>
                <Input type="number" step="0.1" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
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

            <div className="space-y-2">
              <Label>تاريخ الانتهاء (اختياري)</Label>
              <Input type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>

            <div className="pt-4 flex gap-2">
              <Button variant="secondary" onClick={handleSimulate} disabled={!newValue}>
                محاكاة التأثير
              </Button>
              {simulationResult && (
                <div className={`text-sm px-3 py-2 rounded-md font-medium flex items-center gap-2 ${
                  simulationResult.count > 50 ? 'bg-rose-100 text-rose-700' :
                  simulationResult.count > 10 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                  هذا التغيير سيؤثر على {simulationResult.count} أسرة
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(null)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={reason.length < 20 || !newValue}>حفظ التعديل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
