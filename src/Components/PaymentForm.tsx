import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

import type { Payment } from "../types/Payment";
import type { Student } from "../types/Student";

interface Props {
  open: boolean;
  payment: Payment;
  students: Student[];
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void;
}

export default function PaymentForm({
  open,
  payment,
  students,
  onClose,
  onChange,
  onSave,
}: Props) {
  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>Student Payment</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Receipt Number"
              name="receiptNo"
              value={payment.receiptNo}
              onChange={onChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Payment Date"
              name="paymentDate"
              value={payment.paymentDate}
              onChange={onChange}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              select
              fullWidth
              label="Select Student"
              name="studentId"
              value={payment.studentId}
              onChange={onChange}
            >
              {students.map((student) => (
                <MenuItem
                  key={student.id}
                  value={student.id}
                >
                  {student.studentNo} - {student.fullname}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Student Number"
              value={payment.studentNumber}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Course Fee"
              value={payment.courseFee}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Amount Paid"
              value={payment.amountPaid}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Balance"
              value={payment.balance}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Payment Amount"
              name="amount"
              value={payment.amount}
              onChange={onChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              name="paymentMethod"
              value={payment.paymentMethod}
              onChange={onChange}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="EFT">EFT</MenuItem>
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Reference"
              name="reference"
              value={payment.reference}
              onChange={onChange}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              name="notes"
              value={payment.notes}
              onChange={onChange}
            />
          </Grid>
                  </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSave}
        >
          Save Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}