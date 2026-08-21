import { useEffect, useState } from "react";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import SearchBar from "../Components/SearchBar";
import InstructorForm from "../Components/InstructorForm";
import InstructorTable from "../Components/InstructorTable";

import {
  getInstructors,
  addInstructor,
  updateInstructor,
  deleteInstructor,
  type Instructor,
} from "../services/instructorService";

// ======================================
// COMPONENT
// ======================================

function Instructors() {

  const [instructors, setInstructors] =
    useState<Instructor[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    editingInstructor,
    setEditingInstructor,
  ] =
    useState<Instructor | null>(null);

  // ====================================
  // LOAD INSTRUCTORS
  // ====================================

  useEffect(() => {
    loadInstructors();
  }, []);

  async function loadInstructors() {

    try {

      const data =
        await getInstructors();

      setInstructors(data);

    } catch (error) {

      console.error(
        "LOAD INSTRUCTORS ERROR:",
        error
      );

    }
  }

  // ====================================
  // SAVE INSTRUCTOR
  // ====================================

  async function saveInstructor(
    instructor: Instructor
  ) {

    try {

      // ==================================
      // UPDATE
      // ==================================

      if (instructor.id) {

        await updateInstructor(
          instructor.id,
          instructor
        );

        alert(
          "Instructor updated successfully!"
        );

      }

      // ==================================
      // ADD
      // ==================================

      else {

        await addInstructor(
          instructor
        );

        alert(
          "Instructor added successfully!"
        );
      }

      setEditingInstructor(
        null
      );

      await loadInstructors();

    } catch (error: any) {

      console.error(
        "SAVE INSTRUCTOR ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Operation failed."
      );
    }
  }

  // ====================================
  // EDIT INSTRUCTOR
  // ====================================

  function editInstructor(
    id: number
  ) {

    const instructor =
      instructors.find(
        (i) => i.id === id
      );

    if (!instructor) {
      return;
    }

    setEditingInstructor(
      instructor
    );
  }

  // ====================================
  // DELETE INSTRUCTOR
  // ====================================

  async function handleDeleteInstructor(
    id: number
  ) {

    if (
      !window.confirm(
        "Delete this instructor?"
      )
    ) {
      return;
    }

    try {

      await deleteInstructor(
        id
      );

      if (
        editingInstructor?.id === id
      ) {
        setEditingInstructor(
          null
        );
      }

      await loadInstructors();

      alert(
        "Instructor deleted."
      );

    } catch (error: any) {

      console.error(
        "DELETE INSTRUCTOR ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Delete failed."
      );
    }
  }

  // ====================================
  // SEARCH
  // ====================================

  const filteredInstructors =
    instructors.filter(
      (instructor) =>
        instructor.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        instructor.phone
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // ====================================
  // DISPLAY
  // ====================================

  return (

    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f6f9",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

        <Header
          title="Instructor Management"
        />

        <div
          style={{
            padding: "30px",
          }}
        >

          <SearchBar
            search={search}
            setSearch={setSearch}
          />

          <InstructorForm
            onSave={saveInstructor}
            editingInstructor={
              editingInstructor
            }
          />

          <InstructorTable
            instructors={
              filteredInstructors
            }
            onEdit={
              editInstructor
            }
            onDelete={
              handleDeleteInstructor
            }
          />

        </div>

      </div>

    </div>
  );
}

export default Instructors;