import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // SQLite 连接很轻，无需额外配置
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
