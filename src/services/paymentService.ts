import axios from "axios";
import type { Payment } from "../types/Payment";

const API = "http://localhost:5000/payments";

// =====================================================
// GET LOGGED-IN USER SCHOOL
// =====================================================

const getSchoolId = (): number => {
  try {
    const userData = localStorage.getItem("user");

    if (!userData) {
      return 1;
    }

    const user = JSON.parse(userData);

    return Number(user?.school_id || 1);

  } catch (error) {
    console.error(
      "ERROR READING USER SCHOOL:",
      error
    );

    return 1;
  }
};

// =====================================================
// GET ALL PAYMENTS
// =====================================================

export const getPayments = async (): Promise<Payment[]> => {

  const schoolId = getSchoolId();

  const response = await axios.get<Payment[]>(
    API,
    {
      params: {
        school_id: schoolId,
      },
    }
  );

  return response.data;
};

// =====================================================
// GET PAYMENTS FOR ONE STUDENT
// =====================================================

export const getStudentPayments = async (
  studentId: number
): Promise<Payment[]> => {

  const schoolId = getSchoolId();

  const response = await axios.get<Payment[]>(
    `${API}/student/${studentId}`,
    {
      params: {
        school_id: schoolId,
      },
    }
  );

  return response.data;
};

// =====================================================
// ADD PAYMENT
// =====================================================

export const addPayment = async (
  payment: Payment
): Promise<{
  success: boolean;
  id: number;
}> => {

  const schoolId = getSchoolId();

  const response = await axios.post(
    API,
    {
      ...payment,
      school_id: schoolId,
    }
  );

  return response.data;
};

// =====================================================
// UPDATE PAYMENT
// =====================================================

export const updatePayment = async (
  id: number,
  payment: Payment
): Promise<{
  success: boolean;
}> => {

  const schoolId = getSchoolId();

  const response = await axios.put(
    `${API}/${id}`,
    {
      ...payment,
      school_id: schoolId,
    }
  );

  return response.data;
};

// =====================================================
// DELETE PAYMENT
// =====================================================

export const deletePayment = async (
  id: number
): Promise<{
  success: boolean;
}> => {

  const schoolId = getSchoolId();

  const response = await axios.delete(
    `${API}/${id}`,
    {
      params: {
        school_id: schoolId,
      },
    }
  );

  return response.data;
};