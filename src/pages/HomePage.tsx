import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Coins,
  LayoutGrid,
  Plus,
  Search,
  Shield,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemandCard } from "@/components/demands/DemandCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useDemandsQuery } from "@/hooks/queries/useDemandsQueries";
import { useSiteOverviewQuery } from "@/hooks/queries/useStatsQueries";
import { usePageTitle } from "@/hooks/usePageTitle";

const actionCards = [
  {
    to: "/demands",
    title: "需求广场",
    desc: "浏览校园/社区里的互助需求",
    icon: LayoutGrid,
    color: "bg-brand-50 text-brand-600",
  },
  {
    to: "/demands/new",
    title: "发布需求",
    desc: "说出你的小需求，让有空的人接住",
    icon: Plus,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    to: "/recharge",
    title: "充值中心",
    desc: "购买拾光币，发布需求更自由",
    icon: Wallet,
    color: "bg-amber-50 text-amber-600",
  },
  {
    to: "/profile",
    title: "个人中心",
    desc: "管理资料、需求、接单与拾光币",
    icon: User,
    color: "bg-sky-50 text-sky-600",
  },
] as const;

function HomePageInner() {
  usePageTitle("首页 - 拾光互助");
  const user = useAuthStore((s) => s.user);
  const demandsQuery = useDemandsQuery({ page: 1, pageSize: 6, sort: "latest" });
  const overviewQuery = useSiteOverviewQuery();

  const demands = demandsQuery.data?.items ?? [];
  const overview = overviewQuery.data;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        {/* ===== 顶部 Hero / 欢迎区 ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-background to-background pt-28 pb-14">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute top-24 -left-24 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                拾光互助 · 让每一刻空闲都有价值
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5">
                你好{user ? `，${user.name}` : ""} 👋
                <br />
                <span className="text-brand-600">有需要，就发出来</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                发布一个小需求，或者用碎片时间帮别人一个忙。
                每一份善意，都会变成拾光币回到你身边。
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={user ? "/demands/new" : "/register"}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-semibold hover:bg-brand-500 smooth-color"
                >
                  <Plus className="w-4 h-4" />
                  {user ? "发布需求" : "立即加入"}
                </Link>
                <Link
                  to="/demands"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card text-foreground px-6 py-3 text-sm font-semibold hover:bg-muted smooth-color"
                >
                  <Search className="w-4 h-4" />
                  逛逛需求广场
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== 数据概览 ===== */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-4 mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "发布需求", value: overview?.demands ?? 0, icon: CheckCircle2, color: "text-brand-600" },
              { label: "帮助者", value: overview?.helpers ?? 0, icon: User, color: "text-sky-600" },
              { label: "已完成互助", value: overview?.completed ?? 0, icon: Shield, color: "text-emerald-600" },
              { label: "平均响应", value: overview ? `${overview.avgResponseMinutes}m` : "-", icon: Sparkles, color: "text-amber-600" },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-muted ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground tabular-nums">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== 快捷入口 ===== */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">快捷入口</h2>
            <Link
              to="/demands"
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 smooth-color"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actionCards.map((card, idx) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  to={card.to}
                  className="group flex flex-col h-full rounded-3xl bg-card border border-border p-6 hover:border-brand-300 hover:shadow-lg smooth-color"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${card.color} mb-4`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-foreground mb-1">{card.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed flex-1">{card.desc}</div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
                    进入 <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== 最新需求 ===== */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">最新需求</h2>
              <p className="text-sm text-muted-foreground mt-1">看看大家在互助什么</p>
            </div>
            <Link
              to="/demands"
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 smooth-color"
            >
              更多需求 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {demands.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {demands.slice(0, 6).map((demand, idx) => (
                <DemandCard key={demand.id} demand={demand} index={idx} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <div className="font-semibold text-foreground mb-1">暂时还没有需求</div>
              <p className="text-sm text-muted-foreground mb-5">成为第一个发布需求的人吧</p>
              <Link
                to={user ? "/demands/new" : "/register"}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-500 smooth-color"
              >
                <Plus className="w-4 h-4" />
                发布需求
              </Link>
            </div>
          )}
        </section>

        {/* ===== 消息 / 管理快捷 ===== */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/notifications"
              className="group flex items-center gap-4 rounded-3xl bg-card border border-border p-6 hover:border-brand-300 smooth-color"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-500">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">消息通知</div>
                <div className="text-sm text-muted-foreground">申请动态、完成提醒、系统消息</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-600" />
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className="group flex items-center gap-4 rounded-3xl bg-card border border-border p-6 hover:border-brand-300 smooth-color"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 text-purple-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">管理后台</div>
                  <div className="text-sm text-muted-foreground">用户、需求、举报、审计、统计</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-600" />
              </Link>
            )}

            {!user && (
              <Link
                to="/register"
                className="group flex items-center gap-4 rounded-3xl bg-card border border-border p-6 hover:border-brand-300 smooth-color"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">注册领 100 拾光币</div>
                  <div className="text-sm text-muted-foreground">加入拾光互助，开始你的第一单</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-600" />
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function HomePage() {
  return <HomePageInner />;
}