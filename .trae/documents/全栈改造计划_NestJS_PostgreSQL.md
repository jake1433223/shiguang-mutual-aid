# 全栈改造计划：NestJS + PostgreSQL MVP 闭环

## 摘要

将当前纯前端 mock 站点升级为真实可用的全栈应用。

- **后端**：新建 `server/` 目录，独立 `package.json`，使用 NestJS 11 + Prisma ORM + PostgreSQL 16 + JWT 认证
- **前端**：在现有 React + Vite 基础上，引入 axios + @tanstack/react-query，新增 auth store 与 API 层，将 mock 数据替换为真实 API 调用
- **功能闭环**：注册 / 登录 / 登出 / 发布需求 / 浏览筛选 / 接单 / 评论 / 个人中心 / 拾光币虚拟账户
- **部署目标**：本地开发跑通（前端 5173 + 后端 3000 + Postgres 5432），用 docker-compose 一键起 Postgres，后端和前端用 npm run dev

## 当前状态分析

### 前端已有基础

- 完整 React 18 + TypeScript + Vite + Tailwind + Framer Motion + react-router-dom 7 + Zustand
- 4 条路由：`/`（8 个 section）+ `/demands`（列表筛选）+ `/demands/:id`（详情双栏）+ `*`（404）
- mockData.ts 集中管理 12 条需求 + 4 条评价 + 8 个帮手 + 17 条评论
- 7 个文件引用 mockData：DemandFilters / DemandCard / CommentList / LatestDemands / Testimonials / DemandsPage / DemandDetailPage
- useAppStore 有 dead code（mobileMenuOpen 系列无人用），可回收为 auth 状态
- Navbar「登录」「立即加入」按钮当前都是 `href="#"` 占位
- CommentList 输入框已是 `disabled` 状态，文案「登录后即可发送」——本就等认证接入
- main.tsx 无 Provider，vite.config.ts 无 proxy，.gitignore 未忽略 .env

### 完全空白的部分

- 无 `server/` / `backend/` / `api/` 目录
- 无 `prisma/` 目录、无数据库
- 无 `.env` / `.env.example`
- 无 `docker-compose.yml`
- 无 HTTP client 封装（src/lib/utils.ts 只有 `cn()`）
- 无任何认证 UI/状态/token 处理
- 多个 section（Hero STATS / HowItWorks STEPS / Categories CATEGORIES / Rewards TIERS / Leaderboards DATA）是组件内硬编码常量，未走 mockData

## 假设与决策

1. **目录布局**：`server/` 独立子项目，自带 `package.json` + `tsconfig.json`，与前端 `package.json` 平级。前端根目录的 `tsconfig.json` 的 `include: ["src", "api"]` 中的 `api` **不再使用**（改为 server/ 子项目自管），保持 include 不动避免影响前端编译。
2. **数据库**：PostgreSQL 16，通过 docker-compose 起一个容器，端口 5432，库名 `shiguang`，用户 `shiguang` / 密码 `shiguang123`（本地开发用，非生产）。
3. **ORM**：Prisma 5，schema-first，开发期用 `prisma migrate dev`，seed 脚本复用现有 mockData 数据。
4. **认证**：JWT（access token 2h）+ bcrypt（saltRounds 10），token 存 localStorage，axios 拦截器自动注入 `Authorization: Bearer <token>`，401 时自动跳登录。
5. **API 规范**：REST + JSON，统一前缀 `/api`，统一响应包 `{ code: 0, data: T, message?: string }`，错误包 `{ code: number, message: string }`。
6. **虚拟账户**：注册送 100 拾光币，发布需求时冻结 reward 余额，完成接单后释放给帮手，双方各 +10 信用分。不做真实支付。
7. **数据请求**：前端用 @tanstack/react-query v5 管理服务端状态（缓存/重试/失效），zustand 只管 auth（user/token）和 UI 状态。
8. **类型共享**：后端 Prisma 生成的类型不直接导出给前端，前端在 `src/types/api.ts` 重新定义 DTO 类型保持解耦（后端 controller 也会用 class-validator + class-transformer 输出干净 DTO）。
9. **路由保护**：用 react-router v7 的 `<ProtectedRoute>` wrapper 组件，未登录访问受保护页面跳 `/login?from=...`。
10. **strict 不动**：前端 tsconfig `strict: false` 暂不开启，避免一次性暴露太多类型问题；后端 tsconfig 独立且开启 strict。
11. **现有 UI 不重做**：保留所有现有视觉与交互（mouse-glow / card-lift / 磁性按钮 / stagger 入场），只替换数据源。
12. **mockData 保留为 fallback**：Hero STATS / HowItWorks STEPS / Rewards TIERS / Leaderboards DATA 这些静态展示数据暂不接 API（不属于 MVP 闭环），保留硬编码。Categories 的 open/helpers 计数接 API 聚合。Testimonials 接 API（首页展示真实评价）。

