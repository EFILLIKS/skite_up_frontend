import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import {
  Wifi as WifiIcon,
  DesktopWindows as DesktopWindowsIcon,
  VolumeUp as VolumeUpIcon,
  Mic as MicIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Headphones as HeadphonesIcon,
  Code as CodeIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Security as SecurityIcon,
  GraphicEq as GraphicEqIcon,
} from "@mui/icons-material";

export type SessionCheckType = "MCQ" | "LSRW" | "CODING" | "OTHER";

export interface SectionSystemCheckCardProps {
  sectionKey: string;
  sectionType: SessionCheckType;
  questionCount: number;
  totalMarks?: number;
  beepPlayed: boolean;
  micAuthorized: boolean;
  onPlayBeep: () => void;
  onAuthorizeMic: () => void;
  onStartSession: () => void;
  audioPlaybackLabel?: string;
  microphoneAuthLabel?: string;
}

export const SectionSystemCheckCard: React.FC<SectionSystemCheckCardProps> = ({
  sectionKey,
  sectionType,
  questionCount,
  beepPlayed,
  micAuthorized,
  onPlayBeep,
  onAuthorizeMic,
  onStartSession,
  audioPlaybackLabel = "Play the beep",
  microphoneAuthLabel = "Authorize mic",
}) => {
  const themeConfig = React.useMemo(() => {
    switch (sectionType) {
      case "CODING":
        return {
          icon: <CodeIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
          badgeColor: "#eff6ff",
          badgeBorder: "#bfdbfe",
          badgeText: "#1d4ed8",
          title: `Coding Session — Environment & System Check`,
          subtitle: `Verify code compiler sandboxes and Monaco editor before beginning algorithmic problems.`,
          sessionLabel: "Coding & Algorithms",
          buttonColor: "#2563eb",
          buttonHover: "#1d4ed8",
        };
      case "LSRW":
        return {
          icon: <HeadphonesIcon sx={{ fontSize: 28, color: "#16a34a" }} />,
          badgeColor: "#f0fdf4",
          badgeBorder: "#bbf7d0",
          badgeText: "#15803d",
          title: `LSRW Session — Audio & Microphone Readiness`,
          subtitle: `Verify headphones, microphone access, and speech recognition before beginning audio questions.`,
          sessionLabel: "Listening, Speaking, Reading & Writing",
          buttonColor: "#16a34a",
          buttonHover: "#15803d",
        };
      case "MCQ":
      default:
        return {
          icon: <AssignmentTurnedInIcon sx={{ fontSize: 28, color: "#831843" }} />,
          badgeColor: "#fdf2f8",
          badgeBorder: "#fbcfe8",
          badgeText: "#9d174d",
          title: `${sectionKey} Session — System & Browser Check`,
          subtitle: `Verify device connectivity and proctoring window lock before answering questions.`,
          sessionLabel: "Multiple Choice Questions",
          buttonColor: "#831843",
          buttonHover: "#701a35",
        };
    }
  }, [sectionType, sectionKey]);

  return (
    <Box
      sx={{
        border: "1px solid #eaecf0",
        borderRadius: "16px",
        bgcolor: "#ffffff",
        p: { xs: 3, sm: 4 },
        boxShadow: "0 4px 20px rgba(16, 24, 40, 0.05)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "12px",
              bgcolor: themeConfig.badgeColor,
              border: `1px solid ${themeConfig.badgeBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {themeConfig.icon}
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "19px", fontWeight: 700, color: "#101828" }}>
                {themeConfig.title}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#667085", mt: 0.25 }}>
              {themeConfig.subtitle}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${sectionKey} SESSION`}
          sx={{
            bgcolor: themeConfig.badgeColor,
            border: `1px solid ${themeConfig.badgeBorder}`,
            color: themeConfig.badgeText,
            fontWeight: 700,
            fontSize: "12px",
            height: 28,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
          p: 2,
          borderRadius: "12px",
          bgcolor: "#f8fafc",
          border: "1px solid #e2e8f0",
          mb: 3.5,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Section Type
          </Typography>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 0.25 }}>
            {themeConfig.sessionLabel}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Questions Count
          </Typography>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mt: 0.25 }}>
            {questionCount} Questions
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Security & Proctoring
          </Typography>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#16a34a", mt: 0.25, display: "flex", alignItems: "center", gap: 0.5 }}>
            <SecurityIcon sx={{ fontSize: 16 }} /> Full-Screen Active
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", mb: 1.5 }}>
        Required System Checks
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, mb: 3.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WifiIcon sx={{ fontSize: 20, color: "#16a34a" }} />
            <Box>
              <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                Network connection stable
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                Active low-latency connection for auto-saving responses in real time.
              </Typography>
            </Box>
          </Box>
          <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <DesktopWindowsIcon sx={{ fontSize: 20, color: "#16a34a" }} />
            <Box>
              <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                Browser & proctoring environment verified
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                Window lock, function keys prevention, and alt-tab monitoring are active.
              </Typography>
            </Box>
          </Box>
          <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
        </Box>

        {sectionType === "LSRW" && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                bgcolor: beepPlayed ? "#f0fdf4" : "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <VolumeUpIcon sx={{ fontSize: 20, color: beepPlayed ? "#16a34a" : "#64748b" }} />
                <Box>
                  <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                    Audio & headphone test
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Ensure you can hear prompts clearly for listening and speaking sections.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onPlayBeep}
                sx={{
                  borderColor: beepPlayed ? "#16a34a" : "#22c55e",
                  color: beepPlayed ? "#16a34a" : "#15803d",
                  bgcolor: beepPlayed ? "#dcfce7" : "transparent",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "6px",
                  px: 2,
                  "&:hover": { bgcolor: "#dcfce7" },
                }}
              >
                {beepPlayed ? "Audio Verified ✓" : audioPlaybackLabel}
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                bgcolor: micAuthorized ? "#f0fdf4" : "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MicIcon sx={{ fontSize: 20, color: micAuthorized ? "#16a34a" : "#64748b" }} />
                <Box>
                  <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                    Microphone recording authorization
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Required for speaking, read-aloud passages, and voice recordings.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onAuthorizeMic}
                sx={{
                  borderColor: micAuthorized ? "#16a34a" : "#ef4444",
                  color: micAuthorized ? "#16a34a" : "#dc2626",
                  bgcolor: micAuthorized ? "#dcfce7" : "transparent",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "6px",
                  px: 2,
                  "&:hover": { bgcolor: "#dcfce7" },
                }}
              >
                {micAuthorized ? "Microphone Authorized ✓" : microphoneAuthLabel}
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <GraphicEqIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                <Box>
                  <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                    Speech recognition & audio pipeline ready
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Browser audio engine initialized for high-accuracy live transcription.
                  </Typography>
                </Box>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
            </Box>
          </>
        )}

        {sectionType === "CODING" && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CodeIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                <Box>
                  <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                    Multi-language compiler sandbox online
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Java, Python, C++, and JavaScript runtimes ready for test case execution.
                  </Typography>
                </Box>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DesktopWindowsIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                <Box>
                  <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                    Monaco IDE code editor loaded
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Auto-completion, indentation, and syntax diagnostics initialized.
                  </Typography>
                </Box>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
            </Box>
          </>
        )}

        {sectionType === "MCQ" && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 20, color: "#831843" }} />
                <Box>
                  <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                    Option selection & instant response sync
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    Clicking an option immediately marks the question answered and saves your choice.
                  </Typography>
                </Box>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
            </Box>
          </>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: "10px",
          bgcolor: "#f8fafc",
          border: "1px dashed #cbd5e1",
          mb: 3.5,
        }}
      >
        <Typography sx={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.6 }}>
          {sectionType === "LSRW"
            ? "💡 Tip: Speak at a natural pace directly into the microphone. You can review audio recordings before moving to the next question."
            : sectionType === "CODING"
              ? "💡 Tip: You can test your code against visible test cases before making final submission. Keep an eye on edge cases."
              : "💡 Tip: You can navigate between questions in this session using the palette or Skip and Flag buttons."}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button
          variant="contained"
          onClick={onStartSession}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: themeConfig.buttonColor,
            color: "#ffffff",
            px: 4,
            py: 1.25,
            fontWeight: 700,
            fontSize: "14px",
            textTransform: "none",
            borderRadius: "8px",
            boxShadow: `0 4px 12px ${themeConfig.buttonColor}40`,
            "&:hover": { bgcolor: themeConfig.buttonHover },
          }}
        >
          Start {sectionKey} Session
        </Button>
      </Box>
    </Box>
  );
};

export default SectionSystemCheckCard;
