import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if 'Show computed correction' in line or 'DEPENDENT_ADULT' in line and 'employmentQuality' in line:
        print(f"Line {i+1}: {line}")
