import api from "./api";
import type { Student } from "../types/Student";

// ==========================================
// GET ALL STUDENTS
// ==========================================

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>(
    "/students"
  );

  return response.data;
};

// ==========================================
// ADD STUDENT
// ==========================================

export const addStudent = async (
  student: Student
) => {
  const response = await api.post(
    "/students",
    student
  );

  return response.data;
};

// ==========================================
// UPDATE STUDENT
// ==========================================

export const updateStudent = async (
  id: number,
  student: Student
) => {
  const response = await api.put(
    `/students/${id}`,
    student
  );

  return response.data;
};

// ==========================================
// DELETE STUDENT
// ==========================================

export const deleteStudent = async (
  id: number,
  schoolId?: number
) => {
  const url = schoolId
    ? `/students/${id}?school_id=${schoolId}`
    : `/students/${id}`;

  const response = await api.delete(
    url
  );

  return response.data;
};