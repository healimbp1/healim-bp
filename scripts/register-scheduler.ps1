$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $scriptDir "run-silent.vbs"
$taskName = "HealimClinicAutoPublish"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " 해아림한의원 부평점 - 윈도우 작업 스케줄러 자동 등록" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "▶ 작업 이름: $taskName"
Write-Host "▶ 실행 파일: $vbsPath"
Write-Host "▶ 실행 주기: 매 1시간마다 (정각)"
Write-Host ""

$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsPath`""
$trigger = New-ScheduledTaskTrigger -Once -At "00:00:00" -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
    Write-Host "🎉 윈도우 작업 스케줄러 등록이 성공적으로 완료되었습니다!" -ForegroundColor Green
    Write-Host "이제 컴퓨터가 켜져 있는 동안 매 1시간마다 자동으로 검사하여"
    Write-Host "새 칼럼 발행, 텔레그램 전송, Cloudflare 웹사이트 배포가 백그라운드에서 실행됩니다."
} catch {
    Write-Host "⚠️ 스케줄러 등록 실패: $_" -ForegroundColor Red
}

Write-Host ""
