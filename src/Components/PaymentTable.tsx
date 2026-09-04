import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  TableContainer,
} from "@mui/material";

import type { Payment } from "../types/Payment";

interface Props {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (id: number) => void;
  onPrint: (payment: Payment) => void;
}

export default function PaymentTable({
  payments,
  onEdit,
  onDelete,
  onPrint,
}: Props) {
  return (
    <Paper
      sx={{
        mt: 2,
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
            minWidth: 850,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Receipt No</strong>
              </TableCell>

              <TableCell>
                <strong>Student</strong>
              </TableCell>

              <TableCell>
                <strong>Date</strong>
              </TableCell>

              <TableCell>
                <strong>Method</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Amount</strong>
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  minWidth: 260,
                }}
              >
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.receiptNo}
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 180,
                    whiteSpace: "nowrap",
                  }}
                >
                  {payment.studentName}
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {payment.paymentDate}
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {payment.paymentMethod}
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                >
                  R {Number(payment.amount).toFixed(2)}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    minWidth: 260,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() =>
                      onEdit(payment)
                    }
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    onClick={() =>
                      onPrint(payment)
                    }
                    sx={{ mr: 1 }}
                  >
                    🖨️ Print
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={() =>
                      payment.id &&
                      onDelete(payment.id)
                    }
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}