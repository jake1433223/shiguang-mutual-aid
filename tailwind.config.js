/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        input: "var(--input)",
        ring: "var(--ring)",
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
          950: "var(--brand-950)",
        },
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
      },
      fontFamily: {
        sans: ['Sora', 'PingFang SC', 'Microsoft YaHei', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'Sora', 'PingFang SC', 'Microsoft YaHei', 'ui-serif', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "9999px",
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      letterSpacing: {
        tight: "-0.02em",
      },
      keyframes: {
        "glow-drift-a": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(50px, -30px) scale(1.12)" },
        },
        "glow-drift-b": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(-40px, 40px) scale(1.18)" },
        },
        "glow-drift-c": {
          "0%": { transform: "translate(0, 0) scale(1.1)" },
          "100%": { transform: "translate(30px, 20px) scale(0.95)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: 0.7 },
          "100%": { transform: "scale(1.4)", opacity: 0 },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "marquee-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "glow-a": "glow-drift-a 24s ease-in-out infinite alternate",
        "glow-b": "glow-drift-b 28s ease-in-out infinite alternate",
        "glow-c": "glow-drift-c 22s ease-in-out infinite alternate",
        "float-soft": "float-soft 7s ease-in-out infinite",
        "float-subtle": "float-subtle 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "gradient-pan": "gradient-pan 8s ease-in-out infinite",
        "marquee-x": "marquee-x 40s linear infinite",
      },
    },
  },
  plugins: [],
};
