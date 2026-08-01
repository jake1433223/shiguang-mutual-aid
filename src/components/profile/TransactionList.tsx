import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { useMyTransactionsQuery } from "@/hooks/queries/useUsersQueries";
import {
  TRANSACTION_TYPE_LABELS,
  type TransactionType,
} from "@/types/api";
import { formatRelativeTime, formatDate } from "@/utils/format";

/** 类型筛选选项 */
const TYPE_OPTIONS: { value: "" | TransactionType; label: string }[] = [
  { value: "", label: "全部" },
  { value: "REGISTER_BONUS", label: "注册赠送" },
  { value: "DEMAND_FREEZE", label: "需求冻结" },
  { value: "DEMAND_REFUND", label: "需求退款" },
  { value: "DEMAND_REWARD", label: "接单奖励" },
  { value: "ADMIN_ADJUST", label: "管理员调整" },
];

export function TransactionList() {
  const [typeFilter, setTypeFilter] = useState<"" | TransactionType>("");

  const { data, isLoading } = useMyTransactionsQuery(
    typeFilter ? { type: typeFilter, pageSize: 50 } : { pageSize: 50 },
  );

  const items = data?.items ?? [];

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
          <Coins className="w-5 h-5 text-brand-500" />
          拾光币流水
          <span className="text-sm text-muted-foreground font-normal">
            ({data?.total ?? 0})
          </span>
        </h2>

        {/* 类型筛选 */}
        <div className="flex items-center gap-1 flex-wrap">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1 rounded-full text-xs smooth-color ${
                typeFilter === opt.value
                  ? "bg-brand-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-2xl border border-border py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">暂无交易记录</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {items.map((t, i) => {
                const isIncome = t.amount > 0;
                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 smooth-color"
                  >
                    {/* 图标 */}
                    <span
                      className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </span>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {TRANSACTION_TYPE_LABELS[t.type]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.remark || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(t.createdAt)} · {formatDate(t.createdAt)}
                      </p>
                    </div>

                    {/* 金额 */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-base font-bold tabular-nums ${
                          isIncome ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {isIncome ? "+" : ""}
                        {t.amount}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        余额 {t.balance}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </section>
  );
}
