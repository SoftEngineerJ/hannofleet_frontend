"use client";

import { useState } from "react";
import { Vehicle } from "@/types/vehicle";
import {
  CarFront,
  User,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ToursProps {
  vehicles: Vehicle[];
}

const statusColors: Record<string, string> = {
  verfügbar: "#00ba7c",
  in_benutzung: "#1d9bf0",
  werkstatt: "#ffd400",
  unfall: "#f4212e",
  inaktiv: "#71767b",
  ersatzfahrzeug: "#8250df",
};

export default function Tours({ vehicles }: ToursProps) {
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());

  const vehiclesByTour = vehicles.reduce(
    (acc, vehicle) => {
      const tourNumber = vehicle.tourNumber || "ohne Tour";
      if (!acc[tourNumber]) {
        acc[tourNumber] = [];
      }
      acc[tourNumber].push(vehicle);
      return acc;
    },
    {} as Record<string, Vehicle[]>,
  );

  const tourNumbers = Object.keys(vehiclesByTour).sort((a, b) => {
    if (a === "ohne Tour") return 1;
    if (b === "ohne Tour") return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const toggleTour = (tour: string) => {
    setExpandedTours((prev) => {
      const next = new Set(prev);
      if (next.has(tour)) {
        next.delete(tour);
      } else {
        next.add(tour);
      }
      return next;
    });
  };

  const getActiveCount = (tourVehicles: Vehicle[]) => {
    return tourVehicles.filter((v) => v.status === "in_benutzung").length;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Touren</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {tourNumbers.length} Touren
        </div>
      </div>

      <div className="space-y-3">
        {tourNumbers.map((tourNumber) => {
          const tourVehicles = vehiclesByTour[tourNumber];
          const isExpanded = expandedTours.has(tourNumber);
          const activeCount = getActiveCount(tourVehicles);

          return (
            <div
              key={tourNumber}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => toggleTour(tourNumber)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#1d9bf015" }}
                >
                  <MapPin className="w-6 h-6" style={{ color: "#1d9bf0" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {tourNumber}
                    </span>
                    {activeCount > 0 && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${statusColors.in_benutzung}15`,
                          color: statusColors.in_benutzung,
                        }}
                      >
                        {activeCount} aktiv
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tourVehicles.length} Fahrzeuge
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {tourVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${statusColors[vehicle.status]}15`,
                            }}
                          >
                            <CarFront
                              className="w-4 h-4"
                              style={{ color: statusColors[vehicle.status] }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm truncate">
                              {vehicle.model}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {vehicle.licensePlate}
                            </div>
                          </div>
                        </div>
                        {vehicle.driver && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {vehicle.driver}
                          </div>
                        )}
                        <div
                          className="mt-2 text-xs font-medium"
                          style={{ color: statusColors[vehicle.status] }}
                        >
                          {vehicle.status === "verfügbar"
                            ? "Verfügbar"
                            : vehicle.status === "in_benutzung"
                              ? "In Benutzung"
                              : vehicle.status === "werkstatt"
                                ? "Werkstatt"
                                : vehicle.status === "unfall"
                                  ? "Unfall"
                                  : vehicle.status === "inaktiv"
                                    ? "Inaktiv"
                                    : "Ersatzfahrzeug"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tourNumbers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Keine Touren vorhanden</p>
        </div>
      )}
    </div>
  );
}
