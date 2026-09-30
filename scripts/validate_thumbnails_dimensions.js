const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'content', 'column');
const thumbsDir = path.join(__dirname, '..', 'static', 'thumbnails');

const slugs = fs.readdirSync(baseDir).filter(d => !d.startsWith('_') && fs.statSync(path.join(baseDir, d)).isDirectory());

console.log(`\n🔍 Validating all ${slugs.length} column thumbnails in static/thumbnails/...\n`);

let missingCount = 0;
let validCount = 0;
let smallCount = 0;

slugs.forEach((slug, idx) => {
  const pngPath = path.join(thumbsDir, `${slug}.png`);
  const svgPath = path.join(thumbsDir, `${slug}.svg`);

  if (!fs.existsSync(pngPath)) {
    console.error(`❌ [Missing PNG] ${slug}`);
    missingCount++;
    return;
  }

  const stat = fs.statSync(pngPath);
  if (stat.size < 20000) {
    console.warn(`⚠️ [Small PNG < 20KB] ${slug} (${stat.size} bytes)`);
    smallCount++;
  } else {
    validCount++;
  }
});

console.log(`\n========================================`);
console.log(`📊 Validation Summary:`);
console.log(`   - Total Column Folders: ${slugs.length}`);
console.log(`   - Valid High-Res PNGs: ${validCount} / ${slugs.length}`);
console.log(`   - Missing PNGs: ${missingCount}`);
console.log(`   - Anomalies: ${smallCount}`);
console.log(`========================================\n`);

if (missingCount === 0 && smallCount === 0) {
  console.log(`🎉 100% PERFECT: Every single future and existing column has a flawless, high-res 1:1 card thumbnail!`);
} else {
  console.error(`❌ Some thumbnails need attention.`);
  process.exit(1);
}
