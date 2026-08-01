import { motion, useScroll, useTransform } from "framer-motion";
import { Plus, HandHeart, Zap, ArrowDown } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useCountUp } from "@/hooks/useCountUp";
import { useSiteOverviewQuery } from "@/hooks/queries/useStatsQueries";
import heroImg from "@/assets/hero.jpg";

/* ============================================================
   容器 & 子项动画 variants
   ============================================================ */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ============================================================
   磁性按钮（简约版，strength 0.25 更微妙）
   ============================================================ */
function MagneticButton({
  children,
  variant = "primary",
  href,
  to,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  to?: string;
  className?: string;
}) {
  const ref = useMagnetic<HTMLElement>({ strength: 0.25 });
  const base =
    "magnetic-btn inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-all duration-500";
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white shadow-[0_6px_20px_-6px_rgba(22,163,74,0.4)] hover:bg-brand-500 hover:shadow-[0_8px_24px_-6px_rgba(22,163,74,0.5)]"
      : "border-2 border-border-strong text-foreground hover:bg-muted hover:border-brand-300";

  if (to) {
    return (
      <motion.div ref={ref as React.RefObject<HTMLDivElement>} variants={itemVariants} whileTap={{ scale: 0.96 }} className={`${base} ${styles} ${className}`}>
        <Link to={to}>{children}</Link>
      </motion.div>
    );
  }
  return (
    <motion.a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      href={href}
      variants={itemVariants}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.a>
  );
}

/* ============================================================
   计数统计项
   ============================================================ */
function StatItem({
  value,
  label,
  suffix,
  isLast,
}: {
  value: number;
  label: string;
  suffix?: string;
  isLast?: boolean;
}) {
  const { ref, value: display } = useCountUp({ end: value, duration: 2000 });
  return (
    <>
      <motion.div variants={itemVariants}>
        <div className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground tabular-nums">
          <span ref={ref}>
            {display.toLocaleString("en-US")}
            {suffix && <span className="text-xl text-muted-foreground ml-1">{suffix}</span>}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </motion.div>
      {!isLast && <div className="w-px h-12 bg-border" />}
    </>
  );
}

/* ============================================================
   Hero 主体（简约版：浅色背景 + 鼠标跟随柔和光晕）
   ============================================================ */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // 真实站点概览数据
  const { data: overview } = useSiteOverviewQuery();
  const STATS = [
    { label: "次互助", value: overview?.completed ?? 0, suffix: "" },
    { label: "活跃帮手", value: overview?.helpers ?? 0, suffix: "" },
    {
      label: "平均响应",
      value: overview?.avgResponseMinutes ?? 0,
      suffix: " 分钟",
    },
  ];
  const avgResponse = overview?.avgResponseMinutes ?? 0;

  // 鼠标跟随光晕
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleMouseMove}
      className="mouse-glow relative overflow-hidden bg-background"
    >
      {/* 极简装饰光斑（缓慢漂移） */}
      <div className="glow-orb animate-glow-a" style={{ width: 480, height: 480, top: -120, left: -80, background: "radial-gradient(circle, rgba(187,247,208,0.5) 0%, transparent 70%)" }} />
      <div className="glow-orb animate-glow-b" style={{ width: 420, height: 420, bottom: -100, right: -60, background: "radial-gradient(circle, rgba(220,252,231,0.45) 0%, transparent 70%)" }} />
      <div className="glow-orb animate-glow-c" style={{ width: 280, height: 280, top: "30%", left: "50%", background: "radial-gradient(circle, rgba(231,229,228,0.5) 0%, transparent 70%)" }} />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32"
      >
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* 左：文字 60% */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-3"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              空闲时间互助平台
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mt-6 text-foreground"
            >
              让每一刻空闲
              <br />
              都有<span className="text-brand-600">人接住</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mt-6"
            >
              在拾光互助，发布你的小需求，或用碎片时间帮别人一个忙。
              <br className="hidden md:block" />
              只需一点点报酬，让空闲变成彼此的礼物。
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mt-8">
              <MagneticButton to="/demands/new" variant="primary">
                <Plus className="w-5 h-5" />
                发布需求
              </MagneticButton>
              <MagneticButton to="/demands" variant="secondary">
                <HandHeart className="w-5 h-5" />
                浏览需求
              </MagneticButton>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="flex items-center gap-6 lg:gap-10 mt-12"
            >
              {STATS.map((s, i) => (
                <StatItem
                  key={s.label}
                  value={s.value}
                  label={s.label}
                  suffix={s.suffix}
                  isLast={i === STATS.length - 1}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* 右：图片 40% */}
          <motion.div
            style={{ y: imageY }}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 relative hidden md:block"
          >
            <div className="relative animate-float-soft">
              <img
                src={heroImg}
                alt="柔软流动的青柠绿主视觉"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-[2.5rem] border border-border shadow-lg"
              />
              <div className="absolute -inset-2 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-200/40 via-brand-100/20 to-transparent blur-2xl" />

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-5 -left-5 rounded-2xl p-4 border border-border bg-card/90 backdrop-blur-md animate-float-subtle shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{avgResponse} 分钟响应</div>
                    <div className="text-xs text-muted-foreground">平均接单时间</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 滚动指示器 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs tracking-widest uppercase">向下滚动</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
