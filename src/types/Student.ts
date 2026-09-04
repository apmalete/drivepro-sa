export interface Student {
  id?: number;

  studentNo: string;

  fullname: string;

  idNumber: string;

  gender: string;

  phone: string;

  email: string;

  address: string;

  learnerNumber: string;

  learnerCode: string;

  learnerStatus: string;

  licenceCode: string;

  licenceStatus: string;

  instructor: string;

  vehicle: string;

  courseFee: number;

  amountPaid: number;

  balance: number;

  photo: string;

  status: string;

  // School that owns this student
  school_id?: number;
}

