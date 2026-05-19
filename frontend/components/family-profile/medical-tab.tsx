/* eslint-disable react-hooks/incompatible-library */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Stethoscope, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  useFamiliesStore,
  DISABILITY_CLASSES,
  CHRONIC_SEVERITY,
} from "@/lib/store";
import { EmptyState, MiniField } from "./shared";

const medicalSchema = z.object({
  memberName: z.string().optional(),
  type: z.string().optional(),
  condition: z.string().optional(),
  severity: z.string().optional(),
  disabilityClass: z.string().optional().nullable(),
  treatment: z.string().optional(),
  monthlyCost: z.coerce.number().min(0).optional(),
  hospital: z.string().optional(),
  startDate: z.string().optional(),
  needsFollowup: z.boolean().optional(),
  notes: z.string().optional(),
});

export function MedicalTab({ family }: { family: any }) {
  const [open, setOpen] = useState(false);
  const addMedicalRecord = useFamiliesStore(state => state.addMedicalRecord);
  const deleteMedicalRecord = useFamiliesStore(state => state.deleteMedicalRecord);
  const records = family.medicalRecords || [];
  const members = family.members || [];
  const t = useTranslations("families");
  const tMed = useTranslations("families.profile.medical");
  const tM = useTranslations("families.profile.members");

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      memberName: "", type: "chronic", condition: "", severity: "",
      disabilityClass: null, treatment: "", monthlyCost: 0,
      hospital: "", startDate: "", needsFollowup: true, notes: "",
    },
  });

  const recordType = watch("type");
  const disabilityClassVal = watch("disabilityClass");
  const needsFollowupVal = watch("needsFollowup");

  const onSubmit = async (data: any) => {
    if (!data.memberName) {
      toast.error(tMed("personRequired"));
      return;
    }

    const severityObj = recordType === "disability"
      ? DISABILITY_CLASSES.find((d) => d.code === data.disabilityClass)
      : CHRONIC_SEVERITY.find((s) => s.code === data.severity);
    const matchedMember = members.find((m: any) => m.name === data.memberName);
    const personId = matchedMember?.id || family.id;
    try {
      await addMedicalRecord(family.id, personId, {
        ...data,
        severityScore: severityObj?.score || 0,
      });
      toast.success(tMed("addSuccess"));
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tMed("addError"));
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tMed("title")} ({records.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tMed("addRecord")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{tMed("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{tMed("patientName")}</Label>
                {members.length > 0 ? (
                  <Select onValueChange={(v) => setValue("memberName", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {members.map((m: any) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...register("memberName")} placeholder={tM("fullNamePh")} />
                )}
                {errors.memberName && <p className="text-xs text-destructive">{errors.memberName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tMed("conditionType")}</Label>
                  <Select defaultValue="chronic" onValueChange={(v) => setValue("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chronic">{tMed("typechronic")}</SelectItem>
                      <SelectItem value="disability">{tMed("typedisability")}</SelectItem>
                      <SelectItem value="temp_injury">{tMed("typetemp_injury")}</SelectItem>
                      <SelectItem value="surgery">{tMed("typesurgery")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{tMed("diagnosis")}</Label>
                  <Input {...register("condition")} placeholder={tMed("diagnosisPh")} />
                  {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                </div>
              </div>

              {/* Severity selection based on type */}
              {recordType === "disability" ? (
                <div className="space-y-1.5">
                  <Label>{tM("disabilityClass")}</Label>
                  <Select onValueChange={(v) => {
                    setValue("disabilityClass", v);
                    setValue("severity", v, { shouldValidate: true });
                  }}>
                    <SelectTrigger><SelectValue placeholder={tM("selectClass")} /></SelectTrigger>
                    <SelectContent>
                      {DISABILITY_CLASSES.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {t("profile.misc.tier", { code: d.code })} — {t(`dictionaries.disability.${d.key}_label`)} (
                          {d.score} {t("profile.misc.points")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {DISABILITY_CLASSES.map((d) =>
                    disabilityClassVal === d.code ? (
                      <p key={d.code} className="text-[11px] text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                        {t(`dictionaries.disability.${d.key}_desc`)}
                      </p>
                    ) : null
                  )}
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>{tM("severity")}</Label>
                  <Select onValueChange={(v) => setValue("severity", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {CHRONIC_SEVERITY.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {t(`dictionaries.chronicSeverity.${s.key}`)} ({s.score} {t("profile.misc.points")}) —{" "}
                          {t(`dictionaries.chronicSeverity.${s.key}_desc`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{tMed("treatment")}</Label>
                <Input {...register("treatment")} placeholder={tMed("treatmentPh")} />
                {errors.treatment && <p className="text-xs text-destructive">{errors.treatment.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tMed("monthlyCost")}</Label>
                  <Input type="number" {...register("monthlyCost")} min={0} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-1.5">
                  <Label>{tMed("startDate")}</Label>
                  <Input type="date" {...register("startDate")} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{tMed("hospital")}</Label>
                <Input {...register("hospital")} placeholder={tMed("hospitalPh")} />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>{tMed("needsFollowup")}</Label>
                <Switch checked={needsFollowupVal} onCheckedChange={(v) => setValue("needsFollowup", v)} />
              </div>

              <div className="space-y-1.5">
                <Label>{tMed("notes")}</Label>
                <Textarea {...register("notes")} placeholder={tM("notesPh")} rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tMed("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState icon={Stethoscope} message={tMed("emptyState")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record: any) => (
              <Card key={record.id} className="shadow-sm hover:shadow-md transition-all duration-300 border-border/40 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{record.condition}</h4>
                      <p className="text-xs text-muted-foreground">{record.memberName}</p>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteMedicalRecord(family.id, record.id);
                        toast.success(tMed("deleteSuccess"));
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <MiniField label={tMed("treatment")} value={record.treatment} />
                    <MiniField label={tMed("monthlyCost")} value={`${record.monthlyCost} ${tMed("currency")}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
