"use client";

import { useRef, useState, useEffect } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import VehicleCard from "./VehicleCard";
import { CarFront } from "lucide-react";

interface DashboardProps {
  vehicles: Vehicle[];
  onStatusChange: (vehicleId: string, newStatus: VehicleStatus) => void;
}

const statusConfig = {
  FREI: { label: "Frei", color: "#00ba7c", bg: "bg-[#00ba7c]/10" },
  AKTIV: {
    label: "Aktiv",
    color: "#1d9bf0",
    bg: "bg-[#1d9bf0]/10",
  },
  WERKSTATT: { label: "Werkstatt", color: "#ffd400", bg: "bg-[#ffd400]/10" },
  UNFALL: { label: "Unfall", color: "#f4212e", bg: "bg-[#f4212e]/10" },
  ABGEMELDET: { label: "Abgemeldet", color: "#71767b", bg: "bg-[#71767b]/10" },
};

export default function Dashboard({
  vehicles,
  onStatusChange,
}: DashboardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isHovered) return;

    const scroll = () => {
      if (
        container.scrollLeft <
        container.scrollWidth - container.clientWidth
      ) {
        container.scrollLeft += 1;
      } else {
        container.scrollLeft = 0;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.dataset.isDragging = "true";
    container.dataset.startX = e.pageX.toString();
    container.dataset.scrollLeft = container.scrollLeft.toString();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container || container.dataset.isDragging !== "true") return;
    const x = e.pageX - parseInt(container.dataset.startX || "0");
    container.scrollLeft = parseInt(container.dataset.scrollLeft || "0") - x;
  };

  const handleMouseUp = () => {
    const container = scrollContainerRef.current;
    if (container) container.dataset.isDragging = "false";
  };

  const statusCounts = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    },
    {} as Record<VehicleStatus, number>,
  );

  const totalVehicles = vehicles.length;
  const availableVehicles = statusCounts.FREI || 0;
  const inUseVehicles = statusCounts.AKTIV || 0;
  const workshopVehicles = statusCounts.WERKSTATT || 0;
  const accidentVehicles = statusCounts.UNFALL || 0;

  const statusCards = [
    { label: "Gesamt", count: totalVehicles, color: "#71767b", icon: "CAR" },
    {
      label: "Frei",
      count: availableVehicles,
      color: "#00ba7c",
      icon: "CHECK",
    },
    {
      label: "Aktiv",
      count: inUseVehicles,
      color: "#1d9bf0",
      icon: "ROUTE",
    },
    {
      label: "Werkstatt",
      count: workshopVehicles,
      color: "#ffd400",
      icon: "WRENCH",
    },
    {
      label: "Unfall",
      count: accidentVehicles,
      color: "#f4212e",
      icon: "ALERT",
    },
  ];

  const upcomingDeadlines = vehicles
    .filter((v) => v.nextInspection || v.nextWorkshopAppointment)
    .sort((a, b) => {
      const dateA = new Date(
        a.nextInspection || a.nextWorkshopAppointment || "",
      );
      const dateB = new Date(
        b.nextInspection || b.nextWorkshopAppointment || "",
      );
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statusCards.map((card, index) => (
            <div
              key={card.label}
              className="bg-card border border-border rounded-2xl p-4 card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  {card.label === "Gesamt" && (
                    <CarFront
                      className="w-5 h-5"
                      style={{ color: card.color }}
                    />
                  )}
                  {card.label === "Frei" && (
                    <svg
                      className="w-5 h-5"
                      style={{ color: card.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {card.label === "Aktiv" && (
                    <svg
                      className="w-5 h-5"
                      style={{ color: card.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  )}
                  {card.label === "Werkstatt" && (
                    <svg
                      className="w-5 h-5"
                      style={{ color: card.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  {card.label === "Unfall" && (
                    <svg
                      className="w-5 h-5"
                      style={{ color: card.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-3xl font-bold"
                  style={{ color: card.color }}
                >
                  {card.count}
                </span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Anstehende Termine */}
        {upcomingDeadlines.length > 0 && (
          <div
            className="bg-card border border-border rounded-2xl p-5 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Anstehende Termine
            </h2>
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                handleMouseUp();
              }}
            >
              {upcomingDeadlines.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="flex-shrink-0 w-56 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm truncate">
                        {vehicle.model}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {vehicle.licensePlate}
                      </div>
                      {vehicle.nextInspection && (
                        <div className="text-xs text-warning mt-1 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          TÜV:{" "}
                          {new Date(vehicle.nextInspection).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            },
                          )}
                        </div>
                      )}
                      {vehicle.nextWorkshopAppointment && (
                        <div className="text-xs text-info mt-1 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Werkstatt:{" "}
                          {new Date(
                            vehicle.nextWorkshopAppointment,
                          ).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center ml-2 shrink-0"
                      style={{
                        backgroundColor: `${statusConfig[vehicle.status]?.color}15`,
                      }}
                    >
                      <span
                        className="font-semibold text-xs"
                        style={{ color: statusConfig[vehicle.status]?.color }}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Freie Fahrzeuge */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">
              Freie Fahrzeuge
            </h2>
            <div
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#00ba7c15", color: "#00ba7c" }}
            >
              {vehicles.filter((v) => v.status === "FREI").length} frei
            </div>
          </div>
          {vehicles.filter((v) => v.status === "FREI").length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Keine freien Fahrzeuge
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles
                .filter((v) => v.status === "FREI")
                .slice(0, 8)
                .map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    style={{ animationDelay: `${0.6 + index * 0.03}s` }}
                    className="animate-fade-in-up"
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Fahrzeuge in Werkstatt */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">In Werkstatt</h2>
            <div
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#ffd40015", color: "#ffd400" }}
            >
              {workshopVehicles} Fahrzeuge
            </div>
          </div>
          {workshopVehicles === 0 ? (
            <p className="text-muted-foreground text-sm">
              Keine Fahrzeuge in Werkstatt
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles
                .filter((v) => v.status === "WERKSTATT")
                .map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    style={{ animationDelay: `${0.8 + index * 0.03}s` }}
                    className="animate-fade-in-up"
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Aktive Fahrzeuge */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.9s" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">
              Aktive Fahrzeuge
            </h2>
            <div
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#1d9bf015", color: "#1d9bf0" }}
            >
              {inUseVehicles} Fahrzeuge
            </div>
          </div>
          {inUseVehicles === 0 ? (
            <p className="text-muted-foreground text-sm">
              Keine Fahrzeuge unterwegs
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles
                .filter((v) => v.status === "AKTIV")
                .map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    style={{ animationDelay: `${1.0 + index * 0.03}s` }}
                    className="animate-fade-in-up"
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Unfall-Fahrzeuge */}
        <div className="animate-fade-in-up" style={{ animationDelay: "1.1s" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">Unfall</h2>
            <div
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#f4212e15", color: "#f4212e" }}
            >
              {accidentVehicles} Fahrzeuge
            </div>
          </div>
          {accidentVehicles === 0 ? (
            <p className="text-muted-foreground text-sm">
              Keine Unfallfahrzeuge
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles
                .filter((v) => v.status === "UNFALL")
                .map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    style={{ animationDelay: `${1.2 + index * 0.03}s` }}
                    className="animate-fade-in-up"
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
