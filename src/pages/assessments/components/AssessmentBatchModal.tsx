import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Button from "../../../components/common/Button";
import {
  DateTimePickerInput,
  formatToDateTimeString,
  parseDateTimeString,
} from "./DateTimePickerInput";
import {
  useGetBatchesQuery,
  useAssignAssessmentMutation,
  useGetAssessmentTemplatesQuery,
} from "../../../features/assessment/AssessmentApi";
import type { AssessmentTemplateItem, BatchSummaryItem } from "../../../types/Assessment.types";

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

interface AssessmentBatchModalProps {
  open: boolean;
  onClose: () => void;
  preselectedAssessmentId?: string;
  preselectedAssessmentTitle?: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const AssessmentBatchModal: React.FC<AssessmentBatchModalProps> = ({
  open,
  onClose,
  preselectedAssessmentId,
  preselectedAssessmentTitle,
  onSuccess,
  onError,
}) => {
  const { data: batchesRes, isLoading: isFetchingBatches } = useGetBatchesQuery(undefined, {
    skip: !open,
  });

  const { data: templatesRes } = useGetAssessmentTemplatesQuery(undefined, {
    skip: !open,
  });

  const [assignMutation, { isLoading: isAssigning }] = useAssignAssessmentMutation();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [opensAt, setOpensAt] = useState<string>(() => getDefaultDates().opens);
  const [closesAt, setClosesAt] = useState<string>(() => getDefaultDates().closes);
  const [selectedBatchKeys, setSelectedBatchKeys] = useState<string[]>([]);

  const templates: AssessmentTemplateItem[] = React.useMemo(() => {
    const raw = templatesRes?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).content)) return (raw as any).content;
    return [];
  }, [templatesRes]);

  const batchesList: BatchSummaryItem[] = React.useMemo(() => {
    if (batchesRes?.data && Array.isArray(batchesRes.data)) {
      return batchesRes.data;
    }
    return [];
  }, [batchesRes]);

  const getBatchKey = React.useCallback((b: BatchSummaryItem, index: number): string => {
    const rawId = (b as any).id ?? (b as any).batchId;
    if (rawId !== undefined && rawId !== null && String(rawId).trim() !== "") {
      return String(rawId);
    }
    if (b.batch && b.department) {
      return `${b.batch} - ${b.department}`;
    }
    if (b.department) {
      return b.department;
    }
    if (b.displayText) {
      return b.displayText;
    }
    return `${b.batch || "batch"}-${index}`;
  }, []);

  const allKeys = React.useMemo(() => {
    return batchesList.map((b, idx) => getBatchKey(b, idx));
  }, [batchesList, getBatchKey]);

  useEffect(() => {
    if (open) {
      if (preselectedAssessmentId) {
        setSelectedAssessmentId(preselectedAssessmentId);
      } else if (templates.length > 0) {
        setSelectedAssessmentId(templates[0].id);
      } else {
        setSelectedAssessmentId("");
      }
      setSelectedBatchKeys([]);
      const defaults = getDefaultDates();
      setOpensAt(defaults.opens);
      setClosesAt(defaults.closes);
    }
  }, [open, preselectedAssessmentId, templates]);

  const toggleBatch = (key: string) => {
    setSelectedBatchKeys((prev) =>
      prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key]
    );
  };

  const allSelected = allKeys.length > 0 && selectedBatchKeys.length === allKeys.length;
  const someSelected = selectedBatchKeys.length > 0 && selectedBatchKeys.length < allKeys.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedBatchKeys([]);
    } else {
      setSelectedBatchKeys(allKeys);
    }
  };

  const handlePublish = async () => {
    const aid = selectedAssessmentId || preselectedAssessmentId;
    if (!aid) {
      onError("Please select an assessment to assign");
      return;
    }
    if (selectedBatchKeys.length === 0) {
      onError("Please select at least one batch");
      return;
    }
    if (!opensAt.trim() || !closesAt.trim()) {
      onError("Please specify opening and closing times");
      return;
    }

    const selectedBatchValues = selectedBatchKeys.map((key) => {
      const idx = batchesList.findIndex((b, i) => getBatchKey(b, i) === key);
      if (idx !== -1) {
        const b = batchesList[idx];
        const rawId = (b as any).id ?? (b as any).batchId;
        if (rawId !== undefined && rawId !== null && String(rawId).trim() !== "") {
          return String(rawId);
        }
        if (b.batch && b.department) {
          return `${b.batch} - ${b.department}`;
        }
        return b.batch || key;
      }
      return key;
    });

    try {
      const res = await assignMutation({
        assessmentId: aid,
        opensAt: opensAt.trim(),
        closesAt: closesAt.trim(),
        batches: selectedBatchValues,
      }).unwrap();

      onSuccess(res?.message || "Assessment successfully assigned to batches!");
      onClose();
    } catch (err: any) {
      onError(err?.data?.message || err?.message || "Failed to assign assessment to batches");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isAssigning ? undefined : onClose}
      maxWidth="md"
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
          px: 3.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eaecf0",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "17px" }}>
          Select Assessment
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={isAssigning}>
          <CloseRoundedIcon fontSize="small" sx={{ color: "#667085" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}>
              Select Assessment
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  bgcolor: "#ffffff",
                }}
              >
                {preselectedAssessmentId && (
                  <MenuItem value={preselectedAssessmentId}>
                    {preselectedAssessmentTitle || "Selected Assessment"}
                  </MenuItem>
                )}
                {templates.map((tpl) => (
                  <MenuItem key={tpl.id} value={tpl.id}>
                    {tpl.testName}
                  </MenuItem>
                ))}
                {!preselectedAssessmentId && templates.length === 0 && (
                  <MenuItem value="" disabled>No templates available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <DateTimePickerInput
              label="Opens"
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
              disabled={isAssigning}
              disablePast={true}
            />

            <DateTimePickerInput
              label="Closes"
              value={closesAt}
              onChange={setClosesAt}
              placeholder="DD-MM-YYYY 06:00 PM"
              disabled={isAssigning}
              minDate={opensAt}
              disablePast={true}
            />
          </Box>

          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054" }}>
                Batches
              </Typography>
              {!isFetchingBatches && batchesList.length > 0 && (
                <Box
                  onClick={handleSelectAll}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    sx={{
                      p: 0,
                      color: "#d0d5dd",
                      "&.Mui-checked": { color: "#1570ef" },
                      "&.MuiCheckbox-indeterminate": { color: "#1570ef" },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#1570ef", fontSize: "12.5px" }}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Typography>
                </Box>
              )}
            </Box>

            {isFetchingBatches ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} sx={{ color: "#1570ef" }} />
              </Box>
            ) : batchesList.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center", color: "#667085" }}>
                <Typography variant="body2">No batches found from API.</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {batchesList.map((b, idx) => {
                  const key = getBatchKey(b, idx);
                  const isChecked = selectedBatchKeys.includes(key);
                  return (
                    <Box
                      key={key}
                      onClick={() => toggleBatch(key)}
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: isChecked ? "#1570ef" : "#eaecf0",
                        bgcolor: isChecked ? "#f8faff" : "#ffffff",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        "&:hover": {
                          borderColor: "#1570ef",
                          bgcolor: "#f8faff",
                        },
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleBatch(key)}
                        sx={{
                          p: 0,
                          mt: 0.2,
                          color: "#d0d5dd",
                          "&.Mui-checked": { color: "#1570ef" },
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#101828",
                            fontSize: "13px",
                            lineHeight: 1.3,
                          }}
                        >
                          {b.displayText || `${b.batch} · ${b.studentCount} students`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#667085", fontSize: "12px" }}>
                          {b.department}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3.5,
          py: 2,
          borderTop: "1px solid #eaecf0",
          display: "flex",
          justifyContent: "space-between",
          bgcolor: "#ffffff",
        }}
      >
        <Button variant="text" onClick={onClose} disabled={isAssigning}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePublish}
          disabled={isAssigning || selectedBatchKeys.length === 0}
          sx={{
            bgcolor: "#1570ef",
            "&:hover": { bgcolor: "#175cd3" },
            px: 3,
            fontWeight: 600,
          }}
        >
          {isAssigning ? "Publishing..." : "Publish"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentBatchModal;
