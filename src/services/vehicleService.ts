import api from "./api";

// ==========================================
// VEHICLE INTERFACE
// ==========================================

export interface Vehicle {
  id?: number;
  registration: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  status?: string;
  school_id?: number;
}

// ==========================================
// GET ALL VEHICLES
// ==========================================

export const getVehicles = async (): Promise<
  Vehicle[]
> => {
  const response =
    await api.get<Vehicle[]>(
      "/vehicles"
    );

  return response.data;
};

// ==========================================
// ADD VEHICLE
// ==========================================

export const addVehicle = async (
  vehicle: Vehicle
) => {
  const response =
    await api.post(
      "/vehicles",
      vehicle
    );

  return response.data;
};

// ==========================================
// UPDATE VEHICLE
// ==========================================

export const updateVehicle = async (
  id: number,
  vehicle: Vehicle
) => {
  const response =
    await api.put(
      `/vehicles/${id}`,
      vehicle
    );

  return response.data;
};

// ==========================================
// DELETE VEHICLE
// ==========================================

export const deleteVehicle = async (
  id: number
) => {
  const response =
    await api.delete(
      `/vehicles/${id}`
    );

  return response.data;
};