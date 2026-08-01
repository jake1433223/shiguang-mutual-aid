import { create } from "zustand";

export type LeaderboardCategory = "tech" | "design" | "translate";

interface AppState {
  /** 当前排行榜选中的分类 */
  leaderboardTab: LeaderboardCategory;
  /** 移动端导航菜单是否展开 */
  mobileMenuOpen: boolean;
  setLeaderboardTab: (tab: LeaderboardCategory) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  leaderboardTab: "tech",
  mobileMenuOpen: false,
  setLeaderboardTab: (tab) => set({ leaderboardTab: tab }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
