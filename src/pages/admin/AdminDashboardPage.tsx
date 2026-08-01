import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Users as UsersIcon,
  FileText,
  MessageSquare,
  Flag,
  Coins,
  Activity,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAdminStatsQuery } from "@/hooks/queries/useAdminQueries";

const STATS = [
  {
    key: "users" as const,
    label: "注册用户",
    icon: UsersIcon,
    color: "from-brand-500 to-brand-700",
    bg: "bg-brand-50",
    text: "text-brand-600",
  },
  {
    key: "openDemands" as const,
    label: "招募中需求",
    icon: FileText,
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    key: "applications" as const,
    label: "接单申请",
    icon: Activity,
    color: "from-sky-500 to-sky-600",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },
  {
    key: "comments" as const,
    label: "评论数",
    icon: MessageSquare,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    key: "pendingReports" as const,
    label: "待处理举报",
    icon: Flag,
    color: "from-red-500 to-red-600",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  {
    key: "transactions" as const,
    label: "交易流水",
    icon: Coins,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "coinsInCirculation" as const,
    label: "流通拾光币",
    icon: TrendingUp,
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    text: "text-teal-600",
  },
  {
    key: "demands" as const,
    label: "需求总数",
    icon: CheckCircle2,
    color: "from-slate-500 to-slate-600",
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
];

export default function AdminDashboardPage() {
  usePageTitle("管理后台");
  const { data: stats, isLoading } = useAdminStatsQuery();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          数据看板
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          平台运营概览 · 数据每分钟自动刷新
        </p>
      </div>

      {isLoading && !stats ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : stats ? (
        <>
          {/* 指标卡 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-sm smooth-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center mb-3`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {stats[s.key].toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 趋势卡 */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.32 }}
              className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl border border-brand-200 p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <UsersIcon className="w-5 h-5 text-brand-600" />
                <span className="text-sm font-semibold text-brand-700">
                  近 7 天新增用户
                </span>
              </div>
              <div className="text-3xl font-bold text-brand-800 tabular-nums">
                {stats.recent7dUsers}
              </div>
              <div className="text-xs text-brand-600 mt-1">
                占总用户 {stats.users > 0
                  ? ((stats.recent7dUsers / stats.users) * 100).toFixed(1)
                  : "0.0"}
                %
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.36 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  近 7 天新增需求
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-800 tabular-nums">
                {stats.recent7dDemands}
              </div>
              <div className="text-xs text-amber-600 mt-1">
                占总需求 {stats.demands > 0
                  ? ((stats.recent7dDemands / stats.demands) * 100).toFixed(1)
                  : "0.0"}
                %
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </div>
  );
}
