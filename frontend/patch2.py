import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove {draft.role === "DEPENDENT_ADULT" && ( around employmentQuality
emp_qual_pattern = r'\{draft\.role === "DEPENDENT_ADULT" && \(\s*<div className="space-y-1\.5">\s*<Label className=\{labelClass\}>\{t\("wizard\.persons\.employmentQuality"\)\}</Label>'
emp_qual_replacement = r'''<div className="space-y-1.5">
   <Label className={labelClass}>{t("wizard.persons.employmentQuality")}</Label>'''
content = re.sub(emp_qual_pattern, emp_qual_replacement, content, flags=re.DOTALL)

# Also remove the closing )} right after the Select
closing_brace_pattern = r'</Select>\s*</div>\s*\)\}'
closing_brace_replacement = r'</Select>\n   </div>'
content = re.sub(closing_brace_pattern, closing_brace_replacement, content, flags=re.DOTALL)

# Completely remove the computed correction block
correction_pattern = r'\{\/\* Show computed correction for DEPENDENT_ADULT \*\/\}.*?\}\(\)\s*\}'
content = re.sub(correction_pattern, '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for removing DEPENDENT_ADULT restriction and correction box.")
