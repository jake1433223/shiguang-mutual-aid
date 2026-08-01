import { motion } from "framer-motion";
import { MessageCirclePlus, HandHeart, BadgeCheck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: MessageCirclePlus,
    tag: "第一步",
    title: "发布需求",
    desc: "描述你的小问题，设一个小小的报酬。",
  },
  {
    icon: HandHeart,
    tag: "第二步",
    title: "有人接住",
    desc: "附近的帮手看到你的需求，响应只需几分钟。",
  },
  {
    icon: BadgeCheck,
    tag: "第三步",
    title: "完成致谢",
    desc: "问题解决，支付报酬，双方互评攒积分。",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700">
            运作方式
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground">
            三步让空闲流动
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col md:flex-row items-stretch gap-6"
        >
          {STEPS.map((step, i) => (
            <div key={step.title} className="contents">
              <motion.div
                variants={item}
                whileHover={{ y: -8 }}
                className="card-lift relative bg-card rounded-2xl border border-border p-8 flex-1 overflow-hidden"
              >
                {/* 卡片背景光晕（hover 时显现） */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-brand-200/0 group-hover:bg-brand-200/40 blur-3xl transition-all duration-700" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 icon-scale">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-brand-600 tracking-wider block mb-2">
                    {step.tag}
                  </span>
                  <h3 className="font-serif text-xl font-bold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                  {/* 步骤序号水印 */}
                  <span className="absolute bottom-4 right-6 font-serif text-6xl font-bold text-brand-50 select-none">
                    {i + 1}
                  </span>
                </div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div
                  variants={item}
                  className="hidden md:flex items-center justify-center px-1"
                >
                  <div className="arrow-flow relative w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
