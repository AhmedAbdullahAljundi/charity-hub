import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\BurdensStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace normalization logic with pass-through
content = re.sub(r'const normalizeTreatmentCost \= \(.*?\)\s*=>\s*\{\s*if.*?return.*?return.*?\}', 'const normalizeTreatmentCost = (value?: string | null) => { return value || "NONE"; }', content, flags=re.DOTALL)
content = re.sub(r'const normalizeDiseaseFollowup \= \(.*?\)\s*=>\s*\{\s*if.*?return.*?if.*?return.*?return.*?\}', 'const normalizeDiseaseFollowup = (value?: string | null) => { return value || "NONE_OR_RARE"; }', content, flags=re.DOTALL)
content = re.sub(r'const normalizeDiseaseWorkImpact \= \(.*?\)\s*=>\s*\{\s*if.*?return.*?if.*?return.*?return.*?\}', 'const normalizeDiseaseWorkImpact = (value?: string | null) => { return value || "NONE"; }', content, flags=re.DOTALL)
content = re.sub(r'const normalizeDisabilityWorkImpact \= \(.*?\)\s*=>\s*\{\s*if.*?return.*?if.*?return.*?return.*?\}', 'const normalizeDisabilityWorkImpact = (value?: string | null) => { return value || "NONE"; }', content, flags=re.DOTALL)
content = re.sub(r'const normalizeCompanion \= \(.*?\)\s*=>\s*\{\s*if.*?return.*?return.*?\}', 'const normalizeCompanion = (value?: string | null) => { return value || "NONE"; }', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Normalizers updated in BurdensStep!")
