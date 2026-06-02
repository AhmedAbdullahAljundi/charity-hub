import json
with open(r'D:\Charity_Hub\frontend\messages\ar\households.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['wizard']['persons']['roleOptions']['child'] = 'ابن معال'

with open(r'D:\Charity_Hub\frontend\messages\ar\households.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
