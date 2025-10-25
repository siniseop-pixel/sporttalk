# 시작 프로그램에 추가하는 스크립트

$batPath = Join-Path $PSScriptRoot "start_production.bat"
$vbsPath = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup\SportsNara.vbs"

# VBS 스크립트 생성 (백그라운드 실행용)
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "$batPath" & Chr(34), 0
Set WshShell = Nothing
"@

$vbsContent | Out-File -FilePath $vbsPath -Encoding ASCII -Force

Write-Host "✓ 시작 프로그램에 추가되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 부팅부터 자동으로 Sports Nara가 시작됩니다." -ForegroundColor Yellow
Write-Host "시작 프로그램에서 제거하려면 $vbsPath 파일을 삭제하세요." -ForegroundColor Gray
