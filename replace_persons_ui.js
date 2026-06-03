const fs = require('fs');
let c = fs.readFileSync('d:/Charity_Hub/frontend/components/wizard/steps/PersonsStep.tsx', 'utf8');

const oldTextRegex = /<div className="flex items-center justify-between">\s*<Label className="text-xs">\{t\("wizard\.persons\.isMarried"\)\}<\/Label>\s*<Switch checked=\{draft\.sonMarried \?\? false\} onCheckedChange=\{\(v\) => updateDraft\("sonMarried", v\)\} \/>\s*<\/div>\s*<div className="flex items-center justify-between">\s*<Label className="text-xs">\{t\("wizard\.persons\.sameHouse"\)\}<\/Label>\s*<Switch checked=\{draft\.sonSameHouse \?\? false\} onCheckedChange=\{\(v\) => updateDraft\("sonSameHouse", v\)\} \/>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

const newText = `  {/* Independent Work Correction Section */}
  {draft.role === "INDEPENDENT" && (
  <div className="border border-border/60 shadow-sm pt-4 space-y-4 bg-card p-4 rounded-xl mt-6">
    <div className="flex items-center gap-2 mb-2">
      <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">{t("wizard.persons.workCorrection")}</h3>
    </div>
    
    <div className={cn("grid gap-5", isIndependentSon ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      <div className="space-y-1.5">
        <Label className={labelClass}>{t("wizard.persons.education")}</Label>
        <Select value={draft.educationLevel ?? "ILLITERATE"} onValueChange={(v) => updateDraft("educationLevel", v)}>
        <SelectTrigger className="h-9 text-sm bg-background border-input"><SelectValue /></SelectTrigger>
        <SelectContent>
        <SelectItem value="ILLITERATE">{t("wizard.persons.educationOptions.illiterate")}</SelectItem>
        <SelectItem value="MEDIUM">{t("wizard.persons.educationOptions.medium")}</SelectItem>
        <SelectItem value="HIGHER_LIMITED">{t("wizard.persons.educationOptions.higherLimited")}</SelectItem>
        <SelectItem value="HIGHER_STABLE">{t("wizard.persons.educationOptions.higherStable")}</SelectItem>
        </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>{t("wizard.persons.workType")}</Label>
        <Select value={draft.employmentType ?? "NONE"} onValueChange={(v) => updateDraft("employmentType", v)}>
        <SelectTrigger className="h-9 text-sm bg-background border-input"><SelectValue /></SelectTrigger>
        <SelectContent>
        <SelectItem value="NONE">{t("wizard.persons.workTypeOptions.none")}</SelectItem>
        <SelectItem value="SEASONAL">{t("wizard.persons.workTypeOptions.seasonal")}</SelectItem>
        <SelectItem value="REGULAR">{t("wizard.persons.workTypeOptions.regular")}</SelectItem>
        <SelectItem value="ABROAD_MEDIUM">{t("wizard.persons.workTypeOptions.abroad")}</SelectItem>
        </SelectContent>
        </Select>
      </div>

      {isIndependentSon && (
        <div className="flex flex-col justify-center space-y-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
          <div className="flex items-center justify-between h-full">
            <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{t("wizard.persons.sameHouse")}</Label>
            <Switch checked={draft.sonSameHouse ?? true} onCheckedChange={(v) => updateDraft("sonSameHouse", v)} />
          </div>
        </div>
      )}
    </div>
  </div>
  )}`;

if (oldTextRegex.test(c)) {
  const result = c.replace(oldTextRegex, newText);
  fs.writeFileSync('d:/Charity_Hub/frontend/components/wizard/steps/PersonsStep.tsx', result);
  console.log('Success regex replacement!');
} else {
  console.log('Pattern not found.');
}
