"use client";

import { useState } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import VehicleCard from "./VehicleCard";
import {
  Search,
  Plus,
  X,
  CarFront,
  Calendar,
  Gauge,
  User,
  Route,
} from "lucide-react";

interface FleetProps {
  vehicles: Vehicle[];
  onStatusChange: (vehicleId: string, newStatus: VehicleStatus) => void;
  onAddVehicle?: (vehicle: Omit<Vehicle, "id">) => void;
}

const statusOptions: { value: VehicleStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "verfügbar", label: "Verfügbar" },
  { value: "in_benutzung", label: "In Benutzung" },
  { value: "werkstatt", label: "Werkstatt" },
  { value: "unfall", label: "Unfall" },
  { value: "inaktiv", label: "Inaktiv" },
  { value: "ersatzfahrzeug", label: "Ersatzfahrzeug" },
];

export default function Fleet({
  vehicles,
  onStatusChange,
  onAddVehicle,
}: FleetProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
          style={{ backgroundColor: "#1d9bf0", color: "white" }}
        >
          <Plus className="w-4 h-4" />
          Fahrzeug hinzufügen
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
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
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
            <VehicleCard vehicle={vehicle} onStatusChange={onStatusChange} />
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

      {selectedVehicle && !editingVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onEdit={() => {
            setEditingVehicle(selectedVehicle);
            setSelectedVehicle(null);
          }}
        />
      )}

      {editingVehicle && (
        <VehicleModal
          mode="edit"
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={(updated) => {
            onStatusChange(updated.id, updated.status);
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
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit: () => void;
}) {
  const statusColors: Record<string, string> = {
    verfügbar: "#00ba7c",
    in_benutzung: "#1d9bf0",
    werkstatt: "#ffd400",
    unfall: "#f4212e",
    inaktiv: "#71767b",
    ersatzfahrzeug: "#8250df",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Baujahr</p>
                <p className="font-medium text-foreground">{vehicle.year}</p>
              </div>
            </div>
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
          className="w-full mt-6 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
        >
          Bearbeiten
        </button>
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
    make: vehicle?.make || "Opel",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    mileage: vehicle?.mileage || 0,
    status: vehicle?.status || ("verfügbar" as VehicleStatus),
    driver: vehicle?.driver || "",
    tourNumber: vehicle?.tourNumber || "",
    nextInspection: vehicle?.nextInspection || "",
    nextOilChange: vehicle?.nextOilChange || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "add" && onAdd) {
      onAdd({
        ...formData,
        tourNumber: formData.tourNumber || undefined,
        driver: formData.driver || undefined,
        nextInspection: formData.nextInspection || undefined,
        nextOilChange: formData.nextOilChange || undefined,
      });
    } else if (mode === "edit" && onSave && vehicle) {
      onSave({
        ...vehicle,
        ...formData,
        tourNumber: formData.tourNumber || undefined,
        driver: formData.driver || undefined,
        nextInspection: formData.nextInspection || undefined,
        nextOilChange: formData.nextOilChange || undefined,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
              <input
                type="text"
                required
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Modell
              </label>
              <select
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Auswählen...</option>
                <option value="Corsa">Corsa</option>
                <option value="Combo">Combo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Baujahr
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="verfügbar">Verfügbar</option>
                <option value="in_benutzung">In Benutzung</option>
                <option value="werkstatt">Werkstatt</option>
                <option value="unfall">Unfall</option>
                <option value="inaktiv">Inaktiv</option>
                <option value="ersatzfahrzeug">Ersatzfahrzeug</option>
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tour-Nummer
              </label>
              <input
                type="text"
                value={formData.tourNumber}
                onChange={(e) =>
                  setFormData({ ...formData, tourNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
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
                className="w-full px-3 py-2 pr-10 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
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
                Nächster Ölwechsel
              </label>
              <input
                type="date"
                value={formData.nextOilChange}
                onChange={(e) =>
                  setFormData({ ...formData, nextOilChange: e.target.value })
                }
                className="w-full px-3 py-2 pr-10 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors"
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
    make: "Opel",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    status: "verfügbar" as VehicleStatus,
    driver: "",
    tourNumber: "",
    nextInspection: "",
    nextOilChange: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
      onAdd({
        ...formData,
        tourNumber: formData.tourNumber || undefined,
        driver: formData.driver || undefined,
        nextInspection: formData.nextInspection || undefined,
        nextOilChange: formData.nextOilChange || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
              <input
                type="text"
                required
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="B-HF-123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Modell
              </label>
              <select
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Auswählen...</option>
                <option value="Corsa">Corsa</option>
                <option value="Combo">Combo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Baujahr
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="verfügbar">Verfügbar</option>
                <option value="in_benutzung">In Benutzung</option>
                <option value="werkstatt">Werkstatt</option>
                <option value="unfall">Unfall</option>
                <option value="inaktiv">Inaktiv</option>
                <option value="ersatzfahrzeug">Ersatzfahrzeug</option>
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tour-Nummer
              </label>
              <input
                type="text"
                value={formData.tourNumber}
                onChange={(e) =>
                  setFormData({ ...formData, tourNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Optional"
              />
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
                className="w-full px-3 py-2 pr-10 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
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
                Nächster Ölwechsel
              </label>
              <input
                type="date"
                value={formData.nextOilChange}
                onChange={(e) =>
                  setFormData({ ...formData, nextOilChange: e.target.value })
                }
                className="w-full px-3 py-2 pr-10 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer relative"
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              Hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
