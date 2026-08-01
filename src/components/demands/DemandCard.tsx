import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Users, Clock, Coins } from "lucide-react";
import type { Demand, DemandStatus } from "@/types/api";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/types/api";
import { formatRelativeTime } from "@/utils/format";

/* ============================================================
   状态 → 徽章样式
   ============================================================ */
const STATUS_STYLES: Record<DemandStatus, string> = {
  OPEN: "bg-brand-50 text-brand-700 border-brand-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  DONE: "bg-neutral-100 text-neutral-500 border-neutral-200",
  CANCELLED: "bg-neutral-100 text-neutral-400 border-neutral-200",
};

/* ============================================================
   tier → 徽章样式
   ============================================================ */
const TIER_STYLES: Record<1 | 2 | 3, string> = {
  1: "bg-neutral-100 text-neutral-600",
  2: "bg-brand-100 text-brand-700",
  3: "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
};

const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: "LV.1",
  2: "LV.2",
  3: "LV.3",
};

/* ============================================================
   入场动画 variants
   ============================================================ */
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ============================================================
   DemandCard
   ============================================================ */
export function DemandCard({
  demand,
  index = 0,
}: {
  demand: Demand;
  index?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className="h-full"
    >
      <Link
        to={`/demands/${demand.id}`}
        className="group relative flex flex-col h-full bg-card rounded-2xl border border-border p-6 card-lift mouse-glow overflow-hidden"
      >
        {/* 顶部行：分类 + 状态 */}
        <div className="flex items-center justify-between gap-3 mb-4 relative">
          <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700">
            {CATEGORY_LABELS[demand.category]}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[demand.status]}`}
          >
            {STATUS_LABELS[demand.status]}
          </span>
        </div>

        {/* 标题 */}
        <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-brand-600 smooth-color line-clamp-2 leading-snug mb-2 relative">
          {demand.title}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 relative">
          {demand.desc}
        </p>

        {/* 标签 */}
        <div className="flex items-center gap-1.5 flex-wrap mb-5 relative">
          {demand.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 弹性占位 */}
        <div className="flex-1" />

        {/* 奖励（右下浮动） */}
        <div className="flex items-center justify-end gap-1.5 mb-4 relative">
          <Coins className="w-4 h-4 text-brand-500" />
          <span className="font-serif text-xl font-bold text-brand-600 tabular-nums">
            {demand.reward}
          </span>
          <span className="text-xs text-muted-foreground">拾光币</span>
        </div>

        {/* 底部分隔线 + 发布者 + 元信息 */}
        <div className="border-t border-border pt-4 flex items-center justify-between gap-3 relative">
          {/* 发布者 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm font-semibold text-brand-700">
              {demand.publisher.avatar}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {demand.publisher.name}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${TIER_STYLES[demand.publisher.tier as 1 | 2 | 3]}`}
                >
                  {TIER_LABELS[demand.publisher.tier as 1 | 2 | 3]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(demand.publishedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* 元信息 */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="inline-flex items-center gap-1" title="接单人数">
              <Users className="w-3.5 h-3.5" />
              {demand._count.applications}
            </span>
            <span className="inline-flex items-center gap-1" title="浏览数">
              <Eye className="w-3.5 h-3.5" />
              {demand.views}
            </span>
          </div>
        </div>

        {/* 装饰：右下角时钟图标（淡） */}
        <Clock className="absolute -bottom-2 -right-2 w-20 h-20 text-brand-50 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
    </motion.div>
  );
}
