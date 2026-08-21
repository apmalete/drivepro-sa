type Instructor = {
  id?: number;
  name: string;
  phone: string;
  licence: string;
  experience: string;
  status?: string;
};

type InstructorTableProps = {
  instructors: Instructor[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

function InstructorTable({
  instructors,
  onEdit,
  onDelete,
}: InstructorTableProps) {
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
          <th>Name</th>
          <th>Phone</th>
          <th>Licence</th>
          <th>Experience</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {instructors.length === 0 ? (
          <tr>
            <td
              colSpan={7}
              style={{
                textAlign: "center",
                padding: "20px",
              }}
            >
              No instructors found.
            </td>
          </tr>
        ) : (
          instructors.map((instructor) => (
            <tr key={instructor.id}>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {instructor.id}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {instructor.name}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {instructor.phone}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {instructor.licence}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {instructor.experience}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {instructor.status ?? "Active"}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                <button
                  onClick={() =>
                    instructor.id && onEdit(instructor.id)
                  }
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
                  onClick={() =>
                    instructor.id && onDelete(instructor.id)
                  }
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

export default InstructorTable;