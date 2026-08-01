/**
 * Prisma seed 脚本
 *
 * 生产/运营模式：只创建一个管理员账号，不灌任何示例数据。
 * 管理员账号信息：
 *   - 邮箱：通过 ADMIN_EMAIL 环境变量配置，默认 admin@shiguang.dev
 *   - 密码：通过 ADMIN_PASSWORD 环境变量配置，默认 Admin@2026
 *
 * 首次启动后请立即登录管理员后台修改密码。
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 初始化运营数据库...");

  // 清空所有数据（按依赖顺序，包含运营表）
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ 已清空所有旧数据");

  // 创建管理员账号
  const adminEmail = process.env.ADMIN_EMAIL || "admin@shiguang.dev";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: passwordHash,
      name: "系统管理员",
      avatar: "管",
      bio: "平台管理员",
      role: "ADMIN",
      emailVerified: new Date(),
      coins: 0,
      creditScore: 100,
      tier: 3,
    },
  });

  console.log(`✅ 已创建管理员账号：${admin.email}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("管理员登录信息（请尽快修改密码）：");
  console.log(`  邮箱：${adminEmail}`);
  console.log(`  密码：${adminPassword}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🎉 数据库初始化完成！现在可以接待真实用户注册。");
}

main()
  .catch((e) => {
    console.error("❌ 初始化失败：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
