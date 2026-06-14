#!/usr/bin/env zsh

set -e

echo "==================================================="
echo "🚀 Next.js macOS/Linux 全自动部署脚本 (自动读取 .env.local)"
echo "✅ 多域名 + Git 分支 + Google 登录 + 自动打开浏览器"
echo "✅ nodel 版本：不删除 node_modules / package-lock.json，不重新 npm install"
echo "==================================================="

# -------------------------
# 0️⃣ 加载 .env.local 环境变量
# -------------------------
if [[ -f ".env.local" ]]; then
  echo "🔹 加载 .env.local ..."
  set -a
  source .env.local
  set +a
else
  echo "⚠️ 未找到 .env.local 文件"
fi

# -------------------------
# 1️⃣ 配置域名映射
# -------------------------
BRANCH_PROD="main"
DOMAIN_PROD1="https://2.zzzz.tech"
DOMAIN_PROD2="https://next.zzzz.tech"
BRANCH_PREVIEW="develop"
DOMAIN_PREVIEW="https://preview.zzzz.tech"

# 默认使用 DOMAIN_PROD1
NEXTAUTH_URL_CURRENT="$DOMAIN_PROD1"

# -------------------------
# 2️⃣ 获取当前 Git 分支
# -------------------------
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "🔹 当前 Git 分支：$CURRENT_BRANCH"

# -------------------------
# 3️⃣ 根据分支选择域名和环境
# -------------------------
if [[ "$CURRENT_BRANCH" == "$BRANCH_PROD" ]]; then
  DEPLOY_ENV="Production"
  NEXTAUTH_URL_CURRENT="$DOMAIN_PROD1"
  echo "🔹 生产环境部署，默认域名：$NEXTAUTH_URL_CURRENT"
else
  DEPLOY_ENV="Preview"
  NEXTAUTH_URL_CURRENT="$DOMAIN_PREVIEW"
  echo "🔹 预览环境部署，域名：$NEXTAUTH_URL_CURRENT"
fi

# -------------------------
# 4️⃣ 停止 Node.js 进程
# -------------------------
echo
echo "🔹 停止正在运行的 Node.js 进程..."
pkill -f node || true

# -------------------------
# 7️⃣ 检查关键环境变量
# -------------------------
echo
echo "🔹 检查关键环境变量..."
MISSING_VARS=0

if [[ -z "${GOOGLE_CLIENT_ID:-}" ]]; then
  echo "❌ GOOGLE_CLIENT_ID 未设置"
  MISSING_VARS=1
fi

if [[ -z "${GOOGLE_CLIENT_SECRET:-}" ]]; then
  echo "❌ GOOGLE_CLIENT_SECRET 未设置"
  MISSING_VARS=1
fi

if [[ -z "${NEXTAUTH_SECRET:-}" ]]; then
  echo "❌ NEXTAUTH_SECRET 未设置"
  MISSING_VARS=1
fi

if [[ "$MISSING_VARS" == "1" ]]; then
  echo
  echo "❌ 部署中断，请先在 .env.local 或 Vercel Dashboard 配置缺失的环境变量"
  exit 1
fi

# -------------------------
# 8️⃣ 设置临时 NEXTAUTH_URL
# -------------------------
export NEXTAUTH_URL="$NEXTAUTH_URL_CURRENT"
echo "🔹 NEXTAUTH_URL 设置为 $NEXTAUTH_URL_CURRENT"

# -------------------------
# 9️⃣ 构建项目
# -------------------------
echo
echo "🔹 构建项目..."
npm run build

# -------------------------
# 🔟 部署到 Vercel
# -------------------------
echo
echo "🔹 部署到 Vercel $DEPLOY_ENV..."
if [[ "$DEPLOY_ENV" == "Production" ]]; then
  npx vercel@latest --prod
else
  npx vercel@latest
fi

# -------------------------
# 10.5️⃣ 清理当前脚本中的临时 NEXTAUTH_URL
# -------------------------
unset NEXTAUTH_URL
echo "🔹 NEXTAUTH_URL 已从当前脚本环境清除"

# -------------------------
# 11️⃣ 复制域名到剪贴板
# -------------------------
echo
echo "🔹 复制部署域名到剪贴板..."
echo -n "$NEXTAUTH_URL_CURRENT" | pbcopy

# -------------------------
# 12️⃣ 自动在默认浏览器打开域名
# -------------------------
echo "🔹 在默认浏览器打开 $NEXTAUTH_URL_CURRENT ..."
open "$NEXTAUTH_URL_CURRENT"

# -------------------------
# 13️⃣ 完成提示
# -------------------------
echo "==================================================="
echo "✅ $DEPLOY_ENV 部署完成！"
echo "✅ 当前部署域名已复制到剪贴板：$NEXTAUTH_URL_CURRENT"
echo "✅ 默认浏览器已打开"
echo "==================================================="
