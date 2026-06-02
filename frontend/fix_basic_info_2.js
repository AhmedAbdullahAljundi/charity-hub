const fs = require('fs');
const path = 'D:/Charity_Hub/frontend/components/wizard/steps/BasicInfoStep.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /  <\/div>\r?\n  <\/div>e"[\s\S]*?  <\/div>\r?\n  <\/div>/m;

const replacement = `  </div>
  </div>`;
content = content.replace(regex, replacement);

fs.writeFileSync(path, content);
console.log("Fixed code block via regex!");
