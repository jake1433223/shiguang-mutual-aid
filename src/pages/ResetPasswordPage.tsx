import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Loader2,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { authApi } from "@/api/auth";
import { useMagnetic } from "@/hooks/useMagnetic";

export default function ResetPasswordPage() {
  usePageTitle("重置密码");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("链接缺少重置参数，请使用邮件中的完整链接。");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (password.length > 64) {
      setError("密码不能超过 64 位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "重置失败，链接可能已过期或被使用。",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20 flex items-center">
        <div className="max-w-md mx-auto w-full px-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth-color mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl border border-border p-8 shadow-sm"
          >
            {done ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-5">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  密码已重置
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  你的账号密码已更新，请使用新密码登录。
                </p>
                <button
                  onClick={() => navigate("/login", { replace: true })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  去登录
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 mb-4">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                    设置新密码
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    请输入新密码，长度 6-64 位
                  </p>
                </div>

                {!token && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>链接缺少重置参数，请使用邮件中的完整链接。</span>
                  </div>
                )}

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

                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      新密码
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
                      确认新密码
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
                    disabled={submitting || !token}
                    className="magnetic-btn w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        重置中…
                      </>
                    ) : (
                      "重置密码"
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
