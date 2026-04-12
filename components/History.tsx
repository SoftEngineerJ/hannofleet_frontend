"use client";

import { useState, useEffect } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { historyApi, VehicleHistory } from "@/services/api";
import { CarFront, User, Calendar, Filter, ChevronDown } from "lucide-react";

interface HistoryProps {
  vehicles: Vehicle[];
}

const statusLabels: Record<VehicleStatus, string> = {
  FREI: "Frei",
  AKTIV: "Aktiv",
  WERKSTATT: "Werkstatt",
  UNFALL: "Unfall",
  ABGEMELDET: "Abgemeldet",
};

const statusColors: Record<VehicleStatus, string> = {
  FREI: "#00ba7c",
  AKTIV: "#1d9bf0",
  WERKSTATT: "#ffd400",
  UNFALL: "#f4212e",
  ABGEMELDET: "#71767b",
};

type TimelineEvent = VehicleHistory & {
  vehicleName?: string;
  vehiclePlate?: string;
};

export default function History({ vehicles }: HistoryProps) {
  const [historyData, setHistoryData] = useState<VehicleHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "STATUS" | "DRIVER">(
    "all",
  );
  const [filterVehicle, setFilterVehicle] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const loadHistory = async (vehicleId: string) => {
    if (!vehicleId) {
      setHistoryData([]);
      return;
    }
    setLoading(true);
    try {
      const data = await historyApi.getByVehicle(Number(vehicleId));
      setHistoryData(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setFilterVehicle(vehicleId);
    loadHistory(vehicleId);
  };

  const allEvents: TimelineEvent[] = historyData
    .filter((h) => filterType === "all" || h.historyType === filterType)
    .filter(
      (h) => filterVehicle === "all" || String(h.vehicleId) === filterVehicle,
    )
    .map((h) => {
      const vehicle = vehicles.find((v) => v.id === h.vehicleId);
      return {
        ...h,
        vehicleName: vehicle?.model,
        vehiclePlate: vehicle?.licensePlate,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime(),
    );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedEvents = allEvents.reduce(
    (acc, event) => {
      const date = formatDate(event.changeDate);
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    },
    {} as Record<string, TimelineEvent[]>,
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Verlauf</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Automatisch generiert
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Fahrzeug suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-card border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="relative">
            <select
              value={filterVehicle}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-card border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[250px]"
            >
              <option value="">Bitte auswählen</option>
              {vehicles.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.model} - {v.licensePlate}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {searchQuery && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {filteredVehicles.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Keine Fahrzeuge gefunden
              </div>
            ) : (
              filteredVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    handleVehicleSelect(String(v.id));
                    setSearchQuery("");
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary border-b border-border last:border-b-0 flex items-center gap-3"
                >
                  <CarFront className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{v.model}</div>
                    <div className="text-sm text-muted-foreground">
                      {v.licensePlate}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {filterVehicle && (
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none pl-4 pr-10 py-2 bg-card border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="all">Alle Typen</option>
              <option value="STATUS">Nur Status</option>
              <option value="DRIVER">Nur Fahrer</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={() => {
              setFilterVehicle("");
              setHistoryData([]);
            }}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:bg-destructive/10 hover:border-destructive/30"
          >
            Fahrzeug wechseln
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#1d9bf0]" />
          Status-Änderungen:{" "}
          {allEvents.filter((e) => e.historyType === "STATUS").length}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00ba7c]" />
          Fahrer-Wechsel:{" "}
          {allEvents.filter((e) => e.historyType === "DRIVER").length}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Lade Verlauf...
        </div>
      ) : !filterVehicle ? (
        <div className="text-center py-12 text-muted-foreground">
          <CarFront className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Bitte wähle ein Fahrzeug aus</p>
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Noch keine Einträge vorhanden</p>
          <p className="text-sm mt-1">
            Ändere den Status oder Fahrer dieses Fahrzeugs
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {date}
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({events.length} Änderung{events.length !== 1 ? "en" : ""})
                </span>
              </div>

              <div className="relative ml-4 border-l-2 border-border space-y-4 pl-8">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className="absolute -left-[41px] w-4 h-4 rounded-full border-2 border-card"
                      style={{
                        backgroundColor:
                          event.historyType === "STATUS"
                            ? statusColors[event.newValue as VehicleStatus] ||
                              "#71767b"
                            : "#00ba7c",
                      }}
                    />

                    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor:
                                event.historyType === "STATUS"
                                  ? `${statusColors[event.newValue as VehicleStatus] || "#71767b"}15`
                                  : "#00ba7c15",
                            }}
                          >
                            {event.historyType === "STATUS" ? (
                              <CarFront
                                className="w-5 h-5"
                                style={{
                                  color:
                                    statusColors[
                                      event.newValue as VehicleStatus
                                    ] || "#71767b",
                                }}
                              />
                            ) : (
                              <User
                                className="w-5 h-5"
                                style={{ color: "#00ba7c" }}
                              />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                {event.vehicleName ||
                                  `Fahrzeug #${event.vehicleId}`}
                              </span>
                              <span className="text-muted-foreground">|</span>
                              <span className="text-sm text-muted-foreground">
                                {event.vehiclePlate || ""}
                              </span>
                            </div>

                            {event.historyType === "STATUS" ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-sm font-medium"
                                  style={{
                                    color:
                                      statusColors[
                                        event.oldValue as VehicleStatus
                                      ] || "#71767b",
                                  }}
                                >
                                  {statusLabels[
                                    event.oldValue as VehicleStatus
                                  ] || event.oldValue}
                                </span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                                <span
                                  className="text-sm font-medium"
                                  style={{
                                    color:
                                      statusColors[
                                        event.newValue as VehicleStatus
                                      ] || "#71767b",
                                  }}
                                >
                                  {statusLabels[
                                    event.newValue as VehicleStatus
                                  ] || event.newValue}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {event.oldValue || "Kein Fahrer"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                                <span className="text-sm font-medium text-foreground">
                                  {event.newValue}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground">
                            {formatTime(event.changeDate)}
                          </div>
                          <div className="text-xs text-primary mt-1">
                            {event.historyType === "STATUS"
                              ? "Status"
                              : "Fahrer"}
                          </div>
                        </div>
                      </div>

                      {event.note && event.note !== "automatisch" && (
                        <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
