import { Sparkles, Github, Twitter, Mail } from "lucide-react";

const LINKS = {
  product: {
    title: "产品",
    items: [
      { label: "运作方式", href: "#how-it-works" },
      { label: "需求分类", href: "#categories" },
      { label: "排行榜", href: "#leaderboards" },
      { label: "奖励计划", href: "#rewards" },
    ],
  },
  about: {
    title: "关于",
    items: [
      { label: "关于我们", href: "#" },
      { label: "联系我们", href: "#" },
      { label: "加入我们", href: "#" },
    ],
  },
  help: {
    title: "帮助",
    items: [
      { label: "常见问题", href: "#" },
      { label: "使用条款", href: "#" },
      { label: "隐私政策", href: "#" },
    ],
  },
};

const SOCIAL = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Mail, href: "#", label: "邮箱" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8">
          {/* 品牌区 */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#" className="flex items-center gap-2.5 smooth-color group">
              <span className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 group-hover:rotate-12 transition-transform duration-500">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                拾光互助
              </span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              让每一刻空闲，都有人接住
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              © 2026 拾光互助. 保留所有权利.
            </p>
          </div>

          {/* 链接区 */}
          {Object.entries(LINKS).map(([key, section]) => (
            <div key={key} className="lg:col-span-2">
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="smooth-color hover:text-foreground inline-block hover:translate-x-1 transition-transform duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 社交 */}
          <div className="lg:col-span-2 lg:flex lg:justify-end">
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground smooth-color hover:text-brand-600 hover:border-brand-300 hover:-translate-y-1 transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
