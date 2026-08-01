import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateCommentDto, QueryCommentsDto } from "./dto/comment.dto";

function formatComment(c: any) {
  return {
    id: c.id,
    content: c.content,
    rating: c.rating,
    createdAt: c.createdAt.toISOString(),
    demandId: c.demandId,
    authorId: c.authorId,
    author: c.author
      ? { id: c.author.id, name: c.author.name, avatar: c.author.avatar, tier: c.author.tier }
      : null,
  };
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(demandId: string, query: QueryCommentsDto) {
    const { page = 1, pageSize = 50 } = query;
    const where = { demandId };
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, name: true, avatar: true, tier: true } },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return { items: items.map(formatComment), total, page, pageSize };
  }

  async create(authorId: string, demandId: string, dto: CreateCommentDto) {
    const demand = await this.prisma.demand.findUnique({ where: { id: demandId } });
    if (!demand) throw new NotFoundException("需求不存在");

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        rating: dto.rating ?? null,
        demandId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, tier: true } },
      },
    });

    // 通知需求发布者（评论人不是发布者时才通知）
    if (demand.publisherId !== authorId) {
      this.notificationsService.notifyCommentPosted({
        publisherId: demand.publisherId,
        authorName: comment.author?.name ?? "匿名用户",
        demandTitle: demand.title,
        demandId,
      });
    }

    return formatComment(comment);
  }

  async remove(authorId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException("评论不存在");
    if (comment.authorId !== authorId) {
      throw new NotFoundException("评论不存在");
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { id: commentId };
  }
}
