import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, Trash2, AlertTriangle, Star } from "lucide-react";
import {
  useAdminCommentsQuery,
  useDeleteCommentMutation,
} from "@/hooks/queries/useAdminQueries";
import { Pagination } from "@/components/admin/Pagination";
import { Modal } from "@/components/admin/Modal";
import { formatRelativeTime } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AdminCommentsPage() {
  usePageTitle("评论管理");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; content: string } | null>(null);

  const { data, isLoading } = useAdminCommentsQuery({
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
  });

  const deleteMut = useDeleteCommentMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const onSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">评论管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          审查与删除平台所有评论
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
              placeholder="搜索评论内容"
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
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            暂无评论
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                className="px-4 py-4 hover:bg-neutral-50/50 smooth-color"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                    {c.author?.avatar ?? "U"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {c.author?.name ?? "匿名"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.author?.email}
                      </span>
                      {c.rating ? (
                        <span className="inline-flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${
                                idx < c.rating!
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-neutral-200 text-neutral-200"
                              }`}
                            />
                          ))}
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        · {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-1">
                      {c.content}
                    </p>
                    {c.demand && (
                      <Link
                        to={`/demands/${c.demand.id}`}
                        target="_blank"
                        className="text-xs text-brand-600 hover:underline"
                      >
                        所属需求：{c.demand.title}
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: c.id, content: c.content })
                    }
                    className="p-1.5 rounded text-red-500 hover:bg-red-50 smooth-color shrink-0"
                    title="删除评论"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="删除评论"
        loading={deleteMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 smooth-color"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deleteMut.isPending}
              className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 smooth-color"
            >
              确认删除
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-neutral-700 bg-red-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>删除后无法恢复，将通知评论作者。</span>
            </div>
            <div className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              {deleteTarget.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
