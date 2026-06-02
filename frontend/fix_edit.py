import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace openEdit
pattern = r'      if \(member\.diseases\?\.length\) \{\s+draftMember\.diseasesDraft = \[ member\.diseases\[0\] \];\s+\}\s+if \(member\.disabilities\?\.length\) \{\s+draftMember\.disabilitiesDraft = \[ member\.disabilities\[0\] \];\s+\}'
replacement = r'''      if (member.diseases?.length) {
        draftMember.diseasesDraft = [ member.diseases[0] ];
        draftMember.hasDisease = true;
      }
      if (member.disabilities?.length) {
        draftMember.disabilitiesDraft = [ member.disabilities[0] ];
        draftMember.hasDisability = true;
      }'''

content, count = re.subn(pattern, replacement, content)
print(f"Replaced openEdit logic: {count}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
