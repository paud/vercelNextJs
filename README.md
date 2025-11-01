# 二手商品交易平台 - Second-hand Item Trading Platform

> 🎉 **最新更新：完整 LINE 集成支持！** 现已支持 LINE OAuth 登录和智能预览卡片功能。
> 📖 [快速开始指南](docs/QUICK_START.md) | [LINE 集成文档](docs/LINE_INTEGRATION_README.md) | [部署清单](docs/DEPLOYMENT_CHECKLIST.md)

基于Next.js和Prisma ORM构建的现代化二手商品交易平台，支持精确的日本地理位置定位和OAuth认证。

A modern second-hand item trading platform built with Next.js and Prisma ORM, featuring precise Japanese geographic location support and OAuth authentication.

## ✨ 主要功能 Key Features

- 📱 **LINE 集成** - LINE OAuth 登录、智能预览卡片、一键分享
- 🗾 **五级地理层级** - 完整的日本行政区划支持（地方→都道府県→市区町村→区域→区町）
- 🔐 **多种登录方式** - 支持 LINE、Google、邮箱密码登录
- 🎴 **智能预览卡片** - 在 LINE 分享时自动生成美观的预览卡片
- 📱 **响应式设计** - 适配桌面和移动设备
- 🌐 **多语言支持** - 支持中文、日文、英文、韩文、越南文、尼泊尔文
- 🔍 **智能搜索** - 基于地理位置的商品搜索
- 📊 **性能优化** - 数据库索引和查询优化
- 💬 **实时消息** - 用户间私信和未读消息提醒

## 🚀 5 分钟快速开始

### 使用现有项目

```bash
# 1. 克隆项目
git clone <repository-url>
cd prisma-postgres

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入必要配置

# 4. 检查配置
node scripts/check-env.js

# 5. 初始化数据库
npx prisma migrate dev

# 6. 启动开发服务器
npm run dev
```

**完整指南：** 查看 [快速开始文档](docs/QUICK_START.md) 获取详细步骤。

## 📱 LINE 功能配置

