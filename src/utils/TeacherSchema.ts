import { object, string, type InferType } from "yup";

export const teacherSchema = object({
  firstName: string()
    .trim()
    .required("First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: string()
    .trim()
    .required("Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  email: string()
    .trim()
    .required("Email address is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  phoneNumber: string()
    .trim()
    .test(
      "phone-format",
      "Invalid phone number format",
      (val) => !val || /^[+]?[0-9\-\s()]{7,30}$/.test(val)
    )
    .optional(),
  department: string()
    .trim()
    .required("Department is required")
    .max(100, "Department must not exceed 100 characters"),
  subject: string()
    .trim()
    .required("Subject is required")
    .max(100, "Subject must not exceed 100 characters"),
  status: string()
    .trim()
    .default("Active")
    .optional(),
});

export const teacherPatchSchema = object({
  firstName: string().trim().optional(),
  lastName: string().trim().optional(),
  email: string().trim().email("Please enter a valid email address").optional(),
  phoneNumber: string()
    .trim()
    .test(
      "phone-format",
      "Invalid phone number format",
      (val) => !val || /^[+]?[0-9\-\s()]{7,30}$/.test(val)
    )
    .optional(),
  department: string().trim().optional(),
  subject: string().trim().optional(),
  status: string().trim().optional(),
});

export type TeacherValidationData = InferType<typeof teacherSchema>;
export type TeacherPatchValidationData = InferType<typeof teacherPatchSchema>;
