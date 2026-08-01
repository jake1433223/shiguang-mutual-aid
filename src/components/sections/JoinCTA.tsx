import { useRef } from "react";
import { motion } from "framer-motion";
import { UserPlus, Compass } from "lucide-react";
import { useMagnetic } from "@/hooks/useMagnetic";

export function JoinCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const primaryRef = useMagnetic<HTMLAnchorElement>({ strength: 0.4 });
  const secondaryRef = useMagnetic<HTMLAnchorElement>({ strength: 0.3 });

  // 鼠标跟随光晕
  const handleMove = (e: React.MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--cursor-x", `${x}%`);
    el.style.setProperty("--cursor-y", `${y}%`);
  };

  return (
    <section
      ref={sectionRef}
      id="join-cta"
      onMouseMove={handleMove}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      {/* 渐变背景 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
        }}
      />
      {/* 流动渐变层 */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.15), transparent 40%, transparent 60%, rgba(255,255,255,0.15))",
          backgroundSize: "200% 100%",
        }}
      >
        <div
          className="absolute inset-0 animate-gradient-pan"
          style={{
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* 装饰光斑 */}
      <div className="glow-orb animate-glow-a" style={{ width: 420, height: 420, top: -100, right: "8%", background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)" }} />
      <div className="glow-orb animate-glow-b" style={{ width: 360, height: 360, bottom: -80, left: "4%", background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)" }} />
      <div className="glow-orb animate-glow-c" style={{ width: 280, height: 280, top: "40%", left: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)" }} />

      {/* 鼠标跟随光晕 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(600px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(255,255,255,0.15), transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          让空闲被接住
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
          现在就开始，注册免费，发布第一个需求或接下第一个任务，只需 30 秒。
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <motion.a
            ref={primaryRef}
            href="#"
            whileTap={{ scale: 0.96 }}
            className="magnetic-btn inline-flex items-center gap-2 rounded-full bg-white text-brand-700 px-8 py-4 text-base font-semibold shadow-xl hover:shadow-2xl transition-shadow"
          >
            <UserPlus className="w-5 h-5" />
            免费注册
          </motion.a>
          <motion.a
            ref={secondaryRef}
            href="#categories"
            whileTap={{ scale: 0.96 }}
            className="magnetic-btn inline-flex items-center gap-2 rounded-full border-2 border-white/40 text-white px-8 py-4 text-base font-semibold hover:bg-white/10 hover:border-white/60 transition-colors"
          >
            <Compass className="w-5 h-5" />
            浏览需求
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
