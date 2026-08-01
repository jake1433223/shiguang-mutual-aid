/**
 * Mock 数据集中管理
 * - 类型定义导出
 * - DEMANDS / TESTIMONIALS / HELPERS / COMMENTS 静态数组
 * - 工具函数：getDemandById / getCommentsByDemandId / formatRelativeTime
 *
 * 决策：avatar 字段存名字首字，由组件渲染为彩色圆 + 首字母（不依赖外部图片）。
 */

/* ============================================================
   类型定义
   ============================================================ */
export type DemandCategory =
  | "tech"
  | "design"
  | "translate"
  | "study"
  | "errand"
  | "other";

export type DemandStatus = "open" | "in-progress" | "done";

export interface Publisher {
  id: string;
  name: string;
  avatar: string; // 存名字，由组件渲染首字母圆
  tier: 1 | 2 | 3;
}

export interface Demand {
  id: string;
  title: string;
  desc: string;
  category: DemandCategory;
  categoryLabel: string;
  reward: number; // 拾光币
  publisher: Publisher;
  publishedAt: string; // ISO 日期
  deadline: string; // ISO 日期
  status: DemandStatus;
  applicants: number;
  views: number;
  location?: string;
  tags: string[];
}

export interface Testimonial {
  id: string;
  user: string;
  role: string;
  avatar: string;
  content: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface Helper {
  id: string;
  name: string;
  avatar: string;
  tier: 1 | 2 | 3;
  helpedCount: number;
  rating: number;
  tags: string[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

/* ============================================================
   分类标签映射
   ============================================================ */
export const CATEGORY_LABELS: Record<DemandCategory, string> = {
  tech: "技术编程",
  design: "设计创意",
  translate: "翻译润色",
  study: "学习辅导",
  errand: "生活跑腿",
  other: "其他求助",
};

/* ============================================================
   发布者（共用）
   ============================================================ */
const PUBLISHERS: Record<string, Publisher> = {
  p1: { id: "p1", name: "林小满", avatar: "林", tier: 2 },
  p2: { id: "p2", name: "周野", avatar: "周", tier: 1 },
  p3: { id: "p3", name: "苏沐然", avatar: "苏", tier: 3 },
  p4: { id: "p4", name: "陈砚", avatar: "陈", tier: 2 },
  p5: { id: "p5", name: "夏栀", avatar: "夏", tier: 1 },
  p6: { id: "p6", name: "顾时安", avatar: "顾", tier: 2 },
  p7: { id: "p7", name: "梁书白", avatar: "梁", tier: 3 },
  p8: { id: "p8", name: "阮清歌", avatar: "阮", tier: 1 },
  p9: { id: "p9", name: "江雪", avatar: "江", tier: 2 },
  p10: { id: "p10", name: "谢知夏", avatar: "谢", tier: 1 },
  p11: { id: "p11", name: "韩澈", avatar: "韩", tier: 2 },
  p12: { id: "p12", name: "温野", avatar: "温", tier: 1 },
};

/* ============================================================
   DEMANDS —— 12 条，6 个分类各 2 条
   ============================================================ */
export const DEMANDS: Demand[] = [
  {
    id: "d001",
    title: "帮我看一段 React 性能优化的代码",
    desc: "有一个长列表组件，滚动的时候掉帧严重，用了虚拟化但效果一般。希望有人帮我看看 useMemo 和 useCallback 用得对不对，顺便给点重构建议。大概 200 行代码。",
    category: "tech",
    categoryLabel: "技术编程",
    reward: 60,
    publisher: PUBLISHERS.p1,
    publishedAt: "2026-07-19T14:30:00+08:00",
    deadline: "2026-07-25T23:59:00+08:00",
    status: "open",
    applicants: 4,
    views: 187,
    tags: ["React", "性能优化", "前端"],
  },
  {
    id: "d002",
    title: "TypeScript 泛型类型推导问题求助",
    desc: "想写一个工具函数，能根据传入对象的部分 key 推导出剩余 key 的类型，但是 TS 一直报错。希望有熟悉高级类型的朋友帮我看看，30 分钟应该能搞定。",
    category: "tech",
    categoryLabel: "技术编程",
    reward: 45,
    publisher: PUBLISHERS.p2,
    publishedAt: "2026-07-20T09:15:00+08:00",
    deadline: "2026-07-22T23:59:00+08:00",
    status: "in-progress",
    applicants: 2,
    views: 96,
    tags: ["TypeScript", "泛型", "类型体操"],
  },
  {
    id: "d003",
    title: "需要一个社团招新海报",
    desc: "我们是学校的摄影社，下学期招新。希望设计一张有质感、稍微复古一点的海报，主色调用胶片暖橙。我会提供文字内容和几张参考图，预算可以再聊。",
    category: "design",
    categoryLabel: "设计创意",
    reward: 120,
    publisher: PUBLISHERS.p3,
    publishedAt: "2026-07-18T20:00:00+08:00",
    deadline: "2026-08-05T23:59:00+08:00",
    status: "open",
    applicants: 7,
    views: 312,
    tags: ["海报", "复古", "摄影"],
  },
  {
    id: "d004",
    title: "帮我画一个播客封面头像",
    desc: "我的播客叫《深夜厨房》，想做一个有手绘感、带点食物元素的方形封面。风格偏温馨治愈，不要写实。需要 PNG 和源文件。",
    category: "design",
    categoryLabel: "设计创意",
    reward: 90,
    publisher: PUBLISHERS.p4,
    publishedAt: "2026-07-15T11:20:00+08:00",
    deadline: "2026-07-30T23:59:00+08:00",
    status: "in-progress",
    applicants: 3,
    views: 154,
    tags: ["插画", "播客", "手绘"],
  },
  {
    id: "d005",
    title: "一段 800 字英文摘要中译",
    desc: "我写了一篇关于可持续设计的论文，需要把摘要翻成中文用于投稿。专业词汇不算太多，希望译者能保持学术语感，不要机翻痕迹。",
    category: "translate",
    categoryLabel: "翻译润色",
    reward: 50,
    publisher: PUBLISHERS.p5,
    publishedAt: "2026-07-17T16:45:00+08:00",
    deadline: "2026-07-24T23:59:00+08:00",
    status: "open",
    applicants: 5,
    views: 132,
    tags: ["英译中", "学术", "论文"],
  },
  {
    id: "d006",
    title: "日语邮件润色，约 300 字",
    desc: "给日本教授写了一封请求推荐信的邮件，自己写完不太确定敬语用得对不对。希望母语者或者 N1 大佬帮我润色一下语气。",
    category: "translate",
    categoryLabel: "翻译润色",
    reward: 35,
    publisher: PUBLISHERS.p6,
    publishedAt: "2026-07-16T22:10:00+08:00",
    deadline: "2026-07-21T23:59:00+08:00",
    status: "done",
    applicants: 6,
    views: 88,
    tags: ["日语", "敬语", "邮件"],
  },
  {
    id: "d007",
    title: "高数下册不定积分辅导",
    desc: "大二学生，正在准备补考。换元积分和分部积分一直搞混，希望有人能帮我梳理一下思路，做几道典型题。线上腾讯会议 1.5 小时左右。",
    category: "study",
    categoryLabel: "学习辅导",
    reward: 80,
    publisher: PUBLISHERS.p7,
    publishedAt: "2026-07-19T10:00:00+08:00",
    deadline: "2026-07-28T23:59:00+08:00",
    status: "open",
    applicants: 3,
    views: 145,
    tags: ["高数", "积分", "辅导"],
  },
  {
    id: "d008",
    title: "Python 入门陪练 4 次",
    desc: "零基础想学 Python，看视频容易走神。希望有人能每周陪练一次，每次 1 小时，带我做小项目。预算 4 次打包。",
    category: "study",
    categoryLabel: "学习辅导",
    reward: 200,
    publisher: PUBLISHERS.p8,
    publishedAt: "2026-07-14T18:30:00+08:00",
    deadline: "2026-08-20T23:59:00+08:00",
    status: "in-progress",
    applicants: 8,
    views: 421,
    tags: ["Python", "入门", "陪练"],
  },
  {
    id: "d009",
    title: "代取快递（校园内）",
    desc: "今天下午临时有事不在学校，有两个快递在菜鸟驿站，希望有人能帮我取一下送到 7 号宿舍楼下。20 元跑腿费。",
    category: "errand",
    categoryLabel: "生活跑腿",
    reward: 20,
    publisher: PUBLISHERS.p9,
    publishedAt: "2026-07-21T13:00:00+08:00",
    deadline: "2026-07-21T19:00:00+08:00",
    status: "open",
    applicants: 2,
    views: 64,
    location: "东区校园",
    tags: ["校园", "代取", "当天"],
  },
  {
    id: "d010",
    title: "周末帮我去花市挑几束花",
    desc: "周六下午想布置一下家里，但自己对花一窍不通。希望有人陪我一起去花卉市场，帮我挑 3-4 束适合客厅的鲜花，顺便教我养护。",
    category: "errand",
    categoryLabel: "生活跑腿",
    reward: 70,
    publisher: PUBLISHERS.p10,
    publishedAt: "2026-07-20T08:00:00+08:00",
    deadline: "2026-07-27T18:00:00+08:00",
    status: "open",
    applicants: 1,
    views: 49,
    location: "城南花卉市场",
    tags: ["周末", "花市", "陪伴"],
  },
  {
    id: "d011",
    title: "帮忙选一台适合写论文的笔记本",
    desc: "预算 6-8k，主要用来写论文、查文献、看 PDF，偶尔剪短视频。希望有人能给我列 3-5 个候选机型，分析一下优缺点。不需要代买。",
    category: "other",
    categoryLabel: "其他求助",
    reward: 30,
    publisher: PUBLISHERS.p11,
    publishedAt: "2026-07-18T15:20:00+08:00",
    deadline: "2026-07-26T23:59:00+08:00",
    status: "open",
    applicants: 9,
    views: 256,
    tags: ["选购", "笔记本", "论文"],
  },
  {
    id: "d012",
    title: "我养的绿萝叶子发黄了求救",
    desc: "办公室养的绿萝最近叶子一片片发黄，浇水频率没变。希望有养花经验的朋友帮我看看是光照、水还是肥的问题。可以发照片。",
    category: "other",
    categoryLabel: "其他求助",
    reward: 15,
    publisher: PUBLISHERS.p12,
    publishedAt: "2026-07-21T09:30:00+08:00",
    deadline: "2026-07-28T23:59:00+08:00",
    status: "open",
    applicants: 5,
    views: 73,
    tags: ["植物", "绿萝", "办公室"],
  },
];

/* ============================================================
   TESTIMONIALS —— 4 条，渲染时取前 3 条
   ============================================================ */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    user: "沈知意",
    role: "大三学生 · 经管学院",
    avatar: "沈",
    content:
      "原本只是试试看，结果第一次发需求 10 分钟就有人接了。帮我辅导高数的学姐讲得比助教还清楚，补考稳了。",
    rating: 5,
  },
  {
    id: "t2",
    user: "陆时予",
    role: "自由设计师",
    avatar: "陆",
    content:
      "碎片时间接一些海报和插画的小单，既能练手又能赚点买菜钱。平台氛围很温和，不像传统外包那么卷。",
    rating: 5,
  },
  {
    id: "t3",
    user: "宋老师",
    role: "退休语文教师",
    avatar: "宋",
    content:
      "退休后总想再教点什么。在这里帮年轻人改简历、看文书，看到他们拿到 offer 比自己当年评职称还开心。",
    rating: 4,
  },
  {
    id: "t4",
    user: "韩立诚",
    role: "上班族 · 程序员",
    avatar: "韩",
    content:
      "下班后帮人 debug 几个小问题，比刷手机强多了。慢慢攒下来的拾光币换了几本想买很久的技术书。",
    rating: 5,
  },
];

/* ============================================================
   HELPERS —— 8 个帮手（首页排行榜 / 详情页推荐可用）
   ============================================================ */
export const HELPERS: Helper[] = [
  { id: "h1", name: "沈知意", avatar: "沈", tier: 3, helpedCount: 128, rating: 4.9, tags: ["高数", "英语"] },
  { id: "h2", name: "陆时予", avatar: "陆", tier: 2, helpedCount: 96, rating: 4.8, tags: ["海报", "插画"] },
  { id: "h3", name: "宋老师", avatar: "宋", tier: 3, helpedCount: 156, rating: 5.0, tags: ["文书", "简历"] },
  { id: "h4", name: "韩立诚", avatar: "韩", tier: 2, helpedCount: 87, rating: 4.7, tags: ["Python", "前端"] },
  { id: "h5", name: "周野", avatar: "周", tier: 1, helpedCount: 34, rating: 4.6, tags: ["TS", "算法"] },
  { id: "h6", name: "苏沐然", avatar: "苏", tier: 3, helpedCount: 142, rating: 4.9, tags: ["摄影", "排版"] },
  { id: "h7", name: "夏栀", avatar: "夏", tier: 1, helpedCount: 22, rating: 4.5, tags: ["翻译", "日语"] },
  { id: "h8", name: "顾时安", avatar: "顾", tier: 2, helpedCount: 73, rating: 4.8, tags: ["跑腿", "陪伴"] },
];

/* ============================================================
   COMMENTS —— 为前 4 条需求各准备 4~6 条评论
   ============================================================ */
export const COMMENTS: Record<string, Comment[]> = {
  d001: [
    {
      id: "c1",
      author: "韩立诚",
      avatar: "韩",
      content: "看了一下，你的 useMemo 依赖项漏了 list 引用，重新渲染的时候其实没缓存住。",
      createdAt: "2026-07-19T15:10:00+08:00",
      rating: 5,
    },
    {
      id: "c2",
      author: "周野",
      avatar: "周",
      content: "顺便建议用 react-window 替代一下你的手写虚拟化，效果会好很多。",
      createdAt: "2026-07-19T16:20:00+08:00",
    },
    {
      id: "c3",
      author: "林小满",
      avatar: "林",
      content: "谢谢两位！我下午试试 react-window，回头更新一下代码。",
      createdAt: "2026-07-19T17:00:00+08:00",
    },
    {
      id: "c4",
      author: "沈知意",
      avatar: "沈",
      content: "学到了，mark 一下。",
      createdAt: "2026-07-20T08:30:00+08:00",
    },
  ],
  d002: [
    {
      id: "c5",
      author: "韩立诚",
      avatar: "韩",
      content: "你想要的是 distributive conditional type 还是 mapped type？发个最小复现看看。",
      createdAt: "2026-07-20T09:40:00+08:00",
    },
    {
      id: "c6",
      author: "周野",
      avatar: "周",
      content: "这种类型推导最好把函数签名贴出来，光描述不好判断。",
      createdAt: "2026-07-20T10:15:00+08:00",
    },
    {
      id: "c7",
      author: "周野",
      avatar: "周",
      content: "已接单，私信发你 playground 链接。",
      createdAt: "2026-07-20T10:48:00+08:00",
    },
    {
      id: "c8",
      author: "周野",
      avatar: "周",
      content: "搞定了，加了 keyof + infer 就行。代码已经私信发你了。",
      createdAt: "2026-07-20T14:30:00+08:00",
      rating: 5,
    },
  ],
  d003: [
    {
      id: "c9",
      author: "陆时予",
      avatar: "陆",
      content: "胶片暖橙 + 招新，这个方向我很感兴趣，参考图可以发我看一下吗？",
      createdAt: "2026-07-18T20:30:00+08:00",
    },
    {
      id: "c10",
      author: "苏沐然",
      avatar: "苏",
      content: "建议主色再加深一点，纯暖橙印出来会偏荧光。可以试试 #D9701A 这个色。",
      createdAt: "2026-07-19T09:00:00+08:00",
    },
    {
      id: "c11",
      author: "苏沐然",
      avatar: "苏",
      content: "已经接单了，明天给你出第一版草图。",
      createdAt: "2026-07-19T14:20:00+08:00",
    },
    {
      id: "c12",
      author: "林小满",
      avatar: "林",
      content: "围观一下，期待成品。",
      createdAt: "2026-07-19T18:00:00+08:00",
    },
    {
      id: "c13",
      author: "苏沐然",
      avatar: "苏",
      content: "初稿已发，看看哪里需要调整～",
      createdAt: "2026-07-20T11:00:00+08:00",
      rating: 5,
    },
  ],
  d004: [
    {
      id: "c14",
      author: "陆时予",
      avatar: "陆",
      content: "深夜厨房这个主题很有意思！想问下源文件要 PSD 还是 AI？",
      createdAt: "2026-07-15T13:00:00+08:00",
    },
    {
      id: "c15",
      author: "陈砚",
      avatar: "陈",
      content: "PSD 就行，方便我后面自己改字。",
      createdAt: "2026-07-15T13:30:00+08:00",
    },
    {
      id: "c16",
      author: "陆时予",
      avatar: "陆",
      content: "好的，已经接单。这周末给你出 3 个草图方向选一个。",
      createdAt: "2026-07-15T15:00:00+08:00",
    },
    {
      id: "c17",
      author: "陆时予",
      avatar: "陆",
      content: "草图 v1 已发，注意查收。",
      createdAt: "2026-07-17T10:00:00+08:00",
    },
  ],
};

/* ============================================================
   工具函数
   ============================================================ */

/** 根据 id 查找需求 */
export function getDemandById(id: string): Demand | undefined {
  return DEMANDS.find((d) => d.id === id);
}

/** 根据 demandId 获取评论列表（无评论返回空数组） */
export function getCommentsByDemandId(id: string): Comment[] {
  return COMMENTS[id] ?? [];
}

/**
 * 相对时间格式化
 * - < 1 小时：刚刚
 * - < 24 小时：N 小时前
 * - < 7 天：N 天前
 * - 否则：YYYY-MM-DD
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return iso.slice(0, 10);
}

/**
 * 计算距离截止时间的天数（负数表示已过期）
 */
export function daysUntilDeadline(deadlineIso: string): number {
  const deadline = new Date(deadlineIso).getTime();
  const now = Date.now();
  return Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
}

/**
 * 状态对应的中文标签
 */
export const STATUS_LABELS: Record<DemandStatus, string> = {
  open: "招募中",
  "in-progress": "进行中",
  done: "已完成",
};
