import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<div className="grid gap-4 sm:grid-cols-2 border-t pt-4 bg-rose-50/30 rounded-lg p-3 mt-2">.*?{/\* Education \+ Employment for non-spouse/head \*/})'
replacement = r'{draft.role !== "INDEPENDENT" && (\n   \1\n   )}'

content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
print(f"Replaced Health section: {count}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
