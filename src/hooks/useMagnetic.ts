import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface MagneticOptions {
  /** 磁性强度（0-1），越大越吸附 */
  strength?: number;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 磁性按钮 hook：监听鼠标在元素范围内的相对位置，
 * 通过 transform 平移实现磁性吸附效果。
 *
 * 仅在桌面（hover 支持）下启用，移动端自动跳过。
 * 调用方需要把返回的 ref 绑定到目标元素，并在 CSS 中允许 transform。
 */
export function useMagnetic<T extends HTMLElement>(
  options: MagneticOptions = {}
): RefObject<T> {
  const { strength = 0.35, enabled = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    // 仅在支持 hover 的设备上启用
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let rafId = 0;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        // 同步给 CSS 变量，供 ::before 光晕使用
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${px}%`);
        el.style.setProperty("--my", `${py}%`);
      });
    };

    const handleLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.transform = "translate(0, 0)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength, enabled]);

  return ref;
}
