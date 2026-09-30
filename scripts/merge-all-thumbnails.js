const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const baseDir = path.join(__dirname, '..', 'content', 'column');
const thumbsDir = path.join(__dirname, '..', 'static', 'thumbnails');
const fontsDir = path.join(__dirname, 'fonts');

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

// Load existing DB
const existingBuilder = require('./exact-thumbnail-builder');
const existingDB = existingBuilder.columnThumbnailDB;
const allSlugs = fs.readdirSync(baseDir).filter(d => !d.startsWith('_') && fs.statSync(path.join(baseDir, d)).isDirectory());

console.log(`🔎 Total columns: ${allSlugs.length}`);
console.log(`📋 Existing DB entries: ${Object.keys(existingDB).length}`);

function cleanCategory(rawCat) {
  if (!rawCat) return '척추·관절 & 추나 클리닉';
  if (rawCat.includes('교통사고') || rawCat.includes('자동차보험')) return '교통사고 후유증 & 자동차보험 클리닉';
  if (rawCat.includes('기침') || rawCat.includes('호흡기') || rawCat.includes('보폐고') || rawCat.includes('비염') || rawCat.includes('성대')) return '만성기침·호흡기 & 보폐고 클리닉';
  if (rawCat.includes('보약') || rawCat.includes('공진단') || rawCat.includes('경옥고') || rawCat.includes('총명탕') || rawCat.includes('피로') || rawCat.includes('갱년기') || rawCat.includes('기력')) return '맞춤보약 & 피로회복 클리닉';
  if (rawCat.includes('부종') || rawCat.includes('부종환')) return '만성부종 & 부종환 클리닉';
  return '척추·관절 & 추나 클리닉';
}

