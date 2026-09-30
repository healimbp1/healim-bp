const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\[|\]/g, '')
    .trim();
}

function splitTitle(title) {
  const clean = escapeXML(title).replace(/ - 해아림.*$/, '').trim();
  if (clean.length <= 15) {
    return { lines: [clean], fontSize: 32 };
  }

  // 1. Check for comma split
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const line1 = parts[0].trim() + ',';
    const line2 = parts.slice(1).join(',').trim();
    const maxLen = Math.max(line1.length, line2.length);
    const fontSize = maxLen > 24 ? 22 : (maxLen > 18 ? 25 : 28);
    return { lines: [line1, line2], fontSize };
  }

  // 2. Check for middle dot '·' split
  if (clean.includes('·')) {
    const parts = clean.split('·').map(p => p.trim());
    if (parts.length === 2) {
      const line1 = parts[0];
      const line2 = parts[1];
      const maxLen = Math.max(line1.length, line2.length);
      const fontSize = maxLen > 24 ? 22 : (maxLen > 18 ? 25 : 28);
      return { lines: [line1, line2], fontSize };
    } else if (parts.length >= 3) {
      const mid = Math.ceil(parts.length / 2);
      const line1 = parts.slice(0, mid).join(' · ');
      const line2 = parts.slice(mid).join(' · ');
      const maxLen = Math.max(line1.length, line2.length);
      const fontSize = maxLen > 24 ? 22 : (maxLen > 18 ? 25 : 28);
      return { lines: [line1, line2], fontSize };
    }
  }

  // 3. Natural space split closest to middle
  const words = clean.split(' ');
  const totalChars = clean.length;
  let current = '';
  let line1 = '';
  let line2 = '';
  for (let i = 0; i < words.length; i++) {
    const test = current ? `${current} ${words[i]}` : words[i];
    if (test.length <= totalChars / 2 || !line1) {
      current = test;
      line1 = current;
    } else {
      line2 = words.slice(i).join(' ');
      break;
    }
  }

  if (!line2) {
    line2 = '';
  }

  const maxLen = Math.max(line1.length, line2.length);
  const fontSize = maxLen > 24 ? 22 : (maxLen > 18 ? 25 : 28);
  return { lines: line2 ? [line1, line2] : [line1], fontSize };
}

