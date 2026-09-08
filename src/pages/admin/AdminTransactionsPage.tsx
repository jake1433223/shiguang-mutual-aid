import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAdminTransactionsQuery } from "@/hooks/queries/useAdminQueries";
import { TRANSACTION_TYPE_LABELS } from "@/types/api";
import { formatDate } from "@/utils/format";
import { Loader2, Search, Coins } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

const TYPE_OPTIONS = [
  { value: "", label: "全部类型" },
  { value: "REGISTER_BONUS", label: "注册赠送" },
  { value: "RECHARGE", label: "充值" },
  { value: "DEMAND_FREEZE", label: "需求冻结" },
  { value: "DEMAND_RELEASE", label: "需求释放" },
  { value: "DEMAND_REFUND", label: "需求退款" },
  { value: "DEMAND_REWARD", label: "接单奖励" },
  { value: "ADMIN_ADJUST", label: "管理员调整" },
];

function typeLabel(type: string) {
  return (TRANSACTION_TYPE_LABELS as Record<string, string>)[type] ?? type;
}

export default function AdminTransactionsPage() {
  usePageTitle("交易流水 - 管理后台");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");

  const { data, isLoading, isFetching } = useAdminTransactionsQuery({
    page,
    pageSize,
    keyword: keyword || undefined,
    type: type || undefined,
  });

  const total = data?.total ?? 0;
  const items = data?.items ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">交易流水</h1>
        <p className="text-sm text-muted-foreground mt-1">
          全站拾光币收支记录，可按类型和关键词筛选
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="搜索用户 / 备注 / 关联ID"
            className="w-full rounded-xl border border-neutral-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm bg-white"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 font-medium">用户</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">变动</th>
                  <th className="px-4 py-3 font-medium">余额</th>
                  <th className="px-4 py-3 font-medium">备注</th>
                  <th className="px-4 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-sm text-neutral-400">
                      暂无交易记录
                    </td>
                  </tr>
                ) : (
                  items.map((tx) => (
                    <tr key={tx.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-800">{tx.user?.name || "未知用户"}</div>
                        <div className="text-xs text-neutral-400">{tx.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                          {typeLabel(tx.type)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${tx.amount >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {tx.amount >= 0 ? "+" : ""}{tx.amount}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{tx.balance}</td>
                      <td className="px-4 py-3 text-neutral-500 max-w-[260px] truncate">{tx.remark}</td>
                      <td className="px-4 py-3 text-neutral-400">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && total > pageSize && (
          <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              共 {total} 条记录
            </div>
            <Pagination
              page={page}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-700">
        <Coins className="w-4 h-4 inline-block mr-1" />
        这里展示全站拾光币流水：注册赠送、充值、冻结、释放、退款、奖励、管理员调整。
      </div>
    </div>
  );
}
