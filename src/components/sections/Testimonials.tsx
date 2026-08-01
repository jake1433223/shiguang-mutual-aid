import { motion } from "framer-motion";
import { Star, Quote, Loader2 } from "lucide-react";
import { useTestimonialsQuery } from "@/hooks/queries/useTestimonialsQueries";

/* ============================================================
   容器 & 子项动画 variants
   ============================================================ */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ============================================================
   星级渲染
   ============================================================ */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-brand-500 text-brand-500"
              : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Testimonials —— 用户评价区块
   ============================================================ */
export function Testimonials() {
  const { data, isLoading } = useTestimonialsQuery();
  // 只渲染前 3 条保持网格整齐
  const items = (data?.items ?? []).slice(0, 3);

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 bg-muted relative overflow-hidden"
    >
      {/* 背景装饰光斑 */}
      <div
        className="glow-orb animate-glow-c"
        style={{
          width: 380,
          height: 380,
          bottom: "10%",
          left: "-80px",
          background: "radial-gradient(circle, rgba(220,252,231,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700">
            用户评价
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground">
            他们说，被接住的感觉
          </h2>
          <p className="text-muted-foreground mt-4">
            真实的拾光故事，关于温度，关于回应，关于彼此的小小确幸
          </p>
        </motion.div>

        {/* 评价卡片网格 */}
        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无评价
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((t) => (
              <motion.div
                key={t.id}
                variants={itemVariants}
                className="relative bg-card rounded-2xl border border-border p-7 card-lift overflow-hidden"
              >
                {/* 引号装饰 */}
                <Quote className="absolute top-5 right-5 w-10 h-10 text-brand-200 pointer-events-none" />

                {/* 星级 */}
                <div className="mb-4 relative">
                  <Stars rating={t.rating} />
                </div>

                {/* 评价内容 */}
                <p className="text-foreground/80 leading-relaxed text-[15px] mb-6 relative">
                  {t.content}
                </p>

                {/* 分隔线 */}
                <div className="border-t border-border pt-4 flex items-center gap-3 relative">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-base font-semibold text-brand-700">
                    {t.user?.avatar ?? "U"}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {t.user?.name ?? "匿名用户"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.user?.bio || "拾光伙伴"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
