"use client";

import { useState } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { CarFront, X } from "lucide-react";
import { historyApi } from "@/services/api";

interface VehicleCardProps {
  vehicle: Vehicle;
  onStatusChange?: (
    vehicleId: string,
    newStatus: VehicleStatus,
    tourNumber?: string,
  ) => void;
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
  const [showTourModal, setShowTourModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<VehicleStatus | null>(
    null,
  );
  const [tourInput, setTourInput] = useState("");

  const handleStatusChange = async (newStatus: VehicleStatus) => {
    const tourRequired = ["AKTIV", "WERKSTATT", "UNFALL"].includes(newStatus);
    if (tourRequired && !vehicle.tourNumber) {
      setPendingStatus(newStatus);
      setTourInput("");
      setShowTourModal(true);
      return;
    }
    await changeStatus(newStatus, vehicle.tourNumber);
  };

  const changeStatus = async (newStatus: VehicleStatus, tourNum?: string) => {
    setShowTourModal(false);
    await historyApi.create({
      vehicleId: Number(vehicle.id),
      historyType: "STATUS",
      oldValue: vehicle.status,
      newValue: newStatus,
      changeDate: new Date().toLocaleString("sv-SE").replace(" ", "T"),
      note: "automatisch",
    });
    if (onStatusChange) {
      onStatusChange(String(vehicle.id), newStatus, tourNum);
    }
  };

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
        {vehicle.lastInspection && (
          <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
            <span className="text-xs text-muted-foreground">
              Letzte Inspektion
            </span>
            <span className="text-sm font-medium text-foreground">
              {new Date(vehicle.lastInspection).toLocaleDateString("de-DE", {
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
      </div>

      {onStatusChange && (
        <div className="mt-3 pt-3 border-t border-border">
          <select
            value={vehicle.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              const newStatus = e.target.value as VehicleStatus;
              handleStatusChange(newStatus);
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

      {showTourModal && pendingStatus && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTourModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Tour-Nummer erforderlich
              </h3>
              <button
                onClick={() => setShowTourModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Für Status "{statusConfig[pendingStatus].label}" wird eine
              Tour-Nummer benötigt.
            </p>
            <input
              type="text"
              value={tourInput}
              onChange={(e) => setTourInput(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm mb-4"
              placeholder="Tour-Nummer eingeben..."
              autoFocus
              onKeyDown={(e) =>
                e.key === "Enter" &&
                tourInput &&
                changeStatus(pendingStatus, tourInput)
              }
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowTourModal(false)}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={() =>
                  tourInput && changeStatus(pendingStatus, tourInput)
                }
                disabled={!tourInput}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
