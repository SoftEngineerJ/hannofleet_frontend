export type VehicleStatus = 
  | 'verfügbar' 
  | 'in_benutzung' 
  | 'werkstatt' 
  | 'unfall' 
  | 'inaktiv' 
  | 'ersatzfahrzeug';

export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  status: VehicleStatus;
  tourNumber?: string;
  driver?: string;
  lastInspection?: string;
  nextInspection?: string;
  nextOilChange?: string;
  location?: string;
  notes?: string;
}

export interface Tour {
  id: string;
  name: string;
  vehicleId: string;
  driver: string;
  schedule: string;
  status: 'active' | 'inactive';
}

export interface Appointment {
  id: string;
  vehicleId: string;
  type: 'inspection' | 'oil_change' | 'tire_change' | 'maintenance' | 'repair';
  title: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  cost?: number;
  notes?: string;
}

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  type: 'status_change' | 'appointment' | 'accident' | 'maintenance';
  title: string;
  description: string;
  date: string;
  user: string;
}
