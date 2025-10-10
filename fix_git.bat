@echo off
setlocal ENABLEDELAYEDEXPANSION

echo.
echo ===============================
echo  Git 자동 연결/푸시 스크립트
echo ===============================

REM 0) Git 확인
where git >NUL 2>NUL
if errorlevel 1 (
  echo [ERROR] Git이 설치되어 있지 않습니다. https://git-scm.com 에서 설치 후 다시 실행하세요.
  pause
  exit /b 1
)

REM 1) 위치 확인
if not exist "package.json" (
  echo [WARN] 여기에는 package.json 이 없습니다. 프로젝트 루트가 맞는지 확인하세요.
  echo 현재 경로: %CD%
  choice /M "계속 진행할까요?"
  if errorlevel 2 exit /b 1
)

REM 2) git init (이미 있으면 건너뜀)
if exist ".git" (
  echo [INFO] 이미 Git 저장소입니다. (.git 존재)
) else (
  echo [STEP] git init
  git init
)

REM 3) 사용자 이름/이메일 설정 (없을 때만)
for /f "usebackq delims=" %%A in (`git config --get user.name`) do set GUN=%%A
for /f "usebackq delims=" %%A in (`git config --get user.email`) do set GUE=%%A

if "%GUN%"=="" (
  set /p GUN=Git 사용자 이름(user.name)을 입력하세요 (예: Your Name): 
  git config --global user.name "%GUN%"
)

if "%GUE%"=="" (
  set /p GUE=Git 이메일(user.email)을 입력하세요 (예: you@example.com): 
  git config --global user.email "%GUE%"
)

REM 4) GitHub 원격 저장소 정보 입력
echo.
set /p GHUSER=GitHub 사용자명(계정 ID)을 입력하세요 (예: siniseop-pixel): 
if "%GHUSER%"=="" (
  echo [ERROR] 사용자명이 필요합니다.
  pause
  exit /b 1
)

set /p GHREPO=리포지토리 이름을 입력하세요 [기본: sporttalk]: 
if "%GHREPO%"=="" set GHREPO=sporttalk

set REMOTE_URL=https://github.com/%GHUSER%/%GHREPO%.git
echo [INFO] 원격 저장소: %REMOTE_URL%

REM 5) origin 재설정
git remote remove origin >NUL 2>NUL
git remote add origin %REMOTE_URL%

REM 6) README 생성(없으면)
if not exist "README.md" (
  echo # %GHREPO%> README.md
)

REM 7) 첫 커밋
echo [STEP] 파일 스테이징/커밋
git add .
git commit -m "chore: init or reconnect repository" || echo [INFO] 커밋할 변경이 없습니다.

REM 8) 브랜치 main 강제 전환
git branch -M main

REM 9) 원격 푸시
echo [STEP] 원격으로 푸시 중...
git push -u origin main
if errorlevel 1 (
  echo.
  echo [ERROR] 푸시에 실패했습니다. (자격 증명/권한 문제일 수 있음)
  echo  - GitHub에 리포지토리가 생성되어 있는지 확인하세요.
  echo  - 로그인/토큰 팝업이 뜨면 승인하세요.
  echo  - 2FA 계정이면 브라우저 로그인이 열릴 수 있어요.
  pause
  exit /b 1
)

echo.
echo ✅ 완료! 이제부터는 다음으로 자동 배포하면 됩니다:
echo    git add .
echo    git commit -m "auto deploy"
echo    git push
echo.
echo (VS Code 단축키를 만들어두었다면 Ctrl+Shift+D 로 한 번에 실행 가능)
pause
endlocal
