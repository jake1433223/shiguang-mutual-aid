import { IsInt, IsString, Max, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateTestimonialDto {
  @IsString()
  @MaxLength(500)
  content!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
