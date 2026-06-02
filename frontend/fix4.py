import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Using regex to find the exact problematic block
# We know it looks like:
#   </div>
#   </div>
#   )}
#   </div>
#   
#   {/* Vulnerability Conditionals */}

pattern = re.compile(r'  </div>\n  </div>\n  \)}\n  </div>\n\n  \{/\* Vulnerability Conditionals \*/\}')
replacement = r'  </div>\n  </div>\n  </div>\n  )}\n\n  {/* Vulnerability Conditionals */}'

content = pattern.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error.")
