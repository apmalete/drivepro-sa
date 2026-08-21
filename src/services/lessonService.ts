import axios from "axios";

const API = "http://localhost:5000/lessons";

// =====================================================
// LESSON INTERFACE
// =====================================================

export interface Lesson {
  id?: number;
  student: string;
  instructor: string;
  vehicle: string;
  lesson_date: string;
  lesson_time: string;
  status: string;
  school_id?: number;
}

// =====================================================
// GET LOGGED-IN USER SCHOOL
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
      "ERROR READING USER SCHOOL:",
      error
    );

    return 1;
  }
};

// =====================================================
// GET ALL LESSONS
// =====================================================

export const getLessons = async (): Promise<Lesson[]> => {

  const schoolId =
    getSchoolId();

  const response =
    await axios.get<Lesson[]>(API, {
      params: {
        school_id: schoolId,
      },
    });

  return response.data;
};

// =====================================================
// GET LESSONS FOR ONE STUDENT
// =====================================================

export const getStudentLessons = async (
  studentName: string
): Promise<Lesson[]> => {

  const schoolId =
    getSchoolId();

  const response =
    await axios.get<Lesson[]>(
      `${API}/student/${encodeURIComponent(studentName)}`,
      {
        params: {
          school_id: schoolId,
        },
      }
    );

  return response.data;
};

// =====================================================
// ADD LESSON
// =====================================================

export const addLesson = async (
  lesson: Lesson
): Promise<{
  success: boolean;
  id: number;
}> => {

  const schoolId =
    getSchoolId();

  const response =
    await axios.post(
      API,
      {
        ...lesson,
        school_id: schoolId,
      }
    );

  return response.data;
};

// =====================================================
// UPDATE LESSON
// =====================================================

export const updateLesson = async (
  id: number,
  lesson: Lesson
): Promise<{
  success: boolean;
}> => {

  const schoolId =
    getSchoolId();

  const response =
    await axios.put(
      `${API}/${id}`,
      {
        ...lesson,
        school_id: schoolId,
      }
    );

  return response.data;
};

// =====================================================
// DELETE LESSON
// =====================================================

export const deleteLesson = async (
  id: number
): Promise<{
  success: boolean;
}> => {

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