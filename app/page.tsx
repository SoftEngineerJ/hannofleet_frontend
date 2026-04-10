"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import Fleet from "@/components/Fleet";
import Appointments from "@/components/Appointments";
import History from "@/components/History";
import Tours from "@/components/Tours";
import Login from "@/components/Login";
import { vehicles } from "@/data/mockData";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { ChevronUp } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [vehicleData, setVehicleData] = useState(vehicles);

  const handleStatusChange = (vehicleId: string, newStatus: VehicleStatus) => {
    setVehicleData((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, status: newStatus } : vehicle,
      ),
    );
  };

  const handleAddVehicle = (newVehicle: Omit<Vehicle, "id">) => {
    const id = (
      Math.max(...vehicleData.map((v) => parseInt(v.id))) + 1
    ).toString();
    setVehicleData((prev) => [...prev, { ...newVehicle, id }]);
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
          />
        );
      case "tours":
        return <Tours vehicles={vehicleData} />;
      case "appointments":
        return <Appointments vehicles={vehicleData} />;
      case "history":
        return <History vehicles={vehicleData} />;
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

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
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
