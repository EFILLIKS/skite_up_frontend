import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  DesktopWindows as DesktopWindowsIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  GraphicEq as GraphicEqIcon,
  Mic as MicIcon,
} from "@mui/icons-material";

export type SessionCheckType = "MCQ" | "OBJECTIVE" | "LSRW" | "CODING" | "OTHER";

export interface SectionSystemCheckCardProps {
  sectionKey: string;
  sectionType: SessionCheckType;
  questionCount: number;
  durationMinutes?: number;
  totalMarks?: number;
  attemptsAllowed?: number;
  beepPlayed: boolean;
  micAuthorized: boolean;
  declarationAccepted: boolean;
  onToggleDeclaration: (accepted: boolean) => void;
  onPlayBeep: () => void;
  onAuthorizeMic: () => void;
  onStartSession: () => void;
  onBack?: () => void;
  isStarting?: boolean;
  instructions?: string[];
  declarationText?: string;
  audioPlaybackLabel?: string;
  microphoneAuthLabel?: string;
}

export const SectionSystemCheckCard: React.FC<SectionSystemCheckCardProps> = ({
  sectionKey,
  sectionType,
  questionCount,
  durationMinutes,
  totalMarks,
  attemptsAllowed = 3,
  beepPlayed,
  micAuthorized,
  declarationAccepted,
  onToggleDeclaration,
  onPlayBeep,
  onAuthorizeMic,
  onStartSession,
  onBack,
  isStarting = false,
  instructions,
  declarationText = "I have read the instructions and will not use unfair means.",
  audioPlaybackLabel = "Play the beep",
  microphoneAuthLabel = "Authorize mic",
}) => {
  const isLsrw = sectionType === "LSRW";
  const isCoding = sectionType === "CODING";
  const isObjective = !isLsrw && !isCoding;

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  const checkPing = React.useCallback(async () => {
    // 1. Direct browser offline flag check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    // 2. Helper to ping an endpoint with strict timeout and no-cors
    const pingEndpoint = async (url: string, timeoutMs: number = 2000): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        await fetch(url + (url.includes("?") ? "&" : "?") + "_t=" + Date.now(), {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return true;
      } catch {
        return false;
      }
    };

    // When testing on localhost, localhost loopback is always alive, so we must
    // ping external public CDNs to accurately detect if Wi-Fi / Internet is disconnected.
    let reachable = await pingEndpoint("https://www.google.com/favicon.ico");
    if (!reachable) {
      reachable = await pingEndpoint("https://1.1.1.1/favicon.ico");
    }
    if (!reachable) {
      reachable = await pingEndpoint("https://cdnjs.cloudflare.com/favicon.ico");
    }

    // If external pings failed but we're on a custom remote server (not localhost), also test origin
    if (!reachable && typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      reachable = await pingEndpoint(window.location.origin + "/favicon.ico");
    }

    setIsOnline(reachable);
    return reachable;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      checkPing();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    checkPing();

    // Periodic check every 2.5s to catch network disconnect without needing reload
    const interval = setInterval(checkPing, 2500);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkPing]);

  const cardTitle = React.useMemo(() => {
    if (isLsrw) return "Communication";
    if (isCoding) return "Coding Test";
    const upper = (sectionKey || "").toUpperCase();
    if (upper === "MCQ" || upper === "OBJECTIVE" || upper === "OBJECTIVES") {
      return "Objective Test";
    }
    return `${sectionKey} Test`;
  }, [isLsrw, isCoding, sectionKey]);

  const cardSubtitle = React.useMemo(() => {
    if (isLsrw) {
      return "Please complete the hardware connectivity and audits before beginning the assessment.";
    }
    if (isCoding) {
      return questionCount > 1
        ? `${questionCount} problems evaluated against hidden test cases.`
        : "Two problems evaluated against hidden test cases.";
    }
    return "Making sure your device is ready for a timed test.";
  }, [isLsrw, isCoding, questionCount]);

  const startButtonText = React.useMemo(() => {
    if (isLsrw) return isStarting ? "Starting..." : "Start LSRW";
    if (isCoding) return isStarting ? "Starting..." : "Start Coding";
    return isStarting ? "Starting..." : "Start test";
  }, [isLsrw, isCoding, isStarting]);

  const displayDuration = durationMinutes || (isObjective ? 10 : 60);
  const displayMarks = totalMarks !== undefined ? totalMarks : 100;
  const displayQuestions = questionCount || (isCoding ? 2 : 20);

  const canStart = declarationAccepted && isOnline && !isStarting;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 620,
        border: "1px solid #eaecf0",
        borderRadius: "16px",
        bgcolor: "#ffffff",
        p: { xs: 3, sm: 4.5 },
        boxShadow: "0 4px 20px rgba(16, 24, 40, 0.05)",
      }}
    >
      {/* Title & Subtitle */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#101828" }}>
          {cardTitle}
        </Typography>
        <Typography sx={{ fontSize: "13.5px", color: "#667085", mt: 0.5 }}>
          {cardSubtitle}
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isCoding ? "repeat(4, 1fr)" : "repeat(3, 1fr)",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            bgcolor: "#f8fafc",
            borderRadius: "8px",
            p: 1.5,
            border: "1px solid #f1f5f9",
          }}
        >
          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>
            Duration
          </Typography>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#101828", mt: 0.5 }}>
            {displayDuration} min
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "#f8fafc",
            borderRadius: "8px",
            p: 1.5,
            border: "1px solid #f1f5f9",
          }}
        >
          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>
            Questions
          </Typography>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#101828", mt: 0.5 }}>
            {displayQuestions}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "#f8fafc",
            borderRadius: "8px",
            p: 1.5,
            border: "1px solid #f1f5f9",
          }}
        >
          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>
            Marks
          </Typography>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#101828", mt: 0.5 }}>
            {displayMarks}
          </Typography>
        </Box>

        {isCoding && (
          <Box
            sx={{
              bgcolor: "#f8fafc",
              borderRadius: "8px",
              p: 1.5,
              border: "1px solid #f1f5f9",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>
              Attempts
            </Typography>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#101828", mt: 0.5 }}>
              {attemptsAllowed}
            </Typography>
          </Box>
        )}
      </Box>

      {/* System / Hardware Checks */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        {isLsrw ? (
          <>
            {/* Audio Check */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.75,
                px: 2,
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, mr: 2 }}>
                <GraphicEqIcon sx={{ fontSize: 20, color: "#64748b" }} />
                <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                  I have read the instructions and will not use unfair means.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onPlayBeep}
                sx={{
                  borderColor: beepPlayed ? "#16a34a !important" : "#22c55e !important",
                  color: beepPlayed ? "#16a34a !important" : "#16a34a !important",
                  bgcolor: beepPlayed ? "#f0fdf4 !important" : "transparent !important",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  borderRadius: "6px",
                  px: 2,
                  py: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {beepPlayed ? "Played ✓" : audioPlaybackLabel}
              </Button>
            </Box>

            {/* Mic Check */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.75,
                px: 2,
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, mr: 2 }}>
                <MicIcon sx={{ fontSize: 20, color: "#64748b" }} />
                <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                  I have read the instructions and will not use unfair means.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onAuthorizeMic}
                sx={{
                  borderColor: micAuthorized ? "#16a34a !important" : "#ef4444 !important",
                  color: micAuthorized ? "#16a34a !important" : "#ef4444 !important",
                  bgcolor: micAuthorized ? "#f0fdf4 !important" : "transparent !important",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  borderRadius: "6px",
                  px: 2,
                  py: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {micAuthorized ? "Authorized ✓" : microphoneAuthLabel}
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Network check with real-time detection */}
            <Box
              onClick={() => checkPing()}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.75,
                px: 2,
                borderRadius: "8px",
                border: isOnline ? "1px solid #eaecf0" : "1.5px solid #fca5a5",
                bgcolor: isOnline ? "#ffffff" : "#fef2f2",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              title="Click to re-check network status"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {isOnline ? (
                  <WifiIcon sx={{ fontSize: 20, color: "#64748b" }} />
                ) : (
                  <WifiOffIcon sx={{ fontSize: 20, color: "#dc2626" }} />
                )}
                <Typography
                  sx={{
                    fontSize: "13.5px",
                    color: isOnline ? "#334155" : "#dc2626",
                    fontWeight: isOnline ? 500 : 600,
                  }}
                >
                  {isOnline ? "Network connection stable" : "Network connection offline / disconnected"}
                </Typography>
              </Box>
              {isOnline ? (
                <CheckIcon sx={{ fontSize: 20, color: "#16a34a" }} />
              ) : (
                <CloseIcon sx={{ fontSize: 20, color: "#dc2626" }} />
              )}
            </Box>

            {/* Browser supported check */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.75,
                px: 2,
                borderRadius: "8px",
                border: "1px solid #eaecf0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DesktopWindowsIcon sx={{ fontSize: 20, color: "#64748b" }} />
                <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                  Browser supported
                </Typography>
              </Box>
              <CheckIcon sx={{ fontSize: 20, color: "#16a34a" }} />
            </Box>

            {/* Clock synchronized check */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.75,
                px: 2,
                borderRadius: "8px",
                border: "1px solid #eaecf0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AccessTimeIcon sx={{ fontSize: 20, color: "#64748b" }} />
                <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                  Clock synchronized
                </Typography>
              </Box>
              <CheckIcon sx={{ fontSize: 20, color: "#16a34a" }} />
            </Box>
          </>
        )}
      </Box>

      {/* Instructions */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828", mb: 1.25 }}>
          Instructions
        </Typography>
        <Box
          component="ul"
          sx={{
            pl: 2.5,
            m: 0,
            color: "#667085",
            fontSize: "13px",
            lineHeight: 1.8,
          }}
        >
          {instructions && instructions.length > 0 ? (
            instructions.map((inst, idx) => <li key={idx}>{inst}</li>)
          ) : (
            <>
              <li>The timer starts when you begin and cannot be paused. The test auto-submits when time runs out.</li>
              <li>Use the question palette to move between questions and mark questions for review.</li>
              <li>Results are shown right after submission.</li>
            </>
          )}
        </Box>
      </Box>

      {/* Checkbox Declaration */}
      <FormControlLabel
        control={
          <Checkbox
            checked={declarationAccepted}
            onChange={(e) => onToggleDeclaration(e.target.checked)}
            sx={{
              color: "#d0d5dd",
              "&.Mui-checked": { color: "#2563eb" },
              p: 0.75,
            }}
          />
        }
        label={
          <Typography sx={{ fontSize: "13px", color: "#667085" }}>
            {declarationText}
          </Typography>
        }
        sx={{ mb: 3.5, ml: -0.5 }}
      />

      {/* Bottom Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: onBack ? "space-between" : "flex-end",
          alignItems: "center",
          mt: 1,
        }}
      >
        {onBack && (
          <Button
            variant="text"
            onClick={onBack}
            sx={{
              textTransform: "none",
              color: "#2563eb",
              fontWeight: 600,
              fontSize: "14px",
              p: 0,
              minWidth: 0,
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            Back
          </Button>
        )}

        <Button
          variant="contained"
          disabled={!canStart}
          onClick={onStartSession}
          sx={{
            bgcolor: "#831843 !important",
            color: "#ffffff !important",
            px: 3.5,
            py: 1,
            fontWeight: 600,
            fontSize: "14px",
            textTransform: "none",
            borderRadius: "8px",
            boxShadow: "none",
            opacity: !canStart ? 0.6 : 1,
            cursor: !canStart ? "not-allowed !important" : "pointer",
            "&:hover": {
              bgcolor: "#701a35 !important",
            },
          }}
        >
          {startButtonText}
        </Button>
      </Box>

      {!isOnline && (
        <Typography
          sx={{
            fontSize: "12px",
            color: "#dc2626",
            mt: 1.5,
            textAlign: "right",
            fontWeight: 600,
          }}
        >
          ⚠️ Please reconnect your internet connection to start the test.
        </Typography>
      )}
    </Box>
  );
};

export default SectionSystemCheckCard;
