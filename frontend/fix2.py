import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix isWorkingSon in buildPersonPayload
payload_pattern = r'const role = normalizeRole\(member\.role\);\s*const gender = member\.gender \|\| info\?\.gender \|\| "MALE";\s*const employmentType = member\.employmentType \|\| "NONE";\s*const isWorkingSon = role === "INDEPENDENT" && gender === "MALE" && employmentType !== "NONE" && relationship === "SON";'
payload_replacement = r'''const role = normalizeRole(member.role);
  const gender = member.gender || info?.gender || "MALE";
  const employmentType = member.employmentType || "NONE";
  const isWorkingSon = member.role === "INDEPENDENT" && gender === "MALE" && employmentType !== "NONE" && member.relationship === "SON";'''
content = re.sub(payload_pattern, payload_replacement, content, flags=re.DOTALL)

# Fix (m as any) in the render loop.
# Currently the loop starts with d.members.map((m, idx) => {
# We can just change it to d.members.map((m: any, idx) => {
map_pattern = r'\{fd\.members\?\.map\(\(m, idx\) => \{'
map_replacement = r'{fd.members?.map((m: any, idx) => {'
content = re.sub(map_pattern, map_replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
