import api from "./api";

// ==========================================
// INSTRUCTOR INTERFACE
// ==========================================

export interface Instructor {
  id?: number;
  name: string;
  phone: string;
  licence: string;
  experience: string;
  status?: string;
  school_id?: number;
}

// ==========================================
// GET ALL INSTRUCTORS
// ==========================================

export const getInstructors = async (): Promise<
  Instructor[]
> => {
  const response =
    await api.get<Instructor[]>(
      "/instructors"
    );

  return response.data;
};

// ==========================================
// ADD INSTRUCTOR
// ==========================================

export const addInstructor = async (
  instructor: Instructor
) => {
  const response =
    await api.post(
      "/instructors",
      instructor
    );

  return response.data;
};

// ==========================================
// UPDATE INSTRUCTOR
// ==========================================

export const updateInstructor = async (
  id: number,
  instructor: Instructor
) => {
  const response =
    await api.put(
      `/instructors/${id}`,
      instructor
    );

  return response.data;
};

// ==========================================
// DELETE INSTRUCTOR
// ==========================================

export const deleteInstructor = async (
  id: number
) => {
  const response =
    await api.delete(
      `/instructors/${id}`
    );

  return response.data;
};