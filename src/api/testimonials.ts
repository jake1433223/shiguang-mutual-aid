import client from "./client";
import type { CreateTestimonialPayload, Testimonial } from "@/types/api";

export const testimonialsApi = {
  /** 列表 */
  list(): Promise<{ items: Testimonial[] }> {
    return client.get("/testimonials");
  },
  /** 创建感言 */
  create(payload: CreateTestimonialPayload): Promise<Testimonial> {
    return client.post("/testimonials", payload);
  },
};
