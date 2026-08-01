import { motion } from "framer-motion";
import { Sprout, Star, Trophy, Check } from "lucide-react";

const TIERS = [
  {
    tier: 1,
    icon: Sprout,
    level: "LV.1",
    title: "青柠萌新",
    desc: "完成 10 次有效互助",
    perks: ["解锁专属头像框", "基础积分加速"],
    highlight: false,
  },
  {
    tier: 2,
    icon: Star,
    level: "LV.2",
    title: "拾光达人",
    desc: "完成 50 次有效互助",
    perks: ["报酬手续费减免", "月度奖金池分红", "优先展示权益"],
    highlight: false,
  },
  {
    tier: 3,
    icon: Trophy,
    level: "LV.3",
    title: "互助宗师",
    desc: "完成 200 次有效互助",
    perks: ["平台认证徽章", "优先接单特权", "年度大奖提名", "专属客服通道"],
    highlight: true,
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Rewards() {
  return (
    <section id="rewards" className="py-20 lg:py-28 bg-muted relative overflow-hidden">
      <div className="glow-orb animate-glow-a" style={{ width: 500, height: 500, top: "10%", left: "-150px", background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700">
            奖励计划
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground">
            贡献长成奖励
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-6 items-stretch"
        >
          {TIERS.map((t) => {
            const Icon = t.icon;
            const tierClass = `tier-${t.tier}`;
            const isTop = t.highlight;
            return (
              <motion.div
                key={t.tier}
                variants={item}
                whileHover={{ y: -8 }}
                className={`breathing-glow relative ${tierClass} card-lift rounded-2xl border p-8 ${
                  t.tier === 1
                    ? "bg-card border-brand-200"
                    : t.tier === 2
                    ? "bg-brand-50 border-brand-300"
                    : "bg-brand-100 border-brand-400"
                }`}
                style={{
                  boxShadow: isTop
                    ? "var(--shadow-lg), 0 0 60px -20px rgba(22,163,74,0.4)"
                    : "var(--shadow-sm)",
                }}
              >
                {isTop && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                  >
                    最高荣誉
                  </motion.div>
                )}
                <div className="tier-badge mb-6">
                  <Icon className={t.tier === 1 ? "w-6 h-6" : t.tier === 2 ? "w-7 h-7" : "w-8 h-8"} />
                </div>
                <div
                  className={`text-xs font-semibold tracking-wider mb-1 ${
                    t.tier === 3 ? "text-brand-800" : t.tier === 2 ? "text-brand-700" : "text-muted-foreground"
                  }`}
                >
                  {t.level}
                </div>
                <h3 className="font-serif text-xl font-bold mb-2 text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t.desc}</p>
                <div className="space-y-3">
                  {t.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-2.5 text-sm text-foreground">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 ${
                          t.tier === 3 ? "text-brand-700" : "text-brand-600"
                        }`}
                      />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
