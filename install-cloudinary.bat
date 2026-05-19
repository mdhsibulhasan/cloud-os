@echo off
echo ========================================
echo   Installing Cloudinary Packages
echo ========================================
echo.

echo Installing cloudinary and multer-storage-cloudinary...
npm install cloudinary multer-storage-cloudinary

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create Cloudinary account at cloudinary.com
echo 2. Get your credentials from dashboard
echo 3. Add them to .env file
echo 4. Tell me when ready to update the code
echo.
pause
