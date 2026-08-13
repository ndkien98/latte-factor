@echo off
echo ==============================================
echo  LATTE FACTOR DETECTOR - TU DONG BUILD & DEPLOY
echo ==============================================
echo.

:: 1. Build project
echo [1/3] Dang bien dich va dong goi (build) ung dung...
cd "3. code\latte-factor"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Qua trinh build gap loi. Ngung trien khai!
    goto end
)
cd ..

:: 2. Set credentials
echo.
echo [2/3] Cau hinh thong tin xac thuc Firebase...
set GOOGLE_APPLICATION_CREDENTIALS=d:\person_work\latte-factor\4. key\firebase\late-factor-firebase-adminsdk-fbsvc-360f112217.json

:: 3. Deploy
echo.
echo [3/3] Dang tai len (deploy) Firebase Hosting...
call npx firebase-tools deploy --only hosting --non-interactive
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Qua trinh deploy Firebase gap loi!
    goto end
)

echo.
echo ==============================================
echo  TRIEN KHAI CONG VIEC THANH CONG!
echo ==============================================

:end
pause
