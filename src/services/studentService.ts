import api from "./api";

// ==========================================
// STUDENT TYPE
// ==========================================

export interface Student {
  id?: number;
  studentNo: string;
  fullname: string;
  idNumber: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  learnerNumber: string;
  licenceCode: string;
  instructor: string;
  vehicle: string;
  courseFee: number;
  amountPaid: number;
  balance: number;
  photo?: string;
  status: string;
  school_id?: number;
}

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