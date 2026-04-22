"use client";

import { useState, useRef, useEffect } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import VehicleCard from "./VehicleCard";
import BatchAddModal from "./BatchAddModal";
import { historyApi, vehicleApi } from "@/services/api";
import {
  Search,
  Plus,
  X,
  CarFront,
  Calendar,
  Gauge,
  User,
  Route,
  Upload,
} from "lucide-react";

interface FleetProps {
  vehicles: Vehicle[];
  onStatusChange: (
    vehicleId: string,
    newStatus: VehicleStatus,
    tourNumber?: string,
  ) => void;
  onAddVehicle?: (vehicle: Omit<Vehicle, "id">) => void;
  onAddMultiple?: (count: number) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
}

const statusOptions = [
  { value: "all", label: "Alle" },
  { value: "FREI", label: "Frei" },
  { value: "AKTIV", label: "Aktiv" },
  { value: "WERKSTATT", label: "Werkstatt" },
  { value: "UNFALL", label: "Unfall" },
  { value: "ABGEMELDET", label: "Abgemeldet" },
];

export default function Fleet({
  vehicles,
  onStatusChange,
  onAddVehicle,
  onAddMultiple,
  onDeleteVehicle,
}: FleetProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      search === "" ||
      vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.driver?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Fahrzeugflotte</h1>
        <button
          onClick={() => setShowBatchModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Upload className="w-4 h-4" />
          Fahrzeuge hinzufügen
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="inline-flex gap-1 p-1 bg-secondary/50 rounded-full">
          {statusOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              } ${index > 0 ? "border-l-2 border-muted-foreground/30" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredVehicles.length} von {vehicles.length} Fahrzeugen
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${index * 0.03}s` }}
            onClick={() => setSelectedVehicle(vehicle)}
          >
            <VehicleCard
              vehicle={vehicle}
              onStatusChange={(id, status, tourNum) =>
                onStatusChange(id, status, tourNum)
              }
            />
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Keine Fahrzeuge gefunden
        </div>
      )}

      {showAddModal && (
        <VehicleModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onAdd={onAddVehicle}
        />
      )}

      {showBatchModal && (
        <BatchAddModal
          onClose={() => setShowBatchModal(false)}
          onAdd={(vehicle) => {
            if (onAddVehicle && !onAddMultiple) {
              onAddVehicle(vehicle);
            }
          }}
          onAddMultiple={onAddMultiple}
        />
      )}

      {selectedVehicle && !editingVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onEdit={() => {
            setEditingVehicle(selectedVehicle);
            setSelectedVehicle(null);
          }}
          onDelete={() => {
            if (onDeleteVehicle && confirm("Fahrzeug wirklich löschen?")) {
              onDeleteVehicle(String(selectedVehicle.id));
              setSelectedVehicle(null);
            }
          }}
        />
      )}

      {editingVehicle && (
        <VehicleModal
          mode="edit"
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={async (updated) => {
            // Speichere Fahrzeugdaten
            await vehicleApi.update(String(updated.id), updated);

            if (editingVehicle.driver !== updated.driver && updated.driver) {
              await historyApi.create({
                vehicleId: Number(updated.id),
                historyType: "DRIVER",
                oldValue: editingVehicle.driver || "",
                newValue: updated.driver,
                changeDate: new Date()
                  .toLocaleString("sv-SE")
                  .replace(" ", "T"),
                note: "automatisch",
              });
            }
            if (editingVehicle.status !== updated.status) {
              await historyApi.create({
                vehicleId: Number(updated.id),
                historyType: "STATUS",
                oldValue: editingVehicle.status,
                newValue: updated.status,
                changeDate: new Date()
                  .toLocaleString("sv-SE")
                  .replace(" ", "T"),
                note: "automatisch",
              });
            }
            onStatusChange(
              String(updated.id),
              updated.status,
              updated.tourNumber,
            );
            setEditingVehicle(null);
          }}
        />
      )}
    </div>
  );
}

function VehicleDetailModal({
  vehicle,
  onClose,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const statusColors: Record<string, string> = {
    FREI: "#00ba7c",
    AKTIV: "#1d9bf0",
    WERKSTATT: "#ffd400",
    UNFALL: "#f4212e",
    abgemeldet: "#71767b",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CarFront
              className="w-6 h-6"
              style={{ color: statusColors[vehicle.status] }}
            />
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {vehicle.model}
              </h2>
              <p className="text-muted-foreground">{vehicle.licensePlate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${statusColors[vehicle.status]}15` }}
            >
              <span
                className="font-bold text-sm"
                style={{ color: statusColors[vehicle.status] }}
              >
                {vehicle.status.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p
                className="font-medium text-foreground"
                style={{ color: statusColors[vehicle.status] }}
              >
                {vehicle.status === "FREI"
                  ? "Frei"
                  : vehicle.status === "AKTIV"
                    ? "Aktiv"
                    : vehicle.status === "WERKSTATT"
                      ? "Werkstatt"
                      : vehicle.status === "UNFALL"
                        ? "Unfall"
                        : "Abgemeldet"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
              <Gauge className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Kilometer</p>
                <p className="font-medium text-foreground">
                  {vehicle.mileage.toLocaleString("de-DE")} km
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fahrer</p>
                <p className="font-medium text-foreground">
                  {vehicle.driver || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
              <Route className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tour</p>
                <p className="font-medium text-foreground">
                  {vehicle.tourNumber || "-"}
                </p>
              </div>
            </div>
          </div>

          {vehicle.nextInspection && (
            <div className="p-3 bg-warning/10 rounded-xl border border-warning/20">
              <p className="text-xs text-warning">Nächster TÜV</p>
              <p className="font-medium text-foreground">
                {new Date(vehicle.nextInspection).toLocaleDateString("de-DE")}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onEdit}
          className="w-full mt-4 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
        >
          Bearbeiten
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full mt-2 px-4 py-2.5 bg-red-300 text-white rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            Löschen
          </button>
        )}
      </div>
    </div>
  );
}

