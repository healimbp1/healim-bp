const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('====================================================');
  console.log('🚀 [해아림한의원 부평점] 자동발행 & Cloudflare Pages 배포 시작');
  console.log('====================================================\n');

  // 1. auto-publish-slot 실행 (새 칼럼 확인, 썸네일 생성, 텔레그램 전송)
  console.log('▶ 1단계: 예약 칼럼 슬롯 검사 및 텔레그램 발송 중...');
  try {
    const publishOutput = execSync('node scripts/auto-publish-slot.js', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('❌ 자동발행 슬롯 처리 중 오류:', err.message);
  }

  // 2. Hugo 정적 사이트 빌드
  console.log('\n▶ 2단계: Hugo 정적 사이트 빌드 중...');
  try {
    execSync('hugo --cleanDestinationDir --minify', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('✅ Hugo 빌드 완료!');
  } catch (err) {
    console.error('❌ Hugo 빌드 실패:', err.message);
    process.exit(1);
  }

  // 3. Cloudflare Pages로 직접 배포
  console.log('\n▶ 3단계: Cloudflare Pages 프로덕션 배포 중...');
  try {
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    execSync(`${npxCmd} wrangler pages deploy public --project-name=healim-clinic --branch=main --commit-dirty=true`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('\n====================================================');
    console.log('🎉 [배포 성공] healim-bp.com 에 최신 사이트가 반영되었습니다!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Cloudflare 배포 실패:', err.message);
    process.exit(1);
  }

  // 4. Git 변경사항 커밋 및 원격 저장소 동기화
  console.log('\n▶ 4단계: GitHub 원격 저장소 히스토리 동기화 중...');
  try {
    execSync('git add data/publish-history.json static/thumbnails/', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    const diff = execSync('git status --porcelain data/publish-history.json static/thumbnails/', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    if (diff.trim().length > 0) {
      execSync('git commit -m "chore(auto-publish): sync publish history and thumbnails" && git push origin main', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'inherit'
      });
      console.log('✅ GitHub 동기화 완료!');
    } else {
      console.log('ℹ️ 동기화할 새로운 발행 히스토리가 없습니다.');
    }
  } catch (e) {
    console.warn('⚠️ Git 동기화 중 경고 (배포는 이미 완료됨):', e.message);
  }
}

main().catch(err => {
  console.error('❌ 전체 프로세스 오류:', err);
  process.exit(1);
});
