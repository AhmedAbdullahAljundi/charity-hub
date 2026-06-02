import re

file_paths = [
    r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx',
    r'D:\Charity_Hub\frontend\components\wizard\steps\BurdensStep.tsx'
]

for path in file_paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Disease Work Impact
    content = content.replace('value="SLIGHT">{t("wizard.burdens.disease.workImpactOptions.slight")}', 'value="MINOR">{t("wizard.burdens.disease.workImpactOptions.slight")}')
    content = content.replace('value="SEVERE_BUT_WORKING">{t("wizard.burdens.disease.workImpactOptions.severe")}', 'value="MAJOR_WORKS">{t("wizard.burdens.disease.workImpactOptions.severe")}')

    # Disability Work Impact
    content = content.replace('value="SLIGHT">{t("wizard.burdens.disability.workImpactOptions.slight")}', 'value="LIMITED">{t("wizard.burdens.disability.workImpactOptions.slight")}')
    content = content.replace('value="REQUIRES_SPECIAL">{t("wizard.burdens.disability.workImpactOptions.special")}', 'value="SPECIAL_WORK">{t("wizard.burdens.disability.workImpactOptions.special")}')

    # Followup
    content = content.replace('value="PERIODIC_REGULAR">{t("wizard.burdens.disease.followupOptions.regular")}', 'value="REGULAR">{t("wizard.burdens.disease.followupOptions.regular")}')
    content = content.replace('value="PERIODIC_EXPENSIVE">{t("wizard.burdens.disease.followupOptions.expensive")}', 'value="EXPENSIVE">{t("wizard.burdens.disease.followupOptions.expensive")}')

    # Companion
    content = content.replace('value="FULL_DEPENDENCE">{t("wizard.burdens.disability.companionOptions.full")}', 'value="FULLY_DEPENDENT">{t("wizard.burdens.disability.companionOptions.full")}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Select values updated!")
