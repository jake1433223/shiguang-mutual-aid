import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthedUser } from "../common/decorators/current-user.decorator";
import { TestimonialsService } from "./testimonials.service";
import { CreateTestimonialDto } from "./dto/testimonial.dto";

@Controller("testimonials")
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  list() {
    return this.testimonialsService.list();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(user.id, dto);
  }
}
