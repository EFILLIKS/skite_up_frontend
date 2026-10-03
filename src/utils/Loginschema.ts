import { object, string } from "yup";

export const Loginschema = object({
    email: string()
        .required("Email is required")
        .email("Invalid email address"),

    password: string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
});

