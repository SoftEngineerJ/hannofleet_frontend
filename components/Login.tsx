"use client";

import { useState } from "react";
import { CarFront, Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "54321") {
      onLogin();
    } else {
      setError("Ungültige Anmeldedaten");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/Download.png"
            alt="Logo"
            className="w-40 h-40 mx-auto object-contain"
          />
        </div>

        <div className="bg-card border border-border rounded-none p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Anmelden</h2>

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
                  placeholder="admin"
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
                  placeholder="54321"
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
              className="w-full py-3 bg-transparent border border-primary text-primary rounded-none font-medium hover:bg-primary/10 transition-colors"
            >
              Anmelden
            </button>
          </form>

          <div className="mt-6 p-4 bg-secondary/50 rounded-none">
            <p className="text-xs text-muted-foreground text-center">
              Demo-Zugang: admin / 54321
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
