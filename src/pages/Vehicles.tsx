import { useEffect, useState } from "react";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import SearchBar from "../Components/SearchBar";
import VehicleForm from "../Components/VehicleForm";
import VehicleTable from "../Components/VehicleTable";

import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle as deleteVehicleService,
  type Vehicle,
} from "../services/vehicleService";

// =====================================================
// VEHICLES PAGE
// =====================================================

function Vehicles() {

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    editingVehicle,
    setEditingVehicle,
  ] =
    useState<Vehicle | null>(null);

  // ===================================================
  // LOAD VEHICLES
  // ===================================================

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {

    try {

      const data =
        await getVehicles();

      console.log(
        "VEHICLES RECEIVED:",
        data
      );

      setVehicles(
        data || []
      );

    } catch (error: any) {

      console.error(
        "ERROR LOADING VEHICLES:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );
    }
  }

  // ===================================================
  // SAVE VEHICLE
  // ===================================================

  async function saveVehicle(
    vehicle: Vehicle
  ) {

    try {

      // ===============================================
      // UPDATE
      // ===============================================

      if (vehicle.id) {

        await updateVehicle(
          vehicle.id,
          vehicle
        );

        alert(
          "Vehicle updated successfully!"
        );

      }

      // ===============================================
      // ADD
      // ===============================================

      else {

        await addVehicle(
          vehicle
        );

        alert(
          "Vehicle added successfully!"
        );
      }

      setEditingVehicle(
        null
      );

      await loadVehicles();

    } catch (error: any) {

      console.error(
        "SAVE VEHICLE ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save vehicle."
      );
    }
  }

  // ===================================================
  // EDIT VEHICLE
  // ===================================================

  function editVehicle(
    id: number
  ) {

    const vehicle =
      vehicles.find(
        (v) => v.id === id
      );

    if (!vehicle) {
      return;
    }

    setEditingVehicle(
      vehicle
    );
  }

  // ===================================================
  // DELETE VEHICLE
  // ===================================================

  async function handleDeleteVehicle(
    id: number
  ) {

    if (
      !window.confirm(
        "Delete this vehicle?"
      )
    ) {
      return;
    }

    try {

      await deleteVehicleService(
        id
      );

      if (
        editingVehicle?.id === id
      ) {
        setEditingVehicle(
          null
        );
      }

      await loadVehicles();

      alert(
        "Vehicle deleted."
      );

    } catch (error: any) {

      console.error(
        "DELETE VEHICLE ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Delete failed."
      );
    }
  }

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.registration
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        vehicle.make
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        vehicle.model
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor:
          "#f4f6f9",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >

        <Header
          title="Vehicle Management"
        />

        <div
          style={{
            padding: "20px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >

          <SearchBar
            search={search}
            setSearch={setSearch}
          />

          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >

            <VehicleForm
              onSave={
                saveVehicle
              }
              editingVehicle={
                editingVehicle
              }
            />

          </div>

          <div
            style={{
              width: "100%",
              overflowX: "auto",
              background: "#fff",
              borderRadius: "10px",
              padding: "10px",
              boxSizing: "border-box",
            }}
          >

            <VehicleTable
              vehicles={
                filteredVehicles
              }
              onEdit={
                editVehicle
              }
              onDelete={
                handleDeleteVehicle
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Vehicles;