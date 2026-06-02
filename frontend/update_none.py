import json
with open(r'D:\Charity_Hub\frontend\messages\ar\households.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['wizard']['persons']['workTypeOptions']['none'] = 'لا يعمل'

with open(r'D:\Charity_Hub\frontend\messages\ar\households.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open(r'D:\Charity_Hub\frontend\messages\en\households.json', 'r', encoding='utf-8') as f:
    data_en = json.load(f)

data_en['wizard']['persons']['workTypeOptions']['none'] = 'Not Working'

with open(r'D:\Charity_Hub\frontend\messages\en\households.json', 'w', encoding='utf-8') as f:
    json.dump(data_en, f, ensure_ascii=False, indent=2)
