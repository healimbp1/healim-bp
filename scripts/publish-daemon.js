const path = require('path');
const { exec } = require('child_process');

console.log('====================================================');
console.log('🤖 [해아림한의원 부평점] 자동발행 & 배포 상시 감시 데몬 시작');
console.log('매 정각(00분)마다 자동으로 슬롯 확인, 텔레그램 발송 및 배포를 수행합니다.');
console.log('종료하려면 Ctrl + C 를 누르세요.');
console.log('====================================================\n');

let lastRunHour = -1;

function runPublishTask() {
  console.log(`\n[${new Date().toLocaleString('ko-KR')}] ⏰ 정각 자동발행 & 배포 작업 실행...`);
  const child = exec('node scripts/publish-and-deploy.js', {
    cwd: path.join(__dirname, '..')
  });

  child.stdout.on('data', data => process.stdout.write(data));
  child.stderr.on('data', data => process.stderr.write(data));

  child.on('close', code => {
    console.log(`[${new Date().toLocaleString('ko-KR')}] 🏁 작업 완료 (종료 코드: ${code})\n`);
  });
}

// 1. 시작 시 즉시 1회 검사 및 캐치업 실행
runPublishTask();

// 2. 이후 30초마다 시간을 확인하여 매시 00분에 실행
setInterval(() => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentMinute === 0 && lastRunHour !== currentHour) {
    lastRunHour = currentHour;
    runPublishTask();
  }
}, 30000);
