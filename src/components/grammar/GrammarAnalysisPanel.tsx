import React from "react";
import { Box, Typography, CircularProgress, Button, Alert } from "@mui/material";
import { Refresh as RefreshIcon, AutoFixHigh as AutoFixHighIcon } from "@mui/icons-material";
import type { GrammarCheckResponse } from "../../types/Grammar.types";
import GrammarScoreCard from "./GrammarScoreCard";
import GrammarErrorHighlighter from "./GrammarErrorHighlighter";

interface GrammarAnalysisPanelProps {
  originalText?: string;
  grammarData?: GrammarCheckResponse | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}

export const GrammarAnalysisPanel: React.FC<GrammarAnalysisPanelProps> = ({
  originalText = "",
  grammarData,
  isLoading = false,
  error = null,
  onRetry,
  title = "Grammar & Quality Assessment",
  compact = false,
}) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: "12px",
          bgcolor: "#f8fafc",
          border: "1px dashed #cbd5e1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          my: 2,
        }}
        aria-live="polite"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={22} sx={{ color: "#2563eb" }} />
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
            Analyzing your answer...
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
          Evaluating grammar, spelling, sentence structure, and vocabulary.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="info"
        sx={{ my: 2, borderRadius: "10px", fontSize: "13px" }}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={onRetry}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Retry
            </Button>
          )
        }
      >
        {error || "Grammar evaluation is temporarily unavailable for this response."}
      </Alert>
    );
  }

  if (!grammarData) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
      <GrammarScoreCard grammarData={grammarData} title={title} compact={compact} />

      <GrammarErrorHighlighter
        originalText={originalText}
        errors={grammarData.errors}
        grammarData={grammarData}
        title="Feedback & Actionable Suggestions"
      />
    </Box>
  );
};

export default GrammarAnalysisPanel;
