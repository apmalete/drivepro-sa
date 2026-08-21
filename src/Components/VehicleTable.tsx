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

type VehicleTableProps = {
  vehicles: Vehicle[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
}: VehicleTableProps) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <thead
        style={{
          background: "#1E3A8A",
          color: "white",
        }}
      >
        <tr>
          <th style={{ padding: "12px" }}>ID</th>
          <th>Registration</th>
          <th>Make</th>
          <th>Model</th>
          <th>Year</th>
          <th>Transmission</th>
          <th>Fuel</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {vehicles.length === 0 ? (
          <tr>
            <td
              colSpan={9}
              style={{
                textAlign: "center",
                padding: "20px",
              }}
            >
              No vehicles found.
            </td>
          </tr>
        ) : (
          vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.id}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.registration}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.make}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.model}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.year}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.transmission}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.fuel}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {vehicle.status ?? "Available"}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                <button
                  onClick={() => {
                    if (vehicle.id !== undefined) {
                      onEdit(vehicle.id);
                    }
                  }}
                  style={{
                    background: "green",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    marginRight: "8px",
                    cursor: "pointer",
                  }}
                >
                  ✏ Edit
                </button>

                <button
                  onClick={() => {
                    if (vehicle.id !== undefined) {
                      onDelete(vehicle.id);
                    }
                  }}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default VehicleTable;