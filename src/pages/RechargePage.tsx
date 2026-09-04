import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, Loader2, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useRechargePackagesQuery,
  useRechargeMutation,
} from "@/hooks/queries/useRechargeQueries";
import type { RechargePackage } from "@/types/api";

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

function RechargePageInner() {
  usePageTitle("充值中心 - 拾光互助");
  const user = useAuthStore((s) => s.user);
  const packagesQuery = useRechargePackagesQuery();
  const rechargeMut = useRechargeMutation();
  const [paidPackage, setPaidPackage] = useState<RechargePackage | null>(null);

  const packages = packagesQuery.data ?? [];

  const handleRecharge = (pkg: RechargePackage) => {
    setPaidPackage(null);
    rechargeMut.mutate(pkg.id, {
      onSuccess: () => setPaidPackage(pkg),
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-5xl mx-auto w-full px-6">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth-color mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回个人中心
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100 text-brand-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">充值中心</h1>
                <p className="text-sm text-muted-foreground">购买拾光币，发布互助需求更自由</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
              <Coins className="w-5 h-5 text-brand-500" />
              <div>
                <div className="text-xs text-muted-foreground">当前余额</div>
                <div className="text-xl font-bold text-foreground tabular-nums">{user?.coins ?? 0}</div>
              </div>
            </div>
          </div>

          {rechargeMut.isSuccess && paidPackage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-800"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">充值成功（模拟支付）</div>
                <div className="text-sm">
                  {paidPackage.name} 已到账 {paidPackage.totalCoins} 拾光币，当前余额 {user?.coins ?? 0}。
                  正式上线接入支付宝/微信后，这里会跳转真实收银台。
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="relative rounded-3xl border border-border bg-card p-6 flex flex-col"
              >
                {pkg.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 text-white text-xs font-semibold px-3 py-1">
                    {pkg.badge}
                  </span>
                )}
                <div className="text-sm font-semibold text-muted-foreground mb-1">{pkg.name}</div>
                <div className="text-3xl font-bold text-foreground tabular-nums mb-1">
                  {pkg.totalCoins}
                  <span className="text-sm font-normal text-muted-foreground ml-1">拾光币</span>
                </div>
                <div className="text-xs text-muted-foreground mb-5">{pkg.desc}</div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-xl font-bold text-brand-600">{formatPrice(pkg.price)}</div>
                  <button
                    type="button"
                    onClick={() => handleRecharge(pkg)}
                    disabled={rechargeMut.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-500 disabled:opacity-50 smooth-color"
                  >
                    {rechargeMut.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    模拟充值
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-muted/50 p-5 text-sm text-muted-foreground space-y-2">
            <p>
              <span className="font-semibold text-foreground">说明：</span>
              当前为演示版“模拟支付”，用于打通充值流程，不会真实扣款。
            </p>
            <p>
              正式商业化接入时，将替换为：创建支付单 → 跳转支付宝/微信 → 回调确认 → 到账。
            </p>
            <p>
              拾光币是站内虚拟互助积分，不支持提现为法定货币；你可通过完成/发布互助获取或消耗。
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function RechargePage() {
  return <RechargePageInner />;
}
