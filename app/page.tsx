"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import Fleet from "@/components/Fleet";
import Appointments from "@/components/Appointments";
import History from "@/components/History";
import Tours from "@/components/Tours";
import Settings from "@/components/Settings";
import Login from "@/components/Login";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { vehicleApi, authApi } from "@/services/api";
import { ChevronUp } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("activeTab") as string) || "dashboard";
    }
    return "dashboard";
  });
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (!token || !user) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:8080/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const autoLogout = localStorage.getItem("autoLogout");
    if (!autoLogout || autoLogout === "never") return;

    const timeout = parseInt(autoLogout) * 60 * 60 * 1000;
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLoggedIn(false);
      }, timeout);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  useEffect(() => {
    vehicleApi
      .getAll()
      .then(setVehicleData)
      .catch(() => setVehicleData([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (
    vehicleId: string,
    newStatus: VehicleStatus,
  ) => {
    try {
      const updated = await vehicleApi.updateStatus(vehicleId, newStatus);
      setVehicleData((prev) =>
        prev.map((v) => (String(v.id) === vehicleId ? updated : v)),
      );
    } catch (err) {
      alert("Fehler: Backend nicht erreichbar.");
    }
  };

  const handleAddVehicle = async (newVehicle: Omit<Vehicle, "id">) => {
    try {
      const created = await vehicleApi.create(newVehicle);
      setVehicleData((prev) => [...prev, created]);
    } catch (err) {
      alert(
        "Fehler: Backend nicht erreichbar. Fahrzeug konnte nicht erstellt werden.",
      );
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await vehicleApi.delete(vehicleId);
      setVehicleData((prev) => prev.filter((v) => String(v.id) !== vehicleId));
    } catch (err) {
      alert(
        "Fehler: Backend nicht erreichbar. Fahrzeug konnte nicht gelöscht werden.",
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            vehicles={vehicleData}
            onStatusChange={handleStatusChange}
          />
        );
      case "fleet":
        return (
          <Fleet
            vehicles={vehicleData}
            onStatusChange={handleStatusChange}
            onAddVehicle={handleAddVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        );
      case "tours":
        return <Tours vehicles={vehicleData} />;
      case "appointments":
        return <Appointments vehicles={vehicleData} />;
      case "history":
        return <History vehicles={vehicleData} />;
      case "settings":
        return (
          <Settings
            currentTheme={theme}
            onThemeChange={(newTheme: "light" | "dark") => {
              setTheme(newTheme);
              localStorage.setItem("theme", newTheme);
            }}
            onLogout={async () => {
              try {
                await authApi.logout();
              } catch (e) {}
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setIsLoggedIn(false);
            }}
          />
        );
      default:
        return (
          <Dashboard
            vehicles={vehicleData}
            onStatusChange={handleStatusChange}
          />
        );
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(user) => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          localStorage.setItem("activeTab", tab);
          setActiveTab(tab);
        }}
        theme={theme}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          localStorage.setItem("theme", newTheme);
        }}
        onLogout={() => setIsLoggedIn(false)}
      />
      <main>{renderContent()}</main>
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-14 h-14 bg-transparent border border-primary/50 text-primary rounded-none flex items-center justify-center hover:bg-primary/10 transition-all z-50 cursor-pointer"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}
