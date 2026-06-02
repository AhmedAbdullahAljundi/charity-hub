import re

file_paths = [
    r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx',
    r'D:\Charity_Hub\frontend\components\wizard\steps\BurdensStep.tsx'
]

for path in file_paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Treatment Cost
    content = content.replace('value="PERIODIC_VERY_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.veryExpensive")}', 'value="VERY_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.veryExpensive")}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Treatment cost updated!")
