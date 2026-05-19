"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  EXPENSE_CATEGORIES,
} from "@/lib/store";
import { EmptyState } from "./shared";

const createExpenseSchema = (tV: any) => z.object({
  item: z.string().min(1, tV("expenseCategoryRequired")),
  amount: z.coerce.number().min(1, tV("amountRequired")),
  priority: z.string().optional(),
  notes: z.string().optional(),
});

export function ExpensesTab({ family, totalExpenses, netBalance }: any) {
  const [open, setOpen] = useState(false);
  const addExpense = useFamiliesStore(state => state.addExpense);
  const deleteExpense = useFamiliesStore((s) => s.deleteExpense);
  const expenses = family.expenses || [];
  const t = useTranslations("families");
  const tExp = useTranslations("families.profile.expenses");
  const tM = useTranslations("families.profile.members");
  const tV = useTranslations("validation.member");

  const expenseSchema = useMemo(() => createExpenseSchema(tV), [tV]);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { item: "", amount: 0, priority: "basic", notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addExpense(family.id, data);
      toast.success(tExp("addSuccess"));
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tExp("addError"));
    }
  };

  const getExpenseCategoryKey = (raw: string) => {
    if (!raw) return "other";
    const found = EXPENSE_CATEGORIES.find((x) => x.value === raw || x.key === raw);
    return found ? found.key : "other";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tExp("title")} ({expenses.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tExp("addExpense")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{tExp("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{tExp("category")} *</Label>
                <Select onValueChange={(v) => setValue("item", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder={tExp("categoryPh")} /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {dictLabel(t, "expenseCategories", c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.item && <p className="text-xs text-destructive">{errors.item.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tExp("amount")} *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select defaultValue="basic" onValueChange={(v) => setValue("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{tExp("notes")}</Label>
                <Input {...register("notes")} placeholder={tM("notesPh")} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tExp("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.length === 0 ? (
          <EmptyState icon={Receipt} message={tExp("emptyState")} />
        ) : (
          <>
            {expenses.map((exp: any) => (
              <div key={exp.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent bg-secondary/40 hover:bg-secondary/60 hover:border-border/50 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/5 flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5 text-destructive/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dictLabel(t, "expenseCategories", { key: getExpenseCategoryKey(exp.category), value: exp.category })}
                    </p>
                    <p className="text-xs text-muted-foreground">{exp.amount.toLocaleString()} {tExp("currency")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteExpense(family.id, exp.id);
                    toast.success(tExp("deleteSuccess"));
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">{tExp("total")}</span>
              <span className="font-bold text-lg text-destructive">{totalExpenses.toLocaleString()} {tExp("currency")}</span>
            </div>
            <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">{tExp("netBalance")}</span>
              <span className={`font-bold ${netBalance >= 0 ? "text-success" : "text-destructive"}`}>
                {netBalance.toLocaleString()} {tExp("currency")}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
