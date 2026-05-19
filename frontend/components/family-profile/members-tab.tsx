/* eslint-disable react-hooks/incompatible-library */
"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Users, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { dictLabel } from "@/lib/i18n/dict-label";
import {
  useFamiliesStore,
  MEMBER_RELATIONS,
  EDUCATION_LEVELS,
  DISABILITY_CLASSES,
  CHRONIC_SEVERITY,
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
} from "@/lib/store";
import { EmptyState, MiniField } from "./shared";

const createMemberSchema = (tV: any) => z.object({
  name: z.string().min(3, tV("nameMin")),
  nationalId: z.string().optional().refine(
    (val) => !val || (val.length === 14 && /^\d+$/.test(val)),
    tV("nationalId14")
  ),
  relation: z.string().min(1, tV("relationRequired")),
  birthDate: z.string().min(1, tV("birthRequired")),
  gender: z.string().min(1, tV("genderRequired")),
  education: z.string().optional(),
  job: z.string().optional(),
  jobIncome: z.coerce.number().min(0),
  maritalStatus: z.string().optional(),
  hasDisability: z.boolean(),
  disabilityClass: z.string().optional().nullable(),
  disabilityDescription: z.string().optional(),
  hasChronicIllness: z.boolean(),
  chronicIllness: z.string().optional(),
  chronicSeverity: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export function MembersTab({ family }: { family: any }) {
  const [open, setOpen] = useState(false);
  const members = Array.isArray(family.members) ? family.members : [];
  const addMember = useFamiliesStore(state => state.addMember);
  const deleteMember = useFamiliesStore(state => state.deleteMember);
  const t = useTranslations("families");
  const tDomain = useTranslations("domain");
  const tM = useTranslations("families.profile.members");
  const tV = useTranslations("validation.member");

  const memberSchema = useMemo(() => createMemberSchema(tV), [tV]);

  const getDomainLabel = (group: string, val: string | null | undefined) => {
    if (!val) return "---";
    try {
      const key = `${group}.${val}`;
      return tDomain.has(key as any) ? tDomain(key as any) : val;
    } catch {
      return val;
    }
  };

  const {
    register, handleSubmit, setValue, watch, formState: { errors }, reset,
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "", nationalId: "", relation: "", birthDate: "", gender: "male",
      education: "", job: "", jobIncome: 0, maritalStatus: "",
      hasDisability: false, disabilityClass: null, disabilityDescription: "",
      hasChronicIllness: false, chronicIllness: "", chronicSeverity: null, notes: "",
    },
  });

  const hasDisability = watch("hasDisability");
  const hasChronicIllness = watch("hasChronicIllness");
  const disabilityClassVal = watch("disabilityClass");

  const onSubmit = (data: any) => {
    const birthYear = new Date(data.birthDate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    addMember(family.id, { ...data, age });
    toast.success(tM("addSuccess"));
    reset();
    setOpen(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tM("title")} ({members.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tM("addMember")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{tM("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tM("fullName")} *</Label>
                  <Input {...register("name")} placeholder={tM("fullNamePh")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("nationalId")}</Label>
                  <Input {...register("nationalId")} placeholder={tM("nationalIdPh")} dir="ltr" className="text-right" />
                  {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId.message as string}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{tM("relation")} *</Label>
                  <Select onValueChange={(v) => setValue("relation", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {MEMBER_RELATIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {dictLabel(t, "memberRelations", r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.relation && <p className="text-xs text-destructive">{errors.relation.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("birthDate")} *</Label>
                  <Input type="date" {...register("birthDate")} dir="ltr" className="text-right" />
                  {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("gender")} *</Label>
                  <Select defaultValue={GENDER_OPTIONS[0]?.value} onValueChange={(v) => setValue("gender", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {dictLabel(t, "gender", g)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{tM("education")}</Label>
                  <Select onValueChange={(v) => setValue("education", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {dictLabel(t, "educationLevels", e)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.education && <p className="text-xs text-destructive">{errors.education.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("job")}</Label>
                  <Input {...register("job")} placeholder={tM("jobPh")} />
                  {errors.job && <p className="text-xs text-destructive">{errors.job.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("jobIncome")}</Label>
                  <Input type="number" {...register("jobIncome")} min={0} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{tM("maritalStatus")}</Label>
                <Select onValueChange={(v) => setValue("maritalStatus", v, { shouldValidate: true })}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {MARITAL_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {dictLabel(t, "marital", s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                {errors.maritalStatus && <p className="text-xs text-destructive">{errors.maritalStatus.message as string}</p>}
              </div>

              <Separator />

              {/* Disability Section */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{tM("hasDisability")}</Label>
                  <Switch checked={hasDisability} onCheckedChange={(v) => setValue("hasDisability", v)} />
                </div>
                {hasDisability && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>{tM("disabilityClass")}</Label>
                      <Select onValueChange={(v) => setValue("disabilityClass", v)}>
                        <SelectTrigger><SelectValue placeholder={tM("selectClass")} /></SelectTrigger>
                        <SelectContent>
                          {DISABILITY_CLASSES.map((d) => (
                            <SelectItem key={d.code} value={d.code}>
                              <span className="font-medium">{t("profile.misc.tier", { code: d.code })}</span>
                              {" — "}
                              {t(`dictionaries.disability.${d.key}_label`)} ({d.score} {t("profile.misc.points")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {DISABILITY_CLASSES.map((d) =>
                        disabilityClassVal === d.code ? (
                          <p key={d.code} className="text-[11px] text-muted-foreground">
                            {t(`dictionaries.disability.${d.key}_desc`)}
                          </p>
                        ) : null
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>{tM("disabilityDesc")}</Label>
                      <Textarea {...register("disabilityDescription")} placeholder={tM("disabilityDescPh")} rows={2} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chronic Illness Section */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{tM("hasChronicIllness")}</Label>
                  <Switch checked={hasChronicIllness} onCheckedChange={(v) => setValue("hasChronicIllness", v)} />
                </div>
                {hasChronicIllness && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>{tM("illnessName")}</Label>
                      <Input {...register("chronicIllness")} placeholder={tM("illnessNamePh")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{tM("severity")}</Label>
                      <Select onValueChange={(v) => setValue("chronicSeverity", v)}>
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
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{tM("notes")}</Label>
                <Textarea {...register("notes")} placeholder={tM("notesPh")} rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tM("saveMember")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState icon={Users} message={tM("emptyState")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {members.map((member: any) => (
              <Card key={member.id} className="shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-border/40 hover:border-primary/30 overflow-hidden bg-card/60 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-5 flex flex-col gap-4">
                  {/* Header Area */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-bold text-foreground text-[15px] flex items-center gap-2">
                        {member.name}
                        {member.gender === "FEMALE" || member.gender === "أنثى" || member.gender === "female" ? (
                          <span className="text-[10px] bg-pink-500/10 text-pink-600 border border-pink-500/20 px-2 py-0.5 rounded-full font-medium">{tM("female")}</span>
                        ) : (
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">{tM("male")}</span>
                        )}
                      </h4>
                      <p className="text-[13px] font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                        {getDomainLabel("role", member.relation)} • {member.age} {tM("years")}
                      </p>
                      
                      {/* Health Badges */}
                      {(member.hasDisability || member.hasChronicIllness) && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {member.hasDisability && (
                            <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px] font-semibold">
                              {tM("disability")} {getDomainLabel("disabilitySeverities", member.disabilityClass)}
                            </Badge>
                          )}
                          {member.hasChronicIllness && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-semibold">
                              {tM("chronicIllness")}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => {
                        deleteMember(family.id, member.id);
                        toast.success(tM("deleteSuccess"));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Data Grid Area */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <MiniField label={tM("nationalId")} value={member.nationalId || tM("notRegistered")} dir="ltr" />
                    <MiniField label={tM("maritalStatus")} value={getDomainLabel("maritalStatus", member.maritalStatus)} />
                    <MiniField label={tM("education")} value={getDomainLabel("education", member.education)} />
                    <MiniField label={tM("currentJob")} value={member.job || tM("noJob")} />
                    <MiniField label={tM("jobIncome")} value={member.jobIncome > 0 ? `${member.jobIncome} ${t("profile.scoring.currency")}` : tM("noIncome")} />
                    
                    {member.hasDisability && (
                      <MiniField label={tM("disabilityDesc")} value={member.disabilityDescription && member.disabilityDescription !== "undefined" ? member.disabilityDescription : `${t("profile.misc.tier", { code: getDomainLabel("disabilitySeverities", member.disabilityClass) })}`} />
                    )}
                    {member.hasChronicIllness && (
                      <MiniField label={tM("illnessName")} value={`${member.chronicIllness} (${getDomainLabel("chronicSeverities", member.chronicSeverity)})`} />
                    )}
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
