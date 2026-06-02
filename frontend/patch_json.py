import json

ar_path = r'D:\Charity_Hub\frontend\messages\ar\households.json'
with open(ar_path, 'r', encoding='utf-8') as f:
    ar_data = json.load(f)

# Update education options (remove multipliers)
edu_opts = ar_data['wizard']['persons']['educationOptions']
edu_opts['illiterate'] = 'أمي / يقرأ ويكتب'
edu_opts['medium'] = 'متوسط / دبلوم'
edu_opts['higherLimited'] = 'جامعي فرصة محدودة'
edu_opts['higherStable'] = 'جامعي فرصة مستقرة'

# Update workType options
work_opts = ar_data['wizard']['persons']['workTypeOptions']
work_opts['abroad'] = 'مسافر'

with open(ar_path, 'w', encoding='utf-8') as f:
    json.dump(ar_data, f, ensure_ascii=False, indent=2)

en_path = r'D:\Charity_Hub\frontend\messages\en\households.json'
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

edu_opts_en = en_data['wizard']['persons']['educationOptions']
edu_opts_en['illiterate'] = 'Illiterate / Read & Write'
edu_opts_en['medium'] = 'Medium / Diploma'
edu_opts_en['higherLimited'] = 'Higher (Limited Ops)'
edu_opts_en['higherStable'] = 'Higher (Stable Ops)'

work_opts_en = en_data['wizard']['persons']['workTypeOptions']
work_opts_en['abroad'] = 'Traveler'

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("JSON files updated.")
