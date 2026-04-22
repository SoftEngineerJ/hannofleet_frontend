"use client";

import { useState, useEffect } from "react";
import { CarFront, Eye, EyeOff, Lock, User } from "lucide-react";
import { authApi, User as UserType } from "@/services/api";

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [logoFilter, setLogoFilter] = useState("none");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    const isDark = theme === "dark";
    setLogoFilter(isDark ? "none" : "invert(1)");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authApi.login(username, password);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.token) {
        localStorage.setItem("token", user.token);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Ungültige Anmeldedaten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Background Image Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url("/corsa_bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
      />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-border rounded-none p-8">
          <div className="text-center mb-6">
            <img
              src="/Download.png"
              alt="Logo"
              className="w-32 h-32 mx-auto object-contain"
              style={{ filter: logoFilter }}
            />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            Anmelden
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Benutzername
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-none text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-secondary border border-border rounded-none text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-transparent border border-primary text-primary rounded-none font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {loading ? "Anmeldung..." : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-secondary/50 rounded-none">
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">Hilfe & Kontakt:</p>
              <p className="text-xs text-muted-foreground">
                hanno-it@proton.me
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
