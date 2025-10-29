@echo off
echo ===================================================
echo 🚀 Next.js Windows 全自动部署脚本 (自动读取 .env.local)
echo ✅ 多域名 + Git 分支 + Google 登录 + 自动打开浏览器
echo ===================================================

:: -------------------------
:: 0️⃣ 加载 .env.local 环境变量
:: -------------------------
if exist ".env.local" (
    echo 🔹 加载 .env.local ...
    for /f "usebackq tokens=1,2* delims==" %%a in (`type .env.local ^| findstr /v "^#"` ) do (
        set "%%a=%%b"
    )
) else (
    echo ⚠️ 未找到 .env.local 文件
)

:: -------------------------
:: 1️⃣ 配置域名映射
:: -------------------------
set BRANCH_PROD=main
set DOMAIN_PROD1=https://2.zzzz.tech
set DOMAIN_PROD2=https://next.zzzz.tech
set BRANCH_PREVIEW=develop
set DOMAIN_PREVIEW=https://preview.zzzz.tech

:: 默认使用 DOMAIN_PROD1
set NEXTAUTH_URL_CURRENT=%DOMAIN_PROD1%

:: -------------------------
:: 2️⃣ 获取当前 Git 分支
:: -------------------------
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
echo 🔹 当前 Git 分支：%CURRENT_BRANCH%

:: -------------------------
:: 3️⃣ 根据分支选择域名和环境
:: -------------------------
    set DEPLOY_ENV=Preview
    set NEXTAUTH_URL_CURRENT=%DOMAIN_PREVIEW%
    echo 🔹 预览环境部署，域名：%NEXTAUTH_URL_CURRENT%


:: -------------------------
:: 4️⃣ 停止 Node.js 进程
:: -------------------------
echo.
echo 🔹 停止正在运行的 Node.js 进程...
taskkill /F /IM node.exe >nul 2>&1


:: -------------------------
:: 7️⃣ 检查关键环境变量
:: -------------------------
echo.
echo 🔹 检查关键环境变量...
set MISSING_VARS=0

if "%GOOGLE_CLIENT_ID%"=="" (
    echo ❌ GOOGLE_CLIENT_ID 未设置
    set MISSING_VARS=1
)
if "%GOOGLE_CLIENT_SECRET%"=="" (
    echo ❌ GOOGLE_CLIENT_SECRET 未设置
    set MISSING_VARS=1
)
if "%NEXTAUTH_SECRET%"=="" (
    echo ❌ NEXTAUTH_SECRET 未设置
    set MISSING_VARS=1
)
if %MISSING_VARS%==1 (
    echo.
    echo ❌ 部署中断，请先在 .env.local 或 Vercel Dashboard 配置缺失的环境变量
    pause
    exit /b 1
)

:: -------------------------
:: 8️⃣ 设置临时 NEXTAUTH_URL
:: -------------------------
setx NEXTAUTH_URL "%NEXTAUTH_URL_CURRENT%"
echo 🔹 NEXTAUTH_URL 设置为 %NEXTAUTH_URL_CURRENT%

:: -------------------------
:: 9️⃣ 构建项目
:: -------------------------
echo.
echo 🔹 构建项目...
call npm run build

:: -------------------------
:: 🔟 部署到 Vercel
:: -------------------------
echo.
echo 🔹 部署到 Vercel %DEPLOY_ENV%...
if "%DEPLOY_ENV%"=="Production" (
    call vercel --prod
) else (
    call vercel
)

:: -------------------------
:: 8️⃣ 设置临时 NEXTAUTH_URL
:: -------------------------
setx NEXTAUTH_URL ""
set NEXTAUTH_URL_CURRENT=""
echo 🔹 NEXTAUTH_URL 设置清空

:: -------------------------
:: 11️⃣ 复制域名到剪贴板
:: -------------------------
echo.
echo 🔹 复制部署域名到剪贴板...
echo %NEXTAUTH_URL_CURRENT% | clip

:: -------------------------
:: 12️⃣ 自动在默认浏览器打开域名
:: -------------------------
echo 🔹 在默认浏览器打开 %NEXTAUTH_URL_CURRENT% ...
start "" "%NEXTAUTH_URL_CURRENT%"

:: -------------------------
:: 13️⃣ 完成提示
:: -------------------------
echo ===================================================
echo ✅ %DEPLOY_ENV% 部署完成！
echo ✅ 当前部署域名已复制到剪贴板：%NEXTAUTH_URL_CURRENT%
echo ✅ 默认浏览器已打开
echo ===================================================
pause
