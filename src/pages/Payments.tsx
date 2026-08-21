import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Typography,
} from "@mui/material";

import PaymentForm from "../Components/PaymentForm";
import PaymentTable from "../Components/PaymentTable";

import type { Payment } from "../types/Payment";
import type { Student } from "../types/Student";

import {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
} from "../services/paymentService";

import { getStudents } from "../services/studentService";

import { generatePaymentReceipt } from "../utils/pdfGenerator";

const emptyPayment: Payment = {
  receiptNo: "",
  studentId: 0,
  studentName: "",
  studentNumber: "",
  courseFee: 0,
  amountPaid: 0,
  balance: 0,
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "Cash",
  amount: 0,
  reference: "",
  notes: "",
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payment, setPayment] = useState<Payment>(emptyPayment);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadPayments();
    loadStudents();
  }, []);

  async function loadPayments() {
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadStudents() {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "studentId") {
      const student = students.find(
        (s) => s.id === Number(value)
      );

      if (student) {
        setPayment({
          ...payment,
          studentId: student.id!,
          studentName: student.fullname,
          studentNumber: student.studentNo,
          courseFee: Number(student.courseFee),
          amountPaid: Number(student.amountPaid),
          balance: Number(student.balance),
        });
      }

      return;
    }

    if (name === "amount") {
      const amount = Number(value);

      setPayment({
        ...payment,
        amount,
        balance:
          payment.courseFee -
          (payment.amountPaid + amount),
      });

      return;
    }

    setPayment({
      ...payment,
      [name]: value,
    });
  };

  const handleNew = () => {
    setPayment({
      ...emptyPayment,
      receiptNo: `REC${Date.now()}`,
      paymentDate: new Date().toISOString().split("T")[0],
    });

    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (payment.id) {
        await updatePayment(payment.id, payment);
      } else {
        await addPayment(payment);
      }

      alert("Payment saved successfully.");

      setOpen(false);
      setPayment(emptyPayment);

      await loadPayments();
    } catch (error) {
      console.error(error);
      alert("Failed to save payment.");
    }
  };

  const handleEdit = (selectedPayment: Payment) => {
    setPayment(selectedPayment);
    setOpen(true);
  };

  const handlePrint = (selectedPayment: Payment) => {
    const student =
      students.find(
        (s) => s.id === selectedPayment.studentId
      ) || null;

    generatePaymentReceipt(
      selectedPayment,
      student
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await deletePayment(id);
      await loadPayments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        💳 Payments
      </Typography>

      <Button
        variant="contained"
        onClick={handleNew}
        sx={{ mb: 2 }}
      >
        New Payment
      </Button>

      <PaymentTable
        payments={payments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
      />

      <PaymentForm
        open={open}
        payment={payment}
        students={students}
        onClose={() => setOpen(false)}
        onChange={handleChange}
        onSave={handleSave}
      />
    </Paper>
  );
}