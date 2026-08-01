import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Flag,
  ScrollText,
  LogOut,
  Home,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUnreadCountQuery } from "@/hooks/queries/useNotificationsQueries";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "数据看板", icon: LayoutDashboard },
  { to: "/admin/users", label: "用户管理", icon: Users },
  { to: "/admin/demands", label: "需求管理", icon: FileText },
  { to: "/admin/comments", label: "评论管理", icon: MessageSquare },
  { to: "/admin/reports", label: "举报管理", icon: Flag },
  { to: "/admin/audit-logs", label: "审计日志", icon: ScrollText },
];

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: unreadData } = useUnreadCountQuery(!!user);
  const unreadCount = unreadData?.count ?? 0;

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-200">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
            拾
          </span>
          <div className="leading-tight">
            <div className="font-serif font-bold text-foreground">
              拾光互助
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wider">
              ADMIN CONSOLE
            </div>
          </div>
        </Link>
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm smooth-color ${
                isActive
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 底部：用户信息 + 登出 */}
      <div className="border-t border-neutral-200 p-3 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-foreground smooth-color"
        >
          <Home className="w-4 h-4" />
          回到前台
        </Link>
        <Link
          to="/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-foreground smooth-color relative"
        >
          <Bell className="w-4 h-4" />
          通知
          {unreadCount > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-neutral-50">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
            {user?.avatar ?? "A"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {user?.name}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="退出登录"
            className="p-1.5 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 smooth-color"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 移动端顶栏 */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded text-neutral-600 hover:bg-neutral-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-serif font-bold text-foreground">管理后台</span>
        <div className="w-8" />
      </header>

      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 bg-white border-r border-neutral-200 z-30">
        {SidebarContent}
      </aside>

      {/* 移动端抽屉 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 p-1 rounded text-neutral-400 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 主内容区 */}
      <main className="lg:pl-60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
