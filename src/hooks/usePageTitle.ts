import { useEffect } from "react";

/**
 * 设置页面标题（SEO + 浏览器标签）
 * 用法：usePageTitle("需求广场")
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} — 拾光互助`;
    return () => {
      document.title = "拾光互助 — 让每一刻空闲都有人接住";
    };
  }, [title]);
}
