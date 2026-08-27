import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import api from "../services/api";

import type { Student } from "../types/Student";
import type { Payment } from "../types/Payment";
import type { Lesson } from "../services/lessonService";

// ==========================================
// SETTINGS TYPE
// ==========================================

interface SchoolSettings {
  schoolName: string;
  phone: string;
  email: string;
  address: string;
  registrationNumber: string;

  lessonDuration?: number;
  lessonPrice?: number;
}

// ==========================================
// GET SCHOOL SETTINGS
// ==========================================

const getSchoolSettings =
  async (): Promise<SchoolSettings> => {
    try {
      const response =
        await api.get<SchoolSettings>(
          "/settings"
        );

      return {
        schoolName:
          response.data.schoolName ||
          "DrivePro-SA",

        phone:
          response.data.phone || "",

        email:
          response.data.email || "",

        address:
          response.data.address || "",

        registrationNumber:
          response.data.registrationNumber ||
          "",
      };

    } catch (error) {

      console.error(
        "Could not load school settings:",
        error
      );

      // ======================================
      // FALLBACK
      // ======================================

      return {
        schoolName: "DrivePro-SA",
        phone: "",
        email: "",
        address: "",
        registrationNumber: "",
      };
    }
  };

// ==========================================
// MONEY FORMAT
// ==========================================

const money = (
  value: number | string | undefined
) => {

  const amount =
    Number(value || 0);

  return `R ${amount.toLocaleString(
    "en-ZA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

// ==========================================
// GENERATE STUDENT STATEMENT
// ==========================================

export const generateStudentStatement =
  async (
    student: Student,
    payments: Payment[],
    lessons: Lesson[]
  ) => {

    const settings =
      await getSchoolSettings();

    const doc =
      new jsPDF();

    // ======================================
    // PAGE SETTINGS
    // ======================================

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    // ======================================
    // HEADER
    // ======================================

    doc.setFontSize(22);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      settings.schoolName,
      pageWidth / 2,
      20,
      {
        align: "center",
      }
    );

    doc.setFontSize(13);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "STUDENT STATEMENT",
      pageWidth / 2,
      29,
      {
        align: "center",
      }
    );

    // School contact information

    let contactY = 36;

    if (settings.phone) {

      doc.setFontSize(8);

      doc.text(
        `Tel: ${settings.phone}`,
        pageWidth / 2,
        contactY,
        {
          align: "center",
        }
      );

      contactY += 4;
    }

    if (settings.email) {

      doc.text(
        `Email: ${settings.email}`,
        pageWidth / 2,
        contactY,
        {
          align: "center",
        }
      );

      contactY += 4;
    }

    if (settings.registrationNumber) {

      doc.text(
        `Reg No: ${settings.registrationNumber}`,
        pageWidth / 2,
        contactY,
        {
          align: "center",
        }
      );

      contactY += 4;
    }

    doc.line(
      20,
      contactY + 2,
      190,
      contactY + 2
    );

    // ======================================
    // STUDENT INFORMATION
    // ======================================

    const studentStartY =
      contactY + 14;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Student Information",
      20,
      studentStartY
    );

    doc.line(
      20,
      studentStartY + 4,
      190,
      studentStartY + 4
    );

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    const leftX = 20;
    const rightX = 110;

    doc.text(
      `Student Number: ${
        student.studentNo || ""
      }`,
      leftX,
      studentStartY + 15
    );

    doc.text(
      `Full Name: ${
        student.fullname || ""
      }`,
      leftX,
      studentStartY + 22
    );

    doc.text(
      `ID Number: ${
        student.idNumber || ""
      }`,
      leftX,
      studentStartY + 29
    );

    doc.text(
      `Phone: ${
        student.phone || ""
      }`,
      leftX,
      studentStartY + 36
    );

    doc.text(
      `Email: ${
        student.email || ""
      }`,
      leftX,
      studentStartY + 43
    );

    doc.text(
      `Licence Code: ${
        student.licenceCode || ""
      }`,
      rightX,
      studentStartY + 15
    );

    doc.text(
      `Learner Number: ${
        student.learnerNumber || ""
      }`,
      rightX,
      studentStartY + 22
    );

    doc.text(
      `Instructor: ${
        student.instructor || ""
      }`,
      rightX,
      studentStartY + 29
    );

    doc.text(
      `Vehicle: ${
        student.vehicle || ""
      }`,
      rightX,
      studentStartY + 36
    );

    doc.text(
      `Status: ${
        student.status || ""
      }`,
      rightX,
      studentStartY + 43
    );

    // ======================================
    // FINANCIAL INFORMATION
    // ======================================

    const financialY =
      studentStartY + 58;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Financial Information",
      20,
      financialY
    );

    autoTable(doc, {

      startY:
        financialY + 5,

      head: [
        [
          "Course Fee",
          "Amount Paid",
          "Outstanding Balance",
        ],
      ],

      body: [
        [
          money(student.courseFee),
          money(student.amountPaid),
          money(student.balance),
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 10,
        halign: "center",
      },

      headStyles: {
        fontStyle: "bold",
      },
    });

    // ======================================
    // PAYMENT HISTORY
    // ======================================

    const paymentStartY =
      (doc as any).lastAutoTable
        .finalY + 12;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Payment History",
      20,
      paymentStartY
    );

    autoTable(doc, {

      startY:
        paymentStartY + 5,

      head: [
        [
          "Receipt No",
          "Date",
          "Method",
          "Reference",
          "Amount",
        ],
      ],

      body:
        payments.length === 0
          ? [
              [
                "No payment history",
                "",
                "",
                "",
                "",
              ],
            ]
          : payments.map(
              (payment) => [
                payment.receiptNo || "",
                payment.paymentDate || "",
                payment.paymentMethod ||
                  "",
                payment.reference || "",
                money(payment.amount),
              ]
            ),

      theme: "grid",

      styles: {
        fontSize: 8,
      },
    });

    // ======================================
    // LESSON HISTORY
    // ======================================

    const lessonStartY =
      (doc as any).lastAutoTable
        .finalY + 12;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Lesson History",
      20,
      lessonStartY
    );

    autoTable(doc, {

      startY:
        lessonStartY + 5,

      head: [
        [
          "Date",
          "Time",
          "Instructor",
          "Vehicle",
          "Status",
        ],
      ],

      body:
        lessons.length === 0
          ? [
              [
                "No lesson history",
                "",
                "",
                "",
                "",
              ],
            ]
          : lessons.map(
              (lesson) => [
                lesson.lesson_date,
                lesson.lesson_time,
                lesson.instructor,
                lesson.vehicle,
                lesson.status,
              ]
            ),

      theme: "grid",

      styles: {
        fontSize: 8,
      },
    });

    // ======================================
    // FOOTER
    // ======================================

    doc.setFontSize(8);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      settings.schoolName,
      pageWidth / 2,
      pageHeight - 18,
      {
        align: "center",
      }
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-ZA"
      )}`,
      pageWidth / 2,
      pageHeight - 11,
      {
        align: "center",
      }
    );

    // ======================================
    // SAVE
    // ======================================

    doc.save(
      `Student-Statement-${
        student.studentNo || student.id
      }.pdf`
    );
  };

