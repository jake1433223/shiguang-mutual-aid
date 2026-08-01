import { Global, Module, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.$connect();
    Logger.log("✅ Prisma 已连接数据库", "PrismaModule");
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
