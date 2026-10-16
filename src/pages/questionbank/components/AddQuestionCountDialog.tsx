import React from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import Dialog from "../../../components/common/Dialog";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

interface AddQuestionCountDialogProps {
  open: boolean;
  onClose: () => void;
  count: number;
  onCountChange: (newCount: number) => void;
  error?: string;
  onContinue: () => void;
}

export const AddQuestionCountDialog: React.FC<AddQuestionCountDialogProps> = ({
  open,
  onClose,
  count,
  onCountChange,
  error,
  onContinue,
}) => {
  const presetCounts = [1, 3, 5, 10];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add Questions"
      description="Enter the number of questions you want to create in this batch. You will configure each question sequentially."
      maxWidth="xs"
      showCloseButton
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, width: "100%", pt: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#344054",
              borderColor: "#d0d5dd",
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              "&:hover": { borderColor: "#98a2b3", bgcolor: "#f8f9fa" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onContinue}
            sx={{
              bgcolor: "#1570ef",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              "&:hover": { bgcolor: "#175cd3" },
            }}
          >
            Continue
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "#eff8ff", borderRadius: 2, border: "1px solid #b2ddff" }}>
          <HelpOutlineRoundedIcon sx={{ color: "#175cd3", fontSize: 24 }} />
          <Typography variant="body2" sx={{ color: "#175cd3", fontWeight: 500, lineHeight: 1.4 }}>
            You will cycle through each question form with <strong>&lt;&lt; Prev</strong> and <strong>Next &gt;&gt;</strong> controls, and a <strong>Publish</strong> button on the final question.
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#344054", fontWeight: 600, mb: 1, display: "block" }}>
            Number of questions to add *
          </Typography>

          <Input
            type="number"
            label=""
            textFieldProps={{
              value: count,
              onChange: (e) => onCountChange(Math.max(1, parseInt(e.target.value) || 1)),
              placeholder: "e.g. 5",
              error: Boolean(error),
              helperText: error || "Enter between 1 and 50 questions",
              slotProps: {
                htmlInput: { min: 1, max: 50 },
              },
              sx: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#ffffff",
                },
              },
            }}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#667085", fontWeight: 500, mb: 1, display: "block" }}>
            Quick Select:
          </Typography>
          <Stack direction="row" spacing={1}>
            {presetCounts.map((preset) => (
              <Chip
                key={preset}
                label={`${preset} ${preset === 1 ? "Question" : "Questions"}`}
                onClick={() => onCountChange(preset)}
                variant={count === preset ? "filled" : "outlined"}
                sx={{
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: count === preset ? 600 : 500,
                  bgcolor: count === preset ? "#1570ef" : "transparent",
                  color: count === preset ? "#ffffff" : "#344054",
                  borderColor: count === preset ? "#1570ef" : "#d0d5dd",
                  "&:hover": {
                    bgcolor: count === preset ? "#175cd3" : "#f2f4f7",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddQuestionCountDialog;
