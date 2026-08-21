export interface Payment {
  id?: number;

  receiptNo: string;

  studentId: number;
  studentName: string;
  studentNumber: string;

  courseFee: number;
  amountPaid: number;
  balance: number;

  paymentDate: string;
  paymentMethod: string;
  amount: number;

  reference: string;
  notes: string;
}