import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, Flag } from "lucide-react";
import { useCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation } from "@/hooks/queries/useCommentsQueries";
import { useAuthStore } from "@/store/useAuthStore";
import { formatRelativeTime } from "@/utils/format";
import { Link } from "react-router-dom";
import { ReportDialog } from "@/components/ReportDialog";

/* ============================================================
   小星星
   ============================================================ */
function MiniStars({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < rating
              ? "fill-brand-500 text-brand-500"
              : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ============================================================
   CommentList —— 评论区（接真实 API）
   ============================================================ */
export function CommentList({ demandId }: { demandId: string }) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useCommentsQuery(demandId);
  const createMut = useCreateCommentMutation(demandId);
  const deleteMut = useDeleteCommentMutation(demandId);

  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);

  const comments = data?.items ?? [];

  const onSubmit = () => {
    const content = text.trim();
    if (!content || !user) return;
    createMut.mutate(
      { content, rating: rating > 0 ? rating : undefined },
      {
        onSuccess: () => {
          setText("");
          setRating(0);
        },
      },
    );
  };

  return (
    <div>
      <h3 className="font-serif text-xl font-semibold text-foreground mb-5">
        {comments.length} 条评论
      </h3>

      {/* 输入框 */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-8">
        {user ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="留下你的回应或追问…"
              aria-label="评论内容"
              rows={3}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">评分（可选）</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(rating === i + 1 ? 0 : i + 1)}
                      aria-label={`${i + 1} 星`}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          i < rating
                            ? "fill-brand-500 text-brand-500"
                            : "fill-neutral-200 text-neutral-200 hover:fill-brand-200 hover:text-brand-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onSubmit}
                disabled={!text.trim() || createMut.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-4 py-1.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-500 smooth-color"
              >
                {createMut.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                发送
              </button>
            </div>
            {createMut.isError && (
              <div className="text-xs text-red-500 mt-2">
                {(createMut.error as Error).message}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">登录后即可参与评论</span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-4 py-1.5 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              去登录
            </Link>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      {isLoading ? (
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          还没有评论，成为第一个回应的人
        </div>
      ) : (
        <ul className="space-y-1">
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="flex gap-4 py-5 border-b border-border last:border-b-0"
              >
                {/* 头像 */}
                <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm font-semibold text-brand-700">
                  {c.author?.avatar ?? "U"}
                </span>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {c.author?.name ?? "匿名"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                    {c.rating ? <MiniStars rating={c.rating} /> : null}
                    <div className="ml-auto flex items-center gap-3">
                      {/* 举报按钮（非评论作者可见） */}
                      {user && c.authorId !== user.id && (
                        <button
                          type="button"
                          onClick={() => setReportCommentId(c.id)}
                          className="text-xs text-muted-foreground hover:text-red-500 smooth-color inline-flex items-center gap-1"
                        >
                          <Flag className="w-3 h-3" />
                          举报
                        </button>
                      )}
                      {/* 删除按钮（仅评论作者） */}
                      {user && c.authorId === user.id && (
                        <button
                          type="button"
                          onClick={() => deleteMut.mutate(c.id)}
                          className="text-xs text-muted-foreground hover:text-red-500 smooth-color"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* 评论举报对话框 */}
      <ReportDialog
        open={!!reportCommentId}
        onClose={() => setReportCommentId(null)}
        targetType="COMMENT"
        targetId={reportCommentId ?? ""}
        targetLabel="这条评论"
      />
    </div>
  );
}
