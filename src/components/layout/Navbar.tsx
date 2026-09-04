import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, Plus, User, LogOut, Coins, Bell, CheckCheck, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useUnreadCountQuery,
  useNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from "@/hooks/queries/useNotificationsQueries";
import { NOTIFICATION_TYPE_LABELS } from "@/types/api";

// 锚点链接（同页滚动）
const ANCHOR_LINKS = [
  { href: "#how-it-works", label: "运作方式" },
  { href: "#categories", label: "需求分类" },
  { href: "#leaderboards", label: "排行榜" },
  { href: "#rewards", label: "奖励计划" },
];

// 跨页链接
const PAGE_LINKS = [{ to: "/demands", label: "需求广场" }];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const magneticRef = useMagnetic<HTMLAnchorElement>({ strength: 0.25 });
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // 未读数（仅登录时轮询）
  const unreadQuery = useUnreadCountQuery(!!user);
  const unreadCount = unreadQuery.data?.count ?? 0;

  // 下拉展开时拉取最新 5 条
  const notifListQuery = useNotificationsQuery({
    page: 1,
    pageSize: 5,
  });
  const markAllMut = useMarkAllReadMutation();
  const markReadMut = useMarkReadMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 点击外部关闭用户菜单 / 通知面板
  useEffect(() => {
    if (!userMenuOpen && !notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen, notifOpen]);

  // 路由变化时关闭下拉
  useEffect(() => {
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 smooth-color group">
            <span className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">
              拾光互助
            </span>
          </Link>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {/* 跨页链接 */}
            {PAGE_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative smooth-color hover:text-foreground group"
              >
                <span className="relative">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            ))}
            {/* 锚点链接（仅首页有效） */}
            {isHome &&
              ANCHOR_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative smooth-color hover:text-foreground group"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full" />
                  </span>
                </a>
              ))}
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {/* 拾光币余额 */}
                <Link
                  to="/profile"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm text-foreground smooth-color hover:text-brand-600"
                  title="我的拾光币"
                >
                  <Coins className="w-4 h-4 text-brand-500" />
                  <span className="font-semibold tabular-nums">{user.coins}</span>
                </Link>
                {/* 发布需求 */}
                <Link
                  to="/demands/new"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  <Plus className="w-4 h-4" />
                  发布需求
                </Link>
                {/* 通知铃铛 */}
                <div ref={notifRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted smooth-color"
                    aria-label="通知"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-card rounded-2xl border border-border shadow-lg z-50 overflow-hidden"
                      >
                        {/* 头部 */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <span className="text-sm font-semibold text-foreground">
                            通知
                          </span>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={() => markAllMut.mutate()}
                              disabled={markAllMut.isPending}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-600 smooth-color disabled:opacity-50"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              全部已读
                            </button>
                          )}
                        </div>
                        {/* 列表 */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifListQuery.isLoading ? (
                            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                              加载中…
                            </div>
                          ) : notifListQuery.data?.items?.length ? (
                            notifListQuery.data.items.map((n) => {
                              const inner = (
                                <div
                                  className={`px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-muted/60 smooth-color ${
                                    !n.read ? "bg-brand-50/40" : ""
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    {!n.read && (
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                                    )}
                                    <div className={n.read ? "pl-4" : ""}>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs text-muted-foreground">
                                          {
                                            NOTIFICATION_TYPE_LABELS[
                                              n.type
                                            ]
                                          }
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/60">
                                          {new Date(
                                            n.createdAt,
                                          ).toLocaleString("zh-CN", {
                                            hour12: false,
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <div className="text-sm font-medium text-foreground line-clamp-1">
                                        {n.title}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {n.content}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                              return n.link ? (
                                <Link
                                  key={n.id}
                                  to={n.link}
                                  onClick={() => {
                                    if (!n.read) markReadMut.mutate(n.id);
                                    setNotifOpen(false);
                                  }}
                                  className="block"
                                >
                                  {inner}
                                </Link>
                              ) : (
                                <button
                                  key={n.id}
                                  type="button"
                                  onClick={() => {
                                    if (!n.read) markReadMut.mutate(n.id);
                                  }}
                                  className="block w-full text-left"
                                >
                                  {inner}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                              暂无通知
                            </div>
                          )}
                        </div>
                        {/* 底部 */}
                        <Link
                          to="/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="block text-center px-4 py-2.5 text-xs text-brand-600 hover:bg-muted smooth-color border-t border-border"
                        >
                          查看全部通知
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* 用户菜单 */}
                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm font-semibold text-brand-700 hover:scale-105 transition-transform"
                    aria-label="用户菜单"
                  >
                    {user.avatar}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-52 bg-card rounded-2xl border border-border shadow-lg p-2 z-50"
                      >
                        <div className="px-3 py-2 mb-1 border-b border-border">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted smooth-color"
                        >
                          <User className="w-4 h-4" />
                          个人中心
                        </Link>
                          <Link
                            to="/recharge"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted smooth-color"
                          >
                            <Coins className="w-4 h-4 text-brand-500" />
                            充值中心
                          </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-700 hover:bg-brand-50 smooth-color"
                          >
                            <Shield className="w-4 h-4" />
                            管理后台
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={onLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted smooth-color"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm text-muted-foreground smooth-color hover:text-foreground"
                >
                  登录
                </Link>
                <motion.a
                  ref={magneticRef}
                  href="#join-cta"
                  whileTap={{ scale: 0.96 }}
                  className="magnetic-btn hidden sm:inline-flex items-center rounded-full bg-brand-600 text-white px-5 py-2 text-sm font-semibold smooth-color hover:bg-brand-500"
                >
                  立即加入
                </motion.a>
              </>
            )}
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="切换菜单"
              className="md:hidden p-2 rounded-lg text-foreground"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-xl pt-20 px-6"
          >
            <div className="flex flex-col gap-2">
              {PAGE_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block text-2xl font-serif font-semibold text-foreground hover:text-brand-600 py-3 border-b border-border"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {isHome &&
                ANCHOR_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * (i + PAGE_LINKS.length) }}
                    className="text-2xl font-serif font-semibold text-foreground hover:text-brand-600 py-3 border-b border-border"
                  >
                    {link.label}
                  </motion.a>
                ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 mt-6"
              >
                {user ? (
                  <>
                    <Link
                      to="/demands/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center rounded-full bg-brand-600 text-white py-3 font-semibold"
                    >
                      发布需求
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center rounded-full border border-border text-foreground py-3 font-semibold"
                    >
                      个人中心
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center rounded-full border border-border text-foreground py-3 font-semibold"
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center rounded-full bg-brand-600 text-white py-3 font-semibold"
                    >
                      立即加入
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
