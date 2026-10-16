import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import Button from "../../../components/common/Button";
import {
  useGetAssessmentTemplatesQuery,
  useDeleteAssessmentTemplateMutation,
  useGetBatchesQuery,
} from "../../../features/assessment/AssessmentApi";
import type { AssessmentTemplateItem } from "../../../types/Assessment.types";
import AssessmentCreationWizard from "./AssessmentCreationWizard";
import AssessmentBatchModal from "./AssessmentBatchModal";
import Pagination from "../../../components/common/Pagination";

interface AssessmentAssignTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const AssessmentAssignTab: React.FC<AssessmentAssignTabProps> = ({
  onSuccess,
  onError,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All Batches");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments");
  const [selectedSection, setSelectedSection] = useState<string>("All Sections");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [assignAssessmentId, setAssignAssessmentId] = useState<string>("");
  const [assignAssessmentTitle, setAssignAssessmentTitle] = useState<string>("");

  const { data: batchesRes } = useGetBatchesQuery();

  const { data: templatesRes, isLoading, refetch } = useGetAssessmentTemplatesQuery({
    search: searchTerm.trim() || undefined,
  });

  const availableBatches = React.useMemo(() => {
    return (batchesRes?.data || []).map((b) => b.batch);
  }, [batchesRes]);

  const availableDepartments = React.useMemo(() => {
    const set = new Set((batchesRes?.data || []).map((b) => b.department).filter(Boolean));
    return Array.from(set);
  }, [batchesRes]);

  const [deleteTemplateMutation] = useDeleteAssessmentTemplateMutation();

  const templatesList: AssessmentTemplateItem[] = React.useMemo(() => {
    const raw = templatesRes?.data;
    const items = Array.isArray(raw)
      ? raw
      : raw && Array.isArray((raw as any).content)
        ? (raw as any).content
        : [];

    return items.map((item: any) => ({
      id: item.id || item.assessmentId || `tpl-${Math.random()}`,
      testName: item.testName || item.title || "Untitled Assessment",
      categories: Array.isArray(item.categories)
        ? item.categories
        : typeof item.categories === "string"
          ? item.categories.split(",").map((c: string) => c.trim())
          : [],
      categoriesDisplay:
        item.categoriesDisplay ||
        item.types ||
        (Array.isArray(item.categories)
          ? item.categories.join(", ")
          : typeof item.categories === "string"
            ? item.categories
            : "MCQ, LSRW, Coding"),
      marks: item.marks || item.totalMarks || 100,
      marksDisplay: item.marksDisplay || `${item.marks || 100} Total Mark`,
    }));
  }, [templatesRes]);

  React.useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedBatch, selectedDepartment, selectedSection]);

  const paginatedTemplates = React.useMemo(() => {
    const start = page * rowsPerPage;
    return templatesList.slice(start, start + rowsPerPage);
  }, [templatesList, page, rowsPerPage]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplateMutation(id).unwrap();
      onSuccess("Assessment template deleted successfully");
      refetch();
    } catch (err: any) {
      onError(err?.data?.message || "Failed to delete template");
    }
  };

  const handleOpenAssign = (template: AssessmentTemplateItem) => {
    setAssignAssessmentId(template.id);
    setAssignAssessmentTitle(template.testName);
    setBatchModalOpen(true);
  };

  const handleWizardFinish = (createdId: string, name: string) => {
    setIsWizardOpen(false);
    refetch();
    setAssignAssessmentId(createdId);
    setAssignAssessmentTitle(name);
    setBatchModalOpen(true);
  };

  if (isWizardOpen) {
    return (
      <AssessmentCreationWizard
        onCancel={() => setIsWizardOpen(false)}
        onFinishCreate={handleWizardFinish}
        onSuccess={onSuccess}
        onError={onError}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.5,
              py: 0.7,
              borderRadius: "16px",
              bgcolor: "#fffaf5",
              border: "1px solid #fedf89",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16, color: "#b54708" }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#b54708", fontSize: "13px" }}>
              Question Limits - 2000
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: "1 1 260px", maxWidth: 360 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Test name, Date, Batch ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: "#667085", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                bgcolor: "#ffffff",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "13px",
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#ffffff" }}
              >
                <MenuItem value="All Batches">Batch</MenuItem>
                {availableBatches.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#ffffff" }}
              >
                <MenuItem value="All Departments">Department</MenuItem>
                {availableDepartments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                sx={{ borderRadius: "8px", fontSize: "13px", bgcolor: "#ffffff" }}
              >
                <MenuItem value="All Sections">Section</MenuItem>
                <MenuItem value="Section A">Section A</MenuItem>
                <MenuItem value="Section B">Section B</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setIsWizardOpen(true)}
              sx={{
                bgcolor: "#1570ef",
                "&:hover": { bgcolor: "#175cd3" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13.5px",
                px: 2.2,
                py: 0.8,
              }}
            >
              Create new test
            </Button>
          </Box>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} sx={{ color: "#1570ef" }} />
        </Box>
      ) : templatesList.length === 0 ? (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #eaecf0",
            color: "#667085",
          }}
        >
          <Typography variant="body2">No test templates created yet. Click " Create new test" above.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {paginatedTemplates.map((tpl, idx) => {
            const isGreen = idx % 2 === 0;
            return (
              <Box
                key={tpl.id}
                sx={{
                  p: 2,
                  px: 2.5,
                  borderRadius: "10px",
                  border: "1px solid #eaecf0",
                  bgcolor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 24, 40, 0.06)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "8px",
                      bgcolor: isGreen ? "#ecfdf3" : "#fffaf5",
                      border: `1px solid ${isGreen ? "#a6f4c5" : "#fedf89"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isGreen ? "#12b76a" : "#f79009",
                      flexShrink: 0,
                    }}
                  >
                    <AssignmentOutlinedIcon fontSize="small" />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#101828", fontSize: "14px" }}>
                      {tpl.testName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#667085", fontSize: "12px" }}>
                      {tpl.categoriesDisplay ||
                        (Array.isArray(tpl.categories)
                          ? tpl.categories.join(", ")
                          : String(tpl.categories || "MCQ, LSRW, Coding"))}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#101828", fontSize: "14px" }}>
                      {tpl.marks ?? 100}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#667085", fontSize: "11px" }}>
                      Total Mark
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleOpenAssign(tpl)}
                    sx={{
                      fontSize: "12.5px",
                      borderRadius: "6px",
                      borderColor: "#b2ddff",
                      color: "#175cd3",
                      bgcolor: "#eff8ff",
                      "&:hover": { bgcolor: "#d1e9ff" },
                      textTransform: "none",
                      fontWeight: 600,
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    Assign
                  </Button>

                  <Tooltip title="Delete Template">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "6px",
                        border: "1px solid #fee4e2",
                        color: "#d92d20",
                        bgcolor: "#fef3f2",
                        "&:hover": { bgcolor: "#fee4e2" },
                      }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}

          {templatesList.length > 0 && (
            <Box sx={{ mt: 1, bgcolor: "#ffffff", borderRadius: "10px", border: "1px solid #eaecf0", overflow: "hidden" }}>
              <Pagination
                count={templatesList.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Rows per page:"
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    minHeight: 48,
                    px: 2,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontSize: 13,
                    color: "#475467",
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <AssessmentBatchModal
        open={batchModalOpen}
        preselectedAssessmentId={assignAssessmentId}
        preselectedAssessmentTitle={assignAssessmentTitle}
        onClose={() => {
          setBatchModalOpen(false);
          setAssignAssessmentId("");
          setAssignAssessmentTitle("");
        }}
        onSuccess={(msg) => {
          onSuccess(msg);
          refetch();
        }}
        onError={onError}
      />
    </Box>
  );
};

export default AssessmentAssignTab;
