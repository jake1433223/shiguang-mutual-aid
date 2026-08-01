# 拾光互助

> 让每一刻空闲都有价值 —— 发布你的小需求，或用碎片时间帮别人一个忙。

拾光互助是一个校园/社区互助平台：用户可以发布小需求（求助、跑腿、翻译、学习辅导等），或申请帮助他人，通过"拾光币"激励体系运转。

## 功能特性

- 🔐 完整认证：注册 / 登录 / 邮箱验证 / 忘记密码 / 重置密码
- 📋 需求广场：发布、筛选（分类 / 状态 / 排序）、搜索、分页
- 🤝 申请与接单：申请帮助、发布者接受/拒绝、完成评价
- 💰 拾光币经济：注册赠送、发布冻结、完成奖励、流水记录
- ⭐ 用户体系：信用分、等级（Tier）、排行榜、成就
- 🛡️ 安全运营：举报系统、封禁管理、审计日志、全局限流
- 📢 站内通知：申请状态变化、评论、系统消息
- 🧑‍💼 管理后台：用户 / 需求 / 评论 / 举报 / 审计 / 统计大盘
- 📧 邮件服务：验证与重置邮件（SMTP 可配置）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 · TypeScript · Vite · TailwindCSS · React Router 7 · TanStack Query · Zustand · Framer Motion |
| 后端 | NestJS 11 · Prisma ORM · Passport JWT · class-validator · Helmet · Throttler |
| 数据库 | SQLite（开发） / PostgreSQL（生产） |

## 本地开发

### 前置要求

- Node.js ≥ 18

### 1. 后端

```bash
cd server
npm install
npx prisma migrate dev        # 初始化 SQLite 数据库
npx prisma db seed            # 创建管理员账号
npm run start:dev             # http://localhost:3000
```

### 2. 前端

```bash
npm install
npm run dev                   # http://localhost:5173（自动代理 /api → 3000）
```

### 管理员账号

seed 后默认创建（请登录后台后立即修改密码）：

- 邮箱：`admin@shiguang.dev`
- 密码：`Admin@2026`

可在 `server/.env` 中通过 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 修改。

## 生产部署

完整免费部署指南（Vercel + Railway + Neon）见 **[DEPLOYMENT.md](./DEPLOYMENT.md)**。

关键步骤：

1. **数据库**：Neon 创建免费 PostgreSQL，拿到连接串
2. **后端**：Railway/Render 部署 `server/`，配置环境变量（含强 `JWT_SECRET`），执行 `prisma migrate deploy --schema prisma/schema.postgresql.prisma` + seed
3. **前端**：Vercel 部署，配置 `VITE_API_BASE_URL` 指向后端
4. **邮件**：配置真实 SMTP（Resend / Brevo）

### 生产环境变量（`server/.env` 或平台 Variables）

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 连接串（生产） |
| `JWT_SECRET` | 强随机密钥（≥32 字符，生产必填，默认值会拒绝启动） |
| `CORS_ORIGIN` | 允许的前端来源，多个用逗号分隔 |
| `APP_URL` | 前端地址（拼验证/重置链接） |
| `SMTP_HOST/PORT/USER/PASS/FROM` | 真实 SMTP 配置 |

## 项目结构

```
├── src/                  # 前端
│   ├── api/              # API 客户端（axios 封装）
│   ├── components/       # 组件（layout / sections / demands / admin / profile）
│   ├── hooks/            # 自定义 hooks（含 React Query 封装）
│   ├── pages/            # 页面（含 admin 后台）
│   ├── store/            # Zustand 状态
│   ├── types/            # 类型定义
│   └── utils/            # 工具函数
├── server/               # 后端（NestJS）
│   ├── prisma/           # schema（sqlite + postgresql）+ seed
│   └── src/              # 模块：auth/users/demands/applications/comments/
│                         #        reports/notifications/admin/stats/mail...
└── public/               # 静态资源（favicon、robots、sitemap）
```

## 安全说明

- 密码 bcrypt 哈希存储；JWT 短时效（2h）
- 认证接口限流（10 次/分钟），全局限流 60 次/分钟
- 邮箱验证 token 一次性、30 分钟过期
- 生产环境强制校验 `JWT_SECRET` 强度，防止默认密钥上线
- Helmet 安全头、CORS 白名单、class-validator 白名单过滤

## License

MIT
