"use client";

import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { CarFront } from "lucide-react";
import { historyApi } from "@/services/api";

interface VehicleCardProps {
  vehicle: Vehicle;
  onStatusChange?: (vehicleId: string, newStatus: VehicleStatus) => void;
}

const statusConfig = {
  FREI: { label: "Frei", color: "#00ba7c" },
  AKTIV: { label: "Aktiv", color: "#1d9bf0" },
  WERKSTATT: { label: "Werkstatt", color: "#ffd400" },
  UNFALL: { label: "Unfall", color: "#f4212e" },
  ABGEMELDET: { label: "Abgemeldet", color: "#71767b" },
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
                year: "numeric",
              })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
          <span className="text-xs text-muted-foreground">
            Nächtster Werkstatttermin
          </span>
          <span className="text-sm font-medium text-foreground">
            {vehicle.nextWorkshopAppointment
              ? new Date(vehicle.nextWorkshopAppointment).toLocaleDateString(
                  "de-DE",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  },
                )
              : "---"}
          </span>
        </div>
        {vehicle.nextInsurance && (
          <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg mt-1">
            <span className="text-xs text-muted-foreground">
              Nächste Versicherung
            </span>
            <span className="text-sm font-medium text-foreground">
              {new Date(vehicle.nextInsurance).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {onStatusChange && (
        <div className="mt-3 pt-3 border-t border-border">
          <select
            value={vehicle.status}
            onClick={(e) => e.stopPropagation()}
            onChange={async (e) => {
              e.stopPropagation();
              const newStatus = e.target.value as VehicleStatus;

              await historyApi.create({
                vehicleId: Number(vehicle.id),
                historyType: "STATUS",
                oldValue: vehicle.status,
                newValue: newStatus,
                changeDate: new Date()
                  .toLocaleString("sv-SE")
                  .replace(" ", "T"),
                note: "automatisch",
              });

              if (onStatusChange) {
                onStatusChange(String(vehicle.id), newStatus);
              }
            }}
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
