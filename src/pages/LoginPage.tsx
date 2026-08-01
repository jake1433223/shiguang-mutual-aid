import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLoginMutation } from "@/hooks/queries/useAuthQueries";
import { useMagnetic } from "@/hooks/useMagnetic";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function LoginPage() {
  usePageTitle("登录");
  const navigate = useNavigate();
  const location = useLocation();
  // 登录后回跳到来源页（ProtectedRoute 注入的 state.from），否则去首页
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMut = useLoginMutation();
  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("请填写邮箱和密码");
      return;
    }
    loginMut.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate(from, { replace: true }),
        onError: (err: Error) => setError(err.message || "登录失败，请稍后再试"),
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
                欢迎回来
              </h1>
              <p className="text-sm text-muted-foreground">
                登录以继续你的互助之旅
              </p>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    密码
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-brand-600 smooth-color"
                  >
                    忘记密码？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 smooth-color"
                  />
                </div>
              </div>

              <button
                ref={magneticRef}
                type="submit"
                disabled={loginMut.isPending}
                className="magnetic-btn w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loginMut.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    登录中…
                  </>
                ) : (
                  "登录"
                )}
              </button>
            </form>

            {/* 切换到注册 */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              还没有账号？{" "}
              <Link
                to="/register"
                className="text-brand-600 font-medium hover:underline smooth-color"
              >
                立即加入
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
