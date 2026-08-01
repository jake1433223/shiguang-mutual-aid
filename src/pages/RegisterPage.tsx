import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowLeft, AlertCircle, Sparkles, Coins } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useRegisterMutation } from "@/hooks/queries/useAuthQueries";
import { useMagnetic } from "@/hooks/useMagnetic";

export default function RegisterPage() {
  usePageTitle("注册");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const registerMut = useRegisterMutation();
  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError("请填写所有必填项");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    registerMut.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => navigate("/", { replace: true }),
        onError: (err: Error) => setError(err.message || "注册失败，请稍后再试"),
      },
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20 flex items-center">
        <div className="max-w-md mx-auto w-full px-6">
          {/* 返回 */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth-color mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl border border-border p-8 shadow-sm"
          >
            {/* 标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                加入拾光互助
              </h1>
              <p className="text-sm text-muted-foreground">
                注册即可领取 100 拾光币，开启互助之旅
              </p>
            </div>

            {/* 福利提示 */}
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-4 py-2.5 text-xs text-brand-700">
              <Coins className="w-4 h-4 shrink-0" />
              <span>新用户专享：注册即送 100 拾光币 + 100 信用分起评</span>
            </div>

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* 表单 */}
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  昵称
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如何称呼你"
                    autoComplete="nickname"
                    maxLength={20}
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再输入一次"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>
              </div>

              <button
                ref={magneticRef}
                type="submit"
                disabled={registerMut.isPending}
                className="magnetic-btn w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {registerMut.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    注册中…
                  </>
                ) : (
                  "创建账号"
                )}
              </button>
            </form>

            {/* 切换到登录 */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              已经有账号？{" "}
              <Link
                to="/login"
                className="text-brand-600 font-medium hover:underline smooth-color"
              >
                直接登录
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
