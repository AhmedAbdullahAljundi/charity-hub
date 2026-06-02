import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update openEdit to handle OTHER relationship
open_edit_pattern = r'const draftMember = \{ \.\.\.member \};'
open_edit_replacement = '''const draftMember: any = { ...member };
    if (draftMember.relationship?.startsWith("OTHER:")) {
      draftMember.otherRelationshipName = draftMember.relationship.substring(6);
      draftMember.relationship = "OTHER";
    }'''
content = re.sub(open_edit_pattern, open_edit_replacement, content)

# 2. Update updateDraft to handle computeAutoRole
update_draft_pattern = r'const updateDraft = \(key: keyof WizardPersonForm, value: unknown\) => \{\s*setDraft\(\(prev: any\) => \{\s*const updated = \{ \.\.\.prev, \[key\]: value \};\s*if \(key === "role" \|\| key === "relationship"\) \{\s*return applyChildNameConcat\(updated\);\s*\}\s*return updated;\s*\}\);\s*\}\;'

update_draft_replacement = '''const updateDraft = (key: keyof WizardPersonForm | "otherRelationshipName", value: unknown) => {
    setDraft((prev: any) => {
      let updated = { ...prev, [key]: value };
      
      // Auto compute role
      if (updated.role !== "HEAD" && updated.role !== "SPOUSE") {
        const age = updated.nationalId ? extractNationalIdInfo(updated.nationalId)?.age ?? 0 : 0;
        const gender = updated.gender ?? "MALE";
        const isStudent = updated.isStudent ?? false;
        const isSonOrDaughter = updated.relationship === "SON" || updated.relationship === "DAUGHTER";
        
        if (isSonOrDaughter) {
          if (age < 15) {
            updated.role = "CHILD";
          } else if (gender === "MALE") {
            updated.role = isStudent ? "CHILD" : "INDEPENDENT";
          } else if (gender === "FEMALE") {
            updated.role = (!updated.maritalStatus || updated.maritalStatus === "SINGLE") ? "CHILD" : "INDEPENDENT";
          }
        } else if (key === "relationship") {
          updated.role = "INDEPENDENT";
        }
      }
      
      if (key === "role" || key === "relationship") {
        updated = applyChildNameConcat(updated);
      }
      return updated;
    });
  };'''
content = re.sub(update_draft_pattern, update_draft_replacement, content)

# 3. Update conditionals
conditionals_pattern = r'const showBrideToggle =.*?;.*?const showOrphan =.*?;.*?const showDisplaced =.*?;.*?const showSonSection =.*?;'
conditionals_replacement = '''const isSonOrDaughter = draft.relationship === "SON" || draft.relationship === "DAUGHTER";
  const isIndependentSon = isSonOrDaughter && gender === "MALE" && draft.role === "INDEPENDENT" && age >= 15 && !draft.isStudent;
  const hideEducationMain = age < 15 || isIndependentSon;
  
  const showBrideToggle = draft.role === "CHILD" && gender === "FEMALE" && age >= 13 && age <= 25 && draft.maritalStatus === "SINGLE";
  const showOrphan = flags.hasWidow && draft.role === "CHILD";
  const showDisplaced = (flags.hasDivorce || flags.hasPrison) && draft.role === "CHILD";
  const showSonSection = isIndependentSon;'''
content = re.sub(conditionals_pattern, conditionals_replacement, content, flags=re.DOTALL)

# 4. Remove HEAD and SPOUSE from role options
role_options_pattern = r'<SelectItem value="HEAD">\{t\("wizard\.persons\.roleOptions\.head"\)\}</SelectItem>\s*<SelectItem value="SPOUSE">\{t\("wizard\.persons\.roleOptions\.spouse"\)\}</SelectItem>'
content = re.sub(role_options_pattern, '', content)

# 5. Add otherRelationshipName input
relationship_pattern = r'<Select value=\{draft\.relationship \?\? ""\} onValueChange=\{\(v\) => updateDraft\("relationship", v\)\}>\s*<SelectTrigger className=\{inputClass\}><SelectValue placeholder="" /></SelectTrigger>\s*<SelectContent>\s*(.*?)\s*</SelectContent>\s*</Select>'
relationship_replacement = r'''<Select value={draft.relationship ?? ""} onValueChange={(v) => updateDraft("relationship", v)}>
   <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
   <SelectContent>
   \1
   </SelectContent>
   </Select>
   {draft.relationship === "OTHER" && (
     <div className="mt-2">
       <Input 
         placeholder={t("wizard.persons.otherRelationshipName") || "اسم الصلة (مثال: ابن أخت، جارة)"} 
         value={draft.otherRelationshipName ?? ""} 
         onChange={(e) => updateDraft("otherRelationshipName", e.target.value)}
         className={inputClass}
       />
     </div>
   )}'''
