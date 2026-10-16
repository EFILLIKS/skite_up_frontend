import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Button from "../../../components/common/Button";
import {
  DateTimePickerInput,
  formatToDateTimeString,
  parseDateTimeString,
} from "./DateTimePickerInput";
import {
  useGetUnattendedStudentsQuery,
  useReassignAssessmentMutation,
} from "../../../features/assessment/AssessmentApi";

interface AssessmentReassignModalProps {
  open: boolean;
  assignmentId: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const getDefaultDates = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  return {
    opens: formatToDateTimeString(y, m, d, 10, 0, "AM"),
    closes: formatToDateTimeString(y, m, d, 6, 0, "PM"),
  };
};

export const AssessmentReassignModal: React.FC<AssessmentReassignModalProps> = ({
  open,
  assignmentId,
  onClose,
  onSuccess,
  onError,
}) => {
  const {
    data: unattendedRes,
    isLoading: isFetchingStudents,
    refetch,
  } = useGetUnattendedStudentsQuery(assignmentId || "", {
    skip: !open || !assignmentId,
  });

  const [reassignMutation, { isLoading: isSubmitting }] = useReassignAssessmentMutation();

  const [opensAt, setOpensAt] = useState<string>(() => getDefaultDates().opens);
  const [closesAt, setClosesAt] = useState<string>(() => getDefaultDates().closes);

  useEffect(() => {
    if (open) {
      const defaults = getDefaultDates();
      setOpensAt(defaults.opens);
      setClosesAt(defaults.closes);
      if (assignmentId) refetch();
    }
  }, [open, assignmentId, refetch]);

  const studentData = unattendedRes?.data;

  const handleConfirmReassign = async () => {
    if (!assignmentId) return;
    if (!opensAt.trim() || !closesAt.trim()) {
      onError("Please specify opening and closing times");
      return;
    }

    try {
      const res = await reassignMutation({
        assignmentId,
        body: {
          opensAt: opensAt.trim(),
          closesAt: closesAt.trim(),
        },
      }).unwrap();

      onSuccess(res?.message || "Assessment reassigned successfully to unattended students!");
      onClose();
    } catch (err: any) {
      onError(err?.data?.message || err?.message || "Failed to execute reassign workflow");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            boxShadow: "0 20px 40px rgba(16, 24, 40, 0.15)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eaecf0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "#eff8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1570ef",
            }}
          >
            <RefreshRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#101828", fontSize: "16px" }}>
              Reassign Assessment
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085" }}>
              {studentData?.testName || "Unattended Students Only"}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <CloseRoundedIcon fontSize="small" sx={{ color: "#667085" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {isFetchingStudents ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={32} sx={{ color: "#1570ef" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Alert severity="info" sx={{ borderRadius: "8px", fontSize: "13px" }}>
              This action will <strong>only reassign</strong> the assessment to students who did not attend. Already attended students will be safely excluded.
            </Alert>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "8px",
                  bgcolor: "#f9fafb",
                  border: "1px solid #eaecf0",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "#667085" }}>
                  Total Assigned
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", mt: 0.5 }}>
                  {studentData?.totalAssigned ?? 0}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "8px",
                  bgcolor: "#ecfdf3",
                  border: "1px solid #a6f4c5",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "#027a48" }}>
                  Attended (Excluded)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#027a48", mt: 0.5 }}>
                  {studentData?.attendedCount ?? 0}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "8px",
                  bgcolor: "#eff8ff",
                  border: "1px solid #b2ddff",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "#175cd3" }}>
                  Eligible for Reassign
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#175cd3", mt: 0.5 }}>
                  {studentData?.unattendedCount ?? 0}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <DateTimePickerInput
                label="Opens At"
                value={opensAt}
                onChange={(val) => {
                  setOpensAt(val);
                  const openP = parseDateTimeString(val);
                  const closeP = parseDateTimeString(closesAt);
                  const openH = openP.ampm === "PM" && openP.hour12 !== 12 ? openP.hour12 + 12 : openP.ampm === "AM" && openP.hour12 === 12 ? 0 : openP.hour12;
                  const closeH = closeP.ampm === "PM" && closeP.hour12 !== 12 ? closeP.hour12 + 12 : closeP.ampm === "AM" && closeP.hour12 === 12 ? 0 : closeP.hour12;
                  const openD = new Date(openP.year, openP.month, openP.day, openH, openP.minute);
                  const closeD = new Date(closeP.year, closeP.month, closeP.day, closeH, closeP.minute);
                  if (closeD <= openD) {
                    setClosesAt(formatToDateTimeString(openP.year, openP.month, openP.day, 6, 0, "PM"));
                  }
                }}
                placeholder="DD-MM-YYYY 10:00 AM"
                disabled={isSubmitting}
                disablePast={true}
              />

              <DateTimePickerInput
                label="Closes At"
                value={closesAt}
                onChange={setClosesAt}
                placeholder="DD-MM-YYYY 06:00 PM"
                disabled={isSubmitting}
                minDate={opensAt}
                disablePast={true}
              />
            </Box>

            {studentData?.unattendedStudents && studentData.unattendedStudents.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 1, display: "block" }}>
                  Unattended Students ({studentData.unattendedStudents.length}):
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.8,
                    maxHeight: 140,
                    overflowY: "auto",
                    p: 1.5,
                    bgcolor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #eaecf0",
                  }}
                >
                  {studentData.unattendedStudents.map((s) => (
                    <Chip
                      key={s.studentId}
                      label={`${s.studentName} (${s.registerNumber})`}
                      size="small"
                      sx={{
                        fontSize: "12px",
                        bgcolor: "#ffffff",
                        border: "1px solid #d0d5dd",
                        color: "#344054",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #eaecf0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="text" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmReassign}
          disabled={isSubmitting || isFetchingStudents}
          sx={{
            bgcolor: "#1570ef",
            "&:hover": { bgcolor: "#175cd3" },
            px: 2.5,
          }}
        >
          {isSubmitting ? "Reassigning..." : "Execute Reassign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentReassignModal;
