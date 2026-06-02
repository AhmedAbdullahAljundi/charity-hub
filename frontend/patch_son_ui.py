import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the h5 sonWorkingDesc
desc_pattern = r'<h5 className="font-semibold text-xs text-green-800 uppercase">\{t\("wizard\.persons\.sonWorkingDesc"\)\}<\/h5>\s*'
content = re.sub(desc_pattern, '', content)

# 2. Add "NONE" option to workType and change default to NONE
work_type_old = '''<Select value={draft.employmentType ?? "SEASONAL"} onValueChange={(v) => updateDraft("employmentType", v)}>
       <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
       <SelectContent>
       <SelectItem value="SEASONAL">{t("wizard.persons.workTypeOptions.seasonal")}</SelectItem>
       <SelectItem value="REGULAR">{t("wizard.persons.workTypeOptions.regular")}</SelectItem>'''

work_type_new = '''<Select value={draft.employmentType ?? "NONE"} onValueChange={(v) => updateDraft("employmentType", v)}>
       <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
       <SelectContent>
       <SelectItem value="NONE">{t("wizard.persons.workTypeOptions.none")}</SelectItem>
       <SelectItem value="SEASONAL">{t("wizard.persons.workTypeOptions.seasonal")}</SelectItem>
       <SelectItem value="REGULAR">{t("wizard.persons.workTypeOptions.regular")}</SelectItem>'''

content = content.replace(work_type_old, work_type_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for removing header and adding NONE.")