content = re.sub(relationship_pattern, relationship_replacement, content, flags=re.DOTALL)

# 6. Hide education and employment from main section
edu_emp_pattern = r'\{\/\* Education \+ Employment for non-spouse\/head \*\/.*?\{draft\.role !== "SPOUSE" && draft\.role !== "HEAD" && \('
edu_emp_replacement = r'''{/* Education + Employment for non-spouse/head */}
  {draft.role !== "SPOUSE" && draft.role !== "HEAD" && !hideEducationMain && ('''
content = re.sub(edu_emp_pattern, edu_emp_replacement, content, flags=re.DOTALL)

# 7. Remove computed correction blue box
correction_pattern = r'\{\/\* Show computed correction for DEPENDENT_ADULT \*\/\}.*?\}\(\)\s*\}'
content = re.sub(correction_pattern, '', content, flags=re.DOTALL)

# 8. Add education to son section
son_working_pattern = r'<h5 className="font-semibold text-xs text-green-800 uppercase">\{t\("wizard\.persons\.sonWorkingDesc"\)\}</h5>\s*<div className="grid gap-4 sm:grid-cols-2">\s*<div className="space-y-1\.5">\s*<Label className=\{labelClass\}>\{t\("wizard\.persons\.workType"\)\}</Label>\s*<Select value=\{draft\.employmentType \?\? "SEASONAL"\} onValueChange=\{\(v\) => updateDraft\("employmentType", v\)\}>\s*<SelectTrigger className=\{inputClass\}><SelectValue /></SelectTrigger>\s*<SelectContent>\s*<SelectItem value="SEASONAL">\{t\("wizard\.persons\.workTypeOptions\.seasonal"\)\}</SelectItem>\s*<SelectItem value="REGULAR">\{t\("wizard\.persons\.workTypeOptions\.regular"\)\}</SelectItem>\s*</SelectContent>\s*</Select>\s*</div>'

son_working_replacement = r'''<h5 className="font-semibold text-xs text-green-800 uppercase">{t("wizard.persons.sonWorkingDesc")}</h5>
  <div className="grid gap-4 sm:grid-cols-2">
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label className={labelClass}>{t("wizard.persons.education")}</Label>
      <Select value={draft.educationLevel ?? "ILLITERATE"} onValueChange={(v) => updateDraft("educationLevel", v)}>
      <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
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
      <Select value={draft.employmentType ?? "SEASONAL"} onValueChange={(v) => updateDraft("employmentType", v)}>
      <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
      <SelectContent>
      <SelectItem value="SEASONAL">{t("wizard.persons.workTypeOptions.seasonal")}</SelectItem>
      <SelectItem value="REGULAR">{t("wizard.persons.workTypeOptions.regular")}</SelectItem>
      </SelectContent>
      </Select>
    </div>
  </div>'''
content = re.sub(son_working_pattern, son_working_replacement, content, flags=re.DOTALL)

# 9. Update isWorkingSon definition
is_working_son_pattern = r'const isWorkingSon = role === "CHILD" && gender === "MALE" && employmentType !== "NONE";'
is_working_son_replacement = 'const isWorkingSon = role === "INDEPENDENT" && gender === "MALE" && employmentType !== "NONE" && relationship === "SON";'
content = re.sub(is_working_son_pattern, is_working_son_replacement, content)

# 10. Payload OTHER relationship
payload_pattern = r'const payload: Record<string, unknown> = \{\s*\.\.\.member,'
payload_replacement = '''const payload: Record<string, unknown> = {
      ...member,
      relationship: member.relationship === "OTHER" && member.otherRelationshipName ? OTHER: : member.relationship,'''
content = re.sub(payload_pattern, payload_replacement, content)

# Remove unused types
types_pattern = r'otherRelationshipName\?: string;\s*'
# Actually we can just add it to WizardPersonForm if it doesn't exist
content = content.replace('export interface WizardPersonForm {', 'export interface WizardPersonForm {\n  otherRelationshipName?: string;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
