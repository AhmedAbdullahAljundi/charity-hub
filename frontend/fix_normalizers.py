import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace normalization logic with pass-through
content = re.sub(r'function normalizeTreatmentCost\(.*?\)\s*\{\s*if.*?return.*?return.*?\}', 'function normalizeTreatmentCost(value?: string | null) { return value || "NONE"; }', content, flags=re.DOTALL)
content = re.sub(r'function normalizeDiseaseFollowup\(.*?\)\s*\{\s*if.*?return.*?if.*?return.*?return.*?\}', 'function normalizeDiseaseFollowup(value?: string | null) { return value || "NONE_OR_RARE"; }', content, flags=re.DOTALL)
content = re.sub(r'function normalizeDiseaseWorkImpact\(.*?\)\s*\{\s*if.*?return.*?if.*?return.*?return.*?\}', 'function normalizeDiseaseWorkImpact(value?: string | null) { return value || "NONE"; }', content, flags=re.DOTALL)
content = re.sub(r'function normalizeDisabilityWorkImpact\(.*?\)\s*\{\s*if.*?return.*?if.*?return.*?return.*?\}', 'function normalizeDisabilityWorkImpact(value?: string | null) { return value || "NONE"; }', content, flags=re.DOTALL)
content = re.sub(r'function normalizeCompanion\(.*?\)\s*\{\s*if.*?return.*?return.*?\}', 'function normalizeCompanion(value?: string | null) { return value || "NONE"; }', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Normalizers updated!")
