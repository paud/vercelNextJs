import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 禁用深色模式，只使用浅色主题
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#171717",
      },
    },
  },
  plugins: [],
} satisfies Config;
