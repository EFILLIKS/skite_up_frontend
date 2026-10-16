import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Popover,
  TextField,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";

import Card from "../../components/common/Card";
import Dialog from "../../components/common/Dialog";
import AppSkeleton from "../../components/common/Skeleton";

import {
  useGetStudentAssessmentsQuery,
  useLazyGetAssessmentResultQuery,
} from "../../features/assessment/AssessmentApi";
import type {
  StudentAssessmentItem,
  StudentTestResultData,
} from "../../types/Assessment.types";

export const StudentResultPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("All Type");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [dateAnchorEl, setDateAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [page, setPage] = useState<number>(0);
  const pageSize = 10;
  const [jumpPage, setJumpPage] = useState<string>("1");

  const [selectedAssessment, setSelectedAssessment] =
    useState<StudentAssessmentItem | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [detailedResultData, setDetailedResultData] =
    useState<StudentTestResultData | null>(null);

  const [triggerGetResult, { isLoading: isFetchingDetailedResult }] =
    useLazyGetAssessmentResultQuery();

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentAssessmentsQuery({
    search: searchQuery.trim() || undefined,
    status: "completed",
    page,
    size: pageSize,
  });

  const data = responseData?.data;
  const rawList: StudentAssessmentItem[] =
    data?.content || data?.assessments?.content || [];
  const totalElements =
    data?.totalElements ?? data?.assessments?.totalElements ?? rawList.length;
  const totalPages =
    data?.totalPages ??
    data?.assessments?.totalPages ??
    Math.max(1, Math.ceil(totalElements / pageSize));

  const assessmentsList = React.useMemo(() => {
    return rawList.filter((item) => {
      if (typeFilter !== "All Type") {
        const catStr = (
          item.categories ||
          item.categoryList?.join(" ") ||
          ""
        ).toLowerCase();
        if (!catStr.includes(typeFilter.toLowerCase())) return false;
      }
      if (dateFilter) {
        const timeStr = (item.timeDisplay || item.opensAt || "").toLowerCase();
        if (!timeStr.includes(dateFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [rawList, typeFilter, dateFilter]);

  useEffect(() => {
    setJumpPage(String(page + 1));
  }, [page]);

  const handleJumpPage = () => {
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p - 1);
    } else {
      setJumpPage(String(page + 1));
    }
  };

  const navigate = useNavigate();

  const handleViewResult = (item: StudentAssessmentItem) => {
    const targetId =
      item.studentAssignmentId ||
      item.assignmentId ||
      item.assessmentId ||
      "906826ef-1a08-4e3b-8f08-cd8bc2d2a9a5";
    navigate(`/student/result/${targetId}`);
  };

  const startRange = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRange = Math.min((page + 1) * pageSize, totalElements);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, color: "#101828", fontSize: { xs: "22px", md: "26px" } }}
          >
            Assessments
          </Typography>
          <Typography variant="body2" sx={{ color: "#667085", mt: 0.5, fontSize: "14px" }}>
            Analyse assigned work and manage
          </Typography>
        </Box>

        <IconButton
          onClick={() => refetch()}
          title="Refresh Results"
          disabled={isFetching}
          sx={{ border: "1px solid #eaecf0", borderRadius: "8px", bgcolor: "#ffffff" }}
        >
          <RefreshIcon sx={{ fontSize: 20, color: "#667085" }} />
        </IconButton>
      </Box>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          sx={{ mb: 3, borderRadius: "10px" }}
        >
          Failed to load completed assessments. Please retry.
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 440 },
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            px: 2,
            py: 0.85,
            bgcolor: "#ffffff",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&:focus-within": {
              borderColor: "#2563eb",
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
            },
          }}
        >
          <SearchIcon sx={{ color: "#98a2b3", fontSize: 20, mr: 1.25 }} />
          <InputBase
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by Test name, Date, Batch ..."
            sx={{
              flex: 1,
              fontSize: "13.5px",
              color: "#101828",
              "& input::placeholder": {
                color: "#98a2b3",
                opacity: 1,
              },
            }}
          />
          {searchQuery && (
            <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.25 }}>
              <CloseIcon fontSize="small" sx={{ color: "#98a2b3" }} />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Select
            size="small"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            sx={{
              height: 38,
              borderRadius: "8px",
              bgcolor: "#ffffff",
              fontSize: "13px",
              fontWeight: 500,
              color: "#344054",
              minWidth: 120,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e2e8f0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#cbd5e1",
              },
            }}
          >
            <MenuItem value="All Type">All Type</MenuItem>
            <MenuItem value="MCQ">MCQ</MenuItem>
            <MenuItem value="LSRW">LSRW</MenuItem>
            <MenuItem value="Coding">Coding</MenuItem>
          </Select>

          <Button
            variant="outlined"
            onClick={(e) => setDateAnchorEl(e.currentTarget)}
            startIcon={<CalendarTodayOutlinedIcon sx={{ fontSize: "16px !important", color: "#64748b" }} />}
            sx={{
              height: 38,
              borderRadius: "8px",
              bgcolor: "#ffffff",
              borderColor: dateFilter ? "#2563eb" : "#e2e8f0",
              color: dateFilter ? "#2563eb" : "#344054",
              fontSize: "13px",
              fontWeight: 500,
              textTransform: "none",
              px: 2,
              "&:hover": {
                borderColor: "#cbd5e1",
                bgcolor: "#f8fafc",
              },
            }}
          >
            {dateFilter || "Date and Time"}
          </Button>

          <Popover
            open={Boolean(dateAnchorEl)}
            anchorEl={dateAnchorEl}
            onClose={() => setDateAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { p: 2, width: 260, borderRadius: "10px", mt: 1 } }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#101828", mb: 1.5 }}>
              Filter by Date
            </Typography>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  setDateFilter("");
                  setDateAnchorEl(null);
                }}
                sx={{ textTransform: "none", color: "#64748b" }}
              >
                Clear
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => setDateAnchorEl(null)}
                sx={{ bgcolor: "#2563eb", textTransform: "none" }}
              >
                Apply
              </Button>
            </Box>
          </Popover>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {isLoading || isFetching ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <AppSkeleton
              key={idx}
              variant="rectangular"
              height={108}
              sx={{ borderRadius: "12px" }}
            />
          ))
        ) : assessmentsList.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: "1px dashed #eaecf0",
              borderRadius: "12px",
              bgcolor: "#ffffff",
              p: 6,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <AssignmentTurnedInIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#101828", mb: 0.5 }}>
              No completed assessments
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#667085", mb: 2 }}>
              There are no completed test records found matching the filter criteria.
            </Typography>
            {(searchQuery || typeFilter !== "All Type" || dateFilter) && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("All Type");
                  setDateFilter("");
                  setPage(0);
                }}
                sx={{ textTransform: "none", fontSize: "13px", borderRadius: "6px" }}
              >
                Reset Filters
              </Button>
            )}
          </Card>
        ) : (
          assessmentsList.map((item, idx) => (
            <Card
              key={item.studentAssignmentId || item.assignmentId || idx}
              elevation={0}
              sx={{
                border: "1px solid #eaecf0",
                borderRadius: "12px",
                bgcolor: "#ffffff",
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.03)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 14px rgba(16, 24, 40, 0.06)",
                  borderColor: "#d0d5dd",
                },
              }}
              contentSx={{
                p: { xs: "18px 20px", sm: "20px 24px" },
                "&:last-child": { pb: { xs: "18px", sm: "20px" } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 260 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.85,
                      mb: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: item.statusColor || "#64748B",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: item.statusColor || "#64748B",
                      }}
                    >
                      {item.status || "Completed"}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#101828",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "#667085",
                      mt: 0.5,
                    }}
                  >
                    {item.categories || item.categoryList?.join(" . ") || "MCQ . LSRW . Coding"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "#667085",
                      mt: 0.35,
                    }}
                  >
                    {item.timeDisplay || "16 Apr 2025 . 9:00am"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    variant="contained"
                    onClick={() => handleViewResult(item)}
                    sx={{
                      bgcolor: "#2563eb",
                      color: "#ffffff",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "13.5px",
                      borderRadius: "6px",
                      px: 3.5,
                      py: 0.75,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#1d4ed8",
                        boxShadow: "0 2px 6px rgba(37, 99, 235, 0.2)",
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </Box>
            </Card>
          ))
        )}
      </Box>

      {totalElements > 0 && (
        <Box
          sx={{
            mt: 4,
            pt: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "#667085", fontWeight: 500 }}>
            {startRange} - {endRange} of {totalElements}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage(0)}
              sx={{ color: page === 0 ? "#cbd5e1" : "#475467" }}
              title="First Page"
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              sx={{ color: page === 0 ? "#cbd5e1" : "#475467" }}
              title="Previous Page"
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              sx={{ color: page >= totalPages - 1 ? "#cbd5e1" : "#475467" }}
              title="Next Page"
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              sx={{ color: page >= totalPages - 1 ? "#cbd5e1" : "#475467" }}
              title="Last Page"
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "13px", color: "#667085", fontWeight: 500 }}>
              Page
            </Typography>
            <Box
              component="input"
              type="text"
              value={jumpPage}
              onChange={(e: any) => setJumpPage(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") handleJumpPage();
              }}
              sx={{
                width: 38,
                height: 28,
                textAlign: "center",
                borderRadius: "4px",
                border: "1px solid #d0d5dd",
                fontSize: "13px",
                color: "#101828",
                outline: "none",
                "&:focus": { borderColor: "#2563eb" },
              }}
            />
            <Typography
              component="button"
              onClick={handleJumpPage}
              sx={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#2563eb",
                p: 0,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Go
            </Typography>
          </Box>
        </Box>
      )}

      <Dialog
        open={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={selectedAssessment?.title || "Assessment Result"}
        maxWidth="md"
        actions={
          <Button
            variant="contained"
            onClick={() => setResultModalOpen(false)}
            sx={{ bgcolor: "#2563eb", textTransform: "none", borderRadius: "6px" }}
          >
            Close
          </Button>
        }
      >
        {isFetchingDetailedResult ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5, gap: 1.5 }}>
            <CircularProgress size={36} sx={{ color: "#2563eb" }} />
            <Typography sx={{ fontSize: "13px", color: "#64748b" }}>Loading detailed score breakdown...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: "12px",
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: "#16a34a" }} />
                <Box>
                  <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#166534" }}>
                    Test Completed & Graded
                  </Typography>
                  <Typography sx={{ fontSize: "12.5px", color: "#15803d" }}>
                    {selectedAssessment?.timeDisplay || "Evaluated by SkiteUp Assessment Engine"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography sx={{ fontSize: "13px", color: "#166534", fontWeight: 600 }}>Score:</Typography>
                <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#15803d" }}>
                  {detailedResultData?.score !== undefined
                    ? Number(detailedResultData.score).toFixed(2)
                    : selectedAssessment?.score !== undefined && selectedAssessment?.score !== null
                    ? Number(selectedAssessment.score).toFixed(2)
                    : "116.00"}
                  <Typography component="span" sx={{ fontSize: "14px", color: "#4ade80", ml: 0.5 }}>
                    / {detailedResultData?.totalMarks !== undefined ? Number(detailedResultData.totalMarks).toFixed(2) : "135.00"}
                  </Typography>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
              <Box sx={{ p: 2, borderRadius: "8px", border: "1px solid #eaecf0", bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Percentage</Typography>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#16a34a", mt: 0.5 }}>
                  {detailedResultData?.percentage !== undefined
                    ? `${Number(detailedResultData.percentage).toFixed(1)}%`
                    : selectedAssessment?.percentage !== undefined && selectedAssessment?.percentage !== null
                    ? `${Number(selectedAssessment.percentage).toFixed(1)}%`
                    : "85.9%"}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: "8px", border: "1px solid #eaecf0", bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Accuracy</Typography>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#0284c7", mt: 0.5 }}>
                  {detailedResultData?.accuracyPercentage !== undefined
                    ? `${Number(detailedResultData.accuracyPercentage).toFixed(1)}%`
                    : "80.0%"}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: "8px", border: "1px solid #eaecf0", bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Total Questions</Typography>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#101828", mt: 0.5 }}>
                  {selectedAssessment?.totalQuestions || detailedResultData?.totalQuestions || 11}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: "8px", border: "1px solid #eaecf0", bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Duration</Typography>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#101828", mt: 0.5 }}>
                  {selectedAssessment?.durationMinutes || 8} mins
                </Typography>
              </Box>
            </Box>

            {detailedResultData?.sectionBreakdowns && detailedResultData.sectionBreakdowns.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828", mb: 1.5 }}>
                  Section Breakdown
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
                  {detailedResultData.sectionBreakdowns.map((sec, sIdx) => (
                    <Box
                      key={sec.sectionName || sIdx}
                      sx={{
                        p: 2,
                        borderRadius: "8px",
                        border: "1px solid #eaecf0",
                        bgcolor: "#ffffff",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#101828" }}>
                          {sec.sectionName}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${Number(sec.percentage).toFixed(0)}%`}
                          sx={{
                            bgcolor: Number(sec.percentage) >= 70 ? "#ecfdf3" : "#fff7ed",
                            color: Number(sec.percentage) >= 70 ? "#16a34a" : "#ea580c",
                            fontWeight: 700,
                            fontSize: "10.5px",
                            height: 20,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                        Score: <strong>{Number(sec.score).toFixed(2)}</strong> / {Number(sec.totalMarks).toFixed(2)}
                      </Typography>
                      <Typography sx={{ fontSize: "11.5px", color: "#94a3b8", mt: 0.5 }}>
                        Correct: {sec.correctQuestions} / {sec.totalQuestions}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentResultPage;
