@echo off
REM Martingale Calculator Deployment Script for Windows

echo 🚀 Starting deployment process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies.
    pause
    exit /b 1
)

REM Build the project
echo 🔨 Building the project...
call npm run build
if errorlevel 1 (
    echo ❌ Error: Build failed.
    pause
    exit /b 1
)

REM Check if build was successful
if not exist "dist\spa" (
    echo ❌ Error: Build failed. dist\spa directory not found.
    pause
    exit /b 1
)

REM Deploy to GitHub Pages
echo 🌐 Deploying to GitHub Pages...
call npx gh-pages -d dist/spa
if errorlevel 1 (
    echo ❌ Error: Deployment failed.
    pause
    exit /b 1
)

echo ✅ Deployment completed successfully!
echo 🌍 Your app should be available at: https://[username].github.io/martingale-calculator/
pause 