const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/wizard/steps/PersonsStep.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startStr = '<SelectItem value="-2.0">{t("wizard.persons.prisonSuspicionOptions.high")}</SelectItem>';
const endStr = ' {editingIdx === -1 && (';

const startIdx = content.indexOf(startStr);
const nextIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && nextIdx !== -1 && nextIdx > startIdx) {
  const replacement = `<SelectItem value="-2.0">{t("wizard.persons.prisonSuspicionOptions.high")}</SelectItem>
  <SelectItem value="-3.0">{t("wizard.persons.prisonSuspicionOptions.extreme")}</SelectItem>
  </SelectContent>
  </Select>
  <p className="text-[10px] text-muted-foreground mt-1">{t("wizard.persons.prisonSuspicionDesc")}</p>
  </div>
  </>
  )}
  </div>
  )}
 </div>

 {/* Health / Disabilities */}
  {draft.role !== "INDEPENDENT" && (
  <div className="grid gap-6 sm:grid-cols-2 border-t pt-6 mt-4">
    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-semibold text-foreground"><HeartPulse className="w-4 h-4 text-rose-600" />{t("wizard.persons.hasDisease")}</Label>
        <Switch checked={draft.hasDisease ?? false} onCheckedChange={(v) => {
          updateDraft("hasDisease", v);
          if (v) {
            updateDraft("diseasesDraft", [{ name: "", treatmentCost: "NONE", followup: "NONE_OR_RARE", workImpact: "NONE" }]);
          } else {
            updateDraft("diseasesDraft", []);
          }
        }} />
      </div>
      {draft.hasDisease && (
        <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground mb-1.5 block">{t("wizard.burdens.disease.name")} <span className="text-red-500">*</span></Label>
            <Input 
              className="h-9 text-xs bg-background border-input" 
              placeholder="مثال: سكري، ضغط..." 
              value={draft.diseasesDraft?.[0]?.name ?? ""}
              onChange={(e) => {
                const current = draft.diseasesDraft?.[0] || { treatmentCost: "NONE", followup: "NONE_OR_RARE", workImpact: "NONE" };
                updateDraft("diseasesDraft", [{ ...current, name: e.target.value }]);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">{t("wizard.burdens.disease.treatmentCost")}</Label>
            <Select value={draft.diseasesDraft?.[0]?.treatmentCost ?? "NONE"} onValueChange={(v) => {
              const current = draft.diseasesDraft?.[0] || { name: "", followup: "NONE_OR_RARE", workImpact: "NONE" };
              updateDraft("diseasesDraft", [{ ...current, treatmentCost: v }]);
            }}>
              <SelectTrigger className="h-9 text-xs bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("wizard.burdens.disease.treatmentOptions.none")}</SelectItem>
                <SelectItem value="PERIODIC_CHEAP">{t("wizard.burdens.disease.treatmentOptions.cheap")}</SelectItem>
                <SelectItem value="PERIODIC_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.expensive")}</SelectItem>
                <SelectItem value="VERY_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.veryExpensive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">{t("wizard.burdens.disease.followup")}</Label>
            <Select value={draft.diseasesDraft?.[0]?.followup ?? "NONE_OR_RARE"} onValueChange={(v) => {
              const current = draft.diseasesDraft?.[0] || { name: "", treatmentCost: "NONE", workImpact: "NONE" };
              updateDraft("diseasesDraft", [{ ...current, followup: v }]);
            }}>
              <SelectTrigger className="h-9 text-xs bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE_OR_RARE">{t("wizard.burdens.disease.followupOptions.none")}</SelectItem>
                <SelectItem value="REGULAR">{t("wizard.burdens.disease.followupOptions.regular")}</SelectItem>
                <SelectItem value="EXPENSIVE">{t("wizard.burdens.disease.followupOptions.expensive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">{t("wizard.burdens.disease.workImpact")}</Label>
            <Select value={draft.diseasesDraft?.[0]?.workImpact ?? "NONE"} onValueChange={(v) => {
              const current = draft.diseasesDraft?.[0] || { name: "", treatmentCost: "NONE", followup: "NONE_OR_RARE" };
              updateDraft("diseasesDraft", [{ ...current, workImpact: v }]);
            }}>
              <SelectTrigger className="h-9 text-xs bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("wizard.burdens.disease.workImpactOptions.none")}</SelectItem>
                <SelectItem value="MINOR">{t("wizard.burdens.disease.workImpactOptions.slight")}</SelectItem>
                <SelectItem value="MAJOR_WORKS">{t("wizard.burdens.disease.workImpactOptions.severe")}</SelectItem>
                <SelectItem value="CANNOT_WORK">{t("wizard.burdens.disease.workImpactOptions.cannotWork")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>

    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-semibold text-foreground"><Stethoscope className="w-4 h-4 text-orange-600" />{t("wizard.persons.hasDisability")}</Label>
        <Switch checked={draft.hasDisability ?? false} onCheckedChange={(v) => {
          updateDraft("hasDisability", v);
          if (v) {
            updateDraft("disabilitiesDraft", [{ description: "", workImpact: "NONE", companion: "NONE", treatmentCost: "NONE" }]);
          } else {
            updateDraft("disabilitiesDraft", []);
          }
        }} />
      </div>
      {draft.hasDisability && (
        <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground mb-1.5 block">{t("wizard.burdens.disability.desc")} <span className="text-red-500">*</span></Label>
            <Input 
              className="h-9 text-xs bg-background border-input" 
              placeholder="مثال: إعاقة حركية، بصرية..." 
              value={draft.disabilitiesDraft?.[0]?.description ?? ""}
              onChange={(e) => {
                const current = draft.disabilitiesDraft?.[0] || { workImpact: "NONE", companion: "NONE", treatmentCost: "NONE" };
                updateDraft("disabilitiesDraft", [{ ...current, description: e.target.value }]);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">{t("wizard.burdens.disability.workImpact")}</Label>
            <Select value={draft.disabilitiesDraft?.[0]?.workImpact ?? "NONE"} onValueChange={(v) => {
              const current = draft.disabilitiesDraft?.[0] || { description: "", companion: "NONE", treatmentCost: "NONE" };
              updateDraft("disabilitiesDraft", [{ ...current, workImpact: v }]);
            }}>
              <SelectTrigger className="h-9 text-xs bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("wizard.burdens.disability.workImpactOptions.none")}</SelectItem>
                <SelectItem value="LIMITED">{t("wizard.burdens.disability.workImpactOptions.slight")}</SelectItem>
                <SelectItem value="SPECIAL_WORK">{t("wizard.burdens.disability.workImpactOptions.special")}</SelectItem>
                <SelectItem value="CANNOT_WORK">{t("wizard.burdens.disability.workImpactOptions.cannotWork")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">{t("wizard.burdens.disability.companion")}</Label>
            <Select value={draft.disabilitiesDraft?.[0]?.companion ?? "NONE"} onValueChange={(v) => {
              const current = draft.disabilitiesDraft?.[0] || { description: "", workImpact: "NONE", treatmentCost: "NONE" };
              updateDraft("disabilitiesDraft", [{ ...current, companion: v }]);
            }}>
              <SelectTrigger className="h-9 text-xs bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("wizard.burdens.disability.companionOptions.none")}</SelectItem>
                <SelectItem value="OUTSIDE_ONLY">{t("wizard.burdens.disability.companionOptions.outside")}</SelectItem>
                <SelectItem value="FULLY_DEPENDENT">{t("wizard.burdens.disability.companionOptions.full")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">{t("wizard.burdens.disability.treatmentCost")}</Label>
            <Select value={draft.disabilitiesDraft?.[0]?.treatmentCost ?? "NONE"} onValueChange={(v) => {
              const current = draft.disabilitiesDraft?.[0] || { description: "", workImpact: "NONE", companion: "NONE" };
              updateDraft("disabilitiesDraft", [{ ...current, treatmentCost: v }]);
            }}>
              <SelectTrigger className="h-9 text-xs bg-background border-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("wizard.burdens.disease.treatmentOptions.none")}</SelectItem>
                <SelectItem value="PERIODIC_CHEAP">{t("wizard.burdens.disease.treatmentOptions.cheap")}</SelectItem>
                <SelectItem value="PERIODIC_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.expensive")}</SelectItem>
                <SelectItem value="VERY_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.veryExpensive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  </div>
  )}

`;

  const newContent = content.substring(0, startIdx) + replacement + content.substring(nextIdx);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Successfully fixed PersonsStep.tsx using indices!");
} else {
  console.log("Could not find startIdx or nextIdx in PersonsStep.tsx", startIdx, nextIdx);
}
