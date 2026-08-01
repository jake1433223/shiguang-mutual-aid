import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ChevronRight,
  Eye,
  Users,
  Clock,
  Calendar,
  MapPin,
  Coins,
  ShieldCheck,
  ArrowLeft,
  HandHeart,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommentList } from "@/components/demands/CommentList";
import { ReportDialog } from "@/components/ReportDialog";
import { useDemandQuery } from "@/hooks/queries/useDemandsQueries";
import {
  useCreateApplicationMutation,
  useDemandApplicationsQuery,
  useUpdateApplicationMutation,
} from "@/hooks/queries/useApplicationsQueries";
import { useAuthStore } from "@/store/useAuthStore";
import { CATEGORY_LABELS, STATUS_LABELS, APPLICATION_STATUS_LABELS } from "@/types/api";
import type { DemandStatus } from "@/types/api";
import { formatRelativeTime, daysUntilDeadline, formatDate } from "@/utils/format";
import { useMagnetic } from "@/hooks/useMagnetic";
import { usePageTitle } from "@/hooks/usePageTitle";

/* ============================================================
   状态 → 徽章样式
   ============================================================ */
const STATUS_STYLES: Record<DemandStatus, string> = {
  OPEN: "bg-brand-50 text-brand-700 border-brand-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  DONE: "bg-neutral-100 text-neutral-500 border-neutral-200",
  CANCELLED: "bg-neutral-100 text-neutral-400 border-neutral-200",
};

const TIER_STYLES: Record<1 | 2 | 3, string> = {
  1: "bg-neutral-100 text-neutral-600",
  2: "bg-brand-100 text-brand-700",
  3: "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
};

const TIER_LABELS: Record<1 | 2 | 3, string> = { 1: "LV.1", 2: "LV.2", 3: "LV.3" };

/* ============================================================
   DemandDetailPage
   ============================================================ */
