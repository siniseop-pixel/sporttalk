@echo off
echo ========================================
echo Sports Nara 프로덕션 모드 시작
echo ========================================

:: 빌드 실행
echo 빌드 중...
call npm run build

if %errorlevel% neq 0 (
    echo 빌드 실패!
    pause
    exit /b %errorlevel%
)

echo.
echo 빌드 완료!
echo.
echo ========================================
echo 프로덕션 서버 시작 중...
echo ========================================
echo.
echo 서버가 http://localhost:3000 에서 실행됩니다.
echo 종료하려면 Ctrl+C를 누르세요.
echo.

:: 프로덕션 서버 시작
call npm run start

pause

