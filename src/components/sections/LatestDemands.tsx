import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemandsQuery } from "@/hooks/queries/useDemandsQueries";
import { DemandCard } from "@/components/demands/DemandCard";

/* ============================================================
   容器 & 子项动画 variants
   ============================================================ */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

/* ============================================================
   LatestDemands —— 首页「最新需求」区块
   ============================================================ */
export function LatestDemands() {
  const { data, isLoading } = useDemandsQuery({
    page: 1,
    pageSize: 6,
    sort: "latest",
    status: "OPEN",
  });
  const latest = data?.items ?? [];

  return (
    <section id="latest-demands" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* 背景装饰光斑 */}
      <div
        className="glow-orb animate-glow-b"
        style={{
          width: 460,
          height: 460,
          top: "10%",
          right: "-120px",
          background: "radial-gradient(circle, rgba(187,247,208,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700">
            最新需求
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight mt-4 text-foreground">
            正在发生的回响
          </h2>
          <p className="text-muted-foreground mt-4">
            每一分钟都有新的小心愿被发出，也许下一个你能接住的就在这里
          </p>
        </motion.div>

        {/* 卡片网格 */}
        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : latest.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无需求
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {latest.map((demand, i) => (
              <DemandCard key={demand.id} demand={demand} index={i} />
            ))}
          </motion.div>
        )}

        {/* 查看全部按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <Link
            to="/demands"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-border-strong px-7 py-3.5 text-base font-semibold text-foreground hover:border-brand-300 hover:bg-muted smooth-color transition-transform duration-300 hover:-translate-y-0.5"
          >
            查看全部需求
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
