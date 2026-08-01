import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, Eye, AlertTriangle } from "lucide-react";
import {
  useAdminDemandsQuery,
  useTakeDownDemandMutation,
  useRestoreDemandMutation,
} from "@/hooks/queries/useAdminQueries";
import { Pagination } from "@/components/admin/Pagination";
import { Modal } from "@/components/admin/Modal";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/types/api";
import { formatRelativeTime, formatDate } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AdminDemandsPage() {
  usePageTitle("需求管理");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [takenDownFilter, setTakenDownFilter] = useState<"" | "true" | "false">("");

  const [takeDownTarget, setTakeDownTarget] = useState<{ id: string; title: string } | null>(null);
  const [takeDownReason, setTakeDownReason] = useState("");

  const { data, isLoading } = useAdminDemandsQuery({
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    status: statusFilter || undefined,
    takenDown: takenDownFilter || undefined,
  });

  const takeDownMut = useTakeDownDemandMutation();
  const restoreMut = useRestoreDemandMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const onSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const onConfirmTakeDown = () => {
    if (!takeDownTarget || !takeDownReason.trim()) return;
    takeDownMut.mutate(
      { id: takeDownTarget.id, payload: { reason: takeDownReason.trim() } },
      { onSuccess: () => setTakeDownTarget(null) },
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">需求管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理平台所有需求 · 下架/恢复
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="搜索需求标题或描述"
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={onSearch}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 smooth-color"
          >
            搜索
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部状态</option>
          <option value="OPEN">招募中</option>
          <option value="IN_PROGRESS">进行中</option>
          <option value="DONE">已完成</option>
          <option value="CANCELLED">已取消</option>
        </select>

        <select
          value={takenDownFilter}
          onChange={(e) => {
            setTakenDownFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部</option>
          <option value="false">正常</option>
          <option value="true">已下架</option>
        </select>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            暂无需求
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">需求</th>
                  <th className="text-left px-4 py-3 font-medium">分类</th>
                  <th className="text-left px-4 py-3 font-medium">奖励</th>
                  <th className="text-left px-4 py-3 font-medium">状态</th>
                  <th className="text-left px-4 py-3 font-medium">发布者</th>
                  <th className="text-left px-4 py-3 font-medium">申请/评论</th>
                  <th className="text-left px-4 py-3 font-medium">发布时间</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                    className="hover:bg-neutral-50/50 smooth-color"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[240px]">
                            {d.title}
                            {d.takenDownAt && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-medium align-middle">
                                已下架
                              </span>
                            )}
                          </div>
                          {d.takenDownAt && d.takeDownReason && (
                            <div className="text-xs text-red-500 truncate max-w-[240px] mt-0.5">
                              原因：{d.takeDownReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[d.category]}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium text-amber-600">
                      {d.reward}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                        {STATUS_LABELS[d.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="text-foreground truncate max-w-[120px]">
                          {d.publisher.name}
                        </div>
                        <div className="text-muted-foreground truncate max-w-[120px]">
                          {d.publisher.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {d._count.applications} / {d._count.comments}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>{formatRelativeTime(d.publishedAt)}</div>
                      <div className="text-[10px]">{formatDate(d.publishedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/demands/${d.id}`}
                          target="_blank"
                          className="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 smooth-color"
                          title="查看"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {d.takenDownAt ? (
                          <button
                            type="button"
                            onClick={() => restoreMut.mutate(d.id)}
                            disabled={restoreMut.isPending}
                            className="px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 smooth-color"
                          >
                            恢复
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTakeDownTarget({ id: d.id, title: d.title });
                              setTakeDownReason("");
                            }}
                            className="px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50 smooth-color"
                          >
                            下架
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
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
        open={!!takeDownTarget}
        onClose={() => setTakeDownTarget(null)}
        title="下架需求"
        loading={takeDownMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setTakeDownTarget(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 smooth-color"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirmTakeDown}
              disabled={!takeDownReason.trim() || takeDownMut.isPending}
              className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 smooth-color"
            >
              确认下架
            </button>
          </>
        }
      >
        {takeDownTarget && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-neutral-700 bg-red-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                即将下架需求 <strong>{takeDownTarget.title}</strong>，下架后前台不再展示。
              </span>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">下架原因</span>
              <textarea
                value={takeDownReason}
                onChange={(e) => setTakeDownReason(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="请填写下架原因，将通知发布者"
                className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white resize-none"
              />
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
