import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { SearchX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemandCard } from "@/components/demands/DemandCard";
import {
  DemandFilters,
  DEFAULT_FILTER,
  type FilterState,
} from "@/components/demands/DemandFilters";
import { useDemandsQuery } from "@/hooks/queries/useDemandsQueries";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { DemandCategory, DemandStatus } from "@/types/api";

/* ============================================================
   容器 & 子项动画 variants
   ============================================================ */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const PAGE_SIZE = 12;

/* ============================================================
   DemandsPage —— 需求广场
   ============================================================ */
export default function DemandsPage() {
  usePageTitle("需求广场");
  const [searchParams, setSearchParams] = useSearchParams();
  // 初始化：从 URL ?category=TECH 同步
  const [filter, setFilter] = useState<FilterState>(() => {
    const cat = searchParams.get("category") as DemandCategory | null;
    const status = searchParams.get("status") as DemandStatus | null;
    return {
      ...DEFAULT_FILTER,
      category: cat ?? DEFAULT_FILTER.category,
      status: status ?? DEFAULT_FILTER.status,
    };
  });

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  // 把 filter 同步回 URL（让 Categories 跳转后保持可分享）
  useEffect(() => {
    const next = new URLSearchParams();
    if (filter.category !== "all") next.set("category", filter.category);
    if (filter.status !== "all") next.set("status", filter.status);
    setSearchParams(next, { replace: true });
  }, [filter.category, filter.status, setSearchParams]);

  const { data, isLoading, isFetching } = useDemandsQuery({
    page: filter.page,
    pageSize: PAGE_SIZE,
    category: filter.category === "all" ? undefined : filter.category,
    status: filter.status === "all" ? undefined : filter.status,
    sort: filter.sort,
    keyword: filter.keyword.trim() || undefined,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      {/* 顶部滚动进度条 */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 inset-x-0 h-1 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 z-[60]"
      />

      <Navbar />

      <main className="bg-background">
        {/* 标题区 */}
        <section className="pt-32 pb-12 relative overflow-hidden">
          <div
            className="glow-orb animate-glow-a"
            style={{
              width: 420,
              height: 420,
              top: -100,
              left: -80,
              background:
                "radial-gradient(circle, rgba(187,247,208,0.4) 0%, transparent 70%)",
            }}
          />
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700"
            >
              需求广场
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground"
            >
              寻找你能接住的那一个
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-muted-foreground mt-4 max-w-xl"
            >
              浏览所有正在等待回响的小心愿，按分类、状态或奖励筛选属于你的那一份
            </motion.p>
          </div>
        </section>

        {/* 主体两栏布局 */}
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[280px_1fr] gap-8">
            {/* 左：筛选 */}
            <aside>
              <DemandFilters
                value={filter}
                onChange={setFilter}
                totalCount={total}
                visibleCount={items.length}
              />
            </aside>

            {/* 右：卡片网格 */}
            <div>
              {isLoading ? (
                <div className="flex justify-center py-20 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                /* 空状态 */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card rounded-2xl border border-border py-20 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                    <SearchX className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    没有匹配的需求
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    换一个关键词或筛选条件试试，或者等一等新需求冒出来
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilter({ ...DEFAULT_FILTER })}
                    className="inline-flex items-center rounded-full bg-brand-600 text-white px-5 py-2 text-sm font-semibold smooth-color hover:bg-brand-500"
                  >
                    重置筛选
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    key={`${filter.category}-${filter.status}-${filter.sort}-${filter.keyword}-${filter.page}`}
                    className={`grid sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity ${
                      isFetching ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    {items.map((demand, i) => (
                      <DemandCard key={demand.id} demand={demand} index={i} />
                    ))}
                  </motion.div>

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        type="button"
                        disabled={filter.page <= 1}
                        onClick={() =>
                          setFilter((f) => ({ ...f, page: f.page - 1 }))
                        }
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted smooth-color"
                        aria-label="上一页"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        // 只显示当前页前后 2 页
                        if (Math.abs(p - filter.page) > 2 && p !== 1 && p !== totalPages) {
                          // 显示省略号（只一次）
                          if (p === filter.page - 3 || p === filter.page + 3) {
                            return <span key={p} className="text-muted-foreground text-sm">…</span>;
                          }
                          return null;
                        }
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFilter((f) => ({ ...f, page: p }))}
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold border smooth-color ${
                              p === filter.page
                                ? "bg-brand-600 text-white border-brand-600"
                                : "border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={filter.page >= totalPages}
                        onClick={() =>
                          setFilter((f) => ({ ...f, page: f.page + 1 }))
                        }
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted smooth-color"
                        aria-label="下一页"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
