"use client";

import { useState } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { vehicleApi } from "@/services/api";

interface InspectionsProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (vehicle: Vehicle) => void;
}

type FilterType = "all" | "overdue" | "upcoming";

export default function Inspections({
  vehicles,
  onUpdateVehicle,
}: InspectionsProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [completionType, setCompletionType] = useState<
    "tuev" | "workshop" | null
  >(null);
  const [newDate, setNewDate] = useState("");
  const [newMileage, setNewMileage] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower) ||
        vehicle.driver?.toLowerCase().includes(searchLower)
      );
    }
    if (filter === "overdue") {
      return (
        (vehicle.nextInspection && new Date(vehicle.nextInspection) < today) ||
        (vehicle.nextWorkshopAppointment &&
          new Date(vehicle.nextWorkshopAppointment) < today)
      );
    }
    if (filter === "upcoming") {
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      return (
        (vehicle.nextInspection &&
          new Date(vehicle.nextInspection) >= today &&
          new Date(vehicle.nextInspection) <= thirtyDaysLater) ||
        (vehicle.nextWorkshopAppointment &&
          new Date(vehicle.nextWorkshopAppointment) >= today &&
          new Date(vehicle.nextWorkshopAppointment) <= thirtyDaysLater)
      );
    }
    return (
      vehicle.lastInspection ||
      vehicle.nextInspection ||
      vehicle.nextWorkshopAppointment
    );
  });

  const overdueCount = vehicles.filter(
    (v) =>
      (v.nextInspection && new Date(v.nextInspection) < today) ||
      (v.nextWorkshopAppointment &&
        new Date(v.nextWorkshopAppointment) < today),
  ).length;

  const upcomingCount = vehicles.filter((v) => {
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    return (
      (v.nextInspection &&
        new Date(v.nextInspection) >= today &&
        new Date(v.nextInspection) <= thirtyDaysLater) ||
      (v.nextWorkshopAppointment &&
        new Date(v.nextWorkshopAppointment) >= today &&
        new Date(v.nextWorkshopAppointment) <= thirtyDaysLater)
    );
  }).length;

  const handleComplete = (vehicle: Vehicle, type: "tuev" | "workshop") => {
    setSelectedVehicle(vehicle);
    setCompletionType(type);
    const nextDate =
      type === "tuev"
        ? vehicle.nextInspection
        : vehicle.nextWorkshopAppointment;
    const defaultDate = nextDate ? new Date(nextDate) : new Date();
    const monthsToAdd = completionType === "tuev" ? 24 : 6;
    defaultDate.setMonth(defaultDate.getMonth() + monthsToAdd);
    setNewDate(defaultDate.toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedVehicle || !completionType || !newDate) return;
    setSaving(true);
    try {
      const updates: any = {
        id: selectedVehicle.id,
        licensePlate: selectedVehicle.licensePlate,
        model: selectedVehicle.model,
        mileage: selectedVehicle.mileage,
        status: selectedVehicle.status,
      };
      const completedDate =
        completionType === "tuev"
          ? selectedVehicle.nextInspection
          : selectedVehicle.nextWorkshopAppointment;
      updates.lastInspection = completedDate || newDate;
      if (completionType === "tuev") {
        updates.nextInspection = newDate;
      } else {
        updates.nextWorkshopAppointment = newDate;
        if (newMileage) {
          updates.mileage = parseInt(newMileage, 10);
        }
      }
      const updated = await vehicleApi.update(
        String(selectedVehicle.id),
        updates,
      );
      if (onUpdateVehicle) {
        onUpdateVehicle(updated);
      }
      setShowModal(false);
      setSelectedVehicle(null);
      setCompletionType(null);
      setNewMileage("");
    } catch (err) {
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Inspektionsübersicht
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen..."
                className="w-64 px-4 py-2 pl-10 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Alle (
                {
                  vehicles.filter(
                    (v) =>
                      v.lastInspection ||
                      v.nextInspection ||
                      v.nextWorkshopAppointment,
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setFilter("overdue")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "overdue"
                    ? "bg-red-500 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Überfällig ({overdueCount})
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "upcoming"
                    ? "bg-yellow-500 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Bald fällig ({upcomingCount})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Kennzeichen
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Kilometerstand
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Letzte Inspektion
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Nächste Inspektion
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Letzter TÜV
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                    Nächster TÜV
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => {
                  const isOverdue =
                    (vehicle.nextInspection &&
                      new Date(vehicle.nextInspection) < today) ||
                    (vehicle.nextWorkshopAppointment &&
                      new Date(vehicle.nextWorkshopAppointment) < today);
                  return (
                    <tr
                      key={vehicle.id}
                      className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                        isOverdue ? "bg-red-500/5" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">
                          {vehicle.licensePlate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {vehicle.mileage?.toLocaleString("de-DE")} km
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            vehicle.status === "FREI"
                              ? "bg-[#00ba7c]/20 text-[#00ba7c]"
                              : vehicle.status === "AKTIV"
                                ? "bg-[#1d9bf0]/20 text-[#1d9bf0]"
                                : vehicle.status === "WERKSTATT"
                                  ? "bg-[#ffd400]/20 text-[#ffd400]"
                                  : vehicle.status === "UNFALL"
                                    ? "bg-[#f4212e]/20 text-[#f4212e]"
                                    : "bg-[#71767b]/20 text-[#71767b]"
                          }`}
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
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.lastInspection ? (
                          <span className="text-foreground">
                            {new Date(
                              vehicle.lastInspection,
                            ).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.nextWorkshopAppointment ? (
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">
                              {new Date(
                                vehicle.nextWorkshopAppointment,
                              ).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                            {new Date(vehicle.nextWorkshopAppointment) <
                              today && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                                Überfällig
                              </span>
                            )}
                            <button
                              onClick={() =>
                                handleComplete(vehicle, "workshop")
                              }
                              className="ml-2 p-1 rounded bg-green-500/20 text-green-500 hover:bg-green-500/30"
                              title="Als erledigt markieren"
                            >
                              <svg
                                className="w-4 h-4"
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
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.lastTuev ? (
                          <span className="text-foreground">
                            {new Date(vehicle.lastTuev).toLocaleDateString(
                              "de-DE",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.nextInspection ? (
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">
                              {new Date(
                                vehicle.nextInspection,
                              ).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                            {new Date(vehicle.nextInspection) < today && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                                Überfällig
                              </span>
                            )}
                            <button
                              onClick={() => handleComplete(vehicle, "tuev")}
                              className="ml-2 p-1 rounded bg-green-500/20 text-green-500 hover:bg-green-500/30"
                              title="Als erledigt markieren"
                            >
                              <svg
                                className="w-4 h-4"
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
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      Keine Inspektionsdaten vorhanden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Inspektion erledigt
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedVehicle?.licensePlate} -{" "}
              {completionType === "tuev"
                ? "Nächster TÜV"
                : "Nächste Inspektion"}
            </p>
            <div className="space-y-4">
              {completionType === "workshop" && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Aktueller Kilometerstand
                  </label>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    placeholder={selectedVehicle?.mileage?.toString()}
                    className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Neuer Termin (
                  {completionType === "tuev" ? "in 2 Jahren" : "in 6 Monaten"})
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-3 h-14 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedVehicle(null);
                    setCompletionType(null);
                  }}
                  className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Speichern..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
