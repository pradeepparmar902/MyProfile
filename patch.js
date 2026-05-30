const fs = require('fs');
const path = require('path');

const d = 'src/components';
const files = [
  'projects/ProjectsManager.js',
  'skills/SkillsManager.js',
  'experience/InternshipManager.js',
  'experience/ProfessionManager.js',
  'experience/ProfessionSelfManager.js',
  'profile/OutOfBoxManager.js',
  'profile/HobbyManager.js'
];

files.forEach(f => {
  const p = path.join(d, f);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    if (!c.includes('toggleVisibility')) {
      const apiEndpoint = f.includes('Skills') ? 'skills' : 
                          f.includes('Projects') ? 'projects' : 
                          f.includes('Internship') ? 'internship' : 
                          f.includes('ProfessionSelf') ? 'profession-self' : 
                          f.includes('Profession') ? 'profession' : 
                          f.includes('OutOfBox') ? 'outofbox' : 'hobbies';
      
      const resourceKey = apiEndpoint.replace('-', '');
      
      c = c.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { Eye, EyeOff } from "lucide-react";');
      
      c = c.replace(/async function delete/, `async function toggleVisibility(item) {\n    const res = await fetch(\`/api/${apiEndpoint}/\${item.id}\`, {\n      method: "PUT",\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify({ ...item, isHidden: !item.isHidden }),\n    });\n    if (res.ok) {\n      const data = await res.json();\n      setItems(items.map(i => i.id === item.id ? (data.${resourceKey} || Object.values(data)[0]) : i));\n    }\n  }\n\n  async function delete`);
      
      c = c.replace(/<button[^>]*onClick={\(\) => delete[^>]*>([\s\S]*?)<\/button>/, `<button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => toggleVisibility(item)} title={item.isHidden ? "Show on profile" : "Hide from profile"}>{item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>\n              $&`);
      
      // Also apply visual styling to hidden cards
      c = c.replace(/className="p-5"/g, `className={\`p-5 \${item.isHidden ? "opacity-50 grayscale" : ""}\`}`);
      c = c.replace(/className="grid gap-5 p-5 md:grid-cols-\[3fr_2fr\]"/g, `className={\`grid gap-5 p-5 md:grid-cols-[3fr_2fr] \${item.isHidden ? "opacity-50 grayscale" : ""}\`}`);
      c = c.replace(/className="p-5 md:p-6"/g, `className={\`p-5 md:p-6 \${item.isHidden ? "opacity-50 grayscale" : ""}\`}`);

      fs.writeFileSync(p, c);
      console.log('Updated ' + p);
    }
  }
});
