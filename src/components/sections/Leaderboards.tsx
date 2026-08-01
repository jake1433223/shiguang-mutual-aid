import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAppStore, type LeaderboardCategory } from "@/store/useAppStore";
import { useLeaderboardQuery } from "@/hooks/queries/useStatsQueries";
import type { DemandCategory } from "@/types/api";

const TABS: { key: LeaderboardCategory; category: DemandCategory; label: string }[] = [
  { key: "tech", category: "TECH", label: "技术编程" },
  { key: "design", category: "DESIGN", label: "设计创意" },
  { key: "translate", category: "TRANSLATE", label: "翻译润色" },
];

function rankClass(rank: number): string {
  if (rank === 1) return "rank-gold";
  if (rank === 2) return "rank-silver";
  if (rank === 3) return "rank-bronze";
  return "rank-normal";
}

export function Leaderboards() {
  const tab = useAppStore((s) => s.leaderboardTab);
  const setTab = useAppStore((s) => s.setLeaderboardTab);
  const currentTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const { data, isLoading } = useLeaderboardQuery(currentTab.category);
  const rows = data?.items ?? [];

  return (
    <section id="leaderboards" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700">
            分类排行榜
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground">
            高手被看见
          </h2>
          <p className="text-muted-foreground mt-4">
            排行榜按有效回答与有效提问综合计算
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tab 切换 */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative cursor-pointer inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "border-brand-600 text-white"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border-strong"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="lb-tab-bg"
                      className="absolute inset-0 rounded-full bg-brand-600 -z-10"
                    />
                  )}
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* 表头 */}
          <div className="hidden sm:flex items-center gap-4 px-6 py-3 text-xs font-medium text-muted-foreground tracking-wider">
            <div className="w-10 text-center">排名</div>
            <div className="flex-1">帮手</div>
            <div className="flex items-center gap-6">
              <div className="w-12 text-center">回答</div>
              <div className="w-12 text-center">提问</div>
              <div className="w-16 text-center">积分</div>
              <div className="w-5" />
            </div>
          </div>

          {/* 表体 */}
          <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border bg-card shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <div className="flex justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : rows.length === 0 ? (
                  <div className="text-center py-16 text-sm text-muted-foreground">
                    暂无上榜帮手，完成几单就能出现在这里
                  </div>
                ) : (
                  rows.map((row, i) => (
                    <motion.div
                      key={`${tab}-${row.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.4 }}
                      className="group flex items-center gap-4 px-6 py-4 smooth-color hover:bg-brand-50"
                    >
                      <div className={`rank-badge ${rankClass(row.rank)}`}>
                        {row.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-700 flex-shrink-0">
                        {row.avatar || row.name?.[0] || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{row.name}</div>
                        {row.bio && (
                          <div className="text-xs text-muted-foreground truncate">{row.bio}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="w-12 text-center font-semibold text-foreground">{row.answers}</div>
                        <div className="w-12 text-center font-semibold text-foreground">{row.questions}</div>
                        <div className="w-16 text-center font-bold text-primary tabular-nums">
                          {row.points.toLocaleString("en-US")}
                        </div>
                        <TrendingUp className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
