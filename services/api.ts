import { Vehicle, VehicleStatus } from "@/types/vehicle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const VEHICLES_API = `${API_BASE}/api/vehicles`;
const HISTORY_API = `${API_BASE}/api/vehicle-history`;
const AUTH_API = `${API_BASE}/api/auth`;

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "USER";
  token?: string;
}

export interface VehicleHistory {
  id: number;
  vehicleId: number;
  historyType: string;
  oldValue?: string;
  newValue?: string;
  changeDate: string;
  note?: string;
}

export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await fetch(VEHICLES_API, { headers: getAuthHeader() });
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    return response.json();
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await fetch(`${VEHICLES_API}/${id}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Vehicle not found");
    return response.json();
  },

  getByStatus: async (status: VehicleStatus): Promise<Vehicle[]> => {
    const response = await fetch(`${VEHICLES_API}/status/${status}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    return response.json();
  },

  create: async (vehicle: Omit<Vehicle, "id">): Promise<Vehicle> => {
    const response = await fetch(VEHICLES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(vehicle),
    });
    const text = await response.text();
    if (!response.ok) {
      try {
        const data = text ? JSON.parse(text) : null;
        const message = data?.error;
        throw new Error(message || "Fahrzeug konnte nicht erstellt werden");
      } catch (e) {
        if (e instanceof Error && e.message !== "[object Object]") {
          throw e;
        }
        throw new Error("Fahrzeug konnte nicht erstellt werden");
      }
    }
    try {
      return text ? JSON.parse(text) : { ...vehicle, id: Date.now() };
    } catch {
      return { ...vehicle, id: Date.now() };
    }
  },

  update: async (id: string, vehicle: Vehicle): Promise<Vehicle> => {
    const response = await fetch(`${VEHICLES_API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) throw new Error("Failed to update vehicle");
    return response.json();
  },

  updateStatus: async (
    id: string,
    status: VehicleStatus,
    tourNumber?: string,
  ): Promise<Vehicle> => {
    const url = tourNumber
      ? `${VEHICLES_API}/${id}/status?status=${status}&tourNumber=${encodeURIComponent(tourNumber)}`
      : `${VEHICLES_API}/${id}/status?status=${status}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${VEHICLES_API}/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete vehicle");
  },

  createBatch: async (vehicles: Omit<Vehicle, "id">[]): Promise<Vehicle[]> => {
    const response = await fetch(`${VEHICLES_API}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(vehicles),
    });
    const text = await response.text();
    if (!response.ok) {
      try {
        const data = text ? JSON.parse(text) : null;
        const message = data?.error;
        throw new Error(message || "Fehler beim Erstellen der Fahrzeuge");
      } catch (e) {
        if (e instanceof Error && e.message !== "[object Object]") {
          throw e;
        }
        throw new Error("Fehler beim Erstellen der Fahrzeuge");
      }
    }
    return text ? JSON.parse(text) : [];
  },
};

export const historyApi = {
  getAll: async (): Promise<VehicleHistory[]> => {
    const response = await fetch(HISTORY_API, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  },

  getByVehicle: async (vehicleId: number): Promise<VehicleHistory[]> => {
    const response = await fetch(`${HISTORY_API}/vehicle/${vehicleId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch vehicle history");
    return response.json();
  },

  create: async (
    history: Omit<VehicleHistory, "id">,
  ): Promise<VehicleHistory> => {
    const response = await fetch(HISTORY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(history),
    });
    if (!response.ok) throw new Error("Failed to create history");
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${HISTORY_API}/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete history");
  },
};

export const authApi = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Login fehlgeschlagen");
    }
    return response.json();
  },

  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${AUTH_API}/users`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  createUser: async (
    username: string,
    password: string,
    role: "ADMIN" | "USER",
  ): Promise<User> => {
    const response = await fetch(`${AUTH_API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ username, password, role }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Benutzer konnte nicht erstellt werden");
    }
    return response.json();
  },

  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${AUTH_API}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Benutzer konnte nicht gelöscht werden");
    }
  },

  changePassword: async (
    username: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    const response = await fetch(`${AUTH_API}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Passwort konnte nicht geändert werden");
    }
  },

  changeUsername: async (
    currentUsername: string,
    newUsername: string,
    password: string,
  ): Promise<string> => {
    const response = await fetch(`${AUTH_API}/username`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ currentUsername, newUsername, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.error || "Benutzername konnte nicht geändert werden",
      );
    }
    const data = await response.json();
    return data.username;
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${AUTH_API}/logout`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      throw new Error("Logout fehlgeschlagen");
    }
  },
};
