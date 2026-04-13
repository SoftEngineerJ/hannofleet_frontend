"use client";

import { useState } from "react";
import { Vehicle } from "@/types/vehicle";
import {
  Calendar,
  CarFront,
  Wrench,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AppointmentsProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (vehicleId: number, updates: Partial<Vehicle>) => void;
}

type AppointmentType = "all" | "tuev" | "workshop";

const typeConfig = {
  all: { label: "Alle", color: "#71767b", icon: Calendar },
  tuev: { label: "TÜV", color: "#ffd400", icon: CheckCircle },
  workshop: { label: "Werkstatt", color: "#00ba7c", icon: Wrench },
};

interface Appointment {
  id: string;
  vehicleId: number;
  vehicleModel: string;
  licensePlate: string;
  type: "tuev" | "workshop";
  date: string;
  daysUntil: number;
  isCustom?: boolean;
}

export default function Appointments({
  vehicles,
  onUpdateVehicle,
}: AppointmentsProps) {
  const [typeFilter, setTypeFilter] = useState<AppointmentType>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const appointments: Appointment[] = [];

  vehicles.forEach((vehicle) => {
    if (vehicle.nextInspection) {
      const date = new Date(vehicle.nextInspection);
      const today = new Date();
      const daysUntil = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      appointments.push({
        id: `tuev-${vehicle.id}`,
        vehicleId: vehicle.id,
        vehicleModel: vehicle.model,
        licensePlate: vehicle.licensePlate,
        type: "tuev",
        date: vehicle.nextInspection,
        daysUntil,
      });
    }

    if (vehicle.nextWorkshopAppointment) {
      const date = new Date(vehicle.nextWorkshopAppointment);
      const today = new Date();
      const daysUntil = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      appointments.push({
        id: `workshop-${vehicle.id}`,
        vehicleId: vehicle.id,
        vehicleModel: vehicle.model,
        licensePlate: vehicle.licensePlate,
        type: "workshop",
        date: vehicle.nextWorkshopAppointment,
        daysUntil,
      });
    }
  });

  const allAppointments = appointments;
  const filteredAppointments = allAppointments
    .filter((apt) => {
      if (typeFilter === "all") return true;
      return apt.type === typeFilter;
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const upcomingCount = filteredAppointments.filter(
    (a) => a.daysUntil <= 30 && a.daysUntil >= 0,
  ).length;
  const overdueCount = filteredAppointments.filter(
    (a) => a.daysUntil < 0,
  ).length;

  const groupedByMonth = filteredAppointments.reduce(
    (acc, apt) => {
      const date = new Date(apt.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, appointments: [] };
      }
      acc[monthKey].appointments.push(apt);
      return acc;
    },
    {} as Record<string, { label: string; appointments: Appointment[] }>,
  );

  const getDaysLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)} Tage überfällig`;
    if (days === 0) return "Heute";
    if (days === 1) return "Morgen";
    return `in ${days} Tagen`;
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return "text-red-500";
    if (days <= 7) return "text-orange-500";
    if (days <= 30) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Termine</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {overdueCount > 0 && (
          <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            {overdueCount} überfällig
          </div>
        )}
        {upcomingCount > 0 && (
          <div
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: "#ffd40015",
              color: "#ffd400",
              border: "1px solid #ffd40020",
            }}
          >
            {upcomingCount} diese Woche
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          Object.entries(typeConfig) as [
            AppointmentType,
            (typeof typeConfig)[keyof typeof typeConfig],
          ][]
        ).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === key
                  ? "text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={
                typeFilter === key ? { backgroundColor: config.color } : {}
              }
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Keine Termine gefunden
          </div>
        ) : (
          filteredAppointments.map((apt, index) => {
            const config = typeConfig[apt.type as keyof typeof typeConfig];
            const Icon = config.icon;
            const isOverdue = apt.daysUntil < 0;
            const isUrgent = apt.daysUntil >= 0 && apt.daysUntil <= 7;
            const isSoon = apt.daysUntil > 7 && apt.daysUntil <= 30;

            return (
              <div
                key={`${apt.vehicleId}-${apt.type}-${index}`}
                onClick={() => setSelectedAppointment(apt)}
                className="p-3 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div
                    className={`text-xs font-medium ${isOverdue ? "text-red-500" : isUrgent ? "text-orange-500" : isSoon ? "text-yellow-500" : "text-muted-foreground"}`}
                  >
                    {isOverdue
                      ? `${Math.abs(apt.daysUntil)}T`
                      : apt.daysUntil === 0
                        ? "Heute"
                        : apt.daysUntil === 1
                          ? "1T"
                          : `${apt.daysUntil}T`}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">
                    {apt.vehicleModel}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {apt.licensePlate}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${config.color}15`,
                      color: config.color,
                    }}
                  >
                    {config.label}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {new Date(apt.date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const config =
                    typeConfig[
                      selectedAppointment.type as keyof typeof typeConfig
                    ];
                  const Icon = config.icon;
                  return (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: config.color }}
                      />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedAppointment.vehicleModel}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedAppointment.licensePlate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Datum</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedAppointment.date).toLocaleDateString(
                      "de-DE",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Frist</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.daysUntil < 0
                      ? `${Math.abs(selectedAppointment.daysUntil)} Tage überfällig`
                      : selectedAppointment.daysUntil === 0
                        ? "Heute fällig"
                        : selectedAppointment.daysUntil === 1
                          ? "Morgen fällig"
                          : `Noch ${selectedAppointment.daysUntil} Tage`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
                {(() => {
                  const config =
                    typeConfig[
                      selectedAppointment.type as keyof typeof typeConfig
                    ];
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon
                        className="w-5 h-5"
                        style={{ color: config.color }}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Terminart
                        </p>
                        <p className="font-medium text-foreground">
                          {config.label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddAppointmentModal({
  vehicles,
  editAppointment,
  onClose,
  onAdd,
  onUpdate,
}: {
  vehicles: Vehicle[];
  editAppointment?: Appointment;
  onClose: () => void;
  onAdd?: (apt: Appointment) => void;
  onUpdate?: (apt: Appointment) => void;
}) {
  const [formData, setFormData] = useState({
    vehicleId: editAppointment?.vehicleId || 0,
    type: editAppointment?.type || ("workshop" as "tuev" | "workshop"),
    date: editAppointment?.date || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.id === formData.vehicleId);
    if (!vehicle || !formData.date) return;

    const date = new Date(formData.date);
    const today = new Date();
    const daysUntil = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (editAppointment && onUpdate) {
      onUpdate({
        ...editAppointment,
        vehicleId: vehicle.id,
        vehicleModel: vehicle.model,
        licensePlate: vehicle.licensePlate,
        type: formData.type,
        date: formData.date,
        daysUntil,
      });
    } else if (onAdd) {
      onAdd({
        id: `custom-${Date.now()}`,
        vehicleId: vehicle.id,
        vehicleModel: vehicle.model,
        licensePlate: vehicle.licensePlate,
        type: formData.type,
        date: formData.date,
        daysUntil,
        isCustom: true,
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
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {editAppointment ? "Termin bearbeiten" : "Termin hinzufügen"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Fahrzeug
            </label>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) =>
                setFormData({ ...formData, vehicleId: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Auswählen...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model} - {v.licensePlate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Terminart
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="tuev">TÜV</option>
              <option value="workshop">Werkstatt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Datum
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
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
              {editAppointment ? "Speichern" : "Hinzufügen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
