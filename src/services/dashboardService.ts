import axios from "axios";

// =====================================================
// API
// =====================================================

const API =
  "http://localhost:5000";


// =====================================================
// AUTHENTICATION CONFIG
// =====================================================

const getAuthConfig = () => {

  const token =
    localStorage.getItem("token");

  if (!token) {

    throw new Error(
      "Authentication token not found. Please login again."
    );
  }

  return {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };
};


// =====================================================
// GET SCHOOL ID
// =====================================================

const getSchoolId = (): number => {

  try {

    const userData =
      localStorage.getItem("user");

    if (!userData) {
      return 1;
    }

    const user =
      JSON.parse(userData);

    return Number(
      user?.school_id || 1
    );

  } catch (error) {

    console.error(
      "ERROR READING SCHOOL ID:",
      error
    );

    return 1;
  }
};


// =====================================================
// GET DASHBOARD
// =====================================================

export const getDashboard =
  async () => {

    const schoolId =
      getSchoolId();

    const config =
      getAuthConfig();

    const response =
      await axios.get(
        `${API}/dashboard`,
        {
          ...config,

          params: {
            school_id:
              schoolId,
          },
        }
      );

    return response.data;
  };


// =====================================================
// GET TODAY'S LESSONS
// =====================================================

export const getTodaysLessons =
  async () => {

    const schoolId =
      getSchoolId();

    const config =
      getAuthConfig();

    const response =
      await axios.get(
        `${API}/dashboard/today-lessons`,
        {
          ...config,

          params: {
            school_id:
              schoolId,
          },
        }
      );

    return response.data;
  };


// =====================================================
// GET DASHBOARD ALERTS
// =====================================================

export const getDashboardAlerts =
  async () => {

    const schoolId =
      getSchoolId();

    const config =
      getAuthConfig();

    const response =
      await axios.get(
        `${API}/dashboard/alerts`,
        {
          ...config,

          params: {
            school_id:
              schoolId,
          },
        }
      );

    return response.data;
  };