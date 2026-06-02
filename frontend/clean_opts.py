import json

ar_path = r'D:\Charity_Hub\frontend\messages\ar\households.json'
with open(ar_path, 'r', encoding='utf-8') as f:
    ar_data = json.load(f)

# Remove numbers from employmentQualityOptions
opts = ar_data['wizard']['persons']['employmentQualityOptions']
opts['weak'] = 'عمل ضعيف / متقطع'
opts['unstable'] = 'عمل غير منتظم / متذبذب'
opts['sufficient'] = 'عمل مجزئ / كافٍ'

with open(ar_path, 'w', encoding='utf-8') as f:
    json.dump(ar_data, f, ensure_ascii=False, indent=2)

en_path = r'D:\Charity_Hub\frontend\messages\en\households.json'
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

opts_en = en_data['wizard']['persons']['employmentQualityOptions']
opts_en['weak'] = 'Weak / Unstable Work'
opts_en['unstable'] = 'Irregular / Fluctuating Work'
opts_en['sufficient'] = 'Sufficient Work'

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("Employment quality options cleaned.")
