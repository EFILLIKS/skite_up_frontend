import { object, string, type InferType } from "yup";

export const profileSchema = object({
  firstName: string()
    .trim()
    .required("First name cannot be blank")
    .max(100, "First name must not exceed 100 characters"),
  lastName: string()
    .trim()
    .max(100, "Last name must not exceed 100 characters")
    .optional(),
  phone: string()
    .trim()
    .test(
      "phone-pattern",
      "Invalid phone number",
      (val) => !val || /^[+]?[0-9\-\s()]{7,30}$/.test(val)
    )
    .optional(),
  email: string()
    .trim()
    .email("Invalid email")
    .max(255, "Email must not exceed 255 characters")
    .optional(),
  password: string()
    .trim()
    .test(
      "password-length",
      "Password must be between 8 and 100 characters",
      (val) => !val || (val.length >= 8 && val.length <= 100)
    )
    .optional(),
  profilePicture: string()
    .trim()
    .max(30, "Profile picture must not exceed 30 characters")
    .optional(),
  state: string().optional(),
  district: string().optional(),
});

export type ProfileFormData = InferType<typeof profileSchema>;
