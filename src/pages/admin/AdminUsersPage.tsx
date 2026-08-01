import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Ban,
  CheckCircle2,
  Coins,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  useAdminUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useAdjustCoinsMutation,
  useAdjustCreditMutation,
} from "@/hooks/queries/useAdminQueries";
import { Pagination } from "@/components/admin/Pagination";
import { Modal } from "@/components/admin/Modal";
import { formatRelativeTime } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  usePageTitle("用户管理");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "USER" | "ADMIN">("");
  const [bannedFilter, setBannedFilter] = useState<"" | "true" | "false">("");

  // 弹窗状态
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [coinsTarget, setCoinsTarget] = useState<{ id: string; name: string; coins: number } | null>(null);
  const [coinsAmount, setCoinsAmount] = useState<string>("");
  const [coinsRemark, setCoinsRemark] = useState("");
  const [creditTarget, setCreditTarget] = useState<{ id: string; name: string; credit: number } | null>(null);
  const [creditDelta, setCreditDelta] = useState<string>("");
  const [creditRemark, setCreditRemark] = useState("");

  const { data, isLoading } = useAdminUsersQuery({
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    role: roleFilter || undefined,
    banned: bannedFilter || undefined,
  });

  const banMut = useBanUserMutation();
  const unbanMut = useUnbanUserMutation();
  const coinsMut = useAdjustCoinsMutation();
  const creditMut = useAdjustCreditMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const onSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const onConfirmBan = () => {
    if (!banTarget || !banReason.trim()) return;
    banMut.mutate(
      { id: banTarget.id, payload: { reason: banReason.trim() } },
      { onSuccess: () => setBanTarget(null) },
    );
  };

  const onConfirmCoins = () => {
    if (!coinsTarget) return;
    const amount = parseInt(coinsAmount, 10);
    if (isNaN(amount) || amount === 0) return;
    coinsMut.mutate(
      {
        id: coinsTarget.id,
        payload: { amount, remark: coinsRemark.trim() || undefined },
      },
      {
        onSuccess: () => {
          setCoinsTarget(null);
          setCoinsAmount("");
          setCoinsRemark("");
        },
      },
    );
  };

  const onConfirmCredit = () => {
    if (!creditTarget) return;
    const delta = parseInt(creditDelta, 10);
    if (isNaN(delta) || delta === 0) return;
    creditMut.mutate(
      {
        id: creditTarget.id,
        payload: { delta, remark: creditRemark.trim() || undefined },
      },
      {
        onSuccess: () => {
          setCreditTarget(null);
          setCreditDelta("");
          setCreditRemark("");
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">用户管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理平台用户 · 封禁/解禁 · 调整拾光币与信用分
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="搜索邮箱或昵称"
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={onSearch}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 smooth-color"
          >
            搜索
          </button>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部角色</option>
          <option value="USER">普通用户</option>
          <option value="ADMIN">管理员</option>
        </select>

        <select
          value={bannedFilter}
          onChange={(e) => {
            setBannedFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400"
        >
          <option value="">全部状态</option>
          <option value="false">正常</option>
          <option value="true">已封禁</option>
        </select>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            暂无用户
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">用户</th>
                  <th className="text-left px-4 py-3 font-medium">角色</th>
                  <th className="text-left px-4 py-3 font-medium">拾光币</th>
                  <th className="text-left px-4 py-3 font-medium">信用分</th>
                  <th className="text-left px-4 py-3 font-medium">发布/接单/评论</th>
                  <th className="text-left px-4 py-3 font-medium">注册时间</th>
                  <th className="text-left px-4 py-3 font-medium">状态</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                    className="hover:bg-neutral-50/50 smooth-color"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 shrink-0">
                          {u.avatar}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[140px]">
                            {u.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-brand-100 text-brand-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {u.role === "ADMIN" ? "管理员" : "用户"}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium text-foreground">
                      {u.coins}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {u.creditScore}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {u._count.demands} / {u._count.applications} / {u._count.comments}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {u.bannedAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <Ban className="w-3 h-3" />
                          已封禁
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {u.role !== "ADMIN" && (
                          <>
                            {u.bannedAt ? (
                              <button
                                type="button"
                                onClick={() => unbanMut.mutate(u.id)}
                                disabled={unbanMut.isPending}
                                className="px-2 py-1 rounded text-xs text-emerald-600 hover:bg-emerald-50 smooth-color"
                              >
                                解禁
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setBanTarget({ id: u.id, name: u.name });
                                  setBanReason("");
                                }}
                                className="px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50 smooth-color"
                              >
                                封禁
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCoinsTarget({ id: u.id, name: u.name, coins: u.coins });
                                setCoinsAmount("");
                                setCoinsRemark("");
                              }}
                              className="px-2 py-1 rounded text-xs text-amber-600 hover:bg-amber-50 smooth-color inline-flex items-center gap-1"
                            >
                              <Coins className="w-3 h-3" />
                              调币
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCreditTarget({ id: u.id, name: u.name, credit: u.creditScore });
                                setCreditDelta("");
                                setCreditRemark("");
                              }}
                              className="px-2 py-1 rounded text-xs text-sky-600 hover:bg-sky-50 smooth-color inline-flex items-center gap-1"
                            >
                              <Shield className="w-3 h-3" />
                              调信用
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-neutral-100">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
          />
        </div>
      </div>

      {/* 封禁弹窗 */}
      <Modal
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
        title="封禁用户"
        loading={banMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setBanTarget(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 smooth-color"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirmBan}
              disabled={!banReason.trim() || banMut.isPending}
              className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 smooth-color"
            >
              确认封禁
            </button>
          </>
        }
      >
        {banTarget && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-neutral-700 bg-red-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                即将封禁用户 <strong>{banTarget.name}</strong>，封禁后该用户将无法登录。
              </span>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">封禁原因</span>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="请填写封禁原因，将通知用户"
                className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white resize-none"
              />
            </label>
          </div>
        )}
      </Modal>

      {/* 调币弹窗 */}
      <Modal
        open={!!coinsTarget}
        onClose={() => setCoinsTarget(null)}
        title="调整拾光币"
        loading={coinsMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setCoinsTarget(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 smooth-color"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirmCoins}
              disabled={!coinsAmount || parseInt(coinsAmount, 10) === 0 || coinsMut.isPending}
              className="px-3 py-1.5 rounded-lg text-sm bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 smooth-color"
            >
              确认调整
            </button>
          </>
        }
      >
        {coinsTarget && (
          <div className="space-y-3">
            <div className="text-sm text-neutral-700 bg-amber-50 rounded-lg p-3">
              用户 <strong>{coinsTarget.name}</strong> · 当前余额 <strong>{coinsTarget.coins}</strong>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">
                变动数量（正数=充值，负数=扣减）
              </span>
              <input
                type="number"
                value={coinsAmount}
                onChange={(e) => setCoinsAmount(e.target.value)}
                placeholder="如 50 或 -20"
                className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">备注（可选）</span>
              <input
                type="text"
                value={coinsRemark}
                onChange={(e) => setCoinsRemark(e.target.value)}
                maxLength={200}
                placeholder="如：补偿/活动奖励"
                className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white"
              />
            </label>
          </div>
        )}
      </Modal>

      {/* 调信用弹窗 */}
      <Modal
        open={!!creditTarget}
        onClose={() => setCreditTarget(null)}
        title="调整信用分"
        loading={creditMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreditTarget(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 smooth-color"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirmCredit}
              disabled={!creditDelta || parseInt(creditDelta, 10) === 0 || creditMut.isPending}
              className="px-3 py-1.5 rounded-lg text-sm bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 smooth-color"
            >
              确认调整
            </button>
          </>
        }
      >
        {creditTarget && (
          <div className="space-y-3">
            <div className="text-sm text-neutral-700 bg-sky-50 rounded-lg p-3">
              用户 <strong>{creditTarget.name}</strong> · 当前信用 <strong>{creditTarget.credit}</strong>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">
                变动数值（正数=加分，负数=扣分）
              </span>
              <input
                type="number"
                value={creditDelta}
                onChange={(e) => setCreditDelta(e.target.value)}
                placeholder="如 5 或 -10"
                className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">备注（可选）</span>
              <input
                type="text"
                value={creditRemark}
                onChange={(e) => setCreditRemark(e.target.value)}
                maxLength={200}
                placeholder="如：违规扣分"
                className="mt-1 w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:bg-white"
              />
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
