import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the blue box block
start_marker = '  {/* Show computed correction for DEPENDENT_ADULT */}'
if start_marker in content:
    # Find beginning
    idx = content.index(start_marker)
    # Find the closing of the IIFE: "})()" followed by some whitespace
    end_search = content.find('  })()', idx)
    if end_search != -1:
        end_idx = end_search + len('  })()')
        # Check what's after to see if we got the right spot
        print("Found start at:", idx)
        print("Found end at:", end_idx)
        print("Snippet to remove:")
        print(content[idx:end_idx+5])
    else:
        print("Could not find IIFE end")
else:
    print("Start marker not found")
