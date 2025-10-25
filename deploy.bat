@echo off
chcp 65001 > nul
echo ========================================
echo Sports Nara 배포 스크립트
echo ========================================
echo.

:: 기존 .next 폴더 삭제
echo 기존 빌드 파일 삭제 중...
if exist .next rmdir /s /q .next

:: .env.local 파일 확인
if not exist .env.local (
    echo.
    echo [경고] .env.local 파일이 없습니다!
    echo.
    echo .env.local 파일을 생성하고 다음 내용을 추가하세요:
    echo.
    echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo.
    pause
    exit /b 1
)

:: 빌드 실행
echo.
echo ========================================
echo 프로덕션 빌드 시작
echo ========================================
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo [오류] 빌드 실패!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo 빌드 완료!
echo ========================================
echo.
echo 프로덕션 서버를 시작하려면:
echo   npm run start
echo.
echo 또는 start_production.bat 파일을 실행하세요.
echo.
pause

