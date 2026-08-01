import { useMediaQuery } from "./useMediaQuery";

/** 用户是否偏好减弱动效 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
