import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CategoryMeta {
  key: string;
  label: string;
  desc: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "TECH", label: "技术编程", desc: "在线答疑 / 代码审查" },
  { key: "DESIGN", label: "设计创意", desc: "海报 / 配图 / 灵感" },
  { key: "TRANSLATE", label: "翻译润色", desc: "多语种互译" },
  { key: "STUDY", label: "学习辅导", desc: "课业 / 技能" },
  { key: "ERRAND", label: "生活跑腿", desc: "代取 / 代办" },
  { key: "OTHER", label: "其他求助", desc: "千奇百怪的小事" },
];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    // 并行查询每个分类的 OPEN 需求数 + 帮手数（已 COMPLETED 的不同 helperId 数）
    const items = await Promise.all(
      CATEGORIES.map(async (c) => {
        const [open, helpersAgg] = await Promise.all([
          this.prisma.demand.count({
            where: { category: c.key, status: "OPEN" },
          }),
          this.prisma.application.findMany({
            where: { demand: { category: c.key }, status: "COMPLETED" },
            select: { helperId: true },
            distinct: ["helperId"],
          }),
        ]);
        return {
          key: c.key,
          label: c.label,
          desc: c.desc,
          open,
          helpers: helpersAgg.length,
        };
      }),
    );
    return { items };
  }
}
