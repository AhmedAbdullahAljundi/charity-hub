const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/education/StudentRecordModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace section 1 header
content = content.replace(
  /className="w-full flex items-center justify-between border-b border-border pb-2 text-lg font-bold text-foreground"/g,
  'className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-base font-semibold text-foreground rounded-t-xl border-b border-border"'
);

// Replace section 2 header
content = content.replace(
  /className={`w-full flex items-center justify-between border-b border-border pb-2 text-lg font-bold \${!isSection1Complete \? "text-muted-foreground" : "text-foreground"}`}/g,
  'className={`w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-base font-semibold rounded-t-xl border-b border-border ${!isSection1Complete ? "text-muted-foreground opacity-70" : "text-foreground"}`}'
);

// Replace section 3 header
content = content.replace(
  /className="w-full flex items-center justify-between border-b border-border pb-2 text-lg font-bold text-foreground"/g,
  'className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-base font-semibold text-foreground rounded-t-xl border-b border-border"'
);

// Wrap the whole section groups
content = content.replace(
  /<div className="space-y-4">\s*<button\s*type="button"\s*onClick=\{\(\) => setOpenSection1\(\!openSection1\)\}/g,
  '<div className="border border-border rounded-xl shadow-sm bg-card">\n            <button \n              type="button" \n              onClick={() => setOpenSection1(!openSection1)}'
);

content = content.replace(
  /<div className="space-y-4">\s*<button\s*type="button"\s*onClick=\{\(\) => \{\s*if \(\!isSection1Complete\)/g,
  '<div className="border border-border rounded-xl shadow-sm bg-card mt-6">\n            <button \n              type="button" \n              onClick={() => {\n                if (!isSection1Complete)'
);

content = content.replace(
  /<div className="space-y-4">\s*<button\s*type="button"\s*onClick=\{\(\) => setOpenSection3\(\!openSection3\)\}/g,
  '<div className="border border-border rounded-xl shadow-sm bg-card mt-6">\n            <button \n              type="button" \n              onClick={() => setOpenSection3(!openSection3)}'
);


// Replace the content padding for sections
content = content.replace(/<div className="space-y-4 pt-2">/g, '<div className="space-y-4 p-4">');

// For Section 2 "النتائج التعليمية", it has:
// <div className="space-y-4 bg-muted\/30 border border-border\/50 p-4 rounded-xl mt-4">
// Let's make it simpler, since the parent is already a card now.
content = content.replace(
  /<div className="space-y-4 bg-muted\/30 border border-border\/50 p-4 rounded-xl mt-4">/g,
  '<div className="space-y-4 mt-4">'
);

// Also change subjects map container:
// className="flex gap-3 items-end bg-card border border-border/60 p-3 rounded-lg shadow-sm"
content = content.replace(
  /className="flex gap-3 items-end bg-card border border-border\/60 p-3 rounded-lg shadow-sm"/g,
  'className="flex gap-3 items-end bg-slate-50 dark:bg-slate-900/50 border border-border/60 p-3 rounded-lg"'
);

// Make the form save button look better
content = content.replace(
  /className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"/g,
  'className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-6"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated Modal UI successfully");
