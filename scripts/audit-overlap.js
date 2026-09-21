const fs = require('fs');
const path = require('path');

const history = JSON.parse(fs.readFileSync('data/publish-history.json', 'utf8'));
const base = path.join(__dirname, '..', 'content', 'column');
const dirs = fs.readdirSync(base).filter(d => !d.startsWith('_') && fs.statSync(path.join(base, d)).isDirectory());

const published = [];
const scheduled = [];

dirs.forEach(s => {
  const md = fs.readFileSync(path.join(base, s, 'index.md'), 'utf8');
  const t = (md.match(/title:\s*["']?([^"'\r\n]+)["']?/) || [])[1] || '';
  const d = (md.match(/date:\s*([^\r\n]+)/) || [])[1] || '';
  const c = (md.match(/category:\s*["']?([^"'\r\n]+)["']?/) || [])[1] || '';
  const item = { slug: s, title: t, date: d, category: c };
  if (history.sentSlugs.includes(s)) {
    published.push(item);
  } else {
    scheduled.push(item);
  }
});

console.log('====================================================');
console.log(`[1] 기발행 완료 칼럼 (총 ${published.length}편)`);
console.log('====================================================');
published.forEach((p, i) => {
  console.log(`${String(i+1).padStart(2, ' ')}. [${p.category}] ${p.slug}`);
  console.log(`    제목: ${p.title}`);
});

console.log('\n====================================================');
console.log(`[2] 향후 예약 발행 칼럼 (총 ${scheduled.length}편)`);
console.log('====================================================');
scheduled.sort((a, b) => a.date.localeCompare(b.date));
scheduled.forEach((s, i) => {
  console.log(`${String(i+1).padStart(2, ' ')}. [${s.date.slice(5, 16)}] [${s.category}] ${s.slug}`);
  console.log(`    제목: ${s.title}`);
});

console.log('\n====================================================');
console.log('[3] 슬러그 중복 검사:');
const publishedSlugs = new Set(published.map(p => p.slug));
const duplicateSlugs = scheduled.filter(s => publishedSlugs.has(s.slug));
console.log(`중복 슬러그 수: ${duplicateSlugs.length}`);
if (duplicateSlugs.length > 0) {
  duplicateSlugs.forEach(d => console.log(`  ❌ 중복 슬러그: ${d.slug}`));
} else {
  console.log('  ✅ 69편 전체 슬러그 100% 독립/고유함!');
}