## 后端架构设计

### 后端目录结构

```
server/
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   ├── seed.ts                # 用 mockData 灌种子数据
│   └── migrations/            # 由 prisma migrate dev 生成
├── src/
│   ├── main.ts                # NestJS bootstrap，监听 3000 端口，启用 CORS + 全局管道
│   ├── app.module.ts          # 根模块
│   ├── prisma/
│   │   ├── prisma.module.ts   # PrismaClient 全局 provider
│   │   └── prisma.service.ts  # 包装 PrismaClient + onModuleInit/onDestroy
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts # POST /api/auth/register, /login, /me
│   │   ├── auth.service.ts    # 注册/登录/校验逻辑
│   │   ├── jwt.strategy.ts    # Passport JWT 策略
│   │   ├── jwt-auth.guard.ts  # 路由守卫
│   │   └── dto/               # register.dto.ts / login.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts# GET /api/users/me, PATCH /api/users/me
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── demands/
│   │   ├── demands.module.ts
│   │   ├── demands.controller.ts # GET /api/demands (分页+筛选), POST, GET :id, PATCH, DELETE
│   │   ├── demands.service.ts
│   │   └── dto/               # create-demand.dto / query-demands.dto
│   ├── applications/          # 接单
│   │   ├── applications.module.ts
│   │   ├── applications.controller.ts # POST /api/demands/:id/applications, GET /api/applications/me
│   │   ├── applications.service.ts
│   │   └── dto/
│   ├── comments/
│   │   ├── comments.module.ts
│   │   ├── comments.controller.ts # GET /api/demands/:id/comments, POST
│   │   ├── comments.service.ts
│   │   └── dto/
│   ├── testimonials/
│   │   ├── testimonials.module.ts
│   │   ├── testimonials.controller.ts # GET /api/testimonials
│   │   └── testimonials.service.ts
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts # GET /api/categories (含 open/helpers 聚合计数)
│   │   └── categories.service.ts
│   └── common/
│       ├── filters/           # http-exception.filter.ts 统一错误响应
│       ├── interceptors/      # transform.interceptor.ts 统一 {code,data,message} 包
│       ├── decorators/        # @CurrentUser() 装饰器
│       └── pipes/             # (用 nest 内置 ValidationPipe 即可)
├── test/                      # e2e 测试（暂不写）
├── .env                       # DATABASE_URL / JWT_SECRET / PORT
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

### 数据库 Schema（prisma/schema.prisma）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

enum DemandCategory {
  TECH
  DESIGN
  TRANSLATE
  STUDY
  ERRAND
  OTHER
}

enum DemandStatus {
  OPEN
  IN_PROGRESS
  DONE
  CANCELLED
}

enum ApplicationStatus {
  PENDING    // 待接受
  ACCEPTED   // 已接受，进行中
  REJECTED   // 被拒绝
  COMPLETED  // 已完成
  CANCELLED  // 帮手取消
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String   // bcrypt hash
  name         String
  avatar       String   @default("U") // 首字母
  bio          String?  @default("")
  tier         Int      @default(1)   // 1/2/3
  coins        Int      @default(100) // 拾光币余额，注册送 100
  creditScore  Int      @default(0)   // 信用分
  role         UserRole @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  demands        Demand[]
  applications   Application[]
  comments       Comment[]
  testimonials   Testimonial?

  @@index([email])
}

model Demand {
  id            String         @id @default(cuid())
  title         String
  desc          String         @db.Text
  category      DemandCategory
  reward        Int            // 拾光币
  status        DemandStatus   @default(OPEN)
  tags          String[]       @default([])
  location      String?
  deadline      DateTime
  publishedAt   DateTime       @default(now())
  views         Int            @default(0)
  // 关系
  publisherId   String
  publisher     User           @relation(fields: [publisherId], references: [id], onDelete: CASCADE)
  applications  Application[]
  comments      Comment[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([category])
  @@index([status])
  @@index([publisherId])
}

model Application {
  id          String            @id @default(cuid())
  status      ApplicationStatus @default(PENDING)
  message     String?           @db.Text // 接单留言
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  demandId    String
  demand      Demand            @relation(fields: [demandId], references: [id], onDelete: CASCADE)
  helperId    String
  helper      User              @relation(fields: [helperId], references: [id], onDelete: CASCADE)

  @@unique([demandId, helperId]) // 同一需求同一帮手只能接一次
  @@index([helperId])
}

model Comment {
  id         String   @id @default(cuid())
  content    String   @db.Text
  rating     Int?     // 1-5，可选
  createdAt  DateTime @default(now())

  demandId   String
  demand     Demand   @relation(fields: [demandId], references: [id], onDelete: CASCADE)
  authorId   String
  author     User     @relation(fields: [authorId], references: [id], onDelete: CASCADE)

  @@index([demandId, createdAt])
}

model Testimonial {
  id        String   @id @default(cuid())
  content   String   @db.Text
  rating    Int      // 1-5
  createdAt DateTime @default(now())
  // 一个用户只能有一条评价
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: CASCADE)

  @@index([rating])
}
```

