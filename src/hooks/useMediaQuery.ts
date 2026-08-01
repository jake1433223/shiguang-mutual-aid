import { useEffect, useState } from "react";

/**
 * 监听媒体查询，返回是否匹配。
 * 用于响应式降级（如移动端关闭 3D）。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** 便捷预设：是否为移动端（< 768px） */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** 便捷预设：是否为平板或更小（< 1024px） */
export function useIsTabletOrBelow(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

/** 是否支持 hover（桌面） */
export function useSupportsHover(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
