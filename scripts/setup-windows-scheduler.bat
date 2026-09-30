@echo off
chcp 65001 > nul
echo ====================================================
echo  해아림한의원 부평점 - 윈도우 작업 스케줄러 자동 등록
echo ====================================================
echo.

set TASK_NAME=HealimClinicAutoPublish
set SCRIPT_PATH=%~dp0publish-and-deploy.js
set NODE_EXE=node

echo ▶ 작업 이름: %TASK_NAME%
echo ▶ 실행 주기: 매 1시간마다 (매시간 00분)
echo.

schtasks /create /tn "%TASK_NAME%" /tr "cmd.exe /c cd /d \"%~dp0..\" && node scripts/publish-and-deploy.js" /sc HOURLY /mo 1 /f

echo.
if %errorlevel% equ 0 (
    echo 🎉 윈도우 작업 스케줄러 등록이 성공적으로 완료되었습니다!
    echo 이제 컴퓨터가 켜져 있는 동안 매 1시간마다 자동으로 새 글이 발행되고 Cloudflare로 배포됩니다.
) else (
    echo ⚠️ 관리자 권한으로 다시 실행해 주세요 (마우스 우클릭 -> 관리자 권한으로 실행).
)

echo.
pause
