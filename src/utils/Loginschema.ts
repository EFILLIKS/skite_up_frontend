import { object, string } from "yup";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const registerNumberRegex = /^[a-zA-Z0-9._/-]{3,35}$/;

export const Loginschema = object({
    email: string()
        .required("Email or Register Number is required")
        .trim()
        .test(
            "is-email-or-regno",
            "Please enter a valid email address or Register Number",
            (value) => {
                if (!value) return false;
                if (value.includes("@")) {
                    return emailRegex.test(value);
                }
                return registerNumberRegex.test(value);
            }
        ),

    password: string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
});
