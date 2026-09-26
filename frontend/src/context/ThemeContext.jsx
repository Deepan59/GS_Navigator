import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("gs_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("gs_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark", "bg-slate-950", "text-slate-100");
      document.body.classList.remove("bg-slate-50", "text-slate-900");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark", "bg-slate-950", "text-slate-100");
      document.body.classList.add("bg-slate-50", "text-slate-900");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
