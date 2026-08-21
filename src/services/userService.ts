import axios from "axios";

// =====================================================
// API
// =====================================================

const API = "http://localhost:5000/users";

// =====================================================
// GET LOGGED-IN USER
// =====================================================

const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("user");

    if (!userData) {
      return null;
    }

    return JSON.parse(userData);

  } catch (error) {

    console.error(
      "ERROR READING LOGGED-IN USER:",
      error
    );

    return null;
  }
};

// =====================================================
// GET CURRENT SCHOOL ID
// =====================================================

const getSchoolId = (): number => {

  const user = getCurrentUser();

  const schoolId =
    Number(user?.school_id);

  if (
    Number.isInteger(schoolId) &&
    schoolId > 0
  ) {
    return schoolId;
  }

  return 1;
};

// =====================================================
// CHECK SYSTEM ADMINISTRATOR
// =====================================================

const isSystemAdministrator = (): boolean => {

  const user = getCurrentUser();

  const role =
    String(user?.role || "")
      .trim()
      .toLowerCase();

  const username =
    String(user?.username || "")
      .trim()
      .toLowerCase();

  return (
    role === "system administrator" ||
    username === "admin"
  );
};

// =====================================================
// GET USERS
// =====================================================

export const getUsers = async () => {

  const schoolId =
    getSchoolId();

  const response =
    await axios.get(API, {
      params: {
        school_id: schoolId,
      },
    });

  return response.data;
};

// =====================================================
// ADD USER
// =====================================================

export const addUser = async (
  user: any
) => {

  let schoolId: number;

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // Can create a user for ANY school
  // ===================================================

  if (isSystemAdministrator()) {

    schoolId =
      Number(user?.school_id);

  } else {

    // =================================================
    // NORMAL SCHOOL USER
    // Must use their own school
    // =================================================

    schoolId =
      getSchoolId();
  }

  // ===================================================
  // VALIDATE SCHOOL
  // ===================================================

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0
  ) {

    throw new Error(
      "Please select a valid school."
    );
  }

  // ===================================================
  // SEND USER
  // ===================================================

  const response =
    await axios.post(
      API,
      {
        ...user,
        school_id: schoolId,
      }
    );

  return response.data;
};

// =====================================================
// UPDATE USER
// =====================================================

export const updateUser = async (
  id: number,
  user: any
) => {

  let schoolId: number;

  // ===================================================
  // SYSTEM ADMINISTRATOR
  // Can move users between schools
  // ===================================================

  if (isSystemAdministrator()) {

    schoolId =
      Number(user?.school_id);

  } else {

    // =================================================
    // NORMAL SCHOOL USER
    // Cannot move user to another school
    // =================================================

    schoolId =
      getSchoolId();
  }

  // ===================================================
  // VALIDATE SCHOOL
  // ===================================================

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0
  ) {

    throw new Error(
      "Please select a valid school."
    );
  }

  console.log(
    "UPDATE USER:",
    {
      id,
      fullname: user?.fullname,
      username: user?.username,
      role: user?.role,
      school_id: schoolId,
      systemAdministrator:
        isSystemAdministrator(),
    }
  );

  // ===================================================
  // SEND UPDATE
  // ===================================================

  const response =
    await axios.put(
      `${API}/${id}`,
      {
        ...user,

        // IMPORTANT:
        // Selected school is preserved for
        // System Administrator.
        school_id: schoolId,
      }
    );

  return response.data;
};

// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = async (
  id: number
) => {

  const schoolId =
    getSchoolId();

  const response =
    await axios.delete(
      `${API}/${id}`,
      {
        params: {
          school_id: schoolId,
        },
      }
    );

  return response.data;
};