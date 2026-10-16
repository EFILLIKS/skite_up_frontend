import { object, string, array, type InferType } from "yup";
import type { InstitutionType, StudentManualRow } from "../types/Student.types";

export const createEmptyStudentRow = (
  institutionType: InstitutionType = "College"
): StudentManualRow => ({
  registerNumber: "",
  studentName: "",
  degree: institutionType === "College" ? "B.E" : "",
  batch: "2026",
  department: "",
  section: institutionType === "College" ? "A" : "",
  email: "",
  phoneNumber: "",
  institutionType,
});

export const studentRowSchema = object({
  id: string().optional(),
  registerNumber: string()
    .trim()
    .required("Register number is required")
    .max(100, "Register number must not exceed 100 characters"),
  studentName: string()
    .trim()
    .required("Student name is required")
    .max(100, "Student name must not exceed 100 characters"),
  degree: string()
    .trim()
    .max(50, "Degree must not exceed 50 characters")
    .optional()
    .default(""),
  batch: string()
    .trim()
    .required("Batch is required")
    .max(50, "Batch must not exceed 50 characters")
    .default("2026"),
  department: string()
    .trim()
    .required("Department is required")
    .max(100, "Department must not exceed 100 characters"),
  section: string()
    .trim()
    .max(50, "Section must not exceed 50 characters")
    .optional()
    .default(""),
  email: string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  phoneNumber: string()
    .trim()
    .required("Phone number is required")
    .test(
      "phone-format",
      "Please enter a valid phone number (min 10 digits)",
      (val) => !val || /^[+]?[0-9]{10,15}$/.test(val.replace(/[\s\-()]/g, ""))
    )
    .max(30, "Phone number must not exceed 30 characters"),
  institutionType: string().optional(),
});

export const studentTableSchema = object({
  students: array()
    .of(studentRowSchema)
    .min(1, "At least one student row is required")
    .required("At least one student row is required"),
});

export type StudentRowData = InferType<typeof studentRowSchema>;
export type StudentTableFormData = InferType<typeof studentTableSchema>;
