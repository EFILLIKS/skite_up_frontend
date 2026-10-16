import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Dialog from "../../../components/common/Dialog";
import Button from "../../../components/common/Button";
import type { QuestionBankItem } from "../../../types/QuestionBank.types";

interface QuestionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  question: QuestionBankItem | null;
  onEdit?: (question: QuestionBankItem) => void;
}

export const QuestionDetailDialog: React.FC<QuestionDetailDialogProps> = ({
  open,
  onClose,
  question,
  onEdit,
}) => {
  if (!question) return null;

  const isEasy = question.difficulty?.toUpperCase() === "EASY";
  const isMedium = question.difficulty?.toUpperCase() === "MEDIUM";
  const isPublished = question.status?.toUpperCase() === "PUBLISHED";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Question Details"
      description={`ID: ${question.id}`}
      maxWidth="md"
      showCloseButton
      contentSx={{
        px: { xs: 2.5, sm: 3.5 },
        py: 2.5,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
      actions={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            pt: 1.5,
            borderTop: "1px solid #f2f4f7",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#344054",
              borderColor: "#d0d5dd",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
            }}
          >
            Close
          </Button>

          {onEdit && (
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                onEdit(question);
              }}
              sx={{
                bgcolor: "#1570ef",
                color: "#ffffff",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
                px: 3,
                "&:hover": { bgcolor: "#175cd3" },
              }}
            >
              Edit Question
            </Button>
          )}
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={question.category || "MCQ"}
            size="small"
            sx={{ bgcolor: "#eff8ff", color: "#175cd3", fontWeight: 700, borderRadius: "6px" }}
          />

          <Chip
            label={question.questionType || "Single choice"}
            size="small"
            sx={{ bgcolor: "#f2f4f7", color: "#344054", fontWeight: 600, borderRadius: "6px" }}
          />

          <Chip
            label={question.difficulty || "Easy"}
            size="small"
            sx={{
              bgcolor: isEasy ? "#ecfdf3" : isMedium ? "#fffaeb" : "#fef3f2",
              color: isEasy ? "#16a34a" : isMedium ? "#b54708" : "#d92d20",
              fontWeight: 600,
              borderRadius: "6px",
            }}
          />

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              borderRadius: "16px",
              bgcolor: isPublished ? "#ecfdf3" : "#f2f4f7",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isPublished ? "#16a34a" : "#667085",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: isPublished ? "#16a34a" : "#475467",
              }}
            >
              {isPublished ? "Published" : "Draft"}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: "#667085", ml: "auto" }}>
            {question.usedInTestsDisplay || `Used in ${question.usedInTests || 0} tests`}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#667085", fontWeight: 600, textTransform: "uppercase" }}>
            Question
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "#101828",
              mt: 0.75,
              lineHeight: 1.6,
              fontSize: "16px",
            }}
          >
            {question.questionText}
          </Typography>
        </Box>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" },
            gap: 2,
            p: 2,
            bgcolor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #eaecf0",
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "#667085", display: "block" }}>
              Skill
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", mt: 0.25 }}>
              {question.skill || question.skillName || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#667085", display: "block" }}>
              Topic
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", mt: 0.25 }}>
              {question.topic || question.topicName || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#667085", display: "block" }}>
              Marks
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", mt: 0.25 }}>
              {question.marksDisplay || `${question.marks} / ${question.negativeMarks}`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#667085", display: "block" }}>
              Created By
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", mt: 0.25 }}>
              {question.createdBy || question.createdByName || "-"}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#344054", mb: 1.5 }}>
            Options ({question.options?.length || 0})
          </Typography>

          <Stack spacing={1.5}>
            {question.options?.map((opt, idx) => (
              <Box
                key={opt.id || idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: "8px",
                  bgcolor: opt.isCorrect ? "#f6fef9" : "#ffffff",
                  border: opt.isCorrect ? "1.5px solid #a6f4c5" : "1px solid #eaecf0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: opt.isCorrect ? "#16a34a" : "#f2f4f7",
                      color: opt.isCorrect ? "#ffffff" : "#475467",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {opt.optionKey}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: opt.isCorrect ? "#027a48" : "#344054",
                      fontWeight: opt.isCorrect ? 600 : 500,
                    }}
                  >
                    {opt.optionText}
                  </Typography>
                </Box>

                {opt.isCorrect && (
                  <Chip
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: "16px !important", color: "#16a34a" }} />}
                    label="Correct Answer"
                    size="small"
                    sx={{
                      bgcolor: "#ecfdf3",
                      color: "#16a34a",
                      fontWeight: 600,
                      fontSize: 11,
                      borderRadius: "6px",
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        </Box>

        {question.explanation && (
          <Box
            sx={{
              p: 2,
              bgcolor: "#eff8ff",
              borderRadius: "8px",
              border: "1px solid #b2ddff",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#175cd3", display: "block", mb: 0.5 }}>
              Explanation
            </Typography>
            <Typography variant="body2" sx={{ color: "#1e40af", lineHeight: 1.5 }}>
              {question.explanation}
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default QuestionDetailDialog;