// ==========================================
// GENERATE PAYMENT RECEIPT
// ==========================================

export const generatePaymentReceipt =
  async (
    payment: Payment,
    student: Student | null = null
  ) => {

    // ======================================
    // LOAD SETTINGS
    // ======================================

    const settings =
      await getSchoolSettings();

    // ======================================
    // CREATE PDF
    // ======================================

    const doc =
      new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    // ======================================
    // HEADER
    // ======================================

    doc.setFontSize(22);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      settings.schoolName,
      pageWidth / 2,
      20,
      {
        align: "center",
      }
    );

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "PAYMENT RECEIPT",
      pageWidth / 2,
      29,
      {
        align: "center",
      }
    );

    // ======================================
    // CONTACT DETAILS
    // ======================================

    let contactY = 36;

    doc.setFontSize(8);

    doc.setFont(
      "helvetica",
      "normal"
    );

    if (settings.phone) {

      doc.text(
        `Tel: ${settings.phone}`,
        pageWidth / 2,
        contactY,
        {
          align: "center",
        }
      );

      contactY += 4;
    }

    if (settings.email) {

      doc.text(
        `Email: ${settings.email}`,
        pageWidth / 2,
        contactY,
        {
          align: "center",
        }
      );

      contactY += 4;
    }

    if (settings.address) {

      doc.text(
        settings.address,
        pageWidth / 2,
        contactY,
        {
          align: "center",
          maxWidth: 160,
        }
      );

      contactY += 5;
    }

    if (settings.registrationNumber) {

      doc.text(
        `Reg No: ${settings.registrationNumber}`,
        pageWidth / 2,
        contactY,
        {
          align: "center",
        }
      );

      contactY += 4;
    }

    doc.line(
      20,
      contactY + 3,
      190,
      contactY + 3
    );

    // ======================================
    // RECEIPT INFORMATION
    // ======================================

    const receiptY =
      contactY + 16;

    doc.setFontSize(11);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Receipt Number:",
      20,
      receiptY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      payment.receiptNo || "",
      70,
      receiptY
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Payment Date:",
      120,
      receiptY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      payment.paymentDate || "",
      160,
      receiptY
    );

    // ======================================
    // STUDENT INFORMATION
    // ======================================

    const studentY =
      receiptY + 20;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Student Information",
      20,
      studentY
    );

    doc.line(
      20,
      studentY + 4,
      190,
      studentY + 4
    );

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    const studentName =
      student?.fullname ||
      payment.studentName ||
      "";

    const studentNumber =
      student?.studentNo ||
      payment.studentNumber ||
      "";

    const studentPhone =
      student?.phone || "";

    doc.text(
      `Student Name: ${studentName}`,
      20,
      studentY + 15
    );

    doc.text(
      `Student Number: ${studentNumber}`,
      20,
      studentY + 22
    );

    doc.text(
      `Phone: ${studentPhone}`,
      20,
      studentY + 29
    );

    // ======================================
    // PAYMENT DETAILS
    // ======================================

    const paymentY =
      studentY + 43;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Payment Details",
      20,
      paymentY
    );

    autoTable(doc, {

      startY:
        paymentY + 6,

      head: [
        [
          "Payment Method",
          "Reference",
          "Amount Paid",
        ],
      ],

      body: [
        [
          payment.paymentMethod || "",
          payment.reference || "",
          money(payment.amount),
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
      },

      headStyles: {
        fontStyle: "bold",
      },
    });

    // ======================================
    // FINANCIAL SUMMARY
    // ======================================

    const financialY =
      (doc as any).lastAutoTable
        .finalY + 15;

    doc.setFontSize(14);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Account Summary",
      20,
      financialY
    );

    const courseFee =
      Number(
        student?.courseFee ??
          payment.courseFee ??
          0
      );

    const amountAlreadyPaid =
      Number(
        student?.amountPaid ??
          payment.amountPaid ??
          0
      );

    const currentPayment =
      Number(
        payment.amount || 0
      );

    // ======================================
    // CALCULATE BALANCE
    // ======================================

    const balance =
      student
        ? Number(
            student.balance || 0
          )
        : Math.max(
            0,
            courseFee -
              amountAlreadyPaid -
              currentPayment
          );

    autoTable(doc, {

      startY:
        financialY + 6,

      head: [
        [
          "Course Fee",
          "Amount Paid",
          "Current Payment",
          "Balance",
        ],
      ],

      body: [
        [
          money(courseFee),
          money(amountAlreadyPaid),
          money(currentPayment),
          money(balance),
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
      },

      headStyles: {
        fontStyle: "bold",
      },
    });

    // ======================================
    // NOTES
    // ======================================

    const notesY =
      (doc as any).lastAutoTable
        .finalY + 15;

    doc.setFontSize(12);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Notes",
      20,
      notesY
    );

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    const notes =
      payment.notes ||
      "No notes";

    doc.text(
      notes,
      20,
      notesY + 8,
      {
        maxWidth: 170,
      }
    );

    // ======================================
    // PAYMENT CONFIRMATION
    // ======================================

    const confirmationY =
      notesY + 28;

    doc.setFontSize(12);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Payment Status",
      20,
      confirmationY
    );

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Payment received successfully.",
      20,
      confirmationY + 8
    );

    // ======================================
    // FOOTER
    // ======================================

    doc.setFontSize(9);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Thank you for your payment.",
      pageWidth / 2,
      pageHeight - 25,
      {
        align: "center",
      }
    );

    doc.text(
      settings.schoolName,
      pageWidth / 2,
      pageHeight - 17,
      {
        align: "center",
      }
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-ZA"
      )}`,
      pageWidth / 2,
      pageHeight - 10,
      {
        align: "center",
      }
    );

    // ======================================
    // SAVE PDF
    // ======================================

    doc.save(
      `Payment-Receipt-${
        payment.receiptNo ||
        payment.id ||
        "Receipt"
      }.pdf`
    );
  };