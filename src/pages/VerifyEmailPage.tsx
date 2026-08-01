import { useEffect, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MailCheck,
  MailX,
  Loader2,
  ArrowLeft,
  LogIn,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { authApi } from "@/api/auth";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  usePageTitle("验证邮箱");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setStatus("error");
      setMessage("链接缺少验证参数，请使用邮件中的完整链接。");
      return;
    }

    authApi
      .verifyEmail({ token })
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "邮箱验证成功，现在可以登录了。");
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(
          err.message || "验证失败，链接可能已过期或被使用，请重新发送。",
        );
      });
  }, [token]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20 flex items-center">
        <div className="max-w-md mx-auto w-full px-6">
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
            className="bg-card rounded-3xl border border-border p-8 shadow-sm text-center"
          >
            {status === "loading" && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 mb-5">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  正在验证邮箱
                </h1>
                <p className="text-sm text-muted-foreground">
                  请稍候，我们正在确认你的邮箱地址……
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-5">
                  <MailCheck className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  验证成功
                </h1>
                <p className="text-sm text-muted-foreground mb-6">{message}</p>
                <button
                  onClick={() => navigate("/login", { replace: true })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  <LogIn className="w-4 h-4" />
                  去登录
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 text-red-600 mb-5">
                  <MailX className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  验证失败
                </h1>
                <p className="text-sm text-muted-foreground mb-6">{message}</p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground smooth-color hover:bg-muted"
                  >
                    <LogIn className="w-4 h-4" />
                    返回登录
                  </Link>
                  <Link
                    to="/resend-verification"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold smooth-color hover:bg-brand-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新发送
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
