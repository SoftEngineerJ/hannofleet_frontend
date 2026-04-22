"use client";

import { useState } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { vehicleApi } from "@/services/api";
import { X, Plus } from "lucide-react";

interface BatchAddModalProps {
  onClose: () => void;
  onAdd: (vehicle: Vehicle) => void;
  onAddMultiple?: (count: number) => void;
}

export default function BatchAddModal({
  onClose,
  onAdd,
  onAddMultiple,
}: BatchAddModalProps) {
  const emptyVehicle = {
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
  };

  const [vehicles, setVehicles] = useState([{ ...emptyVehicle }]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const addVehicle = () => {
    setVehicles([...vehicles, { ...emptyVehicle }]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index));
    }
  };

  const updateVehicle = (index: number, field: string, value: any) => {
    const updated = [...vehicles];
    (updated[index] as any)[field] = value;
    setVehicles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const validVehicles: Omit<Vehicle, "id">[] = [];
      const newErrors: string[] = [];

      vehicles.forEach((v, i) => {
        if (!v.licensePlate || v.licensePlate.length < 5) {
          newErrors.push(`Fahrzeug ${i + 1}: Ungueltiges Kennzeichen`);
          return;
        }
        if (!v.model) {
          newErrors.push(`Fahrzeug ${i + 1}: Modell fehlt`);
          return;
        }

        const tourRequired = ["AKTIV", "WERKSTATT", "UNFALL"].includes(
          v.status,
        );
        if (tourRequired && !v.tourNumber) {
          newErrors.push(`Fahrzeug ${i + 1}: Tour-Nummer erforderlich`);
          return;
        }

        validVehicles.push({
          licensePlate: v.licensePlate,
          model: v.model,
          mileage: v.mileage || 0,
          status: v.status,
          driver: v.driver || undefined,
          tourNumber: v.tourNumber || undefined,
          nextInspection: v.nextInspection || undefined,
          lastInspection: v.lastInspection || undefined,
          lastTuev: v.lastTuev || undefined,
          nextWorkshopAppointment: v.nextWorkshopAppointment || undefined,
        });
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const created = await vehicleApi.createBatch(validVehicles);
      if (onAddMultiple) {
        onAddMultiple(created.length);
      } else {
        created.forEach((v) => onAdd(v));
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Fehler beim Erstellen der Fahrzeuge";
      setErrorModal(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {errorModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setErrorModal(null)}
        >
          <div
            className="bg-card border border-red-500 rounded-2xl p-6 w-full max-w-md animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Fehler</h3>
              <p className="text-muted-foreground mb-6">{errorModal}</p>
              <button
                onClick={() => setErrorModal(null)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-card border border-border rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Fahrzeuge hinzufügen
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {vehicles.map((vehicle, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary/30 rounded-xl border border-border"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-foreground">
                      Fahrzeug {index + 1}
                    </span>
                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Kennzeichen *
                      </label>
                      <input
                        type="text"
                        value={vehicle.licensePlate}
                        onChange={(e) =>
                          updateVehicle(
                            index,
                            "licensePlate",
                            e.target.value.toUpperCase(),
                          )
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                        placeholder="GÖ-A-1234"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Modell *
                      </label>
                      <select
                        value={vehicle.model || ""}
                        onChange={(e) =>
                          updateVehicle(index, "model", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      >
                        <option value="">Auswählen...</option>
                        <option value="Corsa">Corsa</option>
                        <option value="Combo">Combo</option>
                        <option value="__SONSTIGES__">Sonstiges</option>
                      </select>
                      {(vehicle.model === "__SONSTIGES__" ||
                        (vehicle.model &&
                          !["Corsa", "Combo", ""].includes(vehicle.model))) && (
                        <input
                          type="text"
                          value={
                            vehicle.model === "__SONSTIGES__"
                              ? ""
                              : vehicle.model
                          }
                          onChange={(e) =>
                            updateVehicle(index, "model", e.target.value)
                          }
                          className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm mt-2"
                          placeholder="Modell eingeben..."
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Kilometer
                      </label>
                      <input
                        type="number"
                        value={vehicle.mileage || ""}
                        onChange={(e) =>
                          updateVehicle(
                            index,
                            "mileage",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Status
                      </label>
                      <select
                        value={vehicle.status}
                        onChange={(e) =>
                          updateVehicle(index, "status", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      >
                        <option value="FREI">Frei</option>
                        <option value="AKTIV">Aktiv</option>
                        <option value="WERKSTATT">Werkstatt</option>
                        <option value="UNFALL">Unfall</option>
                        <option value="ABGEMELDET">Abgemeldet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Fahrer
                      </label>
                      <input
                        type="text"
                        value={vehicle.driver}
                        onChange={(e) =>
                          updateVehicle(index, "driver", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Tour-Nr.
                      </label>
                      <input
                        type="text"
                        value={vehicle.tourNumber}
                        onChange={(e) =>
                          updateVehicle(index, "tourNumber", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Nächste Inspektion
                      </label>
                      <input
                        type="date"
                        value={vehicle.nextWorkshopAppointment}
                        onChange={(e) =>
                          updateVehicle(
                            index,
                            "nextWorkshopAppointment",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Letzte Inspektion
                      </label>
                      <input
                        type="date"
                        value={vehicle.lastInspection}
                        onChange={(e) =>
                          updateVehicle(index, "lastInspection", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Nächster TÜV
                      </label>
                      <input
                        type="date"
                        value={vehicle.nextInspection}
                        onChange={(e) =>
                          updateVehicle(index, "nextInspection", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Letzter TÜV
                      </label>
                      <input
                        type="date"
                        value={vehicle.lastTuev}
                        onChange={(e) =>
                          updateVehicle(index, "lastTuev", e.target.value)
                        }
                        className="w-full px-2 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addVehicle}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Weiteres Fahrzeug
            </button>

            {errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                {errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-500">
                    {err}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-4 pt-6 mt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Erstelle..."
                  : `${vehicles.length} Fahrzeug${vehicles.length > 1 ? "e" : ""} erstellen`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
