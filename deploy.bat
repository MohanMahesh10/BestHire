@echo off
echo ========================================
echo  BestHire - GitHub Pages Deployment
echo  Developed by MOHAN MAHESH 2025
echo ========================================
echo.

echo [1/4] Checking Git status...
git status
echo.

echo [2/4] Building Next.js app for production...
call npm run export
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)
echo.

echo [3/4] Deploying to GitHub Pages...
call gh-pages -d out
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed!
    pause
    exit /b %errorlevel%
)
echo.

echo [4/4] Deployment complete!
echo.
echo ========================================
echo  Your site will be live in 2-5 minutes
echo  URL: https://YOUR_USERNAME.github.io/BestHire
echo ========================================
echo.
pause

