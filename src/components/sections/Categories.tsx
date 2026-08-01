import { motion } from "framer-motion";
import {
  Code,
  Palette,
  Languages,
  GraduationCap,
  Bike,
  CircleHelp,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCategoriesQuery } from "@/hooks/queries/useCategoriesQuery";
import type { DemandCategory } from "@/types/api";

/* ============================================================
   分类图标映射
   ============================================================ */
const CATEGORY_ICON: Record<DemandCategory, typeof Code> = {
  TECH: Code,
  DESIGN: Palette,
  TRANSLATE: Languages,
  STUDY: GraduationCap,
  ERRAND: Bike,
  OTHER: CircleHelp,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/** 简约 hover 卡片：仅 card-lift 上浮 + mouse-glow 光晕 + 图标缩放 */
function HoverCard({ category }: { category: { key: DemandCategory; label: string; desc: string; open: number; helpers: number } }) {
  const Icon = CATEGORY_ICON[category.key];
  return (
    <motion.div variants={item}>
      <Link
        to={`/demands?category=${category.key}`}
        className="group relative bg-card rounded-2xl border border-border p-6 card-lift mouse-glow overflow-hidden h-full block"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-5 icon-scale">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1 text-foreground">{category.label}</h3>
          <p className="text-sm text-muted-foreground mb-4">{category.desc}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {category.open} 个待解决
            </span>
            <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs text-brand-700">
              {category.helpers} 位帮手
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function Categories() {
  const { data, isLoading } = useCategoriesQuery();
  const items = data?.items ?? [];

  return (
    <section id="categories" className="py-20 lg:py-28 bg-muted relative overflow-hidden">
      {/* 背景装饰 */}
      <div
        className="glow-orb animate-glow-c"
        style={{
          width: 400,
          height: 400,
          top: "20%",
          right: "-100px",
          background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700">
            需求分类
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground">
            这里都有回响
          </h2>
          <p className="text-muted-foreground mt-4">
            按分类发布与接单，每个领域都有自己的排行榜
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((c) => (
              <HoverCard key={c.key} category={c} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