### LINE OAuth 登录
1. 在 [LINE Developers Console](https://developers.line.biz/) 创建 LINE Login Channel
2. 添加回调 URL：`http://localhost:3000/api/auth/callback/line`
3. 在 `.env.local` 添加：
   ```bash
   LINE_CLIENT_ID="your-channel-id"
   LINE_CLIENT_SECRET="your-channel-secret"
   ```
4. 重启开发服务器

### LINE 预览卡片
✅ **已自动配置！** 当你在 LINE 中分享产品链接时，会自动显示包含图片、标题、价格的精美预览卡片。

**测试方法：**
```bash
# 1. 访问 OG 图片 API
http://localhost:3000/api/og

# 2. 查看产品详情页 OG 标签
curl -s http://localhost:3000/ja/items/1 | grep "og:"

# 3. 在 LINE 中分享链接测试（需部署后）
```

**详细文档：** [LINE 集成完整指南](docs/LINE_INTEGRATION_README.md)

## 🏗️ 地理层级结构 Geographic Hierarchy

```
地方 (Region)               ← 八大地方：北海道、関東、関西、四国、九州等
    ↓
都道府県 (Prefecture)       ← 47个都道府県
    ↓  
市区町村 (City)            ← 政令指定都市、特别区、一般市等
    ↓
区域 (District)            ← 城市下属区域
    ↓
区町 (Ward)                ← 最小行政单位
```

## 🚀 快速开始 Getting Started

Follow these steps to quickly set up the project and start using Prisma ORM with Next.js.

### 1. Create a Next.js app

Run [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) using your preferred package manager:

```bash
# Using npm
npx create-next-app@latest --example prisma-postgres my-prisma-postgres-app
```

<details>

<summary>Expand for <code>yarn</code>, <code>pnpm</code> or <code>bun</code></summary>

```bash
# Using yarn
yarn create next-app --example prisma-postgres my-prisma-postgres-app

# Using pnpm
pnpm create-next-app --example prisma-postgres my-prisma-postgres-app

# Using bun
bunx create-next-app --example prisma-postgres my-prisma-postgres-app
```

</details>

Navigate into the created app:

```bash
cd ./my-prisma-postgres-app
```

Install the dependencies if you haven't already:

```bash
# Using npm
npm install
```

<details>

<summary>Expand for <code>yarn</code>, <code>pnpm</code> or <code>bun</code></summary>

```bash
# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

</details>

### 2. Create a Prisma Postgres instance

Run the following command in your terminal:

```
npx prisma init --db
```

If you don't have a [Prisma Data Platform](https://console.prisma.io/) account yet, or if you are not logged in, the command will prompt you to log in using one of the available authentication providers. A browser window will open so you can log in or create an account. Return to the CLI after you have completed this step.

Once logged in (or if you were already logged in), the CLI will prompt you to:

1. Select a **region** (e.g. `us-east-1`)
1. Enter a **project name**

After successful creation, you will see output similar to the following:

<details>

<summary>CLI output</summary>

```terminal
Let's set up your Prisma Postgres database!
? Select your region: ap-northeast-1 - Asia Pacific (Tokyo)
? Enter a project name: testing-migration
✔ Success! Your Prisma Postgres database is ready ✅

We found an existing schema.prisma file in your current project directory.

--- Database URL ---

Connect Prisma ORM to your Prisma Postgres database with this URL:

prisma+postgres://accelerate.prisma-data.net/?api_key=ey...

--- Next steps ---

Go to https://pris.ly/ppg-init for detailed instructions.

1. Install and use the Prisma Accelerate extension
Prisma Postgres requires the Prisma Accelerate extension for querying. If you haven't already installed it, install it in your project:
npm install @prisma/extension-accelerate

...and add it to your Prisma Client instance:
import { withAccelerate } from "@prisma/extension-accelerate"

const prisma = new PrismaClient().$extends(withAccelerate())

2. Apply migrations
Run the following command to create and apply a migration:
npx prisma migrate dev

3. Manage your data
View and edit your data locally by running this command:
npx prisma studio

...or online in Console:
https://console.prisma.io/{workspaceId}/{projectId}/studio

4. Send queries from your app
If you already have an existing app with Prisma ORM, you can now run it and it will send queries against your newly created Prisma Postgres instance.

5. Learn more
For more info, visit the Prisma Postgres docs: https://pris.ly/ppg-docs
```

</details>

Locate and copy the database URL provided in the CLI output. Then, follow the instructions in the next step to create a `.env` file in the project root.

### 3. Setup your `.env` file

You now need to configure your database connection via an environment variable.

First, create an `.env` file:

```bash
touch .env
```

Then update the `.env` file by replacing the existing `DATABASE_URL` value with the one you previously copied. It will look similar to this:

```bash
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=PRISMA_POSTGRES_API_KEY"
```

### 4. Migrate the database

Run the following commands to set up your database and Prisma schema:

```bash
# Using npm
npx prisma migrate dev --name init
```

<details>

<summary>Expand for <code>yarn</code>, <code>pnpm</code> or <code>bun</code></summary>

```bash
# Using yarn
yarn prisma migrate dev --name init

# Using pnpm
pnpm prisma migrate dev --name init

# Using bun
bun prisma migrate dev --name init
```

</details>

### 5. Seed the database

Add initial data to your database:

```bash
# Using npm
npx prisma db seed
```

<details>

<summary>Expand for <code>yarn</code>, <code>pnpm</code> or <code>bun</code></summary>

```bash
# Using yarn
yarn prisma db seed

# Using pnpm
pnpm prisma db seed

# Using bun
bun prisma db seed
```

</details>

### 6. Run the app

Start the development server:

```bash
# Using npm
npm run dev
```

<details>

<summary>Expand for <code>yarn</code>, <code>pnpm</code> or <code>bun</code></summary>

```bash
# Using yarn
yarn dev

# Using pnpm
pnpm run dev

# Using bun
bun run dev
```

</details>

Once the server is running, visit `http://localhost:3000` to start using the app。

## Usage

The app includes the following routes:

- `/`: Display the thee most recent posts
- `/posts`: Paginated list view of all posts
- `/posts/new`: Create a new post
- `/users/new`: Create a new user
- `/api/posts/`: Pagination logic

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fprisma-orm&env=DATABASE_URL&envDescription=Add%20your%20PRISMA%20POSTGRES%20database%20url&project-name=prisma-orm-app&repository-name=prisma-orm)

## Additional information

Explore different ways to use Prisma ORM in your project with the following resources to help you expand your knowledge and customize your workflow:

- Prisma ORM supports multiple databases. Learn more about the supported databases [here](https://www.prisma.io/docs/orm/reference/supported-databases?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example).
- To use Prisma ORM in an edge runtime without using [Prisma Postgres](https://www.prisma.io/docs/orm/overview/databases/prisma-postgres?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example) or [Prisma Accelerate](https://www.prisma.io/docs/accelerate/getting-started?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example), refer to the [driver adapters guide](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-vercel?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example).

For further learning and support:

- [Prisma ORM documentation](https://www.prisma.io/docs/orm?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example)
- [Prisma Client API reference](https://www.prisma.io/docs/orm/prisma-client?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example)
- [Join our Discord community](https://pris.ly/discord?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example)
- [Follow us on Twitter](https://pris.ly/x?utm_source=nextjs&utm_medium=example&utm_campaign=nextjs_example)

## 🛠️ 技术栈 Tech Stack

### 前端 Frontend
- **Next.js 15** - React全栈框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用工具优先的CSS框架
- **NextAuth.js** - 身份验证解决方案

### 后端 Backend  
- **Prisma ORM** - 现代化数据库ORM
- **PostgreSQL** - 关系型数据库
- **Prisma Accelerate** - 数据库连接池和缓存

### 开发工具 Development Tools
- **Prisma Studio** - 数据库可视化管理
- **TypeScript** - 开发时类型检查
- **ESLint** - 代码质量检查

## 📊 数据模型 Data Models

### 核心模型 Core Models
- `User` - 用户信息（支持OAuth）
- `Item` - 商品信息
- `Account` - OAuth账户
- `Session` - 用户会话

### 地理位置模型 Geographic Models
- `Region` - 地方区划（8个）
- `Prefecture` - 都道府県（47个）
- `City` - 市区町村
- `District` - 区域
- `Ward` - 区町
