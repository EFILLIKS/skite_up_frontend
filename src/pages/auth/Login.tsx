
import { useState } from "react";
import {
    Box,
    Divider,
    IconButton,
    InputAdornment,
    Link,
    Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import logo from "../../assets/skitup-logo.svg";
import type { LoginFormData } from "../../types/login.type";
import { Loginschema } from "../../utils/Loginschema";
import { useLoginMutation } from "../../features/authservice/AuthApi";
import Snackbar from "../../components/common/Snackbar";
import type { SnackbarState } from "../../types/Snackbar.types";

const Login = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });
    const [login, { isLoading }] = useLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: yupResolver(Loginschema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await login(data).unwrap();
            if ((response as { statusCode?: number })?.statusCode === 200) {
                setSnackbar({
                    open: true,
                    message: response.message as string,
                    severity: "success",
                });

                navigate("/dashboard");

            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Login failed please try again.",
                severity: "error",
            });
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "#eef2f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 3,
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{
                    backgroundColor: "#fff",
                    borderRadius: 3,
                    boxShadow:
                        "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                    px: { xs: 3, sm: 5 },
                    pt: 5,
                    pb: 4,
                    width: "100%",
                    maxWidth: 380,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 3.5,
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="Skiteup Logo"
                        sx={{
                            height: 52,
                            objectFit: "contain",
                        }}
                    />
                </Box>

                <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography
                        color="#111827"
                        sx={{
                            fontSize: 16,
                            fontWeight: 500,
                            mb: 1,
                            fontFamily: "manrope",
                        }}
                    >
                        Email / Register ID
                        <Box
                            component="span"
                            sx={{ color: "red", ml: 0.5 }}
                        >
                            *
                        </Box>
                    </Typography>

                    <Input
                        type="text"
                        textFieldProps={{
                            ...register("email"),
                            placeholder: "user@skiteup.com",
                            error: !!errors.email,
                            fullWidth: true,
                            autoComplete: "username",
                            sx: {
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    "& fieldset": {
                                        borderColor: "#d1d9e6",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#b0bac8",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#1976d2",
                                    },
                                },
                            },
                        }}
                    />

                    {errors.email && (
                        <Typography
                            color="error"
                            role="alert"
                            sx={{
                                fontSize: 12,
                                mt: 0.5,
                            }}
                        >
                            {errors.email.message}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ width: "100%", mb: 1 }}>
                    <Typography
                        color="#111827"
                        sx={{
                            fontSize: 16,
                            fontWeight: 500,
                            mb: 1,
                            fontFamily: "manrope",
                        }}
                    >
                        Password
                        <Box
                            component="span"
                            sx={{ color: "red", ml: 0.5 }}
                        >
                            *
                        </Box>
                    </Typography>

                    <Input
                        type="password"
                        textFieldProps={{
                            ...register("password"),
                            placeholder: "Enter Your Password",
                            type: showPassword ? "text" : "password",
                            error: !!errors.password,
                            fullWidth: true,
                            autoComplete: "current-password",
                            slotProps: {
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                edge="end"
                                                size="small"
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                sx={{ color: "#aaa" }}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff fontSize="small" />
                                                ) : (
                                                    <Visibility fontSize="small" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            },
                            sx: {
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    "& fieldset": {
                                        borderColor: "#d1d9e6",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#b0bac8",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#1976d2",
                                    },
                                },
                            },
                        }}
                    />

                    {errors.password && (
                        <Typography
                            color="error"
                            role="alert"
                            sx={{
                                fontSize: 12,
                                mt: 0.5,
                            }}
                        >
                            {errors.password.message}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                        mb: 2,
                    }}
                >
                    <Link
                        href="#"
                        underline="hover"
                        sx={{
                            fontFamily: "Inter",
                            fontSize: 12,
                            color: "#1976d2",
                            fontWeight: 500,
                        }}
                    >
                        Forgot password?
                    </Link>
                </Box>
                <Button
                    id="login-btn"
                    type="submit"
                    fullWidth
                    variant="contained"
                    disableElevation
                    disabled={isSubmitting || isLoading}
                    sx={{
                        backgroundColor: "#337ECC",
                        borderRadius: 2,
                        py: 1.2,
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textTransform: "none",
                        fontFamily: "roboto",
                        mb: 2,
                        "&:hover": {
                            backgroundColor: "#1565c0",
                            boxShadow:
                                "0 4px 16px rgba(25,118,210,0.3)",
                        },
                    }}
                >
                    {isSubmitting || isLoading ? "Logging in..." : "Login"}
                </Button>
                <Divider
                    sx={{
                        width: "100%",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        color: "#667085",
                        fontWeight: 500,
                        my: 1,
                    }}
                >
                    or Continue with
                </Divider>
                <Box
                    sx={{
                        display: "flex",
                        gap: 1.5,
                        width: "100%",
                        mb: 2.5,
                    }}
                >
                    <Button
                        id="google-login"
                        fullWidth
                        variant="outlined"
                        aria-label="Continue with Google"
                        sx={{
                            borderColor: "#e2e8f0",
                            borderRadius: 2,
                            minWidth: 0,
                            py: 1,
                            "&:hover": {
                                borderColor: "#b0bac8",
                                backgroundColor: "#f8fafc",
                            },
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 48 48"
                        >
                            <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                        </svg>
                    </Button>

                    <Button
                        id="github-login"
                        fullWidth
                        variant="outlined"
                        aria-label="Continue with GitHub"
                        sx={{
                            borderColor: "#e2e8f0",
                            borderRadius: 2,
                            minWidth: 0,
                            py: 1,
                            "&:hover": {
                                borderColor: "#b0bac8",
                                backgroundColor: "#f8fafc",
                            },
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="#333"
                        >
                            <path d="M12 .297a12 12 0 0 0-3.79 23.385c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.286c0 .315.21.69.825.57A12 12 0 0 0 12 .297Z" />
                        </svg>
                    </Button>

                    <Button
                        id="facebook-login"
                        fullWidth
                        variant="outlined"
                        aria-label="Continue with Facebook"
                        sx={{
                            borderColor: "#e2e8f0",
                            borderRadius: 2,
                            minWidth: 0,
                            py: 1,
                            "&:hover": {
                                borderColor: "#b0bac8",
                                backgroundColor: "#f8fafc",
                            },
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="#337ECC"
                        >
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.67 4.533-4.67 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z" />
                        </svg>
                    </Button>
                </Box>

                <Typography
                    sx={{
                        fontSize: 13,
                        color: "#64748b",
                    }}
                >
                    Don't have an account?{" "}
                    <Link
                        href="#"
                        underline="hover"
                        sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 13,
                            color: "#1976d2",
                            fontWeight: 600,
                        }}
                    >
                        Register now.
                    </Link>
                </Typography>
            </Box>
            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() =>
                    setSnackbar((current) => ({ ...current, open: false }))
                }
            />
        </Box>
    );
};

export default Login;
