import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateReportMutation } from "@/hooks/queries/useReportsQueries";
import { useAuthStore } from "@/store/useAuthStore";
import {
  REPORT_REASON_LABELS,
  type ReportReason,
  type ReportTargetType,
} from "@/types/api";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  /** 举报目标简要描述，例如「这条需求」「该评论」「该用户」，用于 UI 文案 */
  targetLabel?: string;
}

const REASONS = Object.keys(REPORT_REASON_LABELS) as ReportReason[];

export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
  targetLabel = "该内容",
}: ReportDialogProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const createMut = useCreateReportMutation();

  const onSubmit = () => {
    setError(null);
    if (!reason) {
      setError("请选择举报原因");
      return;
    }
    if (!user) {
      navigate("/login", {
        state: { from: window.location.pathname },
      });
      return;
    }
    createMut.mutate(
      {
        reason,
        description: description.trim() || undefined,
        targetType,
        targetId,
      },
      {
        onSuccess: () => setDone(true),
        onError: (err: Error) =>
          setError(err.message || "提交失败，请稍后再试"),
      },
    );
  };

  const handleClose = () => {
    if (createMut.isPending) return;
    onClose();
    // 关闭后重置内部状态（延迟，等动画结束）
    setTimeout(() => {
      setReason("");
      setDescription("");
      setError(null);
      setDone(false);
      createMut.reset();
    }, 250);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted smooth-color"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            {done ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  举报已提交
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  感谢你的反馈，平台会尽快核实处理。处理结果将通过站内通知告知你。
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-2.5 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  完成
                </button>
              </div>
            ) : (
              <>
                {/* 头部 */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-red-100 text-red-600">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      举报{targetLabel}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      请告诉我们遇到了什么问题
                    </p>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* 原因选择 */}
                <div className="space-y-2 mb-5">
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer smooth-color ${
                        reason === r
                          ? "border-brand-500 bg-brand-50/60"
                          : "border-border hover:bg-muted/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-brand-600"
                      />
                      <span className="text-sm text-foreground">
                        {REPORT_REASON_LABELS[r]}
                      </span>
                    </label>
                  ))}
                </div>

                {/* 补充描述 */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    补充说明（可选）
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="可填写具体的违规情况，便于平台核实"
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 smooth-color resize-none"
                  />
                  <div className="text-[11px] text-muted-foreground text-right mt-1">
                    {description.length}/500
                  </div>
                </div>

                {/* 按钮 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={createMut.isPending}
                    className="flex-1 rounded-full border border-border text-foreground py-2.5 text-sm font-semibold hover:bg-muted smooth-color disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={createMut.isPending || !reason}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-red-500 text-white py-2.5 text-sm font-semibold hover:bg-red-600 smooth-color disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMut.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        提交中…
                      </>
                    ) : (
                      "提交举报"
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
