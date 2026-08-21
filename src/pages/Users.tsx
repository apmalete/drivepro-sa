import { useEffect, useState } from "react";
import { Container, Paper, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import UserTable from "../Components/UserTable";
import UserForm from "../Components/UserForm";

import type { User } from "../Components/UserTable";

import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../services/userService";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = async (user: User) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.fullname}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(user.id);

      alert("User deleted successfully.");

      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user.");
    }
  };

  const handleSave = async (user: any) => {
    try {
      if (user.id) {
        await updateUser(user.id, user);
        alert("User updated successfully.");
      } else {
        await addUser(user);
        alert("User added successfully.");
      }

      setOpen(false);
      setSelectedUser(null);

      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to save user.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          👥 User Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 3 }}
          onClick={handleAdd}
        >
          Add User
        </Button>

        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <UserForm
          open={open}
          user={selectedUser}
          onClose={() => {
            setOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSave}
        />
      </Paper>
    </Container>
  );
}