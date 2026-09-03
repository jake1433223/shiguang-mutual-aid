# 拾光互助部署指南（免费托管方案）

本文档介绍如何使用免费托管平台将拾光互助发布到公网：
- 前端：**Vercel**（免费，全球 CDN）
- 数据库：**Neon**（免费 PostgreSQL，云端）
- 后端：**Railway** 或 **Render**（免费 Node 服务）

> 整体费用：0 元。三个平台均为免费额度。
> 域名：无需购买，平台会提供免费二级域名（`xxx.vercel.app`）。

---

## 架构

```
用户浏览器
    │
    ▼
Vercel（前端静态站 shiguang.vercel.app）
    │  /api/* → VITE_API_BASE_URL 指向后端
    ▼
Railway（NestJS 后端 api.shiguang.up.railway.app）
    │
    ▼
Neon（PostgreSQL 云数据库）
```

---

## 1. 数据库：Neon（PostgreSQL）

1. 注册 https://neon.tech （GitHub 账号一键登录，免费额度足够个人项目）
2. 创建 Project → 选择区域（就近选择，如 `Singapore` 或 `Tokyo`）
3. 创建完成后复制 **连接字符串**（Connection string）：
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require&connect_timeout=30
   ```
   > ⚠️ 必须加 `connect_timeout=30`：Neon 免费版有冷启动延迟（约 5 秒），Prisma 默认 5 秒超时会连不上。
4. 保存备用，稍后填入后端环境变量。

---

## 2. 后端：Railway（或 Render）

### 2.1 准备代码（在项目根目录执行）

```bash
cd server
# 安装依赖
npm install

# 生成 PostgreSQL 客户端
npx prisma generate --schema prisma/schema.postgresql.prisma

# 编译生产代码
npm run build
```

### 2.2 上传到 GitHub

```bash
cd D:\projects\shiguang-mutual-aid
git init
git add .
git commit -m "init: 拾光互助上线"
# 推送到 GitHub 私有仓库（选一个）
git remote add origin https://github.com/你的用户名/shiguang-mutual-aid.git
git push -u origin main
```

> ⚠️ 重要：`.gitignore` 已排除 `.env`、`dev.db`、`node_modules`，密钥不会上传。

### 2.3 Railway 部署

1. 注册 https://railway.app （GitHub 登录，每月 $5 免费额度，个人项目够用）
2. **New Project → Deploy from GitHub repo** → 选择仓库
3. 保持 **Root Directory** 为仓库根目录（默认为 `/`，不要改成 `server`）。仓库自带的 `railway.json` 会自动进入 `server/` 执行安装、生成 Prisma Client 和构建。
4. 在 **Variables** 中配置环境变量：

   | 变量 | 值 |
   |---|---|
   | `DATABASE_URL` | Neon 连接字符串（见第 1 步） |
   | `JWT_SECRET` | 强随机密钥（见下方生成方法） |
   | `JWT_EXPIRES_IN` | `2h` |
   | `PORT` | `3000`（Railway 会自动注入 `PORT`，此项可不填） |
   | `CORS_ORIGIN` | 你的 Vercel 域名，如 `https://shiguang.vercel.app` |
   | `APP_URL` | `https://shiguang.vercel.app` |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | 真实 SMTP（见下文"邮件服务"） |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 管理员账号（首次 seed 用） |

5. **Deploy**。部署成功后得到后端地址：`https://shiguang-production.up.railway.app`

**生成 JWT 强密钥：**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**初始化数据库（一次性）：**

Railway 的 Web 控制台（或本地终端连数据库后）执行：

```bash
cd server
DATABASE_URL="postgresql://..." npx prisma migrate deploy --schema prisma/schema.postgresql.prisma
DATABASE_URL="postgresql://..." npx prisma db seed --schema prisma/schema.postgresql.prisma
```

> 如果 migrate deploy 提示没有迁移文件，可改为 `npx prisma db push --schema prisma/schema.postgresql.prisma`（直接同步 schema，不生成迁移历史）。

### 2.4 备选：Render 部署

1. 注册 https://render.com → **New + → Web Service**
2. 连接 GitHub 仓库，Root Directory 设为 `server`
3. Build Command：`npm install && npx prisma generate --schema prisma/schema.postgresql.prisma && npm run build`
4. Start Command：`npm run start:prod`
5. 同样配置上表的环境变量（Render 自动注入 `PORT`）

---

## 3. 前端：Vercel

1. 注册 https://vercel.com （GitHub 登录）
2. **Add New → Project** → 导入仓库
3. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: 项目根目录（`/`）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - 环境变量：
     | 变量 | 值 |
     |---|---|
     | `VITE_API_BASE_URL` | 后端地址，如 `https://shiguang-production.up.railway.app` |

     > ⚠️ 注意：后端地址本身就是完整 URL（含 `https://`），因为前端不再走同域代理。若想同域部署（推荐），见下文"同域方案"。
4. **Deploy** → 完成后得到 `https://shiguang.vercel.app`

---

## 4. 邮件服务

免费方案（二选一）：

### 方案 A：Resend（推荐，免费 100 封/天）
1. 注册 https://resend.com → **API Keys** 创建密钥
2. 配置域名（或用 `onboarding@resend.dev` 测试，生产需验证自己的域名）
3. 后端环境变量：
   ```
   SMTP_HOST="smtp.resend.com"
   SMTP_PORT="465"
   SMTP_USER="resend"
   SMTP_PASS="re_xxxxxxxx"
   SMTP_FROM="拾光互助 <noreply@你的域名>"
   ```

### 方案 B：Brevo（免费 300 封/天）
1. 注册 https://www.brevo.com → SMTP & API 获取凭据
2. 类似配置 SMTP_HOST 等变量。

---

## 5. 部署后检查清单

- [ ] 打开 `https://shiguang.vercel.app`，首页正常显示
- [ ] 注册新账号 → 收到验证邮件 → 点击验证成功
- [ ] 发布一条需求 → 能看到
- [ ] 用 seed 创建的管理员账号登录 → 进入 `/admin` 后台
- [ ] 忘记密码流程走通
- [ ] 移动端访问正常（浏览器调试工具切换设备模式）

---

## 6. 同域方案（可选，更专业）

如果不想让前端和后端分离域名（避免跨域和 CORS 配置），可以：
1. 后端 Railway 服务绑定自定义域名或直接用 Railway 域名
2. Vercel 里在 `vercel.json` 配置 rewrites：

```json
{
  "rewrites": [{ "source": "/api/:path*", "destination": "https://shiguang-production.up.railway.app/api/:path*" }]
}
```

3. 此时前端不需要 `VITE_API_BASE_URL`（默认走 `/api`），CORS 也可简化。

---

## 7. 本地开发

```bash
# 终端 1：后端（SQLite）
cd server
npm install
npx prisma migrate dev        # 初始化 SQLite
npx prisma db seed            # 创建管理员
npm run start:dev

# 终端 2：前端
npm install
npm run dev
```

打开 http://localhost:5173 即可开发调试。
