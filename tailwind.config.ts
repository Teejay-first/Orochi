import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // PROJECT-SPECIFIC CUSTOM COLORS - Preserved
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        "price-green": {
          DEFAULT: "hsl(var(--price-green))",
          foreground: "hsl(var(--price-green-foreground))",
        },
        "status-deployed": {
          DEFAULT: "hsl(var(--status-deployed))",
          foreground: "hsl(var(--status-deployed-foreground))",
        },
        "status-testing": {
          DEFAULT: "hsl(var(--status-testing))",
          foreground: "hsl(var(--status-testing-foreground))",
        },
        "status-building": {
          DEFAULT: "hsl(var(--status-building))",
          foreground: "hsl(var(--status-building-foreground))",
        },
        "status-repairing": {
          DEFAULT: "hsl(var(--status-repairing))",
          foreground: "hsl(var(--status-repairing-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        "system-sm": "var(--radius-sm)",
        "system-base": "var(--radius-base)",
        "system-md": "var(--radius-md)",
        "system-lg": "var(--radius-lg)",
        "system-xl": "var(--radius-xl)",
        "system-2xl": "var(--radius-2xl)",
        "system-3xl": "var(--radius-3xl)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderWidth: {
        "system-0": "var(--border-width-0)",
        "system-1": "var(--border-width-1)",
        "system-2": "var(--border-width-2)",
        "system-4": "var(--border-width-4)",
        "system-8": "var(--border-width-8)",
      },
      boxShadow: {
        "system-xs": "var(--shadow-xs)",
        "system-sm": "var(--shadow-sm)",
        "system-base": "var(--shadow-base)",
        "system-md": "var(--shadow-md)",
        "system-lg": "var(--shadow-lg)",
        "system-xl": "var(--shadow-xl)",
        "system-2xl": "var(--shadow-2xl)",
        "system-inner": "var(--shadow-inner)",
        "system-glow": "var(--shadow-glow)",
        "system-glow-lg": "var(--shadow-glow-lg)",
        "system-colored": "var(--shadow-colored)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        fadeIn: {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        fadeOut: {
          from: {
            opacity: "1",
          },
          to: {
            opacity: "0",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        scaleOut: {
          from: {
            opacity: "1",
            transform: "scale(1)",
          },
          to: {
            opacity: "0",
            transform: "scale(0.95)",
          },
        },
        slideInFromRight: {
          from: {
            opacity: "0",
            transform: "translateX(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideInFromLeft: {
          from: {
            opacity: "0",
            transform: "translateX(-100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideInFromTop: {
          from: {
            opacity: "0",
            transform: "translateY(-100%)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInFromBottom: {
          from: {
            opacity: "0",
            transform: "translateY(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        bounce: {
          "0%, 20%, 53%, 80%, 100%": {
            transform: "translate3d(0, 0, 0)",
          },
          "40%, 43%": {
            transform: "translate3d(0, -8px, 0)",
          },
          "70%": {
            transform: "translate3d(0, -4px, 0)",
          },
          "90%": {
            transform: "translate3d(0, -2px, 0)",
          },
        },
        pulse: {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.7",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        shake: {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-4px)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translateX(4px)",
          },
        },
        spin: {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px hsl(var(--primary) / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.2)",
          },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "loading-bar": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "50%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn var(--duration-standard) var(--ease-out) forwards",
        "fade-out": "fadeOut var(--duration-standard) var(--ease-in) forwards",
        "scale-in": "scaleIn var(--duration-standard) var(--ease-out) forwards",
        "scale-out": "scaleOut var(--duration-standard) var(--ease-in) forwards",
        "slide-in-right": "slideInFromRight var(--duration-standard) var(--ease-out) forwards",
        "slide-in-left": "slideInFromLeft var(--duration-standard) var(--ease-out) forwards",
        "slide-in-top": "slideInFromTop var(--duration-standard) var(--ease-out) forwards",
        "slide-in-bottom": "slideInFromBottom var(--duration-standard) var(--ease-out) forwards",
        bounce: "bounce var(--duration-slow) var(--ease-out)",
        pulse: "pulse 2s var(--ease-in-out) infinite",
        shake: "shake var(--duration-slow) var(--ease-in-out)",
        spin: "spin 1s linear infinite",
        glow: "glow 2s var(--ease-in-out) infinite",
        shimmer: "shimmer 2s infinite",
        "loading-bar": "loading-bar 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
