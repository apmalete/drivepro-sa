import { useEffect, useState } from "react";

type Vehicle = {
  id?: number;
  registration: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  status?: string;
};

type VehicleFormProps = {
  onSave: (vehicle: Vehicle) => Promise<void>;
  editingVehicle: Vehicle | null;
};

function VehicleForm({
  onSave,
  editingVehicle,
}: VehicleFormProps) {
  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [transmission, setTransmission] = useState("Manual");
  const [fuel, setFuel] = useState("Petrol");
  const [status, setStatus] = useState("Available");

  useEffect(() => {
    if (editingVehicle) {
      setRegistration(editingVehicle.registration);
      setMake(editingVehicle.make);
      setModel(editingVehicle.model);
      setYear(editingVehicle.year.toString());
      setTransmission(editingVehicle.transmission);
      setFuel(editingVehicle.fuel);
      setStatus(editingVehicle.status || "Available");
    } else {
      setRegistration("");
      setMake("");
      setModel("");
      setYear("");
      setTransmission("Manual");
      setFuel("Petrol");
      setStatus("Available");
    }
  }, [editingVehicle]);

  async function handleSave() {
    if (!registration || !make || !model || !year) {
      alert("Please complete all fields.");
      return;
    }

    await onSave({
      id: editingVehicle?.id,
      registration,
      make,
      model,
      year: Number(year),
      transmission,
      fuel,
      status,
    });
  }

  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      <h2>
        {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
      </h2>

      <input
        placeholder="Registration Number"
        value={registration}
        onChange={(e) => setRegistration(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Make"
        value={make}
        onChange={(e) => setMake(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <br /><br />

      <label>Transmission</label>
      <br />

      <select
        value={transmission}
        onChange={(e) => setTransmission(e.target.value)}
      >
        <option>Manual</option>
        <option>Automatic</option>
      </select>

      <br /><br />

      <label>Fuel</label>
      <br />

      <select
        value={fuel}
        onChange={(e) => setFuel(e.target.value)}
      >
        <option>Petrol</option>
        <option>Diesel</option>
      </select>

      <br /><br />

      <label>Status</label>
      <br />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>Available</option>
        <option>Maintenance</option>
        <option>Out of Service</option>
      </select>

      <br /><br />

      <button onClick={handleSave}>
        💾 Save Vehicle
      </button>
    </div>
  );
}

export default VehicleForm;