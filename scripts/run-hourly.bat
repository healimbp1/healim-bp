@echo off
cd /d "%~dp0\.."
echo [%date% %time%] === Hourly Publish and Deploy Start === >> "%~dp0publish.log"
node scripts/publish-and-deploy.js >> "%~dp0publish.log" 2>&1
echo [%date% %time%] === Hourly Publish and Deploy End === >> "%~dp0publish.log"
