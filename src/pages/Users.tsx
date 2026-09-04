import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
} from "@mui/material";

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
  const [users, setUsers] =
    useState<User[]>([]);

  const [open, setOpen] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  // ==========================================
  // LOAD USERS
  // ==========================================

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(
        "Error loading users:",
        error
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // ADD USER
  // ==========================================

  const handleAdd = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  // ==========================================
  // EDIT USER
  // ==========================================

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDelete = async (
    user: User
  ) => {
    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${user.fullname}?`
      );

    if (!confirmDelete) return;

    try {
      await deleteUser(user.id);

      alert(
        "User deleted successfully."
      );

      await loadUsers();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete user."
      );
    }
  };

  // ==========================================
  // SAVE USER
  // ==========================================

  const handleSave = async (
    user: any
  ) => {
    try {
      if (user.id) {
        await updateUser(
          user.id,
          user
        );

        alert(
          "User updated successfully."
        );
      } else {
        await addUser(user);

        alert(
          "User added successfully."
        );
      }

      setOpen(false);
      setSelectedUser(null);

      await loadUsers();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to save user."
      );
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* ====================================
            TITLE
        ===================================== */}

        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: {
              xs: "28px",
              sm: "32px",
            },
            lineHeight: 1.2,
            wordBreak: "break-word",
          }}
        >
          👥 User Management
        </Typography>

        {/* ====================================
            ADD USER
        ===================================== */}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            mb: 3,
          }}
          onClick={handleAdd}
        >
          Add User
        </Button>

        {/* ====================================
            USER TABLE
        ===================================== */}

        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>

        {/* ====================================
            USER FORM
        ===================================== */}

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
    </Box>
  );
}