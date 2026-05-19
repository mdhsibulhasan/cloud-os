@echo off
echo ========================================
echo   Cloud OS - GitHub Deployment Script
echo ========================================
echo.

echo Step 1: Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Creating initial commit...
git commit -m "Initial commit - Cloud OS ready for deployment"

echo.
echo Step 4: Setting main branch...
git branch -M main

echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Go to GitHub.com and create a new repository
echo 2. Copy your repository URL
echo 3. Run this command (replace YOUR_USERNAME):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/cloud-os.git
echo    git push -u origin main
echo.
echo 4. Then go to render.com and follow EASY-DEPLOY.md
echo.
echo ========================================

pause
