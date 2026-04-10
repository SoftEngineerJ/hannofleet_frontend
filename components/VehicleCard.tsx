"use client";

import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { CarFront } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onStatusChange?: (vehicleId: string, newStatus: VehicleStatus) => void;
}

const statusConfig = {
  verfügbar: { label: "Verfügbar", color: "#00ba7c" },
  in_benutzung: { label: "In Benutzung", color: "#1d9bf0" },
  werkstatt: { label: "Werkstatt", color: "#ffd400" },
  unfall: { label: "Unfall", color: "#f4212e" },
  inaktiv: { label: "Inaktiv", color: "#71767b" },
  ersatzfahrzeug: { label: "Ersatzfahrzeug", color: "#8250df" },
};

export default function VehicleCard({
  vehicle,
  onStatusChange,
}: VehicleCardProps) {
  const statusInfo = statusConfig[vehicle.status];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 card-hover h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CarFront className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground truncate">
              {vehicle.model}
            </h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {vehicle.licensePlate}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium shrink-0"
          style={{
            backgroundColor: `${statusInfo.color}15`,
            color: statusInfo.color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full status-dot status-dot-active"
            style={{ backgroundColor: statusInfo.color }}
          ></span>
          {statusInfo.label}
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {vehicle.tourNumber && (
          <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
            <span className="text-xs text-muted-foreground">Tour</span>
            <span className="text-sm font-medium text-foreground">
              {vehicle.tourNumber}
            </span>
          </div>
        )}
        {vehicle.driver && (
          <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
            <span className="text-xs text-muted-foreground">Fahrer</span>
            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
              {vehicle.driver}
            </span>
          </div>
        )}
        {vehicle.nextInspection && (
          <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
            <span className="text-xs text-muted-foreground">Nächster TÜV</span>
            <span className="text-sm font-medium text-foreground">
              {new Date(vehicle.nextInspection).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {onStatusChange && (
        <div className="mt-3 pt-3 border-t border-border">
          <select
            value={vehicle.status}
            onChange={(e) =>
              onStatusChange(vehicle.id, e.target.value as VehicleStatus)
            }
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key} className="bg-card text-foreground">
                {config.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
