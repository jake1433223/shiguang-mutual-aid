// ============================================================
// 全局 API 类型定义
// ============================================================

/** 统一响应包：成功 */
export interface ApiSuccess<T> {
  code: 0;
  data: T;
  message: string;
}

/** 统一响应包：失败 */
export interface ApiError {
  code: number;
  message: string;
  data: null;
}

/** 分页结果 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================
// 枚举
// ============================================================

export type DemandCategory =
  | "TECH"
  | "DESIGN"
  | "TRANSLATE"
  | "STUDY"
  | "ERRAND"
  | "OTHER";

export type DemandStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type DemandSort = "latest" | "reward-desc" | "applicants-desc";

// ============================================================
// 充值
// ============================================================

export type RechargePackageId = "tiny" | "basic" | "pro" | "max";

export interface RechargePackage {
  id: RechargePackageId;
  name: string;
  coins: number;
  /** 价格，单位：分 */
  price: number;
  bonus: number;
  desc: string;
  badge?: string;
  totalCoins: number;
}

export interface RechargeResult {
  orderId: string;
  amount: number;
  price: number;
  method: "MOCK" | "ALIPAY" | "WECHAT";
  paidAt: string;
  user: User;
  transaction: Transaction;
}


// ============================================================
// 实体
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  tier: number;
  coins: number;
  creditScore: number;
  role: "USER" | "ADMIN";
  emailVerified: string | null; // ISO 时间，null 表示未验证
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 列表/详情接口里的发布者精简对象 */
export interface Publisher {
  id: string;
  name: string;
  avatar: string;
  tier: number;
  bio?: string;
}

export interface Demand {
  id: string;
  title: string;
  desc: string;
  category: DemandCategory;
  reward: number;
  status: DemandStatus;
  tags: string[];
  location: string | null;
  deadline: string; // ISO
  publishedAt: string; // ISO
  views: number;
  publisherId: string;
  publisher: Publisher;
  _count: { applications: number; comments: number };
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  demandId: string;
  helperId: string;
  demand: {
    id: string;
    title: string;
    category: DemandCategory;
    reward: number;
    status: DemandStatus;
    deadline: string;
    publisherId: string;
    publisher: { id: string; name: string; avatar: string } | null;
  } | null;
  helper: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    tier: number;
    creditScore: number;
  } | null;
}

export interface Comment {
  id: string;
  content: string;
  rating: number | null;
  createdAt: string;
  demandId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    tier: number;
  } | null;
}

export interface Testimonial {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    tier: number;
  } | null;
}

export interface Category {
  key: DemandCategory;
  label: string;
  desc: string;
  open: number;
  helpers: number;
}

// ============================================================
// 公开统计 / 排行榜
// ============================================================

export interface SiteOverview {
  helpers: number;
  demands: number;
  completed: number;
  avgResponseMinutes: number;
}

export interface LeaderboardRow {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  bio: string;
  tier: number;
  creditScore: number;
  answers: number;
  questions: number;
  points: number;
}

// ============================================================
// 请求 DTO
// ============================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface UpdateUserPayload {
  name?: string;
  avatar?: string;
  bio?: string;
}

export interface CreateDemandPayload {
  title: string;
  desc: string;
  category: DemandCategory;
  reward: number;
  tags?: string[];
  location?: string;
  deadline: string; // ISO date
}

export interface QueryDemandsParams {
  category?: DemandCategory;
  status?: DemandStatus;
  sort?: DemandSort;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateApplicationPayload {
  message?: string;
}

export interface UpdateApplicationPayload {
  status: "ACCEPTED" | "REJECTED" | "COMPLETED";
}

export interface CreateCommentPayload {
  content: string;
  rating?: number;
}

export interface CreateTestimonialPayload {
  content: string;
  rating: number;
}

// ============================================================
// 认证增强：邮箱验证 / 找回密码
// ============================================================

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface MessageResult {
  message: string;
}

// ============================================================
// 通知 / 举报 / 交易流水
// ============================================================

export type NotificationType =
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "DEMAND_COMPLETED"
  | "COMMENT_POSTED"
  | "SYSTEM"
  | "REPORT_RESOLVED"
  | "COIN_ADJUSTED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface QueryNotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface NotificationsResult {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

export type ReportReason = "SPAM" | "ABUSE" | "PORNOGRAPHY" | "FRAUD" | "OTHER";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type ReportTargetType = "DEMAND" | "COMMENT" | "USER";

export interface Report {
  id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolution: string | null;
  targetType: ReportTargetType;
  targetId: string;
  createdAt: string;
  resolvedAt: string | null;
  reporterId: string;
}

export interface CreateReportPayload {
  reason: ReportReason;
  description?: string;
  targetType: ReportTargetType;
  targetId: string;
}

export type TransactionType =
  | "REGISTER_BONUS"
  | "DEMAND_FREEZE"
  | "DEMAND_RELEASE"
  | "DEMAND_REFUND"
  | "ADMIN_ADJUST"
  | "DEMAND_REWARD"
    | "RECHARGE";

export interface Transaction {
  id: string;
  amount: number; // 正数=收入，负数=支出
  balance: number;
  type: TransactionType;
  refType: string | null;
  refId: string | null;
  remark: string | null;
  createdAt: string;
  userId: string;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  REGISTER_BONUS: "注册赠送",
  DEMAND_FREEZE: "需求冻结",
  DEMAND_RELEASE: "需求释放",
  DEMAND_REFUND: "需求退款",
  ADMIN_ADJUST: "管理员调整",
  DEMAND_REWARD: "接单奖励",
    RECHARGE: "充值到账",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  APPLICATION_ACCEPTED: "接单申请",
  APPLICATION_REJECTED: "接单申请",
  DEMAND_COMPLETED: "需求完成",
  COMMENT_POSTED: "评论通知",
  SYSTEM: "系统通知",
  REPORT_RESOLVED: "举报处理",
  COIN_ADJUSTED: "拾光币变动",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "垃圾广告",
  ABUSE: "辱骂攻击",
  PORNOGRAPHY: "色情低俗",
  FRAUD: "欺诈",
  OTHER: "其他",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "待处理",
  RESOLVED: "已处理",
  DISMISSED: "已驳回",
};

// ============================================================
// 通用映射（与原 mockData 保持兼容）
// ============================================================

export const CATEGORY_LABELS: Record<DemandCategory, string> = {
  TECH: "技术编程",
  DESIGN: "设计创意",
  TRANSLATE: "翻译润色",
  STUDY: "学习辅导",
  ERRAND: "生活跑腿",
  OTHER: "其他求助",
};

export const STATUS_LABELS: Record<DemandStatus, string> = {
  OPEN: "招募中",
  IN_PROGRESS: "进行中",
  DONE: "已完成",
  CANCELLED: "已取消",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "待处理",
  ACCEPTED: "已接受",
  REJECTED: "已拒绝",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};
