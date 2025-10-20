@echo off
echo ================================================
echo 🚀 Next.js 清理 + 重建 + Vercel 部署脚本
echo ================================================

echo.
echo 🔹 停止正在运行的 Node.js 进程...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo 🔹 删除 .next 文件夹...
rmdir /s /q .next

echo.
echo 🔹 删除 node_modules 文件夹...
rmdir /s /q node_modules

echo.
echo 🔹 删除 package-lock.json...
del /f /q package-lock.json

echo.
echo 🔹 重新安装依赖...
call npm install

echo.
echo 🔹 重新构建项目...
call npm run build

echo.
echo 🔹 执行 Vercel 部署 (生产环境)...
:: 如果你已经登录 Vercel 并在项目根目录，使用下面命令
call vercel --prod

echo.
echo ✅ 部署完成！
pause
