import { Search, X } from "lucide-react";
import type { DemandCategory, DemandSort, DemandStatus } from "@/types/api";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/types/api";

/* ============================================================
   筛选状态类型
   ============================================================ */
export interface FilterState {
  category: DemandCategory | "all";
  status: DemandStatus | "all";
  sort: DemandSort;
  keyword: string;
  page: number;
}

export const DEFAULT_FILTER: FilterState = {
  category: "all",
  status: "all",
  sort: "latest",
  keyword: "",
  page: 1,
};

/* ============================================================
   选项常量
   ============================================================ */
const CATEGORY_OPTIONS: Array<{ key: DemandCategory | "all"; label: string }> = [
  { key: "all", label: "全部分类" },
  { key: "TECH", label: CATEGORY_LABELS.TECH },
  { key: "DESIGN", label: CATEGORY_LABELS.DESIGN },
  { key: "TRANSLATE", label: CATEGORY_LABELS.TRANSLATE },
  { key: "STUDY", label: CATEGORY_LABELS.STUDY },
  { key: "ERRAND", label: CATEGORY_LABELS.ERRAND },
  { key: "OTHER", label: CATEGORY_LABELS.OTHER },
];

const STATUS_OPTIONS: Array<{ key: DemandStatus | "all"; label: string }> = [
  { key: "all", label: "全部状态" },
  { key: "OPEN", label: STATUS_LABELS.OPEN },
  { key: "IN_PROGRESS", label: STATUS_LABELS.IN_PROGRESS },
  { key: "DONE", label: STATUS_LABELS.DONE },
];

const SORT_OPTIONS: Array<{ key: DemandSort; label: string }> = [
  { key: "latest", label: "最新发布" },
  { key: "reward-desc", label: "奖励最高" },
  { key: "applicants-desc", label: "最热门" },
];

/* ============================================================
   通用按钮组
   ============================================================ */
function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ key: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`text-xs px-3 py-1.5 rounded-full smooth-color ${
              active
                ? "bg-brand-600 text-white border border-brand-600"
                : "bg-muted text-muted-foreground border border-transparent hover:border-border-strong hover:text-foreground"
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   DemandFilters 主体
   ============================================================ */
export function DemandFilters({
  value,
  onChange,
  totalCount,
  visibleCount,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  totalCount: number;
  visibleCount: number;
}) {
  const update = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v, page: key === "page" ? (v as number) : 1 });

  const hasActiveFilter =
    value.category !== "all" ||
    value.status !== "all" ||
    value.keyword.trim() !== "";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 lg:sticky lg:top-20">
      {/* 搜索框 */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value.keyword}
          onChange={(e) => update("keyword", e.target.value)}
          placeholder="搜索标题、标签或描述…"
          aria-label="搜索需求"
          className="w-full bg-muted rounded-full pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 border border-transparent focus:border-brand-300 focus:bg-card focus:outline-none smooth-color"
        />
        {value.keyword && (
          <button
            type="button"
            onClick={() => update("keyword", "")}
            aria-label="清空搜索"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth-color"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 分类 */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2.5">
          分类
        </div>
        <ButtonGroup
          options={CATEGORY_OPTIONS}
          value={value.category}
          onChange={(v) => update("category", v)}
          ariaLabel="按分类筛选"
        />
      </div>

      {/* 状态 */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2.5">
          状态
        </div>
        <ButtonGroup
          options={STATUS_OPTIONS}
          value={value.status}
          onChange={(v) => update("status", v)}
          ariaLabel="按状态筛选"
        />
      </div>

      {/* 排序 */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2.5">
          排序
        </div>
        <ButtonGroup
          options={SORT_OPTIONS}
          value={value.sort}
          onChange={(v) => update("sort", v)}
          ariaLabel="排序方式"
        />
      </div>

      {/* 计数提示 + 重置 */}
      <div className="border-t border-border pt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          已显示 <span className="font-semibold text-foreground tabular-nums">{visibleCount}</span>
          {" "}/ 共 {totalCount} 条
        </span>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTER })}
            className="text-xs text-brand-600 hover:text-brand-700 smooth-color"
          >
            重置筛选
          </button>
        )}
      </div>
    </div>
  );
}
