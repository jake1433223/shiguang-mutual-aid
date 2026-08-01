/**
 * 通用格式化工具（与原 mockData 中的 formatRelativeTime / daysUntilDeadline 保持兼容）
 */

/** 相对时间格式化：刚刚 / N 分钟前 / N 小时前 / N 天前 / 超过一周显示日期 */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  if (hour < 24) return `${hour} 小时前`;
  if (day < 7) return `${day} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

/** 距离截止还剩多少天（负数表示已过期） */
export function daysUntilDeadline(iso: string): number {
  const deadline = new Date(iso);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** 把 ISO 日期格式化为 yyyy-mm-dd */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-CN");
}

/** 把 ISO 日期格式化为 yyyy-mm-dd HH:MM */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
