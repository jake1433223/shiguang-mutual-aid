import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react";

/* ============================================================
   NotFound —— 404 页面
   ============================================================ */
export default function NotFound() {
  usePageTitle("页面未找到");
  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-6">
      {/* 装饰光斑 */}
      <div
        className="glow-orb animate-glow-a"
        style={{
          width: 480,
          height: 480,
          top: -120,
          left: -80,
          background:
            "radial-gradient(circle, rgba(187,247,208,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="glow-orb animate-glow-b"
        style={{
          width: 420,
          height: 420,
          bottom: -100,
          right: -60,
          background:
            "radial-gradient(circle, rgba(220,252,231,0.45) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-lg">
        {/* 大数字 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[120px] md:text-[160px] font-bold leading-none text-brand-600/20 tabular-nums"
        >
          404
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground -mt-6 mb-4"
        >
          迷路了
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-muted-foreground leading-relaxed mb-10"
        >
          你寻找的页面像一缕拾光，悄悄溜走了。
          <br />
          不如回去看看那些正在等待回响的需求。
        </motion.p>

        {/* 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold smooth-color hover:bg-brand-500 shadow-[0_6px_20px_-6px_rgba(22,163,74,0.4)]"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <Link
            to="/demands"
            className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong text-foreground px-6 py-3 text-sm font-semibold smooth-color hover:border-brand-300 hover:bg-muted"
          >
            <Compass className="w-4 h-4" />
            浏览需求
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