### API 端点清单

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/auth/register` | 公开 | 注册：email/password/name，返回 {user, token} |
| POST | `/api/auth/login` | 公开 | 登录：email/password，返回 {user, token} |
| GET | `/api/auth/me` | 必须 | 获取当前登录用户（用 token） |
| GET | `/api/users/me` | 必须 | 获取个人资料 + 余额 |
| PATCH | `/api/users/me` | 必须 | 更新 name/avatar/bio |
| GET | `/api/demands` | 公开 | 列表，支持 ?category&status&sort&keyword&page&pageSize |
| GET | `/api/demands/:id` | 公开 | 详情（含 publisher、applications 数量、comments 数量） |
| POST | `/api/demands` | 必须 | 发布需求（扣发奖励） |
| PATCH | `/api/demands/:id` | 必须（owner） | 修改自己的需求 |
| DELETE | `/api/demands/:id` | 必须（owner） | 删除需求（仅 OPEN 状态可删，退回冻结奖励） |
| POST | `/api/demands/:id/applications` | 必须 | 接单（创建 Application，状态 PENDING） |
| GET | `/api/applications/me` | 必须 | 我接的单列表 |
| PATCH | `/api/applications/:id` | 必须 | 接受/拒绝/完成（仅 demand owner 可接受/拒绝；双方可完成） |
| GET | `/api/demands/:id/comments` | 公开 | 评论列表 |
| POST | `/api/demands/:id/comments` | 必须 | 发表评论（可选 rating） |
| GET | `/api/testimonials` | 公开 | 评价列表（按 rating desc，limit=3） |
| POST | `/api/testimonials` | 必须 | 提交评价（每人一条，已存在则覆盖） |
| GET | `/api/categories` | 公开 | 6 个分类 + 每个 open/helpers 聚合计数 |

### 后端依赖清单（server/package.json）

**dependencies**：
- @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/jwt @nestjs/passport @prisma/client
- passport passport-jwt passport-local bcrypt class-validator class-transformer
- reflect-metadata rxjs

**devDependencies**：
- @nestjs/cli @nestjs/schematics @nestjs/testing
- typescript ts-node tsconfig-paths
- prisma
- @types/node @types/express @types/bcrypt @types/passport-jwt @types/passport-local
- eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
- source-map-support

### 后端关键文件清单（需新建）

1. `server/package.json`
2. `server/tsconfig.json`（strict: true, module: CommonJS, target: ES2021, emitDeclarationOnly: false）
3. `server/tsconfig.build.json`
4. `server/nest-cli.json`
5. `server/.env`（DATABASE_URL, JWT_SECRET, PORT=3000）
6. `server/.env.example`
7. `server/prisma/schema.prisma`（如上）
8. `server/prisma/seed.ts`（从 mockData.ts 灌种子，密码统一 hash `123456`）
9. `server/src/main.ts`
10. `server/src/app.module.ts`
11. `server/src/prisma/{prisma.module.ts, prisma.service.ts}`
12. `server/src/auth/{auth.module.ts, auth.controller.ts, auth.service.ts, jwt.strategy.ts, jwt-auth.guard.ts, dto/{register.dto.ts, login.dto.ts}}`
13. `server/src/users/{users.module.ts, users.controller.ts, users.service.ts, dto/update-user.dto.ts}`
14. `server/src/demands/{demands.module.ts, demands.controller.ts, demands.service.ts, dto/{create-demand.dto.ts, update-demand.dto.ts, query-demands.dto.ts}}`
15. `server/src/applications/{applications.module.ts, applications.controller.ts, applications.service.ts, dto/update-application.dto.ts}`
16. `server/src/comments/{comments.module.ts, comments.controller.ts, comments.service.ts, dto/create-comment.dto.ts}`
17. `server/src/testimonials/{testimonials.module.ts, testimonials.controller.ts, testimonials.service.ts, dto/create-testimonial.dto.ts}`
18. `server/src/categories/{categories.module.ts, categories.controller.ts, categories.service.ts}`
19. `server/src/common/filters/http-exception.filter.ts`
20. `server/src/common/interceptors/transform.interceptor.ts`
21. `server/src/common/decorators/current-user.decorator.ts`

## 前端改造设计

### 前端目录新增

```
src/
├── api/                       # 新建：API 接口层
│   ├── client.ts              # axios 实例 + 拦截器
│   ├── auth.ts                # 登录/注册/me
│   ├── demands.ts             # 需求 CRUD + 列表
│   ├── applications.ts        # 接单
│   ├── comments.ts            # 评论
│   ├── testimonials.ts        # 评价
│   ├── categories.ts          # 分类聚合
│   └── users.ts               # 个人资料
├── types/
│   └── api.ts                 # 新建：DTO 类型定义（与后端对齐）
├── hooks/
│   ├── queries/               # 新建：React Query hooks
│   │   ├── useDemands.ts
│   │   ├── useDemand.ts
│   │   ├── useComments.ts
│   │   ├── useTestimonials.ts
│   │   ├── useCategories.ts
│   │   ├── useMyDemands.ts
│   │   └── useMyApplications.ts
│   └── mutations/             # 新建：mutation hooks
│       ├── useAuth.ts
│       ├── useCreateDemand.ts
│       ├── useCreateApplication.ts
│       ├── useUpdateApplication.ts
│       └── useCreateComment.ts
├── store/
│   └── useAppStore.ts         # 改造：增加 auth slice，清理 mobileMenu dead code
├── components/
│   ├── auth/                  # 新建
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── demands/
│   │   ├── DemandCard.tsx     # 改造：DTO 字段适配
│   │   ├── DemandFilters.tsx  # 改造：枚举值大写化
│   │   ├── CommentList.tsx    # 改造：登录后启用输入框 + 提交
│   │   └── DemandForm.tsx     # 新建：发布/编辑需求表单（Modal）
│   └── layout/
│       ├── Navbar.tsx         # 改造：登录态切换显示用户头像菜单
│       └── Footer.tsx         # 不动
├── pages/
│   ├── HomePage.tsx           # 改造：LatestDemands/Testimonials/Categories 接 API
│   ├── DemandsPage.tsx        # 改造：从 useDemands hook 取数据
│   ├── DemandDetailPage.tsx   # 改造：从 useDemand + useComments 取数据，登录后显示接单按钮
│   ├── LoginPage.tsx          # 新建
│   ├── RegisterPage.tsx       # 新建
│   ├── ProfilePage.tsx        # 新建：个人中心（我发布的需求 / 我接的单 / 余额 / 信用分）
│   ├── PublishDemandPage.tsx  # 新建：发布需求（也可做成 Modal，决策：Modal 更轻）
│   └── NotFound.tsx           # 不动
└── main.tsx                   # 改造：包裹 QueryClientProvider
```

### 关键文件改造细节

#### 1. `src/api/client.ts`（新建）

axios 实例，baseURL `/api`（由 vite proxy 转发到 3000），请求拦截器从 zustand 读 token 注入 Authorization 头，响应拦截器解包 `{code,data,message}` 返回 data，401 时清空 auth + 跳 `/login`。

#### 2. `src/store/useAppStore.ts`（改造）

```ts
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (patch: Partial<User>) => void;
}
```
- 初始化时从 localStorage 读 token 和 user
- setAuth 时同步写 localStorage
- clearAuth 时清 localStorage
- 删除原 mobileMenu dead code
- 保留 leaderboardTab

#### 3. `src/types/api.ts`（新建）

与后端 Prisma 模型对齐的 DTO 类型，但字段名用 camelCase（后端响应统一返回 camelCase）：

```ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  tier: 1 | 2 | 3;
  coins: number;
  creditScore: number;
  createdAt: string;
}
export type DemandCategory = "TECH" | "DESIGN" | "TRANSLATE" | "STUDY" | "ERRAND" | "OTHER";
export type DemandStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export interface Demand {
  id: string;
  title: string;
  desc: string;
  category: DemandCategory;
  reward: number;
  status: DemandStatus;
  tags: string[];
  location?: string;
  deadline: string;
  publishedAt: string;
  views: number;
  publisher: Pick<User, "id" | "name" | "avatar" | "tier">;
  _count?: { applications: number; comments: number };
}
export interface Application { ... }
export interface Comment {
  id: string;
  content: string;
  rating?: number;
  createdAt: string;
  author: Pick<User, "id" | "name" | "avatar">;
}
export interface Testimonial {
  id: string;
  content: string;
  rating: number;
  user: Pick<User, "id" | "name" | "avatar">;
  role?: string; // 暂用 user.bio 或空
}
```

#### 4. `src/pages/DemandsPage.tsx`（改造）

- 删除对 `DEMANDS` 的直接引用
- 用 `useDemands(filter)` hook 取数据（React Query）
- filter 状态作为 queryKey 一部分，filter 变化自动重新请求
- 加载态显示骨架屏（复用 DemandCard 布局 + animate-pulse）
- 错误态显示重试按钮

#### 5. `src/pages/DemandDetailPage.tsx`（改造）

- 用 `useDemand(id)` + `useComments(id)` 取数据
- 登录态下显示「我来接住」CTA，触发 `useCreateApplication` mutation
- CommentList 输入框登录后启用，提交触发 `useCreateComment` mutation，成功后 invalidate comments query
- 已接单状态显示「你已接单，等待发布者确认」

#### 6. `src/components/sections/LatestDemands.tsx`（改造）

- 用 `useDemands({ pageSize: 6, sort: 'latest' })` 取最新 6 条
- 加载态显示 6 个骨架卡

#### 7. `src/components/sections/Testimonials.tsx`（改造）

- 用 `useTestimonials()` 取前 3 条

#### 8. `src/components/sections/Categories.tsx`（改造）

- 用 `useCategories()` 取 6 个分类 + open/helpers 聚合计数
- 其余 UI 不动

#### 9. `src/components/layout/Navbar.tsx`（改造）

- 登录态：显示用户头像 + 下拉菜单（个人中心 / 发布需求 / 登出）
- 未登录：显示「登录」「立即加入」按钮（指向 /login 和 /register）
- 「立即加入」改为 `Link to="/register"`

#### 10. `src/components/demands/CommentList.tsx`（改造）

- 接受 `demandId` prop
- 用 `useComments(demandId)` 取评论
- 登录态下输入框启用，提交触发 `useCreateComment(demandId)`
- 未登录显示「登录后即可评论」+ 跳登录链接

#### 11. `src/components/auth/ProtectedRoute.tsx`（新建）

```tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppStore(s => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
```

#### 12. `src/components/demands/DemandForm.tsx`（新建 Modal）

- 受控表单：title / desc / category / reward / deadline / tags / location
- 提交触发 `useCreateDemand` mutation
- 成功后关闭 modal + invalidate demands + 跳到新需求详情页
- 校验：reward ≤ 当前用户余额（前端预校验，后端再校验）

#### 13. `src/main.tsx`（改造）

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 }
  }
});
createRoot(...).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

#### 14. `src/App.tsx`（改造）

新增路由：
- `/login` → LoginPage
- `/register` → RegisterPage
- `/profile` → `<ProtectedRoute><ProfilePage /></ProtectedRoute>`
- `/demands/:id` 已有

#### 15. `vite.config.ts`（改造）

新增 server.proxy：
```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true }
  }
}
```

#### 16. `.gitignore`（改造）

追加：
```
.env
.env.local
.env.*.local
server/.env
server/dist
```

### 前端新增依赖（根 package.json）

**dependencies**：
- axios
- @tanstack/react-query

**devDependencies**：无新增

## 实施顺序

### 阶段 1：后端基础设施（独立可跑）

1. **创建 server/ 子项目骨架**：package.json + tsconfig.json + tsconfig.build.json + nest-cli.json + .env + .env.example
2. **安装后端依赖**：cd server && npm install
3. **写 prisma/schema.prisma**：按上面设计
4. **写 docker-compose.yml**（根目录）：起 postgres 16
5. **启动 postgres**：docker compose up -d postgres
6. **生成 prisma client + 首次迁移**：npx prisma migrate dev --name init
7. **写 prisma/seed.ts**：从 mockData 灌种子，密码统一 `123456` hash
8. **配置 seed 命令**：package.json 加 `"prisma": {"seed": "ts-node prisma/seed.ts"}`，执行 `npx prisma db seed`
9. **写 NestJS 入口与全局配置**：main.ts + app.module.ts + PrismaModule + 全局管道/过滤器/拦截器
10. **写 AuthModule**：register/login/me + JWT 策略 + guard
11. **写 UsersModule**：me / patch me
12. **写 DemandsModule**：列表/详情/创建/修改/删除
13. **写 ApplicationsModule**：接单/接受/拒绝/完成 + 我的接单列表
14. **写 CommentsModule**：列表/创建
15. **写 TestimonialsModule**：列表/创建
16. **写 CategoriesModule**：6 分类 + 聚合计数
17. **启动后端**：cd server && npm run start:dev，用 curl 测每个端点

### 阶段 2：前端基础设施

18. **前端装依赖**：npm install axios @tanstack/react-query
19. **改 vite.config.ts**：加 proxy
20. **改 .gitignore**：加 .env
21. **写 src/types/api.ts**：DTO 类型定义
22. **写 src/api/client.ts**：axios 实例 + 拦截器
23. **写 src/api/*.ts**：7 个 API 模块函数
24. **改 src/store/useAppStore.ts**：加 auth slice + 清 dead code
25. **改 src/main.tsx**：包 QueryClientProvider
26. **写 src/components/auth/ProtectedRoute.tsx**

### 阶段 3：前端页面改造

27. **写 src/hooks/queries/* 与 mutations/***：8 个 hooks
28. **改 src/components/sections/LatestDemands.tsx**：接 useDemands
29. **改 src/components/sections/Testimonials.tsx**：接 useTestimonials
30. **改 src/components/sections/Categories.tsx**：接 useCategories
31. **改 src/components/demands/DemandCard.tsx**：字段适配（category 大写、status 大写、_count.applications）
32. **改 src/components/demands/DemandFilters.tsx**：枚举值大写化
33. **改 src/pages/DemandsPage.tsx**：用 useDemands + 骨架屏
34. **改 src/components/demands/CommentList.tsx**：接 useComments + 登录态启用输入框
35. **改 src/pages/DemandDetailPage.tsx**：用 useDemand + useComments + 接单 CTA
36. **改 src/components/layout/Navbar.tsx**：登录态切换 + 用户菜单
37. **写 src/pages/LoginPage.tsx**：登录表单 + 成功后跳转
38. **写 src/pages/RegisterPage.tsx**：注册表单
39. **写 src/components/demands/DemandForm.tsx**：发布需求 Modal
40. **写 src/pages/ProfilePage.tsx**：个人中心（我发布 / 我接单 / 余额）
41. **改 src/App.tsx**：新增 /login /register /profile 路由 + ProtectedRoute

### 阶段 4：联调与验证

42. **前端类型检查**：npm run check 通过
43. **后端编译检查**：cd server && npm run build 通过
44. **启动全套**：docker compose up -d postgres + cd server && npm run start:dev + npm run dev
45. **浏览器巡检**：
    - 注册新用户 → 自动登录 → 跳首页
    - 发布需求 → 列表能看到 → 详情页能打开
    - 接单 → 个人中心能看到 → 完成接单 → 双方余额变化
    - 评论 → 详情页能看到
    - 登出 → 受保护页面跳登录
    - 404 仍然正常

## 验证步骤

1. `docker compose up -d postgres` —— Postgres 容器启动
2. `cd server && npx prisma migrate dev --name init` —— 迁移成功，生成 prisma client
3. `cd server && npx prisma db seed` —— 种子数据写入（12 需求 + 4 评价 + 8 用户）
4. `cd server && npm run start:dev` —— 后端启动在 :3000
5. `curl http://localhost:3000/api/demands` —— 返回 `{code:0, data:{items:[...], total:12}}`
6. `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"123456","name":"测试"}'` —— 返回 `{code:0, data:{user, token}}`
7. `npm run check` —— 前端类型零错误
8. `cd server && npm run build` —— 后端编译通过
9. `npm run dev` —— 前端启动在 :5173，proxy 生效
10. 浏览器 `http://localhost:5173/` —— 首页 LatestDemands 显示后端真实数据（6 条）
11. 浏览器 `/demands` —— 列表来自 API，筛选实时请求
12. 浏览器 `/demands/d001`（或种子数据的真实 cuid） —— 详情来自 API，评论区显示
13. 注册 → 登录 → 发布需求 → 列表能看到新需求
14. 接单 → ProfilePage「我接的单」能看到
15. 完成 → 双方 coins 变化（发布者 -reward，帮手 +reward +10 信用）
16. 评论 → 详情页新评论置顶
17. 登出 → `/profile` 自动跳 `/login?from=/profile`

## 不做的事

- 不做真实支付（用虚拟拾光币账户）
- 不做实时私信 / WebSocket 消息系统
- 不做管理员后台
- 不做举报 / 仲裁
- 不做文件上传（头像用首字母方案，需求描述纯文本）
- 不做邮件验证 / 短信验证 / 第三方 OAuth
- 不做生产部署 / CI/CD
- 不做单元测试与 e2e 测试（用户未要求）
- 不重做现有视觉设计（保留 mouse-glow / card-lift / 磁性按钮 / stagger）
- 不开启前端 strict mode（避免一次性类型问题）
- 不引入 SSR / Next.js / Remix
- 不改 Hero STATS / HowItWorks STEPS / Rewards TIERS / Leaderboards DATA（保留硬编码）
- 不删除 mockData.ts（作为类型来源与 fallback 保留，但组件不再直接 import DEMANDS/TESTIMONIALS）
