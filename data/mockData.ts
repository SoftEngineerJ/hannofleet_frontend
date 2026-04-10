import { Vehicle, Tour, Appointment, VehicleEvent } from "@/types/vehicle";

export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "B-HF-123",
    make: "Opel",
    model: "Corsa",
    year: 2022,
    mileage: 45000,
    status: "verfügbar",
    tourNumber: "T-001",
    driver: "Müller",
    nextInspection: "2024-12-15",
    nextOilChange: "2024-08-20",
  },
  {
    id: "2",
    licensePlate: "B-HF-456",
    make: "Opel",
    model: "Combo",
    year: 2021,
    mileage: 62000,
    status: "in_benutzung",
    tourNumber: "T-002",
    driver: "Schmidt",
    nextInspection: "2024-11-30",
    nextOilChange: "2024-09-15",
  },
  {
    id: "3",
    licensePlate: "B-HF-789",
    make: "Opel",
    model: "Corsa",
    year: 2023,
    mileage: 28000,
    status: "werkstatt",
    tourNumber: "T-003",
    driver: "Weber",
    nextInspection: "2025-01-10",
    nextOilChange: "2024-10-01",
  },
  {
    id: "4",
    licensePlate: "B-HF-101",
    make: "Opel",
    model: "Combo",
    year: 2022,
    mileage: 51000,
    status: "unfall",
    tourNumber: "T-004",
    driver: "Fischer",
    nextInspection: "2024-12-01",
    nextOilChange: "2024-08-25",
  },
  {
    id: "5",
    licensePlate: "B-HF-202",
    make: "Opel",
    model: "Corsa",
    year: 2021,
    mileage: 73000,
    status: "ersatzfahrzeug",
    nextInspection: "2024-11-15",
    nextOilChange: "2024-09-10",
  },
  {
    id: "6",
    licensePlate: "B-HF-303",
    make: "Opel",
    model: "Combo",
    year: 2022,
    mileage: 48000,
    status: "verfügbar",
    nextInspection: "2024-12-20",
    nextOilChange: "2024-10-05",
  },
  {
    id: "7",
    licensePlate: "B-HF-404",
    make: "Opel",
    model: "Corsa",
    year: 2023,
    mileage: 35000,
    status: "in_benutzung",
    nextInspection: "2025-02-15",
    nextOilChange: "2024-11-01",
  },
];

// Generate 45 more vehicles to reach 50 total
const additionalVehicles: Vehicle[] = Array.from({ length: 45 }, (_, index) => {
  const isCorsa = index % 2 === 0;
  return {
    id: (index + 8).toString(),
    licensePlate: `B-HF-${String(index + 600).padStart(3, "0")}`,
    make: "Opel",
    model: isCorsa ? "Corsa" : "Combo",
    year: 2020 + (index % 4),
    mileage: 20000 + index * 1500,
    status: ["verfügbar", "in_benutzung", "werkstatt", "inaktiv"][
      index % 4
    ] as Vehicle["status"],
    tourNumber:
      index % 3 === 0 ? `T-${String(index + 100).padStart(3, "0")}` : undefined,
    driver: index % 3 === 0 ? `Fahrer ${index + 1}` : undefined,
    nextInspection: `2024-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    nextOilChange: `2024-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
  };
});

export const vehicles: Vehicle[] = [...mockVehicles, ...additionalVehicles];

export const mockTours: Tour[] = [
  {
    id: "1",
    name: "Linie 1 - Innenstadt",
    vehicleId: "1",
    driver: "Müller",
    schedule: "Mo-Fr 06:00-14:00",
    status: "active",
  },
  {
    id: "2",
    name: "Linie 2 - Außenbezirke",
    vehicleId: "2",
    driver: "Schmidt",
    schedule: "Mo-Fr 14:00-22:00",
    status: "active",
  },
  {
    id: "3",
    name: "Linie 3 - Nachtlinie",
    vehicleId: "3",
    driver: "Weber",
    schedule: "Fr-Sa 22:00-06:00",
    status: "active",
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    vehicleId: "3",
    type: "maintenance",
    title: "Regelmäßige Wartung",
    date: "2024-08-15T09:00:00",
    status: "scheduled",
    cost: 250,
    notes: "Ölwechsel und Filterwechsel",
  },
  {
    id: "2",
    vehicleId: "1",
    type: "inspection",
    title: "Hauptuntersuchung TÜV",
    date: "2024-12-15T10:00:00",
    status: "scheduled",
    cost: 120,
  },
  {
    id: "3",
    vehicleId: "4",
    type: "repair",
    title: "Unfallreparatur",
    date: "2024-08-10T08:00:00",
    status: "scheduled",
    cost: 2500,
    notes: "Kotflügel und Stoßstange ersetzen",
  },
];

export const mockEvents: VehicleEvent[] = [
  {
    id: "1",
    vehicleId: "4",
    type: "accident",
    title: "Unfall gemeldet",
    description: "Auffahrunfall an Kreuzung",
    date: "2024-08-05T14:30:00",
    user: "Admin",
  },
  {
    id: "2",
    vehicleId: "3",
    type: "status_change",
    title: "Status geändert",
    description: "Fahrzeug in Werkstatt überführt",
    date: "2024-08-06T09:00:00",
    user: "Admin",
  },
];
