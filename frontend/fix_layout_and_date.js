const fs = require('fs');
const path = 'D:/Charity_Hub/frontend/components/wizard/steps/BasicInfoStep.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<h3 className="text-sm font-semibold uppercase text-muted-foreground border-b pb-1\.5">\{t\("wizard\.basic\.section"\)\}<\/h3>[\s\S]*?<\/section>/m;

const replacement = `<h3 className="text-sm font-semibold uppercase text-muted-foreground border-b pb-1.5">{t("wizard.basic.section")}</h3>
  <div className="flex flex-col gap-4">
    {/* Row 1: Family Name & PDF URL */}
    <div className="flex flex-wrap gap-4 items-start">
      {/* ── Family Name Dropdown Logic ── */}
      {(() => {
        const availableFamilyNames = [];
        if (fd.wifeName) availableFamilyNames.push({ name: fd.wifeName, role: "الزوجة" });
        if (fd.head?.name) availableFamilyNames.push({ name: fd.head.name, role: "الزوج/العائل" });
        if (fd.members?.length) {
          fd.members.forEach(m => {
            if (m.name && m.name !== fd.wifeName && m.name !== fd.head?.name) {
              let rLabel = m.role === "CHILD" ? "ابن/ـة" : "فرد";
              availableFamilyNames.push({ name: m.name, role: rLabel });
            }
          });
        }
        const currentFamilyNameBase = fd.familyName ? fd.familyName.replace(/^(أسرة|عائلة)\\s*/, "") : (fd.wifeName || "");
        const uniqueFamilyNames = Array.from(new Map(availableFamilyNames.map(item => [item.name, item])).values());
        if (currentFamilyNameBase && !uniqueFamilyNames.some(n => n.name === currentFamilyNameBase)) {
          uniqueFamilyNames.push({ name: currentFamilyNameBase, role: "مخصص" });
        }

        return (
          <div className="space-y-1.5 flex-[2] min-w-[250px]">
            <Label className={labelClass}>{t("wizard.basic.familyName")} <span className="text-destructive">*</span></Label>
            <Select 
              value={currentFamilyNameBase} 
              onValueChange={(v) => setField("familyName", v)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="اختر الاسم (تلقائي حسب الأفراد)" />
              </SelectTrigger>
              <SelectContent>
                {uniqueFamilyNames.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground text-center">يرجى كتابة اسم الزوجة أو العائل أدناه أولاً</div>
                ) : (
                  uniqueFamilyNames.map((n, i) => (
                    <SelectItem key={i} value={n.name}>
                      {n.name} <span className="text-muted-foreground text-[10px] pr-1">({n.role})</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        );
      })()}

      <div className="space-y-1.5 flex-1 min-w-[200px]">
        <Label className={labelClass}>{t("wizard.basic.pdfUrl")}</Label>
        <div className="relative">
        <FileText className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
        className={cn(inputClass, "pr-9")} 
        dir="ltr" 
        placeholder="https://..." 
        value={fd.pdfUrl ?? ""} 
        onChange={(e) => setField("pdfUrl", e.target.value)} 
        />
        </div>
      </div>
    </div>

    {/* Row 2: Code & Registration Date */}
    <div className="flex flex-wrap gap-4 items-start">
      <div className="space-y-1.5 w-32 shrink-0">
        <Label className={labelClass}>{t("wizard.basic.codeLabel")} <span className="text-destructive">*</span></Label>
        <div className="flex gap-2">
        <Input
          className={inputClass}
          type="text"
          value={fd.code ?? ""}
          onChange={(e) => {
          setField("code", e.target.value);
          setCodeError(null);
          setCodeSuccess(null);
          }}
          onBlur={(e) => checkCodeUnique(e.target.value)}
          placeholder={suggestedCode ? \`\${suggestedCode}\` : ""}
          />
        {isCheckingCode && <Loader2 className="h-5 w-5 animate-spin mt-2 text-muted-foreground" />}
        </div>
        {codeError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{codeError}</p>}
        {codeSuccess && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{codeSuccess}</p>}
      </div>

      <div className="space-y-1.5 w-36 shrink-0">
        <Label className={labelClass}>{t("wizard.basic.registrationDate")}</Label>
        <Input 
        type="date" 
        className={cn(inputClass, "bg-muted cursor-not-allowed")}
        value={fd.registrationDate ? (fd.registrationDate.includes("T") ? fd.registrationDate.split("T")[0] : fd.registrationDate) : ""} 
        readOnly
        />
      </div>
    </div>
  </div>
  </section>`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content);
console.log("Layout and date fix applied.");
