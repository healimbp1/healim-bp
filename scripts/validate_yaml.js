const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'content', 'column');
const dirs = fs.readdirSync(base).filter(d => !d.startsWith('_') && fs.statSync(path.join(base, d)).isDirectory());

let fixedCount = 0;

dirs.forEach(slug => {
  const p = path.join(base, slug, 'index.md');
  if (!fs.existsSync(p)) return;

  let content = fs.readFileSync(p, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return;

  let fm = match[1];
  const body = match[2];

  let modified = false;
  const lines = fm.split('\n');
  const newLines = lines.map(line => {
    if (line.startsWith('summary:')) {
      const valMatch = line.match(/^summary:\s*"([\s\S]*)"$/);
      if (valMatch) {
        let inner = valMatch[1];
        if (inner.includes('"')) {
          console.log(`Fixing summary quotes in ${slug}: ${inner}`);
          inner = inner.replace(/"/g, "'");
          modified = true;
          return `summary: "${inner}"`;
        }
      }
    }
    if (line.startsWith('title:')) {
      const valMatch = line.match(/^title:\s*"([\s\S]*)"$/);
      if (valMatch) {
        let inner = valMatch[1];
        if (inner.includes('"')) {
          console.log(`Fixing title quotes in ${slug}: ${inner}`);
          inner = inner.replace(/"/g, "'");
          modified = true;
          return `title: "${inner}"`;
        }
      }
    }
    return line;
  });

  if (modified) {
    const newContent = `---\n${newLines.join('\n')}\n---\n${body}`;
    fs.writeFileSync(p, newContent, 'utf8');
    fixedCount++;
  }
});

console.log(`Total frontmatter fixes: ${fixedCount}`);