export default function DemandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [applyMessage, setApplyMessage] = useState("");
  const [showApplyBox, setShowApplyBox] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const { data: demand, isLoading } = useDemandQuery(id ?? "");
  usePageTitle(demand ? demand.title : "需求详情");
  const isPublisher = !!user && !!demand && user.id === demand.publisherId;
  // 仅发布者可见的申请列表
  const { data: appsData } = useDemandApplicationsQuery(id ?? "", isPublisher);
  const createAppMut = useCreateApplicationMutation(id ?? "");
  const updateAppMut = useUpdateApplicationMutation();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.25 });

  /* ----- 加载中 ----- */
  if (isLoading) {
    return (
      <>
        <motion.div
          style={{ scaleX: progress }}
          className="fixed top-0 inset-x-0 h-1 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 z-[60]"
        />
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center bg-background pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </main>
        <Footer />
      </>
    );
  }

  /* ----- 找不到需求 ----- */
  if (!demand) {
    return (
      <>
        <motion.div
          style={{ scaleX: progress }}
          className="fixed top-0 inset-x-0 h-1 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 z-[60]"
        />
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center bg-background pt-20">
          <div className="text-center max-w-md px-6">
            <div className="font-serif text-6xl font-bold text-brand-600/30 mb-4">
              不见了
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
              这条需求可能已经完成或被撤下
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              换一个看看，也许还有更适合你的
            </p>
            <Link
              to="/demands"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500"
            >
              <ArrowLeft className="w-4 h-4" />
              返回需求广场
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const daysLeft = daysUntilDeadline(demand.deadline);
  const canApply =
    user && !isPublisher && demand.status === "OPEN";

  const onApply = () => {
    if (!user) {
      navigate("/login", { state: { from: `/demands/${id}` } });
      return;
    }
    setApplyError(null);
    createAppMut.mutate(
      { message: applyMessage.trim() || undefined },
      {
        onSuccess: () => {
          setShowApplyBox(false);
          setApplyMessage("");
          // 这里可触发 toast
        },
        onError: (err: Error) => setApplyError(err.message),
      },
    );
  };

  const onManageApp = (appId: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED") => {
    updateAppMut.mutate({ id: appId, payload: { status } });
  };

  const applications = appsData?.items ?? [];

  return (
    <>
      {/* 顶部滚动进度条 */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 inset-x-0 h-1 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 z-[60]"
      />

      <Navbar />

      <main className="bg-background pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* 面包屑 */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-muted-foreground flex items-center gap-1.5 mb-6"
            aria-label="面包屑"
          >
            <Link to="/" className="hover:text-foreground smooth-color">
              首页
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/demands" className="hover:text-foreground smooth-color">
              需求广场
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/70">#{demand.id}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            {/* ===================== 左主栏 ===================== */}
            <div>
              {/* 标签行 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-4 flex-wrap"
              >
                <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {CATEGORY_LABELS[demand.category]}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[demand.status]}`}
                >
                  {STATUS_LABELS[demand.status]}
                </span>
              </motion.div>

              {/* 标题 */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight mb-5"
              >
                {demand.title}
              </motion.h1>

              {/* 元信息 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-6 pb-6 border-b border-border"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-[11px] font-semibold text-brand-700">
                    {demand.publisher.avatar}
                  </span>
                  <span className="text-foreground font-medium">
                    {demand.publisher.name}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeTime(demand.publishedAt)}发布
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  截止 {formatDate(demand.deadline)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {demand.views} 浏览
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {demand._count.applications} 人接单
                </span>
                {demand.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {demand.location}
                  </span>
                )}
                {/* 举报按钮（非发布者可见） */}
                {!isPublisher && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        navigate("/login", {
                          state: { from: `/demands/${id}` },
                        });
                        return;
                      }
                      setReportOpen(true);
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 smooth-color"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    举报
                  </button>
                )}
              </motion.div>

              {/* 描述正文 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="prose prose-neutral max-w-none mb-6"
              >
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {demand.desc}
                </p>
              </motion.div>

              {/* 标签 */}
              {demand.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-2 flex-wrap mb-10"
                >
                  {demand.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* 发布者：管理申请 */}
              {isPublisher && applications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card rounded-2xl border border-border p-6 mb-10"
                >
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                    接单申请（{applications.length}）
                  </h3>
                  <ul className="space-y-3">
                    {applications.map((app) => (
                      <li
                        key={app.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border"
                      >
                        <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm font-semibold text-brand-700">
                          {app.helper?.avatar ?? "U"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                              {app.helper?.name ?? "匿名"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {APPLICATION_STATUS_LABELS[app.status]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {formatRelativeTime(app.createdAt)}
                            </span>
                          </div>
                          {app.message && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {app.message}
                            </p>
                          )}
                          {app.helper && (
                            <div className="text-xs text-muted-foreground mt-1">
                              信用 {app.helper.creditScore} ·{" "}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${TIER_STYLES[app.helper.tier as 1 | 2 | 3]}`}>
                                {TIER_LABELS[app.helper.tier as 1 | 2 | 3]}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* 操作按钮 */}
                        {app.status === "PENDING" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={updateAppMut.isPending}
                              onClick={() => onManageApp(app.id, "ACCEPTED")}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-brand-600 text-white hover:bg-brand-500 smooth-color disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              接受
                            </button>
                            <button
                              type="button"
                              disabled={updateAppMut.isPending}
                              onClick={() => onManageApp(app.id, "REJECTED")}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted smooth-color disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              拒绝
                            </button>
                          </div>
                        )}
                        {app.status === "ACCEPTED" && demand.status === "IN_PROGRESS" && (
                          <button
                            type="button"
                            disabled={updateAppMut.isPending}
                            onClick={() => onManageApp(app.id, "COMPLETED")}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-brand-600 text-white hover:bg-brand-500 smooth-color disabled:opacity-50 shrink-0"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            标记完成
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* 分隔线 */}
              <div className="border-t border-border pt-10">
                <CommentList demandId={demand.id} />
              </div>
            </div>

            {/* ===================== 右侧栏 ===================== */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
              {/* 奖励 + 接单 CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  本次报酬
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <Coins className="w-6 h-6 text-brand-500" />
                  <span className="font-serif text-4xl font-bold text-brand-600 tabular-nums">
                    {demand.reward}
                  </span>
                  <span className="text-sm text-muted-foreground">拾光币</span>
                </div>
                <div className="text-xs text-muted-foreground mb-5">
                  约 ¥{(demand.reward * 0.5).toFixed(1)} 等值
                </div>

                {/* 倒计时 */}
                <div className="bg-muted rounded-xl px-4 py-3 mb-5 text-xs text-muted-foreground">
                  {daysLeft > 0 ? (
                    <span>
                      距截止还有{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {daysLeft}
                      </span>{" "}
                      天
                    </span>
                  ) : daysLeft === 0 ? (
                    <span className="text-amber-600 font-semibold">今天截止</span>
                  ) : (
                    <span className="text-neutral-500">已截止</span>
                  )}
                </div>

                {/* 接单 CTA */}
                {isPublisher ? (
                  <div className="text-center text-sm text-muted-foreground bg-muted rounded-xl py-3.5">
                    这是你发布的需求
                  </div>
                ) : !user ? (
                  <Link
                    to="/login"
                    state={{ from: `/demands/${demand.id}` }}
                    className="magnetic-btn flex items-center justify-center gap-2 w-full rounded-full bg-brand-600 text-white px-6 py-3.5 text-base font-semibold smooth-color hover:bg-brand-500 shadow-[0_6px_20px_-6px_rgba(22,163,74,0.4)]"
                  >
                    <HandHeart className="w-5 h-5" />
                    登录后接单
                  </Link>
                ) : !canApply ? (
                  <div className="text-center text-sm text-muted-foreground bg-muted rounded-xl py-3.5">
                    {demand.status === "OPEN" ? "暂不可接单" : STATUS_LABELS[demand.status]}
                  </div>
                ) : showApplyBox ? (
                  <div className="space-y-3">
                    <textarea
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="给发布者留个言（可选）"
                      rows={3}
                      className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 border border-transparent focus:border-brand-300 focus:bg-card focus:outline-none smooth-color resize-none"
                    />
                    {applyError && (
                      <div className="text-xs text-red-500 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {applyError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowApplyBox(false);
                          setApplyMessage("");
                          setApplyError(null);
                        }}
                        className="flex-1 rounded-full border border-border text-foreground py-2 text-sm font-semibold hover:bg-muted smooth-color"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        ref={magneticRef}
                        disabled={createAppMut.isPending}
                        onClick={onApply}
                        className="magnetic-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 text-white py-2 text-sm font-semibold hover:bg-brand-500 smooth-color disabled:opacity-50"
                      >
                        {createAppMut.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <HandHeart className="w-4 h-4" />
                        )}
                        确认接单
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    ref={magneticRef}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowApplyBox(true)}
                    className="magnetic-btn flex items-center justify-center gap-2 w-full rounded-full bg-brand-600 text-white px-6 py-3.5 text-base font-semibold smooth-color hover:bg-brand-500 shadow-[0_6px_20px_-6px_rgba(22,163,74,0.4)]"
                  >
                    <HandHeart className="w-5 h-5" />
                    我来接住这个需求
                  </motion.button>
                )}

                <div className="text-xs text-muted-foreground text-center mt-3">
                  接单后报酬将由平台担保，完成后释放
                </div>
              </motion.div>

              {/* 发布者信息卡 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card rounded-2xl border border-border p-5"
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  发布者
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-base font-semibold text-brand-700">
                    {demand.publisher.avatar}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {demand.publisher.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${TIER_STYLES[demand.publisher.tier as 1 | 2 | 3]}`}
                      >
                        {TIER_LABELS[demand.publisher.tier as 1 | 2 | 3]}
                      </span>
                      {demand.publisher.bio && (
                        <span className="text-xs text-muted-foreground truncate">
                          {demand.publisher.bio}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to="/demands"
                  className="text-xs text-brand-600 hover:text-brand-700 smooth-color inline-flex items-center gap-1"
                >
                  查看全部需求
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </motion.div>

              {/* 安全提示 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-brand-50/50 border border-brand-200 rounded-2xl p-4 flex gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-foreground mb-1">
                    平台担保交易
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    接单后报酬进入担保账户，完成确认后才会释放给帮手，保障双方权益
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* 举报对话框 */}
      {demand && (
        <ReportDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="DEMAND"
          targetId={demand.id}
          targetLabel="这条需求"
        />
      )}
    </>
  );
}
