import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface CountUpOptions {
  /** 目标值 */
  end: number;
  /** 起始值，默认 0 */
  start?: number;
  /** 持续时间 ms，默认 1800 */
  duration?: number;
  /** 是否在进入视口时触发，默认 true */
  triggerOnView?: boolean;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 数字计数动画 hook。
 * 配合 framer-motion 的 useInView 实现进入视口触发。
 * 尊重 prefers-reduced-motion（开启时直接返回 end）。
 */
export function useCountUp({
  end,
  start = 0,
  duration = 1800,
  triggerOnView = true,
  enabled = true,
}: CountUpOptions) {
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = usePrefersReducedMotion();

  const shouldRun = enabled && (!triggerOnView || inView) && !reducedMotion;

  useEffect(() => {
    if (!shouldRun) {
      setValue(end);
      return;
    }
    let rafId = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shouldRun, end, start, duration]);

  return { ref, value };
}
