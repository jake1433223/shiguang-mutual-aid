import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthedUser } from "../common/decorators/current-user.decorator";
import { CommentsService } from "./comments.service";
import { CreateCommentDto, QueryCommentsDto } from "./dto/comment.dto";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get("demand/:demandId")
  list(@Param("demandId") demandId: string, @Query() query: QueryCommentsDto) {
    return this.commentsService.list(demandId, query);
  }

  @Post("demand/:demandId")
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthedUser,
    @Param("demandId") demandId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, demandId, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.commentsService.remove(user.id, id);
  }
}