function generateRobustSVG(params) {
  const cleanCategory = escapeXML(params.category || '척추·관절 & 추나 클리닉');
  const cleanSubHook = escapeXML(params.subHook || '만성화되기 전 원인부터 바로잡는 1:1 맞춤 진료');
  const cleanSubTitle = escapeXML(params.subTitle || '정밀 진단과 비수술 한방 1:1 맞춤 치료 솔루션');
  
  const titleInfo = splitTitle(params.title || '해아림한의원 부평점 통합진료');
  
  const step1 = params.step1 || { title: '근본 원인 및 손상 부위 정밀 진단', desc: '이학적 검진 및 증상별 원인 분석' };
  const step2 = params.step2 || { title: '맞춤 한방 침구 & 정밀 약침 치료', desc: '통증 완화 및 염증 배출 집중 케어' };
  const step3 = params.step3 || { title: '체형 교정 추나 & 자생력 강화 한약', desc: '재발 방지 및 전신 균형 회복' };

  // SubHook font size
  const subHookFontSize = cleanSubHook.length > 34 ? 13 : (cleanSubHook.length > 26 ? 14 : 15);
  // SubTitle font size
  const subTitleFontSize = cleanSubTitle.length > 36 ? 14 : 15.5;

  // Title render block
  let titleSVG = '';
  if (titleInfo.lines.length === 1) {
    titleSVG = `<text x="85" y="236" font-size="${titleInfo.fontSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.03em">${titleInfo.lines[0]}</text>`;
  } else {
    const y1 = titleInfo.fontSize > 24 ? 220 : 218;
    const y2 = titleInfo.fontSize > 24 ? 256 : 252;
    titleSVG = `<text x="85" y="${y1}" font-size="${titleInfo.fontSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.03em">${titleInfo.lines[0]}</text>
    <text x="85" y="${y2}" font-size="${titleInfo.fontSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.03em">${titleInfo.lines[1]}</text>`;
  }

  // Step formatting helper
  function formatStepText(title, desc) {
    const t = escapeXML(title);
    const d = escapeXML(desc);
    const tSize = t.length > 26 ? 14.5 : (t.length > 20 ? 16 : 17.5);
    const dSize = d.length > 38 ? 12 : (d.length > 30 ? 13 : 14);
    return { t, d, tSize, dSize };
  }

  const s1 = formatStepText(step1.title, step1.desc);
  const s2 = formatStepText(step2.title, step2.desc);
  const s3 = formatStepText(step3.title, step3.desc);

  return `<svg width="900" height="960" viewBox="0 0 900 960" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Dark Teal-Navy) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#081b18" />
      <stop offset="100%" stop-color="#061219" />
    </linearGradient>

    <!-- Card Shadow -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Outer Dark Teal/Navy Canvas -->
  <rect x="0" y="0" width="900" height="960" rx="36" fill="url(#bgGrad)" />

  <!-- Top Floating Pill (Teal / Forest Green) -->
  <g transform="translate(450, 60)">
    <rect x="-210" y="-22" width="420" height="44" rx="22" fill="#0d9488" />
    <text x="0" y="6" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${cleanCategory}
    </text>
  </g>

  <!-- Inner Pure White Card -->
  <g filter="url(#cardShadow)">
    <rect x="45" y="105" width="810" height="810" rx="28" fill="#ffffff" />
  </g>

  <!-- Content inside White Card -->
  <!-- 1. Sub-Hook Pill -->
  <g transform="translate(85, 145)">
    <rect x="0" y="0" width="730" height="38" rx="8" fill="#ecfdf5" />
    <text x="16" y="24" font-size="${subHookFontSize}" font-weight="900" fill="#047857" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${cleanSubHook}
    </text>
  </g>

  <!-- 2. Main Title (1 or 2 lines) -->
  <g>
    ${titleSVG}
  </g>

  <!-- 3. Subtitle Description -->
  <g>
    <text x="85" y="288" font-size="${subTitleFontSize}" font-weight="800" fill="#334155" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${cleanSubTitle}
    </text>
  </g>

  <!-- 4. Subtle Dashed Divider Line -->
  <line x1="85" y1="316" x2="815" y2="316" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,6" />

  <!-- 5. Step 01 Card (Mint/Teal Accent) -->
  <g transform="translate(85, 334)">
    <rect x="0" y="0" width="730" height="110" rx="16" fill="#f0fdfa" stroke="#ccfbf1" stroke-width="1.5" />
    <rect x="16" y="17" width="66" height="76" rx="12" fill="#e6fffa" />
    <circle cx="49" cy="55" r="22" fill="#0d9488" />
    <text x="49" y="62" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">1</text>
    <text x="96" y="44" font-size="${s1.tSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${s1.t}
    </text>
    <text x="96" y="74" font-size="${s1.dSize}" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      ${s1.d}
    </text>
  </g>

  <!-- 6. Step 02 Card (Warm Amber Accent) -->
  <g transform="translate(85, 460)">
    <rect x="0" y="0" width="730" height="110" rx="16" fill="#fefce8" stroke="#fef08a" stroke-width="1.5" />
    <rect x="16" y="17" width="66" height="76" rx="12" fill="#fef9c3" />
    <circle cx="49" cy="55" r="22" fill="#d97706" />
    <text x="49" y="62" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">2</text>
    <text x="96" y="44" font-size="${s2.tSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${s2.t}
    </text>
    <text x="96" y="74" font-size="${s2.dSize}" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      ${s2.d}
    </text>
  </g>

  <!-- 7. Step 03 Card (Cool Blue Accent) -->
  <g transform="translate(85, 586)">
    <rect x="0" y="0" width="730" height="110" rx="16" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5" />
    <rect x="16" y="17" width="66" height="76" rx="12" fill="#dbeafe" />
    <circle cx="49" cy="55" r="22" fill="#2563eb" />
    <text x="49" y="62" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">3</text>
    <text x="96" y="44" font-size="${s3.tSize}" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${s3.t}
    </text>
    <text x="96" y="74" font-size="${s3.dSize}" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      ${s3.d}
    </text>
  </g>

  <!-- 8. Bottom Dark Navy Footer Capsule -->
  <g transform="translate(85, 726)">
    <rect x="0" y="0" width="730" height="48" rx="12" fill="#0f172a" />
    <text x="365" y="30" font-size="14.5" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      해아림한의원 부평점 · 1:1 맞춤 통합진료 클리닉 (부평역 7번 출구 도보 5분)
    </text>
  </g>
</svg>`;
}

// Test rendering for traffic-accident-knee-dashboard-impact
const testSVG = generateRobustSVG({
  category: '교통사고 후유증 & 자동차보험 클리닉',
  subHook: '충돌 시 무릎이 대시보드에 부딪힌 후 지속되는 통증과 불안정성',
  title: '접촉사고 충돌 시 대시보드 무릎 충격 후유증, 슬관절 인대 손상과 자동차보험 한방 집중 치료',
  subTitle: '후방십자인대 및 슬개골 타박 어혈을 풀고 관절을 안정화하는 1:1 맞춤 케어',
  step1: { title: '후방십자인대 & 슬개골 손상 정밀 진단', desc: '경골 후방 전위 및 연골 타박 어혈 체크' },
  step2: { title: '어혈 배출 당귀수산 가감방 & 인대강화 약침', desc: '관절강 내 염증성 삼출물 흡수 및 인대 자생력 복원' },
  step3: { title: '슬관절-골반 교정 추나 & 물리치료', desc: '본인부담금 0원으로 후유증 없는 관절 가동성 회복' }
});

const fontsDir = path.join(__dirname, 'fonts');
const resvg = new Resvg(testSVG, {
  fitTo: { mode: 'width', value: 900 },
  font: {
    fontDirs: [fontsDir, 'C:\\Windows\\Fonts'],
    loadSystemFonts: true,
    defaultFontFamily: 'Pretendard'
  }
});

const pngBuffer = resvg.render().asPng();
fs.writeFileSync(path.join(__dirname, '..', 'static', 'thumbnails', 'test-robust.png'), pngBuffer);
console.log('✅ test-robust.png successfully generated with length:', pngBuffer.length);
