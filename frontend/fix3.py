import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_closing = """  </div>
  </div>
  )}
  </div>"""

good_closing = """  </div>
  </div>
  </div>
  )}"""

content = content.replace(bad_closing, good_closing)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
