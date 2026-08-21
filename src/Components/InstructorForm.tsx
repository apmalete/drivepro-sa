import { useEffect, useState } from "react";

type Instructor = {
  id?: number;
  name: string;
  phone: string;
 licence: string;
  experience: string;
  status?: string;
};

type InstructorFormProps = {
  onSave: (instructor: Instructor) => Promise<void>;
  editingInstructor: Instructor | null;
};

function InstructorForm({
  onSave,
  editingInstructor,
}: InstructorFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licence, setLicence] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (editingInstructor) {
      setName(editingInstructor.name);
      setPhone(editingInstructor.phone);
      setLicence(editingInstructor.licence);
      setExperience(editingInstructor.experience);
      setStatus(editingInstructor.status || "Active");
    } else {
      setName("");
      setPhone("");
      setLicence("");
      setExperience("");
      setStatus("Active");
    }
  }, [editingInstructor]);

  async function handleSave() {
    if (!name || !phone || !licence || !experience) {
      alert("Please complete all fields.");
      return;
    }

    await onSave({
      id: editingInstructor?.id,
      name,
      phone,
      licence,
      experience,
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
        {editingInstructor
          ? "Edit Instructor"
          : "Add Instructor"}
      </h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Licence"
        value={licence}
        onChange={(e) => setLicence(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Experience"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSave}>
        💾 Save Instructor
      </button>
    </div>
  );
}

export default InstructorForm;