import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Loader2,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from "@/hooks/queries/useNotificationsQueries";
import { useMagnetic } from "@/hooks/useMagnetic";
import { NOTIFICATION_TYPE_LABELS, type NotificationType } from "@/types/api";

function NotifIcon({ type }: { type: NotificationType }) {
  // 用一个彩色小圆点替代图标，避免每个类型都要 icon
  const colorMap: Record<NotificationType, string> = {
    APPLICATION_ACCEPTED: "bg-emerald-500",
    APPLICATION_REJECTED: "bg-red-500",
    DEMAND_COMPLETED: "bg-brand-500",
    COMMENT_POSTED: "bg-blue-500",
    SYSTEM: "bg-amber-500",
    REPORT_RESOLVED: "bg-purple-500",
    COIN_ADJUSTED: "bg-yellow-500",
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${colorMap[type]} bg-opacity-15 text-foreground shrink-0`}
    >
      <span className={`w-2 h-2 rounded-full ${colorMap[type]}`} />
    </span>
  );
}

function NotificationsPageInner() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data, isLoading, isFetching } = useNotificationsQuery({
    unreadOnly: filter === "unread",
    page: 1,
    pageSize: 50,
  });
  const markAllMut = useMarkAllReadMutation();
  const markReadMut = useMarkReadMutation();
  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-3xl mx-auto w-full px-6">
          {/* 返回 */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth-color mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-brand-100 text-brand-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  我的通知
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unreadCount > 0
                    ? `你有 ${unreadCount} 条未读通知`
                    : "全部通知已读"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                ref={magneticRef}
                type="button"
                onClick={() => markAllMut.mutate()}
                disabled={markAllMut.isPending}
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground smooth-color hover:bg-muted disabled:opacity-60"
              >
                {markAllMut.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                全部已读
              </button>
            )}
          </div>

          {/* 过滤器 */}
          <div className="flex items-center gap-1 mb-6 p-1 bg-card rounded-full border border-border w-fit">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium smooth-color ${
                filter === "all"
                  ? "bg-brand-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              全部
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium smooth-color ${
                filter === "unread"
                  ? "bg-brand-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              未读
              {unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* 列表 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              加载中…
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-muted text-muted-foreground mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {filter === "unread" ? "没有未读通知" : "暂无通知"}
              </p>
              <p className="text-xs text-muted-foreground">
                {filter === "unread"
                  ? "所有通知都已读过啦"
                  : "发布需求或接单后，相关动态会在这里显示"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 },
                },
              }}
              className="space-y-2"
            >
              {items.map((n) => {
                const inner = (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className={`flex items-start gap-3 rounded-2xl border p-4 smooth-color ${
                      !n.read
                        ? "bg-brand-50/40 border-brand-200"
                        : "bg-card border-border"
                    } hover:shadow-sm`}
                  >
                    <NotifIcon type={n.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {NOTIFICATION_TYPE_LABELS[n.type]}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60">
                          {new Date(n.createdAt).toLocaleString("zh-CN", {
                            hour12: false,
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!n.read && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-brand-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            新
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-foreground mb-0.5">
                        {n.title}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {n.content}
                      </div>
                    </div>
                  </motion.div>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link} className="block">
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.read) markReadMut.mutate(n.id);
                    }}
                    className="block w-full text-left"
                  >
                    {inner}
                  </button>
                );
              })}
            </motion.div>
          )}
          {isFetching && !isLoading && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              正在刷新…
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function NotificationsPage() {
  usePageTitle("通知");
  return (
    <ProtectedRoute>
      <NotificationsPageInner />
    </ProtectedRoute>
  );
}
