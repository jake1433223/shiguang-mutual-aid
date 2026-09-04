# 阿里云部署方案（拾光互助）

本目录用于在阿里云 ECS（或任意有 Docker 的 Linux 服务器）上一键部署完整全栈。

## 1. 推荐资源（省钱方案）

| 资源 | 建议 | 费用 |
|---|---|---|
| ECS/轻量服务器 | 2核2G，Ubuntu/CentOS，带宽 3-5M | 新用户常有低价/试用活动，长期正式用建议选包年 |
| 数据库 | 用 Docker 在本机跑 PostgreSQL，或用阿里云 RDS PostgreSQL | 本机跑省数据库费用；RDS 更稳 |
| 域名 | 可选，有域名可做 HTTPS | 域名另购 |
| 证书 | 阿里云免费 SSL 证书 | 0 元 |

> 阿里云不是长期完全免费；新用户一般有免费试用/低价套餐。如果不想付费，继续用现在的 Vercel + Railway 即可。

## 2. 目录说明

```
deploy/aliyun/
├── docker-compose.yml        # 一键编排 db + backend + frontend
├── Dockerfile.backend        # NestJS 后端镜像
├── Dockerfile.frontend       # 前端构建 + Nginx 镜像
├── nginx.conf                # 静态文件 + /api 反向代理
└── .env.example              # 环境变量模板
```

## 3. 部署步骤

### 3.1 准备服务器

1. 购买/开通一台阿里云 ECS 或轻量应用服务器
2. 安全组放行 80 / 443（以及临时 SSH 22）
3. 安装 Docker 和 Docker Compose

```bash
# Ubuntu/Debian 示例
curl -fsSL https://get.docker.com | bash
sudo systemctl enable --now docker
sudo apt install -y docker-compose-plugin
```

### 3.2 上传代码到服务器

任选：

```bash
git clone https://github.com/jake1433223/shiguang-mutual-aid.git
cd shiguang-mutual-aid/deploy/aliyun
```

### 3.3 配置环境变量并启动

```bash
cp .env.example .env
vim .env
docker compose up -d --build
```

初始化管理员（首次执行一次）：

```bash
docker compose exec backend \
  npx prisma db seed --schema prisma/schema.postgresql.prisma
```

### 3.4 验证

```bash
curl http://服务器IP/health
curl http://服务器IP/api/stats/overview
```

浏览器访问：`http://服务器IP`

## 4. 接入支付宝 / 微信支付

代码已预留 `server/src/recharge/payment.ts`，正式接入时：

1. 在支付宝开放平台/微信支付商户平台创建应用
2. 在 `server/.env` 填入 `ALIPAY_*` / `WECHAT_PAY_*`
3. 实现 `AlipayProvider` / `WechatPayProvider`
4. 增加支付回调接口，回调确认后调用现有 `recharge` 到账逻辑

## 5. 需要你提供的授权

- **方式 A：阿里云 AccessKey**
  - RAM 用户 + 最小权限（ECS、OSS 等）
  - 给我 `AccessKey ID` / `AccessKey Secret`
- **方式 B：ECS SSH**
  - 公网 IP
  - 用户名 + 密码或 SSH 私钥
- **方式 C：你自己在服务器上粘贴命令**
  - 我提供命令，你执行并反馈

拿到任意一种后，我就可以继续自动/远程部署。
