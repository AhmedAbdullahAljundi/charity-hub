import re

file_path = r'D:\Charity_Hub\frontend\lib\stores\wizardStore.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern_diseases = r'diseases:\s*\(uiHead\?\.diseases\s*\?\?\s*\[\]\)\.map\(\(d\)\s*=>\s*\{\s*\.\.\.d,\s*personId:\s*uiHead\?\.id,\s*\}\),'
replacement_diseases = r'diseases: (h.persons ?? []).flatMap(p => (p.diseases ?? []).map(d => ({ ...d, personId: p.id }))),'

pattern_disabilities = r'disabilities:\s*\(uiHead\?\.disabilities\s*\?\?\s*\[\]\)\.map\(\(d\)\s*=>\s*\{\s*\.\.\.d,\s*personId:\s*uiHead\?\.id,\s*\}\),'
replacement_disabilities = r'disabilities: (h.persons ?? []).flatMap(p => (p.disabilities ?? []).map(d => ({ ...d, personId: p.id }))),'

content, c1 = re.subn(pattern_diseases, replacement_diseases, content)
content, c2 = re.subn(pattern_disabilities, replacement_disabilities, content)

print(f"Replaced diseases: {c1}")
print(f"Replaced disabilities: {c2}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
