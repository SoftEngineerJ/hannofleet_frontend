"use client";

import { useState } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { CarFront, User, Clock, Plus, X } from "lucide-react";

interface HistoryProps {
  vehicles: Vehicle[];
}

interface DriverHistory {
  id: string;
  vehicleId: string;
  driverName: string;
  startDate: string;
  endDate?: string;
}

interface StatusHistoryEntry {
  id: string;
  vehicleId: string;
  status: VehicleStatus;
  date: string;
  endDate?: string;
}

const statusLabels: Record<VehicleStatus, string> = {
  verfügbar: "Verfügbar",
  in_benutzung: "In Benutzung",
  werkstatt: "Werkstatt",
  unfall: "Unfall",
  inaktiv: "Inaktiv",
  ersatzfahrzeug: "Ersatzfahrzeug",
};

const statusColors: Record<VehicleStatus, string> = {
  verfügbar: "#00ba7c",
  in_benutzung: "#1d9bf0",
  werkstatt: "#ffd400",
  unfall: "#f4212e",
  inaktiv: "#71767b",
  ersatzfahrzeug: "#8250df",
};

export default function History({ vehicles }: HistoryProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyType, setHistoryType] = useState<"driver" | "status">("driver");

  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([
    {
      id: "1",
      vehicleId: "1",
      status: "verfügbar",
      date: "2025-01-01",
      endDate: "2025-02-14",
    },
    {
      id: "2",
      vehicleId: "1",
      status: "in_benutzung",
      date: "2025-02-15",
      endDate: "2025-03-19",
    },
    { id: "3", vehicleId: "1", status: "verfügbar", date: "2025-03-20" },
    { id: "4", vehicleId: "2", status: "in_benutzung", date: "2024-06-01" },
    {
      id: "5",
      vehicleId: "3",
      status: "werkstatt",
      date: "2025-04-01",
      endDate: "2025-04-10",
    },
    { id: "6", vehicleId: "3", status: "verfügbar", date: "2025-04-11" },
  ]);

  const [driverHistory, setDriverHistory] = useState<DriverHistory[]>([
    {
      id: "1",
      vehicleId: "1",
      driverName: "Max Müller",
      startDate: "2025-01-15",
      endDate: "2025-03-20",
    },
    {
      id: "2",
      vehicleId: "1",
      driverName: "Anna Schmidt",
      startDate: "2025-03-21",
    },
    {
      id: "3",
      vehicleId: "2",
      driverName: "Tom Weber",
      startDate: "2024-06-01",
    },
    {
      id: "4",
      vehicleId: "3",
      driverName: "Lisa Bauer",
      startDate: "2025-02-10",
      endDate: "2025-04-05",
    },
    {
      id: "5",
      vehicleId: "3",
      driverName: "Jan Hoffmann",
      startDate: "2025-04-06",
    },
  ]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const vehicleDriverHistory = driverHistory
    .filter((h) => h.vehicleId === selectedVehicleId)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

  const vehicleStatusHistory = statusHistory
    .filter((h) => h.vehicleId === selectedVehicleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAddDriverHistory = (data: {
    driverName: string;
    startDate: string;
    endDate?: string;
  }) => {
    setDriverHistory((prev) => [
      ...prev.map((h) => {
        if (h.vehicleId === selectedVehicleId && !h.endDate) {
          return { ...h, endDate: data.startDate };
        }
        return h;
      }),
      {
        id: Date.now().toString(),
        vehicleId: selectedVehicleId,
        driverName: data.driverName,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    ]);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Historie</h1>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Fahrzeug auswählen
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Fahrzeug wählen...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} - {v.licensePlate}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setHistoryType("driver")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              historyType === "driver"
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Fahrer
          </button>
          <button
            onClick={() => setHistoryType("status")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              historyType === "status"
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <CarFront className="w-4 h-4 inline mr-2" />
            Status
          </button>
        </div>
      </div>

      {selectedVehicleId ? (
        <div className="space-y-4">
          {historyType === "driver" && (
            <>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Fahrerwechsel
                </button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <CarFront className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">
                        {selectedVehicle?.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedVehicle?.licensePlate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {vehicleDriverHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {history.driverName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(history.startDate)}
                          {history.endDate
                            ? ` - ${formatDate(history.endDate)}`
                            : " - heute"}
                        </div>
                      </div>
                      {!history.endDate && (
                        <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-md">
                          Aktuell
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {historyType === "status" && (
            <>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Status ändern
                </button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <CarFront className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">
                        {selectedVehicle?.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedVehicle?.licensePlate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {vehicleStatusHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="p-4 flex items-center gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${statusColors[history.status]}15`,
                        }}
                      >
                        <CarFront
                          className="w-5 h-5"
                          style={{ color: statusColors[history.status] }}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-medium text-foreground"
                          style={{ color: statusColors[history.status] }}
                        >
                          {statusLabels[history.status]}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(history.date)}
                          {history.endDate
                            ? ` - ${formatDate(history.endDate)}`
                            : " - heute"}
                        </div>
                      </div>
                      {!history.endDate && (
                        <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-md">
                          Aktuell
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <CarFront className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Bitte wähle ein Fahrzeug aus</p>
        </div>
      )}

      {showAddModal && historyType === "driver" && (
        <AddDriverHistoryModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDriverHistory}
        />
      )}

      {showAddModal && historyType === "status" && (
        <AddStatusHistoryModal
          currentStatus={selectedVehicle?.status}
          onClose={() => setShowAddModal(false)}
          onAdd={(status, date, endDate) => {
            setStatusHistory((prev) => [
              ...prev.map((h) => {
                if (
                  h.vehicleId === selectedVehicleId &&
                  !h.id.includes("new")
                ) {
                  return { ...h, id: h.id + "_old" };
                }
                return h;
              }),
              {
                id: `new-${Date.now()}`,
                vehicleId: selectedVehicleId,
                status,
                date,
                endDate,
              },
            ]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddDriverHistoryModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: {
    driverName: string;
    startDate: string;
    endDate?: string;
  }) => void;
}) {
  const [driverName, setDriverName] = useState("");
  const [dateType, setDateType] = useState<"today" | "single" | "range">(
    "today",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !startDate) return;
    onAdd({
      driverName,
      startDate,
      endDate: dateType !== "today" ? endDate : undefined,
    });
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
          <h2 className="text-xl font-bold text-foreground">Fahrerwechsel</h2>
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
              Neuer Fahrer
            </label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Name eingeben..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Zeitraum
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setDateType("today")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateType === "today"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Ab Datum
              </button>
              <button
                type="button"
                onClick={() => setDateType("single")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateType === "single"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Ein Tag
              </button>
              <button
                type="button"
                onClick={() => setDateType("range")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateType === "range"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Zeitraum
              </button>
            </div>

            {dateType === "today" && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Ab Datum
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bis heute / Aktuell
                </p>
              </div>
            )}

            {dateType === "single" && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {dateType === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Von
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Bis
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}
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
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddStatusHistoryModal({
  currentStatus,
  onClose,
  onAdd,
}: {
  currentStatus?: VehicleStatus;
  onClose: () => void;
  onAdd: (status: VehicleStatus, date: string, endDate?: string) => void;
}) {
  const [status, setStatus] = useState<VehicleStatus>(
    currentStatus || "verfügbar",
  );
  const [dateType, setDateType] = useState<"today" | "single" | "range">(
    "today",
  );
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onAdd(status, date, dateType !== "today" ? endDate : undefined);
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
          <h2 className="text-xl font-bold text-foreground">Status ändern</h2>
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
              Neuer Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
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
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Zeitraum
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setDateType("today")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateType === "today"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Ab Datum
              </button>
              <button
                type="button"
                onClick={() => setDateType("single")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateType === "single"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Ein Tag
              </button>
              <button
                type="button"
                onClick={() => setDateType("range")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateType === "range"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Zeitraum
              </button>
            </div>

            {dateType === "today" && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Ab Datum
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bis heute / Aktuell
                </p>
              </div>
            )}

            {dateType === "single" && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {dateType === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Von
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Bis
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}
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
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
