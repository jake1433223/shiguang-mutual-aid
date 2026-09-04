import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRechargeDto, RechargePackageId } from "./dto/recharge.dto";

export interface RechargePackage {
  id: RechargePackageId;
  name: string;
  coins: number;
  /** 价格，单位：分 */
  price: number;
  bonus: number;
  desc: string;
  badge?: string;
}

export const RECHARGE_PACKAGES: RechargePackage[] = [
  { id: "tiny", name: "体验包", coins: 100, price: 600, bonus: 0, desc: "适合新手试发小需求" },
  { id: "basic", name: "标准包", coins: 600, price: 3000, bonus: 0, desc: "满足日常互助需求" },
  { id: "pro", name: "进阶包", coins: 1500, price: 6800, bonus: 100, desc: "额外赠送 100 币", badge: "热卖" },
  { id: "max", name: "超值包", coins: 3000, price: 12800, bonus: 300, desc: "额外赠送 300 币", badge: "最划算" },
];

@Injectable()
export class RechargeService {
  constructor(private readonly prisma: PrismaService) {}

  packages() {
    return RECHARGE_PACKAGES.map((p) => ({
      ...p,
      totalCoins: p.coins + p.bonus,
    }));
  }

  /**
   * 模拟支付确认充值。
   * 正式环境应改为：创建支付单 -> 跳转支付宝/微信 -> 异步回调中调用本确认逻辑。
   */
  async recharge(userId: string, dto: CreateRechargeDto) {
    const pkg = RECHARGE_PACKAGES.find((p) => p.id === dto.packageId);
    if (!pkg) throw new NotFoundException("充值套餐不存在");

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");
    if (user.bannedAt) throw new BadRequestException("账号已被封禁，无法充值");

    const amount = pkg.coins + pkg.bonus;
    const newBalance = user.coins + amount;

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } },
        select: { id: true, email: true, name: true, avatar: true, bio: true, tier: true, coins: true, creditScore: true, role: true, emailVerified: true, bannedAt: true, banReason: true, createdAt: true, updatedAt: true },
      });
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount,
          balance: newBalance,
          type: "RECHARGE",
          refType: "RECHARGE",
          remark: `充值 ${pkg.name}：到账 ${amount} 拾光币`,
        },
      });
      return { updated, transaction };
    });

    return {
      orderId: result.transaction.id,
      amount,
      price: pkg.price,
      method: dto.method ?? "MOCK",
      paidAt: new Date().toISOString(),
      user: result.updated,
      transaction: result.transaction,
    };
  }
}
