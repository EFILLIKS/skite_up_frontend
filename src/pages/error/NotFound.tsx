import { Box, Button, Chip, Link, Typography } from "@mui/material";
import {
    ArrowBackRounded,
    HomeRounded,
    SearchOffRounded,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/skitup-logo.svg";

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const accessToken = localStorage.getItem("accessToken");
    const isAuthenticated = Boolean(accessToken);
    const homePath = isAuthenticated ? "/dashboard" : "/";
    const homeLabel = isAuthenticated ? "Back to Dashboard" : "Back to Home";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f8fafc",
                backgroundImage: `
                    radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 35%),
                    radial-gradient(circle at 85% 80%, rgba(124, 58, 237, 0.08) 0%, transparent 40%),
                    radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.04) 0%, transparent 60%)
                `,
                p: { xs: 2.5, sm: 4 },
                position: "relative",
                overflow: "hidden",
            }}
        >
            <style>{`
                @keyframes floatSlow {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-16px) rotate(1.5deg);
                    }
                }
                @keyframes floatReverse {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(14px) rotate(-1.5deg);
                    }
                }
                @keyframes pulseGlow {
                    0%, 100% {
                        transform: scale(0.96);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.08);
                        opacity: 0.85;
                    }
                }
                @keyframes orbitSpin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes orbitSpinReverse {
                    from {
                        transform: rotate(360deg);
                    }
                    to {
                        transform: rotate(0deg);
                    }
                }
                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.2;
                        transform: scale(0.7);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.25);
                    }
                }
                @keyframes gradientShimmer {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                @keyframes signalWave {
                    0% {
                        r: 22;
                        opacity: 0.9;
                    }
                    100% {
                        r: 58;
                        opacity: 0;
                    }
                }
            `}</style>

            <Box
                sx={{
                    position: { xs: "static", sm: "absolute" },
                    top: { sm: 32 },
                    left: { sm: 40 },
                    mb: { xs: 3, sm: 0 },
                    cursor: "pointer",
                }}
                onClick={() => navigate(homePath)}
            >
                <Box
                    component="img"
                    src={logo}
                    alt="Skiteup Logo"
                    sx={{
                        height: { xs: 36, sm: 42 },
                        objectFit: "contain",
                    }}
                />
            </Box>

            <Box
                sx={{
                    maxWidth: 680,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    zIndex: 1,
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        width: { xs: 260, sm: 340, md: 380 },
                        height: { xs: 200, sm: 240, md: 270 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            width: 220,
                            height: 220,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(124, 58, 237, 0.12) 50%, transparent 75%)",
                            filter: "blur(28px)",
                            animation: "pulseGlow 4s ease-in-out infinite",
                            pointerEvents: "none",
                        }}
                    />

                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 380 270"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ overflow: "visible" }}
                    >
                        <circle
                            cx="190"
                            cy="135"
                            r="115"
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                            strokeDasharray="6 6"
                            style={{
                                transformOrigin: "190px 135px",
                                animation: "orbitSpin 35s linear infinite",
                            }}
                        />

                        <ellipse
                            cx="190"
                            cy="135"
                            rx="135"
                            ry="58"
                            stroke="#93c5fd"
                            strokeWidth="1.25"
                            strokeDasharray="4 8"
                            style={{
                                transformOrigin: "190px 135px",
                                animation: "orbitSpinReverse 25s linear infinite",
                            }}
                        />

                        <circle
                            cx="190"
                            cy="135"
                            r="28"
                            stroke="#60a5fa"
                            strokeWidth="1.5"
                            fill="none"
                            style={{
                                animation: "signalWave 2.8s cubic-bezier(0.2, 0.6, 0.35, 1) infinite",
                            }}
                        />

                        <circle
                            cx="190"
                            cy="135"
                            r="28"
                            stroke="#a78bfa"
                            strokeWidth="1.2"
                            fill="none"
                            style={{
                                animation: "signalWave 2.8s cubic-bezier(0.2, 0.6, 0.35, 1) infinite 1.4s",
                            }}
                        />

                        <circle
                            cx="190"
                            cy="135"
                            r="32"
                            fill="url(#coreGradient)"
                            filter="drop-shadow(0 6px 14px rgba(37,99,235,0.3))"
                        />
                        <path
                            d="M178 135C178 123 202 123 202 135C202 147 178 147 178 135Z"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeOpacity="0.8"
                        />
                        <path
                            d="M190 120V150M175 135H205"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeOpacity="0.85"
                            strokeLinecap="round"
                        />

                        <g
                            style={{
                                transformOrigin: "85px 65px",
                                animation: "floatSlow 5s ease-in-out infinite",
                            }}
                        >
                            <circle cx="85" cy="65" r="16" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
                            <circle cx="85" cy="65" r="5" fill="#2563eb" />
                            <path d="M73 65H65M97 65H105M85 53V45M85 77V85" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                        </g>

                        <g
                            style={{
                                transformOrigin: "295px 190px",
                                animation: "floatReverse 6s ease-in-out infinite 0.8s",
                            }}
                        >
                            <circle cx="295" cy="190" r="12" fill="#faf5ff" stroke="#8b5cf6" strokeWidth="1.8" />
                            <circle cx="295" cy="190" r="4" fill="#7c3aed" />
                            <ellipse cx="295" cy="190" rx="19" ry="6" stroke="#c4b5fd" strokeWidth="1.2" />
                        </g>

                        <path
                            d="M60 160L62 165L67 167L62 169L60 174L58 169L53 167L58 165Z"
                            fill="#f59e0b"
                            style={{ animation: "twinkle 3s ease-in-out infinite 0.3s" }}
                        />
                        <path
                            d="M325 80L327 84L331 86L327 88L325 92L323 88L319 86L323 84Z"
                            fill="#3b82f6"
                            style={{ animation: "twinkle 3.5s ease-in-out infinite 1.2s" }}
                        />
                        <path
                            d="M130 35L131 38L134 39L131 40L130 43L129 40L126 39L129 38Z"
                            fill="#8b5cf6"
                            style={{ animation: "twinkle 2.5s ease-in-out infinite 1.8s" }}
                        />
                        <path
                            d="M245 225L246 228L249 229L246 230L245 233L244 230L241 229L244 228Z"
                            fill="#10b981"
                            style={{ animation: "twinkle 3.2s ease-in-out infinite 0.6s" }}
                        />

                        <defs>
                            <linearGradient id="coreGradient" x1="165" y1="110" x2="215" y2="160" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="60%" stopColor="#2563eb" />
                                <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <Typography
                        sx={{
                            position: "absolute",
                            fontSize: { xs: 78, sm: 98, md: 114 },
                            fontWeight: 900,
                            letterSpacing: "-0.04em",
                            lineHeight: 1,
                            userSelect: "none",
                            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(37, 99, 235, 0.95) 45%, rgba(124, 58, 237, 0.9) 80%)",
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "gradientShimmer 7s ease infinite, floatSlow 6s ease-in-out infinite",
                            filter: "drop-shadow(0 12px 24px rgba(37, 99, 235, 0.15))",
                            pointerEvents: "none",
                            zIndex: 2,
                        }}
                    >
                        404
                    </Typography>
                </Box>

                <Chip
                    icon={<SearchOffRounded sx={{ fontSize: 16, color: "#2563eb !important" }} />}
                    label="Error 404 • Page Not Found"
                    size="small"
                    sx={{
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        fontWeight: 600,
                        fontSize: 11.5,
                        height: 28,
                        borderRadius: 1.5,
                        border: "1px solid #bfdbfe",
                        mb: 2,
                    }}
                />

                <Typography
                    sx={{
                        fontSize: { xs: 24, sm: 30, md: 34 },
                        fontWeight: 750,
                        color: "#0f172a",
                        lineHeight: 1.25,
                        letterSpacing: "-0.02em",
                        mb: 1.2,
                    }}
                >
                    Lost in Digital Space?
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: 13, sm: 14.5 },
                        color: "#64748b",
                        lineHeight: 1.6,
                        maxWidth: 480,
                        mb: 2.5,
                    }}
                >
                    The page you are trying to reach doesn't exist, has been relocated, or is temporarily unavailable.
                </Typography>

                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: "#ffffff",
                        border: "1px dashed #cbd5e1",
                        borderRadius: 2,
                        px: 2,
                        py: 0.8,
                        fontSize: 12,
                        color: "#64748b",
                        maxWidth: "100%",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                        mb: 3.5,
                    }}
                >
                    <Typography component="span" sx={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>
                        Attempted Route:
                    </Typography>
                    <Typography
                        component="code"
                        sx={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: 12,
                            color: "#ef4444",
                            maxWidth: { xs: 180, sm: 260 },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {location.pathname}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 1.5,
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        mb: 4,
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={() => navigate(homePath)}
                        startIcon={<HomeRounded sx={{ fontSize: 18 }} />}
                        sx={{
                            bgcolor: "#1976d2",
                            color: "#ffffff",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                            py: 1.15,
                            fontSize: 13,
                            boxShadow: "0 4px 14px rgba(25, 118, 210, 0.28)",
                            "&:hover": {
                                bgcolor: "#1565c0",
                                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
                                transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}
                    >
                        {homeLabel}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackRounded sx={{ fontSize: 18 }} />}
                        sx={{
                            borderColor: "#cbd5e1",
                            color: "#334155",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: 2,
                            px: 2.75,
                            py: 1.15,
                            fontSize: 13,
                            bgcolor: "#ffffff",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                            "&:hover": {
                                borderColor: "#94a3b8",
                                bgcolor: "#f1f5f9",
                                transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}
                    >
                        Go Back
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default NotFound;
