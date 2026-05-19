/* eslint-disable react-hooks/incompatible-library */
"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Wallet, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  INCOME_SOURCES,
} from "@/lib/store";
import { EmptyState } from "./shared";

const createIncomeSchema = (tV: any) => z.object({
  source: z.string().min(1, tV("sourceRequired")),
  amount: z.coerce.number().min(1, tV("amountRequired")),
  frequency: z.string().min(1, tV("frequencyRequired")),
  verified: z.boolean(),
  notes: z.string().optional(),
});

export function IncomeTab({ family, totalIncome }: { family: any; totalIncome: number }) {
  const [open, setOpen] = useState(false);
  const addIncome = useFamiliesStore(state => state.addIncome);
  const deleteIncome = useFamiliesStore(state => state.deleteIncome);

  const getIncomeSourceKey = (raw: string) => {
    if (!raw) return "other";
    if (raw === "SALARY") return "fixed_salary";
    if (raw === "TAKAFUL_KARAMA") return "takafol";
    if (raw === "PENSION") return "pension";
    if (raw === "PROJECT") return "project_income";
    if (raw === "PROPERTY") return "real_estate_income";
    if (raw === "RATION_CARD") return "ration_card";
    const found = INCOME_SOURCES.find((x) => x.value === raw || x.key === raw);
    return found ? found.key : "other";
  };

  const incomes = family.income || [];
  const t = useTranslations("families");
  const tInc = useTranslations("families.profile.income");
  const tV = useTranslations("validation.member");
  const tM = useTranslations("families.profile.members");
  
  const incomeSchema = useMemo(() => createIncomeSchema(tV), [tV]);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: { source: "", amount: 0, frequency: "monthly", verified: false, notes: "" },
  });

  const verifiedVal = watch("verified");

  const onSubmit = async (data: any) => {
    try {
      await addIncome(family.id, data);
      toast.success(tInc("addSuccess"));
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tInc("addError"));
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tInc("title")} ({incomes.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tInc("addIncome")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{tInc("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{tInc("source")} *</Label>
                <Select onValueChange={(v) => setValue("source", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder={tInc("sourcePh")} /></SelectTrigger>
                  <SelectContent>
                    {INCOME_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {dictLabel(t, "incomeSources", s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tInc("amount")} *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tInc("frequency")}</Label>
                  <Select defaultValue="monthly" onValueChange={(v) => setValue("frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{tInc("monthly")}</SelectItem>
                      <SelectItem value="daily">{tInc("daily")}</SelectItem>
                      <SelectItem value="weekly">{tInc("weekly")}</SelectItem>
                      <SelectItem value="seasonal">{tInc("seasonal")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>{tInc("verified")}</Label>
                <Switch checked={verifiedVal} onCheckedChange={(v) => setValue("verified", v)} />
              </div>
              <div className="space-y-1.5">
                <Label>{tM("notes")}</Label>
                <Input {...register("notes")} placeholder={tM("notesPh")} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tInc("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {incomes.length === 0 ? (
          <EmptyState icon={Wallet} message={tInc("emptyState")} />
        ) : (
          <>
            {incomes.map((inc: any) => (
              <div key={inc.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent bg-secondary/40 hover:bg-secondary/60 hover:border-border/50 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dictLabel(t, "incomeSources", { key: getIncomeSourceKey(inc.source), value: inc.source })}
                    </p>
                    <p className="text-xs text-muted-foreground">{inc.amount.toLocaleString()} {tInc("currency")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteIncome(family.id, inc.id);
                    toast.success(tInc("deleteSuccess"));
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">{tInc("total")}</span>
              <span className="font-bold text-lg text-primary">{totalIncome.toLocaleString()} {tInc("currency")}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
