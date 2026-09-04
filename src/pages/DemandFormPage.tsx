import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Tag,
  Coins,
  MapPin,
  Calendar,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCreateDemandMutation } from "@/hooks/queries/useDemandsQueries";
import { useAuthStore } from "@/store/useAuthStore";
import { useMagnetic } from "@/hooks/useMagnetic";
import { CATEGORY_LABELS } from "@/types/api";
import type { DemandCategory } from "@/types/api";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as DemandCategory[];

export default function DemandFormPage() {
  usePageTitle("发布需求");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createMut = useCreateDemandMutation();
  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<DemandCategory>("TECH");
  const [reward, setReward] = useState<number>(30);
  const [tagsInput, setTagsInput] = useState("");
  const [location, setLocation] = useState("");
  // 默认截止日期：7 天后
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("请填写需求标题");
      return;
    }
    if (title.trim().length > 60) {
      setError("标题不要超过 60 个字");
      return;
    }
    if (!desc.trim()) {
      setError("请描述一下需求详情");
      return;
    }
    if (desc.trim().length > 2000) {
      setError("详情不要超过 2000 字");
      return;
    }
    if (reward < 1) {
      setError("奖励至少 1 拾光币");
      return;
    }
    if (user && reward > user.coins) {
      setError(`拾光币余额不足（当前余额 ${user.coins}）`);
      return;
    }
    const deadlineDate = new Date(deadline + "T23:59:59");
    if (isNaN(deadlineDate.getTime())) {
      setError("截止日期格式不对");
      return;
    }
    if (deadlineDate.getTime() < Date.now()) {
      setError("截止日期必须晚于当前时间");
      return;
    }

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 6);

    createMut.mutate(
      {
        title: title.trim(),
        desc: desc.trim(),
        category,
        reward,
        tags,
        location: location.trim() || undefined,
        deadline: deadlineDate.toISOString(),
      },
      {
        onSuccess: (demand) => {
          navigate(`/demands/${demand.id}`, { replace: true });
        },
        onError: (err: Error) => setError(err.message || "发布失败，请稍后再试"),
      },
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* 返回 */}
          <Link
            to="/demands"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth-color mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回需求广场
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl border border-border p-8 shadow-sm"
          >
            {/* 标题 */}
            <div className="mb-8">
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                发布一个小心愿
              </h1>
              <p className="text-sm text-muted-foreground">
                填写下面的内容，让更多人看到你的需求
              </p>
            </div>

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="一句话说清你的需求"
                  maxLength={60}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {title.length}/60
                </p>
              </div>

              {/* 详情 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  详细描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="说明背景、要求、交付物、注意事项等"
                  rows={6}
                  maxLength={2000}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color resize-y"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {desc.length}/2000
                </p>
              </div>

              {/* 分类 + 奖励 */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    分类
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border smooth-color ${
                          category === c
                            ? "bg-brand-600 text-white border-brand-600"
                            : "bg-background text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {CATEGORY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-brand-500" />
                      奖励（拾光币）
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={user?.coins ?? 9999}
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    当前余额 {user?.coins ?? 0}，发布后将冻结相应数量。余额不足？<Link to="/recharge" className="text-brand-600 hover:text-brand-700 font-medium smooth-color">去充值</Link>
                  </p>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    标签
                  </span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="用空格或逗号分隔，最多 6 个，如：React 性能 前端"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                />
              </div>

              {/* 地点 + 截止 */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      地点（可选）
                    </span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="如：东区校园 / 线上"
                    maxLength={50}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      截止日期
                    </span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>
              </div>

              {/* 提交 */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  ref={magneticRef}
                  type="submit"
                  disabled={createMut.isPending}
                  className="magnetic-btn inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createMut.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      发布中…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      确认发布
                    </>
                  )}
                </button>
                <Link
                  to="/demands"
                  className="text-sm text-muted-foreground hover:text-foreground smooth-color"
                >
                  取消
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
