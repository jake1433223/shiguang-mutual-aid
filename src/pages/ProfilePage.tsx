import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coins,
  Shield,
  Loader2,
  Plus,
  Edit3,
  Check,
  X,
  Award,
  Inbox,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TransactionList } from "@/components/profile/TransactionList";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useMyDemandsQuery,
  useMyApplicationsQuery,
  useUpdateMeMutation,
} from "@/hooks/queries/useUsersQueries";
import { useMagnetic } from "@/hooks/useMagnetic";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
} from "@/types/api";
import { formatRelativeTime, formatDate } from "@/utils/format";

const TIER_LABELS: Record<number, string> = { 1: "LV.1", 2: "LV.2", 3: "LV.3" };

const TIER_STYLES: Record<number, string> = {
  1: "bg-neutral-100 text-neutral-600",
  2: "bg-brand-100 text-brand-700",
  3: "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
};

export default function ProfilePage() {
  usePageTitle("个人中心");
  const user = useAuthStore((s) => s.user);
  const { data: myDemandsData, isLoading: demandsLoading } = useMyDemandsQuery();
  const { data: myAppsData, isLoading: appsLoading } = useMyApplicationsQuery();
  const updateMut = useUpdateMeMutation();
  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editBio, setEditBio] = useState(user?.bio ?? "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar ?? "");

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-28 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </main>
        <Footer />
      </>
    );
  }

  const myDemands = myDemandsData?.items ?? [];
  const myApps = myAppsData?.items ?? [];

  const onSaveProfile = () => {
    if (!editName.trim()) return;
    updateMut.mutate(
      {
        name: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim() || user.avatar,
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const onCancelEdit = () => {
    setEditName(user.name);
    setEditBio(user.bio);
    setEditAvatar(user.avatar);
    setEditing(false);
  };

  return (
    <>
      <Navbar />
      <main className="bg-background pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* ===================== 个人卡片 ===================== */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl border border-border p-8 shadow-sm mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* 头像 */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-3xl font-bold text-brand-700 shrink-0">
                {editing ? (
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value.slice(0, 2))}
                    maxLength={2}
                    className="w-12 text-center bg-transparent border-b border-border focus:outline-none focus:border-brand-500"
                    placeholder="字"
                  />
                ) : (
                  user.avatar
                )}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={20}
                      className="w-full text-xl font-serif font-bold text-foreground bg-transparent border-b border-border focus:outline-none focus:border-brand-500 pb-1"
                      placeholder="昵称"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      maxLength={100}
                      rows={2}
                      placeholder="一句话介绍你自己"
                      className="w-full text-sm text-foreground bg-transparent border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 resize-none"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="font-serif text-2xl font-bold text-foreground">
                        {user.name}
                      </h1>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_STYLES[user.tier] ?? TIER_STYLES[1]}`}
                      >
                        {TIER_LABELS[user.tier] ?? "LV.1"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {user.bio || "还没有个人介绍"}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </>
                )}
              </div>

              {/* 编辑按钮 */}
              <div className="shrink-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <button
                      ref={magneticRef}
                      type="button"
                      onClick={onSaveProfile}
                      disabled={updateMut.isPending}
                      className="magnetic-btn inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold smooth-color hover:bg-brand-500 disabled:opacity-60"
                    >
                      {updateMut.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="inline-flex items-center gap-1 rounded-full border border-border text-foreground px-4 py-2 text-sm smooth-color hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-border text-foreground px-4 py-2 text-sm smooth-color hover:bg-muted"
                  >
                    <Edit3 className="w-4 h-4" />
                    编辑资料
                  </button>
                )}
              </div>
            </div>

            {/* 统计数据条 */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 mb-2">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {user.coins}
                </div>
                <div className="text-xs text-muted-foreground">
                    拾光币
                    <Link
                      to="/recharge"
                      className="ml-1 inline-flex items-center text-brand-600 hover:text-brand-700 font-medium smooth-color"
                    >
                      充值
                    </Link>
                  </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {user.creditScore}
                </div>
                <div className="text-xs text-muted-foreground">信用分</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {TIER_LABELS[user.tier] ?? "LV.1"}
                </div>
                <div className="text-xs text-muted-foreground">等级</div>
              </div>
            </div>
          </motion.section>

          {/* ===================== 拾光币流水 ===================== */}
          <section className="mb-8">
            <TransactionList />
          </section>

          {/* ===================== 我发布的需求 ===================== */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <Inbox className="w-5 h-5 text-brand-500" />
                我发布的需求
                <span className="text-sm text-muted-foreground font-normal">
                  ({myDemands.length})
                </span>
              </h2>
              <Link
                to="/demands/new"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold smooth-color hover:bg-brand-500"
              >
                <Plus className="w-4 h-4" />
                发布新需求
              </Link>
            </div>

            {demandsLoading ? (
              <div className="bg-card rounded-2xl border border-border py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : myDemands.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  还没有发布过需求
                </p>
                <Link
                  to="/demands/new"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-5 py-2 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  <Plus className="w-4 h-4" />
                  发布第一个需求
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {myDemands.map((d, i) => (
                  <motion.li
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      to={`/demands/${d.id}`}
                      className="block bg-card rounded-2xl border border-border p-5 smooth-color hover:border-brand-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
                              {CATEGORY_LABELS[d.category]}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {STATUS_LABELS[d.status]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(d.publishedAt)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground truncate mb-1">
                            {d.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              {d.reward}
                            </span>
                            <span>截止 {formatDate(d.deadline)}</span>
                            <span>{d._count.applications} 人接单</span>
                            <span>{d.views} 浏览</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>

          {/* ===================== 我的接单 ===================== */}
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-brand-500" />
              我的接单
              <span className="text-sm text-muted-foreground font-normal">
                ({myApps.length})
              </span>
            </h2>

            {appsLoading ? (
              <div className="bg-card rounded-2xl border border-border py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : myApps.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  还没有接过单
                </p>
                <Link
                  to="/demands"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border text-foreground px-5 py-2 text-sm font-semibold smooth-color hover:bg-muted"
                >
                  去需求广场看看
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {myApps.map((a, i) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    {a.demand ? (
                      <Link
                        to={`/demands/${a.demand.id}`}
                        className="block bg-card rounded-2xl border border-border p-5 smooth-color hover:border-brand-300 hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700">
                            {CATEGORY_LABELS[a.demand.category]}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {APPLICATION_STATUS_LABELS[a.status]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(a.createdAt)}申请
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground truncate mb-1">
                          {a.demand.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {a.demand.reward}
                          </span>
                          <span>截止 {formatDate(a.demand.deadline)}</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="bg-card rounded-2xl border border-border p-5">
                        <span className="text-sm text-muted-foreground">
                          需求已不可访问
                        </span>
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
