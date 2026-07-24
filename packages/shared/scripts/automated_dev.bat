@echo off
setlocal enableextensions

echo 📦 Building shared package...
call pnpm --filter @himvirasat/shared build
if %errorlevel% neq 0 (
    echo ❌ Shared package build failed!
    exit /b %errorlevel%
)

echo 🚀 Starting backend and frontend concurrently...
call pnpm --parallel --filter himvirasat-backend --filter himvirasat-frontend dev