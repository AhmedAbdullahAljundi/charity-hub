import re

file_path = r'D:\Charity_Hub\frontend\components\wizard\steps\PersonsStep.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix maritalStatus block closing
bad_closing = """  </SelectContent>
  </Select>
    </div>
  </div>

  {/* Education + Employment for non-spouse/head */}"""

good_closing = """  </SelectContent>
  </Select>
  </div>
  )}
  </div>

  {/* Education + Employment for non-spouse/head */}"""

content = content.replace(bad_closing, good_closing)

# Also remove the computed correction box completely since patch2 failed
correction_box = """  {/* Show computed correction for DEPENDENT_ADULT */}
  {draft.role === "DEPENDENT_ADULT" &&
  draft.employmentQuality &&
  draft.employmentQuality !== "NONE" &&
  (() => {
  const baseMap: Record<string, number> = {
  WEAK: -0.20,
  UNSTABLE: -0.40,
  SUFFICIENT: -0.60,
  };
  const eduMap: Record<string, number> = {
  ILLITERATE: 1,
  MEDIUM: 0.75,
  HIGHER_LIMITED: 0.5,
  HIGHER_STABLE: 0.25,
  };
  const base = baseMap[draft.employmentQuality!] ?? 0;
  const edu = eduMap[draft.educationLevel ?? "ILLITERATE"] ?? 1;
  const correction = base * edu;
  return (
  <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-1.5 flex items-center gap-2">
  <span className="font-bold">التصحيح المحسوب:</span>
  <span className="font-mono font-semibold">{correction.toFixed(2)}</span>
  <span className="text-blue-500">نقطة على درجة الهشاشة</span>
  </div>
  );
  })()
  }"""

content = content.replace(correction_box, "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
