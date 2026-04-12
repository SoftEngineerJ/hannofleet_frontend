"use client";

import { useState, useEffect } from "react";
import {
  DashboardIcon,
  CarIcon,
  MapIcon,
  CalendarIcon,
  HistoryIcon,
} from "./Icons";
import { CarFront, Sun, Moon, Settings, LogOut } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  {
    id: "fleet",
    label: "Fahrzeugflotte",
    icon: <CarFront className="w-4 h-4" />,
  },
  { id: "tours", label: "Touren", icon: <MapIcon /> },
  { id: "appointments", label: "Termine", icon: <CalendarIcon /> },
  { id: "history", label: "Historie", icon: <HistoryIcon /> },
  {
    id: "settings",
    label: "Einstellungen",
    icon: <Settings className="w-4 h-4" />,
  },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onLogout?: () => void;
}

export default function Navigation({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  onLogout,
}: NavigationProps) {
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setResolvedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    onThemeChange(newTheme);
  };

  const getThemeIcon = () => {
    return resolvedTheme === "dark" ? (
      <Moon className="w-5 h-5 text-foreground" />
    ) : (
      <Sun className="w-5 h-5 text-foreground" />
    );
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">HANNOFLEET</h1>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Fuhrpark Management
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </button>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: "#1d9bf015", color: "#1d9bf0" }}
            >
              Admin
            </div>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#00ba7c" }}
            ></div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex gap-1 mt-4 -mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer
                ${
                  activeTab === tab.id
                    ? "text-foreground border-b-2"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }
              `}
              style={
                activeTab === tab.id
                  ? { borderColor: "#1d9bf0", color: "#1d9bf0" }
                  : {}
              }
            >
              <span className="w-4 h-4">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
