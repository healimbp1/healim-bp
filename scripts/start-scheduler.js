const { exec } = require('child_process');
const path = require('path');

console.log('🚀 [해아림 정기 자동발행 로컬 데몬 시작]');
console.log('⏰ 30분마다 예약 칼럼 검사 및 자동 텔레그램 전송을 수행합니다. (Ctrl+C 로 종료)');

function checkAndPublish() {
  const scriptPath = path.join(__dirname, 'auto-publish-slot.js');
  console.log(`\n[${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}] 정기 슬롯 검사 실행...`);
  
  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
    if (error) console.error(`❌ 실행 에러: ${error.message}`);
  });
}

// Initial check on launch
checkAndPublish();

// Check every 30 minutes
setInterval(checkAndPublish, 30 * 60 * 1000);
