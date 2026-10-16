import { boolean, object, string, type InferType } from "yup";

export const collegeSchema = object({
  institutionName: string()
    .trim()
    .required("College name is required"),
  institutionCode: string()
    .trim()
    .required("College code is required"),
  email: string()
    .trim()
    .required("Email id is required")
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),
  address: string()
    .trim()
    .required("Address is required"),
  city: string()
    .trim()
    .required("City is required"),
  state: string()
    .trim()
    .required("State is required"),
  country: string()
    .trim()
    .required("Country is required"),
  postalCode: string()
    .trim()
    .required("Postal code is required"),
  website: string()
    .trim()
    .optional(),
  firstName: string()
    .trim()
    .required("First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: string()
    .trim()
    .required("Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  phone: string()
    .trim()
    .test(
      "phone-format",
      "Invalid phone number",
      (val) => !val || /^[+]?[0-9\-\s()]{7,30}$/.test(val)
    )
    .optional(),
  settings: object({
    mcqTest: boolean().default(true),
    codingTest: boolean().default(true),
    lsrwTest: boolean().default(true),
  }).default({
    mcqTest: true,
    codingTest: true,
    lsrwTest: true,
  }),
});

export type CollegeFormData = InferType<typeof collegeSchema>;
