import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(222, 47%, 6%)",
        foreground: "hsl(0, 0%, 95%)",
        card: "hsl(222, 47%, 8%)",
        "card-foreground": "hsl(0, 0%, 95%)",
        popover: "hsl(222, 47%, 8%)",
        "popover-foreground": "hsl(0, 0%, 95%)",
        primary: "hsl(174, 72%, 46%)",
        "primary-foreground": "hsl(222, 47%, 6%)",
        secondary: "hsl(262, 83%, 65%)",
        "secondary-foreground": "hsl(222, 47%, 6%)",
        muted: "hsl(222, 20%, 20%)",
        "muted-foreground": "hsl(0, 0%, 70%)",
        accent: "hsl(43, 96%, 58%)",
        "accent-foreground": "hsl(222, 47%, 6%)",
        destructive: "hsl(0, 84%, 60%)",
        border: "hsl(222, 20%, 25%)",
        input: "hsl(222, 20%, 25%)",
        ring: "hsl(174, 72%, 46%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        "space-grotesk": ["var(--font-space-grotesk)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(174, 72%, 46%, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(174, 72%, 46%, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
