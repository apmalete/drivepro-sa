import api from "./api";

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

  const schoolId = Number(user?.school_id);

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

  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const username = String(user?.username || "")
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
  const schoolId = getSchoolId();

  const response = await api.get(
    "/users",
    {
      params: {
        school_id: schoolId,
      },
    }
  );

  return response.data;
};

// =====================================================
// ADD USER
// =====================================================

export const addUser = async (
  user: any
) => {
  let schoolId: number;

  if (isSystemAdministrator()) {
    schoolId = Number(user?.school_id);
  } else {
    schoolId = getSchoolId();
  }

  if (
    !Number.isInteger(schoolId) ||
    schoolId <= 0
  ) {
    throw new Error(
      "Please select a valid school."
    );
  }

  const response = await api.post(
    "/users",
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

  if (isSystemAdministrator()) {
    schoolId = Number(user?.school_id);
  } else {
    schoolId = getSchoolId();
  }

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

  const response = await api.put(
    `/users/${id}`,
    {
      ...user,
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
  const schoolId = getSchoolId();

  const response = await api.delete(
    `/users/${id}`,
    {
      params: {
        school_id: schoolId,
      },
    }
  );

  return response.data;
};