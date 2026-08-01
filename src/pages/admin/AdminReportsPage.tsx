import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useAdminReportsQuery,
  useResolveReportMutation,
  useDismissReportMutation,
} from "@/hooks/queries/useAdminQueries";
import { Pagination } from "@/components/admin/Pagination";
import { Modal } from "@/components/admin/Modal";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  type ReportStatus,
  type ReportTargetType,
} from "@/types/api";
import { formatRelativeTime } from "@/utils/format";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  DISMISSED: "bg-neutral-100 text-neutral-500",
};

const TARGET_LABELS: Record<ReportTargetType, string> = {
  DEMAND: "需求",
  COMMENT: "评论",
  USER: "用户",
};

export default function AdminReportsPage() {
  usePageTitle("举报管理");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"" | ReportStatus>("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<"" | ReportTargetType>("");

  const [resolveTarget, setResolveTarget] = useState<{ id: string; type: "resolve" | "dismiss"; label: string } | null>(null);
  const [resolution, setResolution] = useState("");

  const { data, isLoading } = useAdminReportsQuery({
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter || undefined,
    targetType: targetTypeFilter || undefined,
  });

  const resolveMut = useResolveReportMutation();
  const dismissMut = useDismissReportMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const onConfirm = () => {
    if (!resolveTarget) return;
    const mut = resolveTarget.type === "resolve" ? resolveMut : dismissMut;
    mut.mutate(
      { id: resolveTarget.id, payload: { resolution: resolution.trim() || undefined } },
      {
        onSuccess: () => {
          setResolveTarget(null);
          setResolution("");
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">举报管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          处理用户举报 · 受理或驳回
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部状态</option>
          <option value="PENDING">待处理</option>
          <option value="RESOLVED">已处理</option>
          <option value="DISMISSED">已驳回</option>
        </select>

        <select
          value={targetTypeFilter}
          onChange={(e) => {
            setTargetTypeFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部类型</option>
          <option value="DEMAND">需求</option>
          <option value="COMMENT">评论</option>
          <option value="USER">用户</option>
        </select>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            暂无举报
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                className="px-4 py-4 hover:bg-neutral-50/50 smooth-color"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        {REPORT_REASON_LABELS[r.reason]}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                        {TARGET_LABELS[r.targetType]}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}
                      >
                        {REPORT_STATUS_LABELS[r.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {formatRelativeTime(r.createdAt)}
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-sm text-foreground/80 mb-1">
                        {r.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      举报人：{r.reporter?.name ?? "匿名"} · {r.reporter?.email}
                    </div>
                    {r.resolution && (
                      <div className="text-xs text-muted-foreground mt-1 bg-neutral-50 rounded px-2 py-1">
                        处理结果：{r.resolution}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {r.targetType === "DEMAND" && (
                      <Link
                        to={`/demands/${r.targetId}`}
                        target="_blank"
                        className="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 smooth-color"
                        title="查看被举报对象"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    {r.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setResolveTarget({ id: r.id, type: "resolve", label: "受理举报" });
                            setResolution("");
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 smooth-color"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          受理
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResolveTarget({ id: r.id, type: "dismiss", label: "驳回举报" });
                            setResolution("");
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-500 hover:bg-neutral-100 smooth-color"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          驳回
                        </button>
                      </>
                    )}
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

      <Modal
        open={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        title={resolveTarget?.label ?? ""}
        loading={resolveMut.isPending || dismissMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setResolveTarget(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 smooth-color"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={resolveMut.isPending || dismissMut.isPending}
              className={`px-3 py-1.5 rounded-lg text-sm text-white disabled:opacity-50 smooth-color ${
                resolveTarget?.type === "resolve"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-neutral-600 hover:bg-neutral-500"
              }`}
            >
              确认
            </button>
          </>
        }
      >
        <label className="block">
          <span className="text-xs text-muted-foreground">
            处理说明（可选，将通知举报人）
          </span>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="如：已删除违规内容"
            className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white resize-none"
          />
        </label>
      </Modal>
    </div>
  );
}
