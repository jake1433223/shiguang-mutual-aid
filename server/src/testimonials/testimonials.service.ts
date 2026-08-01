import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTestimonialDto } from "./dto/testimonial.dto";

function formatTestimonial(t: any) {
  return {
    id: t.id,
    content: t.content,
    rating: t.rating,
    createdAt: t.createdAt.toISOString(),
    userId: t.userId,
    user: t.user
      ? { id: t.user.id, name: t.user.name, avatar: t.user.avatar, bio: t.user.bio, tier: t.user.tier }
      : null,
  };
}

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true, bio: true, tier: true } },
      },
    });
    return { items: items.map(formatTestimonial) };
  }

  async create(userId: string, dto: CreateTestimonialDto) {
    const exists = await this.prisma.testimonial.findUnique({ where: { userId } });
    if (exists) throw new ConflictException("已提交过感言，每位用户仅可提交一条");

    const t = await this.prisma.testimonial.create({
      data: {
        content: dto.content,
        rating: dto.rating,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, bio: true, tier: true } },
      },
    });
    return formatTestimonial(t);
  }
}
