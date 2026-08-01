import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Send,
  MailCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { authApi } from "@/api/auth";
import { useMagnetic } from "@/hooks/useMagnetic";

export default function ResendVerificationPage() {
  usePageTitle("重发验证邮件");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const magneticRef = useMagnetic<HTMLButtonElement>({ strength: 0.2 });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resendVerification({ email: email.trim() });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "发送失败，请稍后再试");
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
                  <MailCheck className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  验证邮件已重发
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  如果该邮箱已注册且尚未验证，新的验证链接已发送到{" "}
                  <span className="font-medium text-foreground">{email}</span>
                  。请在 30 分钟内查收邮件。
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  返回登录
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 mb-4">
                    <Send className="w-6 h-6" />
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                    重新发送验证邮件
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    输入注册邮箱，我们会重新发送验证链接
                  </p>
                </div>

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
                      注册邮箱
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

                  <button
                    ref={magneticRef}
                    type="submit"
                    disabled={submitting}
                    className="magnetic-btn w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        发送中…
                      </>
                    ) : (
                      "重新发送"
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
