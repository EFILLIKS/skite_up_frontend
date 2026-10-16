import React from "react";
import { Box, Typography } from "@mui/material";
import {
  CheckCircle as CheckCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  TrendingUp as TrendingUpIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
} from "@mui/icons-material";
import type { GrammarError, GrammarCheckResponse } from "../../types/Grammar.types";

interface GrammarErrorHighlighterProps {
  originalText?: string;
  errors?: GrammarError[];
  grammarData?: GrammarCheckResponse;
  title?: string;
}

export const GrammarErrorHighlighter: React.FC<GrammarErrorHighlighterProps> = ({
  errors = [],
  grammarData,
  title = "Feedback & Actionable Suggestions",
}) => {
  const strengths: string[] =
    grammarData?.strengths && grammarData.strengths.length > 0
      ? grammarData.strengths
      : [];

  const weaknesses: string[] =
    grammarData?.weaknesses && grammarData.weaknesses.length > 0
      ? grammarData.weaknesses
      : errors.map((err) => `${err.errorType}: ${err.explanation}`);

  const improvedAreas: string[] =
    grammarData?.improvedAreas && grammarData.improvedAreas.length > 0
      ? grammarData.improvedAreas
      : [
          "Sentence Structure: Divide long thoughts into concise sentences.",
          "Spelling & Spacing: Ensure proper technical term spellings and word spacing.",
        ];

  const suggestions: string[] =
    grammarData?.suggestions && grammarData.suggestions.length > 0
      ? grammarData.suggestions
      : errors
          .filter((e) => e.suggestion)
          .map((e) => `Use '${e.suggestion}' instead of '${e.originalText}'`);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "12px",
        bgcolor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        mb: 2,
      }}
    >
      <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", mb: 2 }}>
        💡 {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {strengths.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#16a34a" }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>
                Identified Strengths
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: "#14532d", fontSize: "13px" }}>
              {strengths.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </Box>
          </Box>
        )}

        {weaknesses.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              bgcolor: "#fff1f2",
              border: "1px solid #fecdd3",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <WarningAmberIcon sx={{ fontSize: 18, color: "#e11d48" }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#9f1239" }}>
                Identified Weaknesses
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: "#881337", fontSize: "13px" }}>
              {weaknesses.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </Box>
          </Box>
        )}

        {improvedAreas.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              bgcolor: "#f0f9ff",
              border: "1px solid #bae6fd",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: "#0284c7" }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0369a1" }}>
                Areas for Improvement
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: "#0c4a6e", fontSize: "13px" }}>
              {improvedAreas.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </Box>
          </Box>
        )}

        {suggestions.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <TipsAndUpdatesIcon sx={{ fontSize: 18, color: "#16a34a" }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>
                Actionable Suggestions
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: "#14532d", fontSize: "13px" }}>
              {suggestions.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GrammarErrorHighlighter;
