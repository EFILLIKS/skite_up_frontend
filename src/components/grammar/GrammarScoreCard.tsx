import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Stars as StarsIcon,
  CheckCircle as CheckCircleIcon,
  EditNote as EditNoteIcon,
  ShortText as ShortTextIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import type { GrammarCheckResponse } from "../../types/Grammar.types";

interface GrammarScoreCardProps {
  grammarData: GrammarCheckResponse;
  title?: string;
  compact?: boolean;
}

const formatScore = (val?: number): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0.00%";
  return `${Number(val).toFixed(2)}%`;
};

const getScoreColor = (score?: number) => {
  const num = Number(score || 0);
  if (num >= 85) return { text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", bar: "#16a34a" };
  if (num >= 70) return { text: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", bar: "#0284c7" };
  if (num >= 50) return { text: "#b45309", bg: "#fffbeb", border: "#fde68a", bar: "#d97706" };
  return { text: "#b91c1c", bg: "#fef2f2", border: "#fecaca", bar: "#dc2626" };
};

export const GrammarScoreCard: React.FC<GrammarScoreCardProps> = ({
  grammarData,
  title = "Speech Grammar & Fluency Analysis",
  compact = false,
}) => {
  const {
    finalScore = 0,
    grammarScore = 0,
    spellingScore = 0,
    sentenceScore = 0,
    vocabularyScore = 0,
  } = grammarData;

  const scoreItems = [
    {
      label: "Final Score",
      value: finalScore,
      icon: <StarsIcon sx={{ fontSize: 18, color: "#7c3aed" }} />,
      accent: { text: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", bar: "#7c3aed" },
    },
    {
      label: "Grammar",
      value: grammarScore,
      icon: <CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb" }} />,
      accent: getScoreColor(grammarScore),
    },
    {
      label: "Spelling",
      value: spellingScore,
      icon: <EditNoteIcon sx={{ fontSize: 18, color: "#059669" }} />,
      accent: getScoreColor(spellingScore),
    },
    {
      label: "Sentence Structure",
      value: sentenceScore,
      icon: <ShortTextIcon sx={{ fontSize: 18, color: "#d97706" }} />,
      accent: getScoreColor(sentenceScore),
    },
    {
      label: "Vocabulary",
      value: vocabularyScore,
      icon: <MenuBookIcon sx={{ fontSize: 18, color: "#0284c7" }} />,
      accent: getScoreColor(vocabularyScore),
    },
  ];

  return (
    <Box
      sx={{
        p: compact ? 2 : 2.5,
        borderRadius: "12px",
        bgcolor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
          📊 {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
        }}
      >
        {scoreItems.map((item, idx) => {
          const colors = item.accent;
          const numValue = Math.min(100, Math.max(0, Number(item.value || 0)));

          return (
            <Box
              key={idx}
              sx={{
                p: 2,
                borderRadius: "10px",
                bgcolor: colors.bg,
                border: `1px solid ${colors.border}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 100,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                {item.icon}
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                  {item.label}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: "22px", fontWeight: 800, color: colors.text, mb: 1 }}>
                {formatScore(item.value)}
              </Typography>

              <Box sx={{ width: "100%", bgcolor: "rgba(0,0,0,0.06)", height: 5, borderRadius: 2.5, overflow: "hidden" }}>
                <Box
                  sx={{
                    width: `${numValue}%`,
                    height: "100%",
                    bgcolor: colors.bar,
                    borderRadius: 2.5,
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default GrammarScoreCard;
