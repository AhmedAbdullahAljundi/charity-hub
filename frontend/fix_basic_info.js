const fs = require('fs');
const path = 'D:/Charity_Hub/frontend/components/wizard/steps/BasicInfoStep.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<section className="space-y-4">\s*<h3.*?\{t\("wizard\.basic\.  <div className="flex flex-col gap-4">/m;

const replacement = `<section className="space-y-4">
 <h3 className="text-sm font-semibold uppercase text-muted-foreground border-b pb-1.5">{t("wizard.basic.section")}</h3>
 <div className="flex flex-col gap-4">`;

content = content.replace(regex, replacement);

const regex2 = /<\/div>e" \s*className=\{cn\(inputClass, "bg-muted cursor-not-allowed"\)\}\s*value=\{fd\.registrationDate \?\? ""\}\s*readOnly\s*\/>\s*<\/div>\s*<\/div>\s*<\/div>/m;

const replacement2 = `  </div>
  </div>`;
content = content.replace(regex2, replacement2);


fs.writeFileSync(path, content);
console.log("Fixed code block via regex!");
