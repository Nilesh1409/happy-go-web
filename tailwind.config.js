/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,css}",
    "./pages/**/*.{js,ts,jsx,tsx,css}",
    "./components/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        // Fallback colors for older browsers, then CSS variables for modern browsers
        background: "#ffffff",
        background: "var(--background)",
        foreground: "#1f2937",
        foreground: "var(--foreground)",
        border: "#e5e7eb",
        border: "var(--border)",
        ring: "#b4b4b4",
        ring: "var(--ring)",

        card: "#ffffff",
        card: "var(--card)",
        "card-foreground": "#1f2937",
        "card-foreground": "var(--card-foreground)",
        popover: "#ffffff",
        popover: "var(--popover)",
        "popover-foreground": "#1f2937",
        "popover-foreground": "var(--popover-foreground)",

        primary: "#f47b20",
        primary: "var(--primary)",
        "primary-dark": "#e06a0f",
        "primary-dark": "var(--primary-dark)",
        "primary-light": "#ff8f3d",
        "primary-light": "var(--primary-light)",
        "primary-foreground": "#fcfcfc",
        "primary-foreground": "var(--primary-foreground)",

        secondary: "#f8fafc",
        secondary: "var(--secondary)",
        "secondary-foreground": "#2a2a2a",
        "secondary-foreground": "var(--secondary-foreground)",

        muted: "#f8fafc",
        muted: "var(--muted)",
        "muted-foreground": "#8a8a8a",
        "muted-foreground": "var(--muted-foreground)",

        accent: "#f8fafc",
        accent: "var(--accent)",
        "accent-foreground": "#2a2a2a",
        "accent-foreground": "var(--accent-foreground)",

        destructive: "#e54b4b",
        destructive: "var(--destructive)",

        sidebar: "#fcfcfc",
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "#1f2937",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "#f47b20",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "#fcfcfc",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "#f8fafc",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "#2a2a2a",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "#e5e7eb",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "#b4b4b4",
        "sidebar-ring": "var(--sidebar-ring)",

        "chart-1": "#f56565",
        "chart-1": "var(--chart-1)",
        "chart-2": "#4fd1c5",
        "chart-2": "var(--chart-2)",
        "chart-3": "#6b46c1",
        "chart-3": "var(--chart-3)",
        "chart-4": "#a8e05f",
        "chart-4": "var(--chart-4)",
        "chart-5": "#f6ad55",
        "chart-5": "var(--chart-5)",
      },
      borderColor: (theme) => ({
        DEFAULT: theme("colors.border"),
        primary: theme("colors.primary"),
      }),
      ringColor: (theme) => ({
        DEFAULT: theme("colors.ring"),
      }),
      borderRadius: {
        // Fallback border radius values for older browsers
        sm: "0.375rem", // 6px
        sm: "var(--radius-sm)",
        md: "0.5rem", // 8px
        md: "var(--radius-md)",
        lg: "0.625rem", // 10px
        lg: "var(--radius-lg)",
        xl: "0.75rem", // 12px
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};
