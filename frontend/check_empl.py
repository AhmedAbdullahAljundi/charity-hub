import json
with open(r'D:\Charity_Hub\frontend\messages\ar\households.json', 'r', encoding='utf-8') as f:
    ar_data = json.load(f)
opts = ar_data['wizard']['persons']['employmentQualityOptions']
print(json.dumps(opts, ensure_ascii=False, indent=2))
