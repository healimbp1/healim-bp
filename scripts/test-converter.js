const fs = require('fs');
const path = require('path');

function convertMarkdownToTistoryHTML(mdContent, slug) {
  const match = mdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { title: slug, html: mdContent, category: '건강 칼럼', tags: [] };

  const frontmatterStr = match[1];
  let bodyStr = match[2];

  const titleMatch = frontmatterStr.match(/title:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : slug;

  const categoryMatch = frontmatterStr.match(/category:\s*"([^"]+)"/);
  const category = categoryMatch ? categoryMatch[1] : '해아림 건강칼럼';

  const tagsMatch = frontmatterStr.match(/tags:\s*\[(.*?)\]/);
  let tags = [];
  if (tagsMatch) {
    tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
  }

  // 0. Strip summary cards, callout boxes, and footer signatures from the bottom cleanly
  bodyStr = bodyStr.replace(/<div class="column-summary-card[\s\S]*$/gi, '');
  bodyStr = bodyStr.replace(/<div class="summary-card[\s\S]*$/gi, '');
  bodyStr = bodyStr.replace(/<div class="callout-box[\s\S]*$/gi, '');

  // 1. Extract voice lines (supports both voice-box and column-voice-box)
  let voiceLinesHTML = '';
  const voiceMatch = bodyStr.match(/<div class="(?:column-)?voice-box">([\s\S]*?)<\/div>/i);
  if (voiceMatch) {
    const rawLines = voiceMatch[1].match(/(?:<div class="voice-line">|<p class="voice-desc">)(.*?)<\/(?:div|p)>/gi) || [];
    const lines = rawLines.map(l => l.replace(/<\/?(?:div|p)[^>]*>/gi, '').trim());
    voiceLinesHTML = lines.map(l => `${l}`).join('<br><br>');
    bodyStr = bodyStr.replace(/<div class="(?:column-)?voice-box">[\s\S]*?<\/div>/i, '');
  }

  // 2. Extract TOC (supports both .toc and .column-toc-box)
  let tocBoxHTML = '';
  const tocMatch = bodyStr.match(/<div class="(?:column-)?toc(?:-box)?[\s\S]*?<\/div>/i);
  if (tocMatch) {
    const lis = tocMatch[0].match(/<li>([\s\S]*?)<\/li>/gi) || [];
    const tocItems = lis.map((li, idx) => {
      let text = li.replace(/<\/?li>/gi, '').replace(/^[•\-\*]\s*/, '').trim();
      text = text.replace(/^\d+\.\s*/, '');
      const num = String(idx + 1).padStart(2, '0');
      return `    <div style="display: flex; align-items: flex-start; margin-bottom: 9px; font-size: 15px; line-height: 1.6; color: #374151; word-break: keep-all;"><span style="color: #2F5D50; font-weight: 800; margin-right: 10px; flex-shrink: 0;">${num}.</span><span>${text}</span></div>`;
    }).join('\n');

    tocBoxHTML = `<div style="background-color: #F8FAF9; border: 1px solid #E2EAE5; border-radius: 12px; padding: 22px 24px; margin: 30px 0 34px 0; font-style: normal;">
    <div style="font-size: 16.5px; font-weight: 800; color: #1E4638; margin-bottom: 14px; letter-spacing: -0.01em;">📌 이 칼럼에서 다루는 핵심 목차</div>
${tocItems}
  </div>`;
    bodyStr = bodyStr.replace(/<div class="(?:column-)?toc(?:-box)?[\s\S]*?<\/div>/i, '');
  }

  // 3. Extract Intro (everything before the first ### section)
  let introHTML = '';
  const firstSectionIdx = bodyStr.search(/\n(?=###\s+)/);
  let introPart = firstSectionIdx !== -1 ? bodyStr.substring(0, firstSectionIdx).trim() : '';
  let remainingBody = firstSectionIdx !== -1 ? bodyStr.substring(firstSectionIdx).trim() : bodyStr;

  if (introPart) {
    // If wrapped in <div class="intro-body">...</div>
    introPart = introPart.replace(/<div class="intro-body">/gi, '').replace(/<\/div>/gi, '');
    
    // Split into paragraphs (either <p> tags or newline-separated paragraphs)
    const introParagraphs = [];
    const pTagMatches = introPart.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pTagMatches && pTagMatches.length > 0) {
      pTagMatches.forEach(p => {
        let cleanP = p.replace(/<\/?p[^>]*>/gi, '').trim();
        if (cleanP) introParagraphs.push(cleanP);
      });
    } else {
      introPart.split(/\n\s*\n/).forEach(p => {
        let cleanP = p.trim();
        if (cleanP) introParagraphs.push(cleanP);
      });
    }

    introHTML = introParagraphs.map(pText => {
      pText = pText.replace(/\[(.*?)\]/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
      pText = pText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
      return `<p style="font-size: 16px; line-height: 1.85; color: #374151; margin-bottom: 18px; word-break: keep-all; font-style: normal;">${pText}</p>`;
    }).join('\n  ');
  }

  // 4. Parse sections
  const sections = remainingBody.split(/\n(?=###\s+)/);
  let parsedSectionsHTML = '';

  const sectionIcons = ['🌿', '🔍', '📚', '🩺', '💡', '❓'];

  sections.forEach((sec, sIdx) => {
    sec = sec.trim();
    if (!sec) return;

    if (sec.startsWith('###')) {
      const firstLineEnd = sec.indexOf('\n');
      let heading = (firstLineEnd !== -1 ? sec.substring(3, firstLineEnd) : sec.substring(3)).trim();
      let content = firstLineEnd !== -1 ? sec.substring(firstLineEnd).trim() : '';

      content = content.replace(/^---\s*$/gm, '').trim();

      // Clean decorative icon
      let icon = sectionIcons[sIdx % sectionIcons.length];
      if (heading.includes('FAQ') || heading.includes('자주 묻는') || heading.includes('질문')) {
        icon = '❓';
      }

      // Check if FAQ section
      if (heading.includes('FAQ') || heading.includes('자주 묻는') || heading.includes('질문')) {
        const faqHTML = formatFAQSection(content);
        parsedSectionsHTML += `\n  <h3 style="font-size: 19px; font-weight: 800; color: #1E4638; border-bottom: 2px solid #E2EAE5; padding-bottom: 10px; margin: 38px 0 18px 0; letter-spacing: -0.02em; font-style: normal;">${icon} ${heading}</h3>\n${faqHTML}\n`;
        return;
      }

      // Format tables first
      content = convertMarkdownTableToHTML(content);

      // Parse content blocks (paragraphs, flex list items, subheadings) cleanly
      const sectionBlocksHTML = parseSectionBlocks(content);

      parsedSectionsHTML += `\n  <h3 style="font-size: 19px; font-weight: 800; color: #1E4638; border-bottom: 2px solid #E2EAE5; padding-bottom: 10px; margin: 38px 0 18px 0; letter-spacing: -0.02em; font-style: normal;">${icon} ${heading}</h3>\n  ${sectionBlocksHTML}\n`;
    }
  });

  // Get base64 thumbnail for 100% offline & copy-paste instant preview
  const thumbsDir = path.join(__dirname, '..', 'static', 'thumbnails');
  const thumbPngPath = path.join(thumbsDir, `${slug}.png`);
  let thumbSrc = `https://healim-bp.com/thumbnails/${slug}.png`;
  if (fs.existsSync(thumbPngPath)) {
    const b64 = fs.readFileSync(thumbPngPath).toString('base64');
    thumbSrc = `data:image/png;base64,${b64}`;
  }

  // Assemble the exact Tistory HTML matching healimbp.tistory.com/46 standard
  const tistoryFullHTML = `<div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; line-height: 1.85; color: #333333; max-width: 780px; margin: 0 auto; padding: 10px 0; font-style: normal;">
  
  <!-- 대표 썸네일 이미지 (다음/카카오/네이버 검색 썸네일 자동 연동) -->
  <div style="text-align: center; margin: 0 0 24px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <img src="${thumbSrc}" alt="${title} - 해아림한의원 부평점 통합진료센터" style="width: 100%; max-width: 780px; height: auto; display: block; border-radius: 12px; margin: 0 auto; object-fit: cover;" />
  </div>

  <!-- 상단 안내 헤더 박스 -->
  <div style="background-color: #F4F8F6; border-left: 5px solid #2F5D50; padding: 20px 24px; border-radius: 10px; margin-bottom: 32px; box-shadow: 0 1px 4px rgba(47,93,80,0.05); font-style: normal;">
    <p style="margin: 0; font-size: 16px; color: #2F5D50; font-weight: 800; letter-spacing: -0.01em; font-style: normal;">
      🌿 해아림한의원 부평점 통합진료센터 권형근 대표원장의 1:1 맞춤 건강 칼럼
    </p>
    <p style="margin: 8px 0 0 0; font-size: 13.5px; color: #556B62; line-height: 1.6; font-style: normal;">
      척추·관절 통증 · 건강보험 추나 · 교통사고 입원/통원 · 만성 기침(보폐고) · 만성 부종(부종환) · 맞춤보약
    </p>
  </div>

  ${voiceLinesHTML ? `<!-- 환자 호소문 인용 박스 -->
  <div style="background-color: #F8FAF9; border-left: 4px solid #2F5D50; border-radius: 0 12px 12px 0; padding: 18px 24px; margin: 24px 0 28px 0; color: #2C3E35; font-size: 15px; line-height: 1.85; font-style: normal; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
    ${voiceLinesHTML}
  </div>` : ''}

  <!-- 칼럼 본문 -->
  <div style="font-size: 16px; color: #374151; word-break: keep-all; font-style: normal;">
  <p style="font-size: 16px; line-height: 1.85; color: #374151; margin-bottom: 18px; word-break: keep-all; font-style: normal;">안녕하세요. <strong style="color: #1E4638; font-weight: 700;">해아림한의원 부평점 대표원장 권형근(한방침구과 전문의)</strong>입니다.</p>
  
  ${introHTML}

  ${tocBoxHTML}

  ${parsedSectionsHTML}

  <!-- 원장 조언 박스 -->
  <div style="background: linear-gradient(135deg, #F0F6F3 0%, #E8F1EC 100%); border-left: 5px solid #2F5D50; border-radius: 4px 14px 14px 4px; padding: 22px 26px; margin: 36px 0; color: #2C3E35; box-shadow: 0 2px 6px rgba(47,93,80,0.06); font-style: normal;">
    <p style="margin: 0 0 8px 0; font-size: 15.5px; font-weight: 800; color: #1E4638; font-style: normal;">
      👨‍⚕️ <strong>권형근 대표원장의 진료실 조언</strong>
    </p>
    <p style="margin: 0; font-size: 15px; line-height: 1.85; color: #33443C; word-break: keep-all; font-style: normal;">
      "증상은 몸이 보내는 쉼과 치유의 절박한 신호입니다. 정확한 원인 진단과 1:1 맞춤 한방 치료를 통해 건강하고 활기찬 일상을 되찾으시길 바랍니다."
    </p>
  </div>

  </div>

  <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 44px 0 32px 0;" />

  <!-- 원장 소개 및 한의원 진료 안내 카드 -->
  <div style="background-color: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 14px; padding: 26px; margin-top: 32px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); font-style: normal;">
    <h4 style="margin: 0 0 12px 0; color: #1E4638; font-size: 17.5px; font-weight: 800; font-style: normal;">
      🏥 해아림한의원 부평점 통합진료센터 진료 안내
    </h4>
    <ul style="margin: 0 0 18px 0; padding-left: 20px; font-size: 14.5px; color: #4B5563; line-height: 1.85; font-style: normal;">
      <li style="margin-bottom: 6px;"><strong>대표원장:</strong> 권형근 (한방침구과 전문의 1:1 직접 책임 진료)</li>
      <li style="margin-bottom: 6px;"><strong>오시는 길:</strong> 인천 부평구 경원대로 1412, 2층 (부평역 7번 출구 도보 5분)</li>
      <li style="margin-bottom: 6px; color: #2F5D50;"><strong>진료권역:</strong> 부평동, 삼산동, 산곡동, 부개동, 청천동, 갈산동, 십정동, 일신동 등 부평구 전역 및 인근 지역</li>
      <li style="margin-bottom: 6px;"><strong>상담 및 예약:</strong> 032-719-3472</li>
      <li style="margin-bottom: 6px;"><strong>진료 시간:</strong> 월·수·금 10:00 ~ 20:00 (야간진료) / 화 10:00 ~ 19:00 / 토 09:00 ~ 15:00 (점심시간 없음) / 목·일 정기휴진 (공휴일 09:00~13:00)</li>
    </ul>

    <!-- 원클릭 바로가기 버튼 그룹 -->
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px;">
      <a href="https://booking.naver.com/booking/13/bizes/934695" target="_blank" rel="noopener" style="display: inline-block; background-color: #03C75A; color: #ffffff; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-size: 13.5px; font-weight: bold; box-shadow: 0 2px 4px rgba(3,199,90,0.2); font-style: normal;">
        📅 네이버 간편 진료예약
      </a>
      <a href="https://pf.kakao.com/_Tcxcxoxj" target="_blank" rel="noopener" style="display: inline-block; background-color: #FEE500; color: #191919; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-size: 13.5px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.08); font-style: normal;">
        💬 카카오톡 1:1 비밀상담
      </a>
      <a href="https://healim-bp.com/column/${slug}/" target="_blank" rel="noopener" style="display: inline-block; background-color: #2F5D50; color: #ffffff; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-size: 13.5px; font-weight: bold; box-shadow: 0 2px 4px rgba(47,93,80,0.2); font-style: normal;">
        🌐 공식 홈페이지 칼럼 원문 보기
      </a>
    </div>
  </div>

  <!-- 출처 표기 (백링크 SEO) -->
  <p style="text-align: right; font-size: 12px; color: #9CA3AF; margin-top: 16px; font-style: normal;">
    출처: <a href="https://healim-bp.com/column/${slug}/" target="_blank" rel="noopener" style="color: #6B7280; text-decoration: underline;">해아림한의원 부평점 통합진료센터 (healim-bp.com)</a>
  </p>

</div>`;

  return {
    title,
    category,
    tags,
    html: tistoryFullHTML
  };
}

// Convert FAQ text into beautiful Card UI boxes matching healimbp.tistory.com/46
function formatFAQSection(content) {
  content = content.replace(/<div class="column-summary-card[\s\S]*$/gi, '');
  content = content.replace(/<div class="summary-card[\s\S]*$/gi, '');
  content = content.replace(/<div class="callout-box[\s\S]*$/gi, '');

  const qnaBlocks = [];
  const lines = content.split('\n');
  let currentQ = '';
  let currentA = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith('---') || line.startsWith('<div')) return;

    if (line.match(/^\*?\*?Q\d*\.?\s*/i)) {
      if (currentQ) {
        qnaBlocks.push({ q: currentQ, a: currentA.join(' ') });
      }
      currentQ = line.replace(/^\*?\*?Q\d*\.?\s*/i, '').replace(/\*?\*?$/g, '').trim();
      currentA = [];
    } else {
      if (currentQ) {
        let cleanLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
        cleanLine = cleanLine.replace(/\[(.*?)\]/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
        currentA.push(cleanLine);
      }
    }
  });

  if (currentQ) {
    qnaBlocks.push({ q: currentQ, a: currentA.join(' ') });
  }

  if (qnaBlocks.length === 0) {
    return `<div style="font-size: 16px; line-height: 1.85; color: #374151;">${content.replace(/\n/g, '<br>')}</div>`;
  }

  let html = '<div style="margin: 24px 0;">\n';
  qnaBlocks.forEach((item, idx) => {
    const qNum = `Q${idx + 1}`;
    html += `  <div style="background-color: #F9FAF8; border: 1px solid #E2EAE5; border-radius: 12px; padding: 18px 22px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); font-style: normal;">
    <div style="font-size: 15.5px; font-weight: 800; color: #1E4638; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-style: normal;">
      <span style="background-color: #2F5D50; color: #ffffff; font-size: 12px; font-weight: bold; padding: 3px 8px; border-radius: 6px; display: inline-block; flex-shrink: 0; margin-right: 6px;">${qNum}</span>
      <span>${item.q}</span>
    </div>
    <p style="font-size: 14.5px; line-height: 1.85; color: #4E6159; margin: 0; padding-left: 36px; word-break: keep-all; font-style: normal;">
      ${item.a}
    </p>
  </div>\n`;
  });
  html += '</div>';
  return html;
}

// Parse section blocks into clean HTML using DIVs with absolute immunity against Tistory list bullet overrides
function parseSectionBlocks(content) {
  const lines = content.split('\n');
  const outputBlocks = [];

  let currentListItems = [];
  let currentP = [];

  function flushList() {
    if (currentListItems.length > 0) {
      const itemsHtml = currentListItems.map(item => {
        let clean = item.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
        clean = clean.replace(/\[(.*?)\]/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
        return `    <div style="display: flex; align-items: flex-start; margin-bottom: 10px; font-size: 15.5px; line-height: 1.8; color: #374151; word-break: keep-all; font-style: normal;"><span style="color: #2F5D50; font-size: 13px; margin-right: 8px; flex-shrink: 0; line-height: 1.8;">▪</span><div>${clean}</div></div>`;
      }).join('\n');

      outputBlocks.push(`<div style="margin: 16px 0 20px 0;">\n${itemsHtml}\n  </div>`);
      currentListItems = [];
    }
  }

  function flushP() {
    if (currentP.length > 0) {
      let pText = currentP.join('<br>');
      pText = pText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
      pText = pText.replace(/\[(.*?)\]/g, '<strong style="color: #1E4638; font-weight: 700;">$1</strong>');
      outputBlocks.push(`<p style="font-size: 16px; line-height: 1.85; color: #374151; margin-bottom: 18px; word-break: keep-all; font-style: normal;">${pText}</p>`);
      currentP = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushP();
      flushList();
      continue;
    }

    if (line.startsWith('<div style="overflow-x: auto;') || line.startsWith('<table')) {
      flushP();
      flushList();
      outputBlocks.push(rawLine);
      continue;
    }

    // Ignore raw summary cards or closing tags if any leaked
    if (line.startsWith('<div class="column-summary') || line.startsWith('</div>') || line.startsWith('<h3 class="text-xl') || line.startsWith('<i class="fa-solid')) {
      continue;
    }

    // Check if list item (starts with - or * or 1. / 2. / etc)
    const listMatch = line.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushP();
      currentListItems.push(listMatch[1].trim());
      continue;
    }

    // Regular text / subtitle line
    flushList();
    currentP.push(line);
  }

  flushP();
  flushList();

  return outputBlocks.join('\n  ');
}

function convertMarkdownTableToHTML(text) {
  const tableRegex = /\|(.+)\|\r?\n\|[-:\s|]+\|\r?\n((?:\|.+\|\r?\n?)+)/g;
  return text.replace(tableRegex, (match, headerLine, rowsBlock) => {
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const rows = rowsBlock.trim().split('\n').map(row => row.split('|').map(c => c.trim()).filter(c => c));

    let ths = headers.map(h => `<th style="border: 1px solid #D1DDD7; padding: 10px 14px; background-color: #EAF3EF; color: #1E4638; font-weight: bold; font-size: 14px; text-align: center;">${h.replace(/\*\*(.*?)\*\*/g, '$1')}</th>`).join('');
    let trs = rows.map(r => {
      let tds = r.map((cell, cIdx) => {
        let align = cIdx === 0 ? 'text-align: center; font-weight: bold;' : 'text-align: left;';
        let cellFormatted = cell.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1E4638;">$1</strong>');
        return `<td style="border: 1px solid #E2EAE5; padding: 10px 14px; font-size: 14px; color: #374151; ${align}">${cellFormatted}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    }).join('\n');

    return `<div style="overflow-x: auto; margin: 20px 0;">
  <table style="width: 100%; border-collapse: collapse; border: 1px solid #D1DDD7; font-size: 14px; line-height: 1.6; text-align: left; background-color: #FFFFFF; font-style: normal;">
    <thead>
      <tr>${ths}</tr>
    </thead>
    <tbody>
      ${trs}
    </tbody>
  </table>
</div>`;
  });
}

module.exports = { convertMarkdownToTistoryHTML };
