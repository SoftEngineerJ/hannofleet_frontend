"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Lock,
  Clock,
  Trash2,
  Plus,
} from "lucide-react";
import { authApi, User as UserType } from "@/services/api";

interface SettingsProps {
  onThemeChange: (theme: "light" | "dark") => void;
  currentTheme: "light" | "dark";
  onLogout: () => void;
}

export default function Settings({
  onThemeChange,
  currentTheme,
  onLogout,
}: SettingsProps) {
  const [autoLogout, setAutoLogout] = useState<string>("never");
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");
  const [username, setUsername] = useState("");
  const [usernamePassword, setUsernamePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const saved = localStorage.getItem("autoLogout");
    if (saved) setAutoLogout(saved);

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (user.role === "ADMIN") {
        loadUsers();
      }
    }
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await authApi.getUsers();
      setUsers(userList);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer:", err);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      setMessage("Benutzername und Passwort erforderlich");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      await authApi.createUser(newUsername, newPassword, newRole);
      setNewUsername("");
      setNewPassword("");
      setNewRole("USER");
      loadUsers();
      setMessage("Benutzer erstellt");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Benutzer wirklich löschen?")) return;
    try {
      await authApi.deleteUser(id);
      loadUsers();
      setMessage("Benutzer gelöscht");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAutoLogoutChange = (value: string) => {
    setAutoLogout(value);
    localStorage.setItem("autoLogout", value);
  };

  const handleUsernameSave = async () => {
    if (!username.trim() || !usernamePassword) {
      setMessage("Benutzername und Passwort erforderlich");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!currentUser) {
      setMessage("Nicht eingeloggt");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const newUsernameValue = await authApi.changeUsername(
        currentUser.username,
        username.trim(),
        usernamePassword,
      );
      const updatedUser = { ...currentUser, username: newUsernameValue };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setUsername("");
      setUsernamePassword("");
      setMessage("Benutzername erfolgreich geändert");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setMessage("Bitte alle Felder ausfüllen");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setMessage("Neue Passwörter stimmen nicht überein");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!currentUser) {
      setMessage("Nicht eingeloggt");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      await authApi.changePassword(
        currentUser.username,
        currentPassword,
        newPassword,
      );
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setMessage("Passwort erfolgreich geändert");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const themeOptions = [
    { value: "light", label: "Hell", icon: Sun },
    { value: "dark", label: "Dunkel", icon: Moon },
  ];

  const logoutOptions = [
    { value: "never", label: "Nie" },
    { value: "1", label: "1 Stunde" },
    { value: "2", label: "2 Stunden" },
    { value: "8", label: "8 Stunden" },
    { value: "24", label: "24 Stunden" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Design</h2>
        </div>

        <div className="flex gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => onThemeChange(option.value as "light" | "dark")}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                  currentTheme === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Automatisch Abmelden
          </h2>
        </div>

        <select
          value={autoLogout}
          onChange={(e) => handleAutoLogoutChange(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {logoutOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Benutzername ändern
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Neuer Benutzername"
              className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-3">
            <input
              type="password"
              value={usernamePassword}
              onChange={(e) => setUsernamePassword(e.target.value)}
              placeholder="Passwort zur Bestätigung"
              className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleUsernameSave}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Passwort ändern
          </h2>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Aktuelles Passwort"
            className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Neues Passwort"
            className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            placeholder="Neues Passwort bestätigen"
            className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handlePasswordChange}
            className="w-full px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            Passwort ändern
          </button>
        </div>
      </div>

      {currentUser?.role === "ADMIN" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Benutzerverwaltung
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Benutzername"
                className="min-w-[140px] flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Passwort"
                className="min-w-[140px] flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "USER" | "ADMIN")}
                className="px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                onClick={handleCreateUser}
                className="px-4 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.username}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  {user.id !== 1 && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Abmelden
        </button>
      </div>

      {message && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl font-medium animate-fade-in-up ${
            messageType === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
