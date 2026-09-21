const fs = require('fs');
const path = require('path');
const { convertMarkdownToTistoryHTML } = require('./test-converter');

const base = path.join(__dirname, '..', 'content', 'column');
const dirs = fs.readdirSync(base).filter(d => !d.startsWith('_') && fs.statSync(path.join(base, d)).isDirectory());

console.log(`Checking all ${dirs.length} articles for Tistory HTML integrity...`);

let errors = 0;
dirs.forEach((slug, idx) => {
  const p = path.join(base, slug, 'index.md');
  const md = fs.readFileSync(p, 'utf8');
  try {
    const res = convertMarkdownToTistoryHTML(md, slug);
    if (!res.html || res.html.length < 500) {
      console.error(`❌ HTML too short in ${slug}`);
      errors++;
    }
    if (res.html.includes('<div class="column-summary-card') || res.html.includes('bg-[#F4F8F6]')) {
      console.error(`❌ Leaked raw card/attribute in HTML: ${slug}`);
      errors++;
    }
    if (res.html.includes('[#F4F8F6]') || res.html.includes('[#2F5D50]')) {
      console.error(`❌ Leaked [#HEX] in HTML: ${slug}`);
      errors++;
    }
  } catch (e) {
    console.error(`❌ Exception converting ${slug}: ${e.message}`);
    errors++;
  }
});

if (errors === 0) {
  console.log(`\n🎉 All ${dirs.length} articles converted to Tistory HTML with 100% PERFECT integrity!`);
} else {
  console.error(`\n❌ Total errors found: ${errors}`);
  process.exit(1);
}
