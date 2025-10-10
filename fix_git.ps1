Write-Host ""
Write-Host "==============================="
Write-Host " Git 자동 연결/푸시 스크립트 "
Write-Host "==============================="

# 0) Git 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] Git이 설치되어 있지 않습니다. https://git-scm.com 에서 설치 후 다시 실행하세요."
  Pause
  exit
}

# 1) 위치 확인
if (-not (Test-Path "package.json")) {
  Write-Host "[WARN] package.json이 없습니다. 프로젝트 루트가 맞는지 확인하세요."
  Write-Host "현재 경로: $PWD"
  $ans = Read-Host "계속 진행할까요? (Y/N)"
  if ($ans -ne "Y" -and $ans -ne "y") { exit }
}

# 2) git init (이미 있으면 건너뜀)
if (Test-Path ".git") {
  Write-Host "[INFO] 이미 Git 저장소입니다. (.git 존재)"
} else {
  Write-Host "[STEP] git init"
  git init
}

# 3) 사용자 이름/이메일 설정
$GUN = git config --get user.name
$GUE = git config --get user.email

if (-not $GUN) {
  $GUN = Read-Host "Git 사용자 이름(user.name)을 입력하세요 (예: Your Name)"
  git config --global user.name "$GUN"
}

if (-not $GUE) {
  $GUE = Read-Host "Git 이메일(user.email)을 입력하세요 (예: you@example.com)"
  git config --global user.email "$GUE"
}

# 4) 원격 저장소 입력
$GHUSER = Read-Host "GitHub 사용자명(계정 ID)을 입력하세요 (예: siniseop-pixel)"
if (-not $GHUSER) { Write-Host "[ERROR] 사용자명이 필요합니다."; Pause; exit }

$GHREPO = Read-Host "리포지토리 이름을 입력하세요 [기본: sporttalk]"
if (-not $GHREPO) { $GHREPO = "sporttalk" }

$REMOTE_URL = "https://github.com/$GHUSER/$GHREPO.git"
Write-Host "[INFO] 원격 저장소: $REMOTE_URL"

# 5) origin 재설정
git remote remove origin 2>$null
git remote add origin $REMOTE_URL

# 6) README 생성
if (-not (Test-Path "README.md")) {
  "# $GHREPO" | Out-File "README.md" -Encoding utf8
}

# 7) 커밋
Write-Host "[STEP] 파일 스테이징/커밋"
git add .
git commit -m "chore: init or reconnect repository" | Out-Null
git branch -M main

# 8) 원격 푸시
Write-Host "[STEP] 원격으로 푸시 중..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ GitHub 푸시 완료!"

  # --- 🔥 자동 Vercel 배포 트리거 ---
  $vercelUrl = Read-Host "Vercel 배포 Webhook URL을 입력하세요 (없으면 Enter)"
  if ($vercelUrl) {
    try {
      Write-Host "🚀 Vercel redeploy 트리거 중..."
      Invoke-WebRequest -Uri $vercelUrl -Method POST | Out-Null
      Write-Host "✅ Vercel 배포 트리거 완료!"
    } catch {
      Write-Host "⚠️ Vercel 트리거 실패: $($_.Exception.Message)"
    }
  }
} else {
  Write-Host "❌ Git push 실패 — GitHub 인증이나 리포 확인 필요."
}

Write-Host ""
Write-Host "🎉 완료! 이후엔 아래 명령만 실행하면 됩니다:"
Write-Host "   git add ."
Write-Host "   git commit -m 'auto deploy'"
Write-Host "   git push"
Write-Host ""
Pause
