file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == ')}' and 'Vulnerability Conditionals' in ''.join(lines[i:i+5]):
        if '</div>' in lines[i+1]:
            # swap
            lines[i], lines[i+1] = lines[i+1], lines[i]
            print(f"Swapped lines {i} and {i+1}")
            break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