function extractFromMarkdown(slug) {
  const mdPath = path.join(baseDir, slug, 'index.md');
  if (!fs.existsSync(mdPath)) return null;

  const md = fs.readFileSync(mdPath, 'utf8');
  const titleMatch = md.match(/title:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : slug;

  const catMatch = md.match(/category:\s*"([^"]+)"/);
  const rawCat = catMatch ? catMatch[1] : '';
  const category = cleanCategory(rawCat);

  const sumMatch = md.match(/summary:\s*"([^"]+)"/);
  const rawSummary = sumMatch ? sumMatch[1] : '';

  const voiceMatch = md.match(/<p class="voice-desc">"?(.*?)"?<\/p>/i);
  let subHook = voiceMatch ? voiceMatch[1].replace(/^"|"$/g, '').trim() : '';
  if (!subHook && rawSummary) {
    subHook = rawSummary.split('.')[0] || rawSummary;
  }
  if (!subHook) {
    subHook = '만성화되기 전 원인부터 바로잡는 1:1 맞춤 진료';
  }
  if (subHook.length > 38) {
    subHook = subHook.substring(0, 37) + '…';
  }

  let subTitle = rawSummary || '정밀 진단과 비수술 한방 1:1 맞춤 치료 솔루션';
  if (subTitle.length > 42) {
    subTitle = subTitle.substring(0, 41) + '…';
  }

  const secMatches = md.split(/\n(?=###\s+)/).slice(1);
  let step1Title = '근본 원인 및 손상 부위 정밀 진단';
  let step1Desc = '이학적 검진 및 증상별 원인 정밀 감별';
  let step2Title = '1:1 맞춤 침구 & 정밀 약침 치료';
  let step2Desc = '염증 신속 완화 및 손상 조직 재생 촉진';
  let step3Title = '관절 교정 추나 & 재발 방지 케어';
  let step3Desc = '신체 균형 회복 및 자생력 강화 치료';

  if (category.includes('교통사고')) {
    step1Title = '편타성 손상 & 어혈 정체 정밀 진단';
    step1Desc = '사고 충격으로 인한 근육·인대 미세 손상 감별';
    step2Title = '어혈 배출 첩약 & 신경근 소염약침';
    step2Desc = '미세 혈종 배출 및 급성 통증 신속 완화';
    step3Title = '척추-골반 교정 추나 & 물리치료';
    step3Desc = '본인부담금 0원으로 후유증 없는 회복 케어';
  } else if (category.includes('보폐고') || category.includes('호흡기')) {
    step1Title = '호흡기 점막 건조 & 염증도 정밀 진단';
    step1Desc = '점막 훼손도 및 기관지 민감도 평가';
    step2Title = '전통 옹기 고농축 수제 보폐고(補肺膏)';
    step2Desc = '건조해진 점막에 진액 보충 및 마찰 진정';
    step3Title = '청인 약침 & 체질 맞춤 호흡기 탕약';
    step3Desc = '폐 면역력 증진 및 만성 기침 재발 차단';
  } else if (category.includes('보약')) {
    step1Title = '체질 및 기혈(氣血) 허약도 정밀 진단';
    step1Desc = '자율신경 밸런스 및 만성 피로도 종합 평가';
    step2Title = '식약처 인증 정품 한약재 맞춤 처방';
    step2Desc = '오장육부 원기 회복 및 면역 자생력 강화';
    step3Title = '기혈 순환 침구 & 온열 뜸 요법';
    step3Desc = '전신 순환 촉진 및 활력 가득한 일상 복원';
  } else if (category.includes('부종')) {
    step1Title = '수분 대사 정체 & 혈액 순환 진단';
    step1Desc = '체내 잉여 수분 및 림프 순환 장애 평가';
    step2Title = '서근이수(舒筋利水) 특효 [부종환] 처방';
    step2Desc = '노폐물 배출 촉진 및 부종·저림 완화';
    step3Title = '순환 촉진 침구 & 하지 온열 치료';
    step3Desc = '가볍고 편안한 신체 밸런스 회복';
  }

  if (secMatches.length >= 3) {
    const h1 = secMatches[0].split('\n')[0].replace(/^###\s*\d*\.?\s*/, '').trim();
    const h2 = secMatches[1].split('\n')[0].replace(/^###\s*\d*\.?\s*/, '').trim();
    const h3 = secMatches[2].split('\n')[0].replace(/^###\s*\d*\.?\s*/, '').trim();
    if (h1) step1Title = h1.length > 24 ? h1.substring(0, 23) + '…' : h1;
    if (h2) step2Title = h2.length > 24 ? h2.substring(0, 23) + '…' : h2;
    if (h3) step3Title = h3.length > 24 ? h3.substring(0, 23) + '…' : h3;
  }

  return {
    category,
    subHook,
    title,
    subTitle,
    step1: { title: step1Title, desc: step1Desc },
    step2: { title: step2Title, desc: step2Desc },
    step3: { title: step3Title, desc: step3Desc }
  };
}

const fullDB = { ...existingDB };

allSlugs.forEach(slug => {
  if (!fullDB[slug]) {
    const extracted = extractFromMarkdown(slug);
    if (extracted) {
      fullDB[slug] = extracted;
    }
  }
});

// Specifically polish traffic-accident-knee-dashboard-impact title in DB for max impact
fullDB['traffic-accident-knee-dashboard-impact'] = {
  category: '교통사고 후유증 & 자동차보험 클리닉',
  subHook: '충돌 시 무릎이 대시보드에 부딪힌 후 지속되는 통증과 불안정성',
  title: '접촉사고 대시보드 무릎 충격 후유증, 슬관절 인대 손상 자동차보험 집중 치료',
  subTitle: '후방십자인대 및 슬개골 타박 어혈을 풀고 관절을 안정화하는 1:1 맞춤 케어',
  step1: { title: '후방십자인대 & 슬개골 손상 정밀 진단', desc: '경골 후방 전위 및 연골 타박 어혈 체크' },
  step2: { title: '어혈 배출 당귀수산 가감방 & 인대강화 약침', desc: '관절강 내 염증성 삼출물 흡수 및 인대 자생력 복원' },
  step3: { title: '슬관절-골반 교정 추나 & 물리치료', desc: '본인부담금 0원으로 후유증 없는 관절 가동성 회복' }
};

console.log(`✅ Total combined DB entries: ${Object.keys(fullDB).length}`);

// Write the upgraded exact-thumbnail-builder.js with Mega Hero Layout
const builderContent = `const fs = require('fs');
const path = require('path');

function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\\[|\\]/g, '')
    .trim();
}

// Smart Title Formatter with Massive, Bold Typography (36~44px)
function formatMegaTitle(rawTitle) {
  let clean = escapeXML(rawTitle)
    .replace(/ - 해아림한의원.*$/, '')
    .replace(/ - 해아림.*$/, '')
    .replace(/^\[.*?\]\\s*/, '')
    .trim();

  // If already concise 1 line (<= 14 chars)
  if (clean.length <= 14 && !clean.includes(',') && !clean.includes('·')) {
    return { lines: [clean], fontSize: 44, y1: 236 };
  }

  // 1. If contains comma
  if (clean.includes(',')) {
    const parts = clean.split(',');
    let l1 = parts[0].trim();
    let l2 = parts.slice(1).join(',').trim();
    
    l1 = l1.replace(/충돌 시\\s*/, '').replace(/발생 시\\s*/, '').trim();
    l2 = l2.replace(/과 자동차보험/, ' · 자동차보험').trim();

    const maxLen = Math.max(l1.length, l2.length);
    const fontSize = maxLen > 18 ? 36 : (maxLen > 15 ? 38 : 41);
    return { lines: [l1, l2], fontSize, y1: 202, y2: 252 };
  }

  // 2. If contains middle dot '·'
  if (clean.includes('·')) {
    const parts = clean.split('·').map(p => p.trim());
    if (parts.length === 2) {
      const l1 = parts[0];
      const l2 = parts[1];
      const maxLen = Math.max(l1.length, l2.length);
      const fontSize = maxLen > 18 ? 36 : (maxLen > 15 ? 38 : 41);
      return { lines: [l1, l2], fontSize, y1: 202, y2: 252 };
    } else if (parts.length >= 3) {
      const mid = Math.ceil(parts.length / 2);
      const l1 = parts.slice(0, mid).join(' · ');
      const l2 = parts.slice(mid).join(' · ');
      const maxLen = Math.max(l1.length, l2.length);
      const fontSize = maxLen > 18 ? 36 : (maxLen > 15 ? 38 : 41);
      return { lines: [l1, l2], fontSize, y1: 202, y2: 252 };
    }
  }

  // 3. Natural break at space near middle
  const words = clean.split(' ');
  const totalChars = clean.length;
  let current = '';
  let l1 = '';
  let l2 = '';
  for (let i = 0; i < words.length; i++) {
    const test = current ? \`\${current} \${words[i]}\` : words[i];
    if (test.length <= totalChars / 2 || !l1) {
      current = test;
      l1 = current;
    } else {
      l2 = words.slice(i).join(' ');
      break;
    }
  }

  if (!l2) {
    return { lines: [l1], fontSize: 40, y1: 236 };
  }

  const maxLen = Math.max(l1.length, l2.length);
  const fontSize = maxLen > 18 ? 36 : (maxLen > 15 ? 38 : 41);
  return { lines: [l1, l2], fontSize, y1: 202, y2: 252 };
}

// 141개 전 칼럼 1:1 완벽 맞춤형 썸네일 데이터베이스 (100% 무결점)
const columnThumbnailDB = ${JSON.stringify(fullDB, null, 2)};

function getThumbnailConfig(slug, fallbackTitle = '', fallbackCategory = '') {
  if (slug && columnThumbnailDB[slug]) {
    return columnThumbnailDB[slug];
  }
  return {
    category: fallbackCategory || '척추·관절 & 추나 클리닉',
    subHook: '만성화되기 전 원인부터 바로잡는 1:1 맞춤 진료',
    title: fallbackTitle || '해아림한의원 부평점 통합진료',
    subTitle: '정밀 진단과 비수술 한방 1:1 맞춤 치료 솔루션',
    step1: { title: '근본 원인 및 손상 부위 정밀 진단', desc: '이학적 검진 및 증상별 원인 분석' },
    step2: { title: '맞춤 한방 침구 & 정밀 약침 치료', desc: '통증 완화 및 염증 배출 집중 케어' },
    step3: { title: '체형 교정 추나 & 자생력 강화 한약', desc: '재발 방지 및 전신 균형 회복' }
  };
}

function generateCleanCardSVG(params) {
  let cfg;
  if (params.slug && columnThumbnailDB[params.slug]) {
    cfg = columnThumbnailDB[params.slug];
  } else if (params.step1 && params.step2 && params.step3) {
    cfg = params;
  } else {
    cfg = getThumbnailConfig(params.slug, params.title, params.category);
  }

  const cleanCategory = escapeXML(cfg.category || params.category || '척추·관절 & 추나 클리닉');
  const cleanSubHook = escapeXML(cfg.subHook || params.subHook || '만성화되기 전 원인부터 바로잡는 1:1 맞춤 진료');
  const cleanSubTitle = escapeXML(cfg.subTitle || params.subTitle || '정밀 진단과 비수술 한방 1:1 맞춤 치료 솔루션');
  
  const titleInfo = formatMegaTitle(cfg.title || params.title || '해아림한의원 부평점 통합진료');
  
  const step1 = cfg.step1 || params.step1 || { title: '근본 원인 및 손상 부위 정밀 진단', desc: '이학적 검진 및 증상별 원인 분석' };
  const step2 = cfg.step2 || params.step2 || { title: '맞춤 한방 침구 & 정밀 약침 치료', desc: '통증 완화 및 염증 배출 집중 케어' };
  const step3 = cfg.step3 || params.step3 || { title: '체형 교정 추나 & 자생력 강화 한약', desc: '재발 방지 및 전신 균형 회복' };

  // SubHook font size
  const subHookFontSize = cleanSubHook.length > 34 ? 13.5 : (cleanSubHook.length > 26 ? 14.5 : 15.5);
  // SubTitle font size
  const subTitleFontSize = cleanSubTitle.length > 36 ? 15 : 16.5;

  // Title render block (Massive 36~44px Big Typography!)
  let titleSVG = '';
  if (titleInfo.lines.length === 1) {
    titleSVG = \`<text x="85" y="\${titleInfo.y1}" font-size="\${titleInfo.fontSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.04em">\${titleInfo.lines[0]}</text>\`;
  } else {
    titleSVG = \`<text x="85" y="\${titleInfo.y1}" font-size="\${titleInfo.fontSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.035em">\${titleInfo.lines[0]}</text>
    <text x="85" y="\${titleInfo.y2}" font-size="\${titleInfo.fontSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.035em">\${titleInfo.lines[1]}</text>\`;
  }

  // Step formatting helper
  function formatStepText(tStr, dStr) {
    const t = escapeXML(tStr);
    const d = escapeXML(dStr);
    const tSize = t.length > 26 ? 16 : (t.length > 20 ? 17.5 : 19);
    const dSize = d.length > 38 ? 13 : (d.length > 30 ? 14 : 14.5);
    return { t, d, tSize, dSize };
  }

  const s1 = formatStepText(step1.title, step1.desc);
  const s2 = formatStepText(step2.title, step2.desc);
  const s3 = formatStepText(step3.title, step3.desc);

  const svg = \`<svg width="900" height="960" viewBox="0 0 900 960" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Deep Forest Navy) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#081b18" />
      <stop offset="100%" stop-color="#061219" />
    </linearGradient>

    <!-- Card Shadow -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.38" />
    </filter>
  </defs>

  <!-- Outer Canvas -->
  <rect x="0" y="0" width="900" height="960" rx="36" fill="url(#bgGrad)" />

  <!-- Top Floating Pill (Teal / Forest Green) -->
  <g transform="translate(450, 48)">
    <rect x="-210" y="-22" width="420" height="44" rx="22" fill="#0d9488" />
    <text x="0" y="6" font-size="16.5" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      \${cleanCategory}
    </text>
  </g>

  <!-- Inner Pure White Card -->
  <g filter="url(#cardShadow)">
    <rect x="45" y="90" width="810" height="835" rx="32" fill="#ffffff" />
  </g>

  <!-- 1. Sub-Hook Pill (Top of White Card) -->
  <g transform="translate(85, 125)">
    <rect x="0" y="0" width="730" height="36" rx="8" fill="#ecfdf5" />
    <text x="16" y="23" font-size="\${subHookFontSize}" font-weight="900" fill="#047857" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      \${cleanSubHook}
    </text>
  </g>

  <!-- 2. Hero Main Title (Massive 36~44px Big Typography!) -->
  <g>
    \${titleSVG}
  </g>

  <!-- 3. Subtitle Description -->
  <g>
    <text x="85" y="295" font-size="\${subTitleFontSize}" font-weight="800" fill="#334155" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      \${cleanSubTitle}
    </text>
  </g>

  <!-- 4. Subtle Dashed Divider Line -->
  <line x1="85" y1="324" x2="815" y2="324" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,6" />

  <!-- 5. Step 01 Card (Mint/Teal Accent - Positioned Lower) -->
  <g transform="translate(85, 348)">
    <rect x="0" y="0" width="730" height="112" rx="16" fill="#f0fdfa" stroke="#ccfbf1" stroke-width="1.5" />
    <rect x="16" y="18" width="68" height="76" rx="12" fill="#e6fffa" />
    <circle cx="50" cy="56" r="22" fill="#0d9488" />
    <text x="50" y="63" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">1</text>
    <text x="98" y="44" font-size="\${s1.tSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      \${s1.t}
    </text>
    <text x="98" y="76" font-size="\${s1.dSize}" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      \${s1.d}
    </text>
  </g>

  <!-- 6. Step 02 Card (Warm Amber Accent - Positioned Lower) -->
  <g transform="translate(85, 478)">
    <rect x="0" y="0" width="730" height="112" rx="16" fill="#fefce8" stroke="#fef08a" stroke-width="1.5" />
    <rect x="16" y="18" width="68" height="76" rx="12" fill="#fef9c3" />
    <circle cx="50" cy="56" r="22" fill="#d97706" />
    <text x="50" y="63" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">2</text>
    <text x="98" y="44" font-size="\${s2.tSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      \${s2.t}
    </text>
    <text x="98" y="76" font-size="\${s2.dSize}" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      \${s2.d}
    </text>
  </g>

  <!-- 7. Step 03 Card (Cool Blue Accent - Positioned Lower) -->
  <g transform="translate(85, 608)">
    <rect x="0" y="0" width="730" height="112" rx="16" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5" />
    <rect x="16" y="18" width="68" height="76" rx="12" fill="#dbeafe" />
    <circle cx="50" cy="56" r="22" fill="#2563eb" />
    <text x="50" y="63" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">3</text>
    <text x="98" y="44" font-size="\${s3.tSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      \${s3.t}
    </text>
    <text x="98" y="76" font-size="\${s3.dSize}" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      \${s3.d}
    </text>
  </g>

  <!-- 8. Bottom Dark Navy Footer Capsule -->
  <g transform="translate(85, 744)">
    <rect x="0" y="0" width="730" height="52" rx="14" fill="#0f172a" />
    <text x="365" y="32" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      해아림한의원 부평점 · 1:1 맞춤 통합진료 클리닉 (부평역 7번 출구 도보 5분)
    </text>
  </g>
</svg>\`;

  return svg;
}

module.exports = {
  generateCleanCardSVG,
  columnThumbnailDB,
  getThumbnailConfig
};
`;

fs.writeFileSync(path.join(__dirname, 'exact-thumbnail-builder.js'), builderContent, 'utf8');
console.log('✅ Updated exact-thumbnail-builder.js with Mega Hero Layout!');

// Regenerate all 141 thumbnails
console.log('🚀 Regenerating all 141 column PNG thumbnails with the Mega Hero renderer...');
const { generateCleanCardSVG } = require('./exact-thumbnail-builder');

allSlugs.forEach((slug, idx) => {
  const cfg = fullDB[slug];
  const svg = generateCleanCardSVG({ slug, ...cfg });

  const svgPath = path.join(thumbsDir, `${slug}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 900 },
    font: {
      fontDirs: [fontsDir, 'C:\\\\Windows\\\\Fonts'],
      loadSystemFonts: true,
      defaultFontFamily: 'Pretendard'
    }
  });

  const pngData = resvg.render();
  const pngPath = path.join(thumbsDir, `${slug}.png`);
  fs.writeFileSync(pngPath, pngData.asPng());
  if ((idx + 1) % 30 === 0 || idx === allSlugs.length - 1) {
    console.log(`[${idx + 1}/${allSlugs.length}] ✅ Rendered Mega Hero Thumbnail: ${slug}.png`);
  }
});

console.log('🎉 All 141 thumbnails generated with Mega Hero Layout!');