function VehicleModal({
  mode,
  vehicle,
  onClose,
  onAdd,
  onSave,
}: {
  mode: "add" | "edit";
  vehicle?: Vehicle;
  onClose: () => void;
  onAdd?: (vehicle: Omit<Vehicle, "id">) => void;
  onSave?: (vehicle: Vehicle) => void;
}) {
  const [formData, setFormData] = useState({
    licensePlate: vehicle?.licensePlate || "",
    model: vehicle?.model || "",
    mileage: vehicle?.mileage || 0,
    status: vehicle?.status || ("FREI" as VehicleStatus),
    driver: vehicle?.driver || "",
    tourNumber: vehicle?.tourNumber || "",
    nextInspection: vehicle?.nextInspection || "",
    lastInspection: vehicle?.lastInspection || "",
    lastTuev: vehicle?.lastTuev || "",
    nextWorkshopAppointment: vehicle?.nextWorkshopAppointment || "",
  });
  const [tourError, setTourError] = useState(false);
  const [licenseError, setLicenseError] = useState(false);

  const lpRef1 = useRef<HTMLInputElement>(null);
  const lpRef2 = useRef<HTMLInputElement>(null);
  const lpRef3 = useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLInputElement | null> | null,
    prevRef: React.RefObject<HTMLInputElement | null> | null,
  ) => {
    if (e.key === "ArrowLeft" && prevRef?.current) {
      prevRef.current.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && nextRef?.current) {
      nextRef.current.focus();
      e.preventDefault();
    } else if (
      e.key === "Backspace" &&
      (e.target as HTMLInputElement).value === "" &&
      prevRef?.current
    ) {
      prevRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const statusMap: Record<string, string> = {
      FREI: "FREI",
      AKTIV: "AKTIV",
      WERKSTATT: "WERKSTATT",
      UNFALL: "UNFALL",
      ABGEMELDET: "ABGEMELDET",
    };
    const backendStatus = statusMap[formData.status] || formData.status;

    const tourRequired = ["AKTIV", "WERKSTATT", "UNFALL"].includes(
      backendStatus,
    );
    const showTourError = tourRequired && !formData.tourNumber;
    const showLicenseError =
      !formData.licensePlate || formData.licensePlate.length < 5;
    setTourError(showTourError);
    setLicenseError(showLicenseError);

    if (showLicenseError) {
      alert("Bitte gültiges Kennzeichen eingeben (z.B. B-B-1234)");
      return;
    }

    if (showTourError) {
      return;
    }

    if (mode === "add" && onAdd) {
      onAdd({
        ...formData,
        status: backendStatus as VehicleStatus,
        tourNumber: formData.tourNumber || undefined,
        driver: formData.driver || undefined,
        nextInspection: formData.nextInspection || undefined,
        lastInspection: formData.lastInspection || undefined,
        lastTuev: formData.lastTuev || undefined,
        nextWorkshopAppointment: formData.nextWorkshopAppointment || undefined,
      });
    } else if (mode === "edit" && onSave && vehicle) {
      const updates: any = {
        id: vehicle.id,
        licensePlate: formData.licensePlate || vehicle.licensePlate,
        model: formData.model || vehicle.model,
        mileage: formData.mileage || vehicle.mileage,
        status: backendStatus,
      };
      if (formData.tourNumber) updates.tourNumber = formData.tourNumber;
      if (formData.driver) updates.driver = formData.driver;
      if (formData.nextInspection)
        updates.nextInspection = formData.nextInspection;
      if (formData.lastInspection)
        updates.lastInspection = formData.lastInspection;
      if (formData.lastTuev) updates.lastTuev = formData.lastTuev;
      if (formData.nextWorkshopAppointment)
        updates.nextWorkshopAppointment = formData.nextWorkshopAppointment;
      onSave(updates);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-3xl animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {mode === "add" ? "Fahrzeug hinzufügen" : "Fahrzeug bearbeiten"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Kennzeichen
              </label>
              <div className="relative">
                <div className="flex rounded-lg border-2 border-border overflow-hidden bg-card">
                  <div className="flex-1 flex items-center justify-center p-1">
                    <input
                      ref={lpRef1}
                      type="text"
                      maxLength={2}
                      value={formData.licensePlate.split("-")[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-ZÄÖÜ]/g, "")
                          .slice(0, 2);
                        const rest = formData.licensePlate.split("-")[2] || "";
                        const newPlate =
                          val.length === 2
                            ? val +
                              "-" +
                              (formData.licensePlate.split("-")[1] || "") +
                              "-" +
                              rest
                            : val;
                        setFormData({
                          ...formData,
                          licensePlate: newPlate,
                        });
                        if (val.length === 2) lpRef2.current?.focus();
                      }}
                      onKeyDown={(e) => handleKeyDown(e, lpRef2, null)}
                      className="w-full h-14 px-3 bg-muted text-foreground text-center font-mono text-xl font-bold rounded-lg border-2 border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                      placeholder="B"
                    />
                  </div>
                  <div className="w-10 flex items-center justify-center p-1">
                    <input
                      ref={lpRef2}
                      type="text"
                      maxLength={1}
                      value={formData.licensePlate.split("-")[1]?.[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-ZÄÖÜ]/g, "")
                          .slice(-1);
                        const parts = formData.licensePlate.split("-");
                        const prefix = parts[0] || "";
                        const rest = parts[2] || "";
                        const newPlate = val
                          ? prefix + "-" + val + (rest ? "-" + rest : "")
                          : prefix;
                        setFormData({
                          ...formData,
                          licensePlate: newPlate,
                        });
                        if (val) lpRef3.current?.focus();
                      }}
                      onKeyDown={(e) => handleKeyDown(e, lpRef3, lpRef1)}
                      className="w-full h-14 px-0 bg-muted text-foreground text-center font-mono text-xl font-bold rounded-lg border-2 border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                      placeholder="-"
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center p-1">
                    <input
                      ref={lpRef3}
                      type="text"
                      maxLength={4}
                      value={formData.licensePlate.split("-")[2] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-ZÄÖÜ0-9]/g, "")
                          .slice(0, 4);
                        const parts = formData.licensePlate.split("-");
                        const prefix =
                          parts[0] && parts[1]
                            ? parts[0] + "-" + parts[1]
                            : parts[0] || "";
                        setFormData({
                          ...formData,
                          licensePlate: prefix + (prefix ? "-" : "") + val,
                        });
                      }}
                      onKeyDown={(e) => handleKeyDown(e, null, lpRef2)}
                      className="w-full h-14 px-3 bg-muted text-foreground text-center font-mono text-xl font-bold rounded-lg border-2 border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                      placeholder="1234"
                    />
                  </div>
                </div>
                {formData.licensePlate && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, licensePlate: "" });
                      lpRef1.current?.focus();
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Modell
              </label>
              <select
                value={formData.model || ""}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Auswählen...</option>
                <option value="Corsa">Corsa</option>
                <option value="Combo">Combo</option>
                <option value="__SONSTIGES__">Sonstiges</option>
              </select>
              {(formData.model === "__SONSTIGES__" ||
                (formData.model &&
                  !["Corsa", "Combo", ""].includes(formData.model))) && (
                <input
                  type="text"
                  value=""
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mt-2"
                  placeholder="Modell eingeben..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Kilometerstand
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mileage: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as VehicleStatus,
                  })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="FREI">Frei</option>
                <option value="AKTIV">Aktiv</option>
                <option value="WERKSTATT">Werkstatt</option>
                <option value="UNFALL">Unfall</option>
                <option value="ABGEMELDET">Abgemeldet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Fahrer
              </label>
              <input
                type="text"
                value={formData.driver}
                onChange={(e) =>
                  setFormData({ ...formData, driver: e.target.value })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tour-Nummer{" "}
                {["AKTIV", "WERKSTATT", "UNFALL"].includes(formData.status) && (
                  <span className="text-[#f4212e]">*</span>
                )}
              </label>
              <input
                type="text"
                value={formData.tourNumber}
                onChange={(e) => {
                  setFormData({ ...formData, tourNumber: e.target.value });
                  setTourError(false);
                }}
                className={`w-full px-3 py-3 h-14 bg-muted border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${tourError ? "border-[#f4212e]" : "border-border"}`}
                placeholder={
                  ["AKTIV", "WERKSTATT", "UNFALL"].includes(formData.status)
                    ? "Pflichtfeld"
                    : "Optional"
                }
              />
              {tourError && (
                <p className="text-xs text-[#f4212e] mt-1">
                  Pflichtfeld für diesen Status
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Letzte Inspektion
              </label>
              <input
                type="date"
                value={formData.lastInspection}
                onChange={(e) =>
                  setFormData({ ...formData, lastInspection: e.target.value })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nächster TÜV
              </label>
              <input
                type="date"
                value={formData.nextInspection}
                onChange={(e) =>
                  setFormData({ ...formData, nextInspection: e.target.value })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nächster Werkstatttermin
              </label>
              <input
                type="date"
                value={formData.nextWorkshopAppointment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextWorkshopAppointment: e.target.value,
                  })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Letzter TÜV
              </label>
              <input
                type="date"
                value={formData.lastTuev}
                onChange={(e) =>
                  setFormData({ ...formData, lastTuev: e.target.value })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="flex gap-4 pt-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              {mode === "add" ? "Hinzufügen" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddVehicleModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd?: (vehicle: Omit<Vehicle, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    licensePlate: "",
    model: "",
    mileage: 0,
    status: "FREI" as VehicleStatus,
    driver: "",
    tourNumber: "",
    nextInspection: "",
    lastInspection: "",
    lastTuev: "",
    nextWorkshopAppointment: "",
  });
  const [tourError, setTourError] = useState(false);

  const lpRef1 = useRef<HTMLInputElement>(null);
  const lpRef2 = useRef<HTMLInputElement>(null);
  const lpRef3 = useRef<HTMLInputElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLInputElement | null> | null,
    prevRef: React.RefObject<HTMLInputElement | null> | null,
  ) => {
    if (e.key === "ArrowLeft" && prevRef?.current) {
      prevRef.current.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && nextRef?.current) {
      nextRef.current.focus();
      e.preventDefault();
    } else if (
      e.key === "Backspace" &&
      (e.target as HTMLInputElement).value === "" &&
      prevRef?.current
    ) {
      prevRef.current.focus();
    }
  };

  useEffect(() => {
    lpRef1.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const statusMap: Record<string, string> = {
      FREI: "FREI",
      AKTIV: "AKTIV",
      WERKSTATT: "WERKSTATT",
      UNFALL: "UNFALL",
      ABGEMELDET: "ABGEMELDET",
    };
    const backendStatus = statusMap[formData.status] || formData.status;

    const tourRequired = ["AKTIV", "WERKSTATT", "UNFALL"].includes(
      backendStatus,
    );
    const showTourError = tourRequired && !formData.tourNumber;
    const showLicenseError =
      !formData.licensePlate || formData.licensePlate.length < 5;
    setTourError(showTourError);

    if (showLicenseError) {
      alert("Bitte gültiges Kennzeichen eingeben (z.B. B-B-1234)");
      return;
    }

    if (showTourError) {
      return;
    }

    if (onAdd) {
      onAdd({
        ...formData,
        status: backendStatus as VehicleStatus,
        tourNumber: formData.tourNumber || undefined,
        driver: formData.driver || undefined,
        nextInspection: formData.nextInspection || undefined,
        lastInspection: formData.lastInspection || undefined,
        lastTuev: formData.lastTuev || undefined,
        nextWorkshopAppointment: formData.nextWorkshopAppointment || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-3xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Fahrzeug hinzufügen
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Kennzeichen
              </label>
              <div className="relative">
                <div className="flex rounded-lg border-2 border-border overflow-hidden bg-card">
                  <div className="flex-1 flex items-center justify-center p-1">
                    <input
                      ref={lpRef1}
                      type="text"
                      maxLength={2}
                      value={formData.licensePlate.split("-")[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-ZÄÖÜ]/g, "")
                          .slice(0, 2);
                        const rest = formData.licensePlate.split("-")[2] || "";
                        const newPlate =
                          val.length === 2
                            ? val +
                              "-" +
                              (formData.licensePlate.split("-")[1] || "") +
                              "-" +
                              rest
                            : val;
                        setFormData({
                          ...formData,
                          licensePlate: newPlate,
                        });
                        if (val.length === 2) lpRef2.current?.focus();
                      }}
                      onKeyDown={(e) => handleKeyDown(e, lpRef2, null)}
                      className="w-full h-14 px-3 bg-muted text-foreground text-center font-mono text-xl font-bold rounded-lg border-2 border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                      placeholder="B"
                    />
                  </div>
                  <div className="w-10 flex items-center justify-center p-1">
                    <input
                      ref={lpRef2}
                      type="text"
                      maxLength={1}
                      value={formData.licensePlate.split("-")[1]?.[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-ZÄÖÜ]/g, "")
                          .slice(-1);
                        const parts = formData.licensePlate.split("-");
                        const prefix = parts[0] || "";
                        const rest = parts[2] || "";
                        const newPlate = val
                          ? prefix + "-" + val + (rest ? "-" + rest : "")
                          : prefix;
                        setFormData({
                          ...formData,
                          licensePlate: newPlate,
                        });
                        if (val) lpRef3.current?.focus();
                      }}
                      onKeyDown={(e) => handleKeyDown(e, lpRef3, lpRef1)}
                      className="w-full h-14 px-0 bg-muted text-foreground text-center font-mono text-xl font-bold rounded-lg border-2 border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                      placeholder="-"
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center p-1">
                    <input
                      ref={lpRef3}
                      type="text"
                      maxLength={4}
                      value={formData.licensePlate.split("-")[2] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toUpperCase()
                          .replace(/[^A-ZÄÖÜ0-9]/g, "")
                          .slice(0, 4);
                        const parts = formData.licensePlate.split("-");
                        const prefix =
                          parts[0] && parts[1]
                            ? parts[0] + "-" + parts[1]
                            : parts[0] || "";
                        setFormData({
                          ...formData,
                          licensePlate: prefix + (prefix ? "-" : "") + val,
                        });
                      }}
                      onKeyDown={(e) => handleKeyDown(e, null, lpRef2)}
                      className="w-full h-14 px-3 bg-muted text-foreground text-center font-mono text-xl font-bold rounded-lg border-2 border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                      placeholder="1234"
                    />
                  </div>
                </div>
                {formData.licensePlate && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, licensePlate: "" });
                      lpRef1.current?.focus();
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Modell
              </label>
              <select
                value={formData.model || ""}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Auswählen...</option>
                <option value="Corsa">Corsa</option>
                <option value="Combo">Combo</option>
                <option value="__SONSTIGES__">Sonstiges</option>
              </select>
              {(formData.model === "__SONSTIGES__" ||
                (formData.model &&
                  !["Corsa", "Combo", ""].includes(formData.model))) && (
                <input
                  type="text"
                  value=""
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mt-2"
                  placeholder="Modell eingeben..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Kilometerstand
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mileage: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as VehicleStatus,
                  })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="FREI">Frei</option>
                <option value="AKTIV">Aktiv</option>
                <option value="WERKSTATT">Werkstatt</option>
                <option value="UNFALL">Unfall</option>
                <option value="ABGEMELDET">Abgemeldet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Fahrer
              </label>
              <input
                type="text"
                value={formData.driver}
                onChange={(e) =>
                  setFormData({ ...formData, driver: e.target.value })
                }
                className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tour-Nummer{" "}
                {["AKTIV", "WERKSTATT", "UNFALL"].includes(formData.status) && (
                  <span className="text-[#f4212e]">*</span>
                )}
              </label>
              <input
                type="text"
                value={formData.tourNumber}
                onChange={(e) => {
                  setFormData({ ...formData, tourNumber: e.target.value });
                  setTourError(false);
                }}
                className={`w-full px-3 py-3 h-14 bg-muted border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${tourError ? "border-[#f4212e]" : "border-border"}`}
                placeholder={
                  ["AKTIV", "WERKSTATT", "UNFALL"].includes(formData.status)
                    ? "Pflichtfeld"
                    : "Optional"
                }
              />
              {tourError && (
                <p className="text-xs text-[#f4212e] mt-1">
                  Pflichtfeld für diesen Status
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Letzte Inspektion
              </label>
              <input
                type="date"
                value={formData.lastInspection}
                onChange={(e) =>
                  setFormData({ ...formData, lastInspection: e.target.value })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Letzter TÜV
              </label>
              <input
                type="date"
                value={formData.lastTuev}
                onChange={(e) =>
                  setFormData({ ...formData, lastTuev: e.target.value })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nächster TÜV
              </label>
              <input
                type="date"
                value={formData.nextInspection}
                onChange={(e) =>
                  setFormData({ ...formData, nextInspection: e.target.value })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nächster Werkstatttermin
              </label>
              <input
                type="date"
                value={formData.nextWorkshopAppointment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextWorkshopAppointment: e.target.value,
                  })
                }
                className="w-full px-3 py-3 h-14 pr-10 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
                style={{ colorScheme: "dark" }}
              />
              <svg
                className="absolute right-2 top-9 w-5 h-5 text-primary pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="flex gap-4 pt-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              Hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
