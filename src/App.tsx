import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

// 路由级代码分割：首屏只加载首页，其他页面按需加载
const HomePage = lazy(() => import("@/pages/HomePage"));
const DemandsPage = lazy(() => import("@/pages/DemandsPage"));
const DemandDetailPage = lazy(() => import("@/pages/DemandDetailPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const DemandFormPage = lazy(() => import("@/pages/DemandFormPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));
const ResendVerificationPage = lazy(() =>
  import("@/pages/ResendVerificationPage")
);
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const RechargePage = lazy(() => import("@/pages/RechargePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminDemandsPage = lazy(() => import("@/pages/admin/AdminDemandsPage"));
const AdminCommentsPage = lazy(() => import("@/pages/admin/AdminCommentsPage"));
const AdminReportsPage = lazy(() => import("@/pages/admin/AdminReportsPage"));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/AdminAuditLogsPage"));

/** 页面级加载占位 */
function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demands" element={<DemandsPage />} />
          <Route path="/demands/:id" element={<DemandDetailPage />} />

          {/* 认证相关 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/resend-verification"
            element={<ResendVerificationPage />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* 需登录 */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
            <Route
              path="/recharge"
              element={
                <ProtectedRoute>
                  <RechargePage />
                </ProtectedRoute>
              }
            />

          <Route
            path="/demands/new"
            element={
              <ProtectedRoute>
                <DemandFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />

          {/* 管理员后台 */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="demands" element={<AdminDemandsPage />} />
            <Route path="comments" element={<AdminCommentsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
