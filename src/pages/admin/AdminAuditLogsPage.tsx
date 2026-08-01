import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import { Loader2, ScrollText } from "lucide-react";
import { useAdminAuditLogsQuery } from "@/hooks/queries/useAdminQueries";
import { Pagination } from "@/components/admin/Pagination";
import { formatRelativeTime, formatDate } from "@/utils/format";

const PAGE_SIZE = 20;

const ACTION_LABELS: Record<string, string> = {
  USER_BAN: "封禁用户",
  USER_UNBAN: "解禁用户",
  USER_COIN_ADJUST: "调整拾光币",
  USER_CREDIT_ADJUST: "调整信用分",
  DEMAND_TAKE_DOWN: "下架需求",
  DEMAND_RESTORE: "恢复需求",
  COMMENT_DELETE: "删除评论",
  REPORT_RESOLVE: "受理举报",
  REPORT_DISMISS: "驳回举报",
};

const ACTION_COLORS: Record<string, string> = {
  USER_BAN: "bg-red-50 text-red-700",
  USER_UNBAN: "bg-emerald-50 text-emerald-700",
  USER_COIN_ADJUST: "bg-amber-50 text-amber-700",
  USER_CREDIT_ADJUST: "bg-sky-50 text-sky-700",
  DEMAND_TAKE_DOWN: "bg-red-50 text-red-700",
  DEMAND_RESTORE: "bg-emerald-50 text-emerald-700",
  COMMENT_DELETE: "bg-red-50 text-red-700",
  REPORT_RESOLVE: "bg-emerald-50 text-emerald-700",
  REPORT_DISMISS: "bg-neutral-100 text-neutral-600",
};

function formatDetail(detail: string | null): string {
  if (!detail) return "—";
  try {
    const obj = JSON.parse(detail);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return detail;
  }
}

export default function AdminAuditLogsPage() {
  usePageTitle("审计日志");
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useAdminAuditLogsQuery({
    page,
    pageSize: PAGE_SIZE,
    action: actionFilter || undefined,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">审计日志</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理员所有操作记录 · 不可篡改
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部操作</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <ScrollText className="w-8 h-8 text-neutral-300" />
            暂无审计日志
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((log, i) => (
              <motion.li
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                className="px-4 py-3 hover:bg-neutral-50/50 smooth-color"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ACTION_COLORS[log.action] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {log.targetType && (
                        <span className="text-xs text-muted-foreground">
                          目标：{log.targetType}
                          {log.targetId && ` #${log.targetId.slice(-8)}`}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        · {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/70 font-mono break-all">
                      {formatDetail(log.detail)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>操作人：{log.admin?.name ?? "—"}</span>
                      {log.ip && <span>IP：{log.ip}</span>}
                      <span className="hidden sm:inline">{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}

        <div className="px-4 py-3 border-t border-neutral-100">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
