import { useEffect, useRef } from "react";

/**
 * 全局鼠标位置追踪（归一化到 [-1, 1]，方便 Three.js / 视差使用）。
 * 通过 ref 避免重渲染，调用方在 RAF 中读取 current 值。
 */
export function useMousePosition() {
  const position = useRef({ x: 0, y: 0 });
  const normalized = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      position.current.x = e.clientX;
      position.current.y = e.clientY;
      normalized.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      normalized.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return { position, normalized };
}
