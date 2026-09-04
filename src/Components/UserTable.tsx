import { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Chip,
  TextField,
  Box,
  InputAdornment,
  TableContainer,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

export interface User {
  id: number;
  fullname: string;
  username: string;
  role: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
}: UserTableProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.fullname
        .toLowerCase()
        .includes(value) ||
      user.username
        .toLowerCase()
        .includes(value) ||
      user.role
        .toLowerCase()
        .includes(value)
    );
  });

  return (
    <>
      {/* ======================================
          SEARCH
      ======================================= */}

      <Box
        sx={{
          mb: 2,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Search Users"
          placeholder="Search by name, username or role..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* ======================================
          TABLE
      ======================================= */}

      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{
            width: "100%",
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <Table
            sx={{
              minWidth: 700,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    minWidth: 70,
                  }}
                >
                  <b>ID</b>
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 180,
                  }}
                >
                  <b>Full Name</b>
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 150,
                  }}
                >
                  <b>Username</b>
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 140,
                  }}
                >
                  <b>Role</b>
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    minWidth: 150,
                  }}
                >
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.id}
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.fullname}
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.username}
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Chip
                        label={user.role}
                        color="primary"
                        size="small"
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        minWidth: 150,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() =>
                          onEdit(user)
                        }
                        title="Edit User"
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          onDelete(user)
                        }
                        title="Delete User"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}