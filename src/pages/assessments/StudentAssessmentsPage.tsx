import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Chip,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  KeyboardArrowLeftRounded as KeyboardArrowLeftRoundedIcon,
  KeyboardArrowRightRounded as KeyboardArrowRightRoundedIcon,
  KeyboardDoubleArrowLeftRounded as KeyboardDoubleArrowLeftRoundedIcon,
  KeyboardDoubleArrowRightRounded as KeyboardDoubleArrowRightRoundedIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import AppSkeleton from "../../components/common/Skeleton";
import type { SnackbarState } from "../../types/Snackbar.types";

import { useGetStudentAssessmentsQuery } from "../../features/assessment/AssessmentApi";
import type { StudentAssessmentItem } from "../../types/Assessment.types";

type StatusTab = "All" | "Live" | "Upcoming" | "Completed" | "Missed";

export const StudentAssessmentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("All");
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [jumpPage, setJumpPage] = useState<string>("1");

  const [selectedItemForDetails, setSelectedItemForDetails] =
    useState<StudentAssessmentItem | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentAssessmentsQuery({
    search: searchQuery.trim() || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    page,
    size: pageSize,
  });

  const data = responseData?.data;
  const filterCounts = data?.filterCounts;
  const assessmentsList: StudentAssessmentItem[] =
    data?.content || data?.assessments?.content || [];
  const totalElements = data?.totalElements ?? data?.assessments?.totalElements ?? assessmentsList.length;
  const totalPages = data?.totalPages ?? data?.assessments?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  React.useEffect(() => {
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

  const handleStartAssessment = (item: StudentAssessmentItem) => {
    if (!item.canStart) return;
    navigate(`/student/assessments/take/${item.assignmentId || item.assessmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "#22C55E";
      case "Upcoming":
        return "#F97316";
      case "Completed":
        return "#64748B";
      case "Missed":
        return "#EF4444";
      default:
        return "#667085";
    }
  };

  const statusTabs: Array<{ id: StatusTab; label: string; count: number }> = [
    { id: "All", label: "All", count: filterCounts?.all ?? totalElements },
    { id: "Live", label: "Live", count: filterCounts?.live ?? 0 },
    { id: "Upcoming", label: "Upcoming", count: filterCounts?.upcoming ?? 0 },
    { id: "Completed", label: "Completed", count: filterCounts?.completed ?? 0 },
  ];

  if ((filterCounts?.missed ?? 0) > 0) {
    statusTabs.push({ id: "Missed", label: "Missed", count: filterCounts?.missed ?? 0 });
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, color: "#101828", fontSize: { xs: "22px", md: "26px" } }}
          >
            Assessments
          </Typography>
          <Typography variant="body2" sx={{ color: "#667085", mt: 0.5, fontSize: "13.5px" }}>
            Analyse assigned work and manage
          </Typography>
        </Box>

        <IconButton
          onClick={() => refetch()}
          title="Refresh Assessments"
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
          Failed to retrieve student assessments. Please check your network and retry.
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 460 },
            border: "1px solid #e4e7ec",
            borderRadius: "24px",
            px: 2,
            py: 0.8,
            bgcolor: "#ffffff",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&:focus-within": {
              borderColor: "#2563eb",
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
            },
          }}
        >
          <SearchIcon sx={{ color: "#98a2b3", fontSize: 20, mr: 1 }} />
          <InputBase
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by Test name, Date, Batch ..."
            sx={{
              flex: 1,
              fontSize: "13px",
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
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            p: "4px",
            borderRadius: "24px",
            border: "1px solid #e4e7ec",
            bgcolor: "#ffffff",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)",
          }}
        >
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(0);
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.75,
                  py: 0.5,
                  borderRadius: "20px",
                  bgcolor: isActive ? "#2563eb" : "transparent",
                  color: isActive ? "#ffffff" : "#475467",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#1d4ed8" : "#f8fafc",
                  },
                }}
              >
                <span>{tab.label}</span>
                <Box
                  component="span"
                  sx={{
                    ml: 0.85,
                    px: 0.75,
                    py: 0.1,
                    borderRadius: "10px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    bgcolor: isActive ? "#1d4ed8" : "#f2f4f7",
                    color: isActive ? "#ffffff" : "#344054",
                  }}
                >
                  {tab.count}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
        {isLoading || isFetching ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <AppSkeleton
              key={idx}
              variant="rectangular"
              height={110}
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
              p: 5,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#344054", mb: 0.5 }}>
              No assessments found
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#667085", mb: 2 }}>
              There are no assessments matching the selected status or search query.
            </Typography>
            {(statusFilter !== "All" || searchQuery) && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setStatusFilter("All");
                  setSearchQuery("");
                  setPage(0);
                }}
                sx={{ textTransform: "none", fontSize: "13px" }}
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
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(16, 24, 40, 0.06)",
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
                      gap: 0.75,
                      mb: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: item.statusColor || getStatusColor(item.status),
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: item.statusColor || getStatusColor(item.status),
                      }}
                    >
                      {item.status}
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
                      fontSize: "12.5px",
                      color: "#667085",
                      mt: 0.5,
                    }}
                  >
                    {item.categories || item.categoryList?.join(" . ") || "MCQ . Coding"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "12.5px",
                      color: "#667085",
                      mt: 0.35,
                    }}
                  >
                    {item.timeDisplay}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedItemForDetails(item)}
                    sx={{
                      borderColor: "#be185d",
                      color: "#be185d",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      borderRadius: "6px",
                      px: 2.5,
                      py: 0.7,
                      "&:hover": {
                        borderColor: "#9d174d",
                        bgcolor: "#fdf2f8",
                      },
                    }}
                  >
                    Details
                  </Button>

                  {item.status !== "Completed" && (
                    <Button
                      variant="contained"
                      disabled={!item.canStart}
                      onClick={() => handleStartAssessment(item)}
                      sx={{
                        bgcolor: item.canStart ? "#2563eb" : "#cbd5e1 !important",
                        color: "#ffffff !important",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 2.75,
                        py: 0.7,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: item.canStart ? "#1d4ed8" : "#cbd5e1",
                        },
                      }}
                    >
                      Start
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>
          ))
        )}
      </Box>

      {!isLoading && totalElements > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mt: 3.5,
            pt: 2.5,
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "#667085", fontWeight: 500 }}>
            {`${page * pageSize + 1} - ${Math.min((page + 1) * pageSize, totalElements)} of ${totalElements}`}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage(0)}
              title="First Page"
              sx={{ color: page === 0 ? "#cbd5e1" : "#667085", p: 0.5 }}
            >
              <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              title="Previous Page"
              sx={{ color: page === 0 ? "#cbd5e1" : "#667085", p: 0.5 }}
            >
              <KeyboardArrowLeftRoundedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              title="Next Page"
              sx={{ color: page >= totalPages - 1 ? "#cbd5e1" : "#667085", p: 0.5 }}
            >
              <KeyboardArrowRightRoundedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              title="Last Page"
              sx={{ color: page >= totalPages - 1 ? "#cbd5e1" : "#667085", p: 0.5 }}
            >
              <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "13px", color: "#667085" }}>Page</Typography>
            <Box
              component="input"
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJumpPage();
              }}
              sx={{
                width: 44,
                height: 28,
                textAlign: "center",
                borderRadius: "4px",
                border: "1px solid #d0d5dd",
                outline: "none",
                fontSize: "13px",
                color: "#101828",
                bgcolor: "#ffffff",
                "&:focus": {
                  borderColor: "#2563eb",
                  boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.1)",
                },
              }}
            />
            <Typography
              onClick={handleJumpPage}
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#475467",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": { color: "#2563eb" },
              }}
            >
              Go
            </Typography>
          </Box>
        </Box>
      )}

      <Dialog
        open={Boolean(selectedItemForDetails)}
        onClose={() => setSelectedItemForDetails(null)}
        title={selectedItemForDetails?.title || "Assessment Details"}
        maxWidth="sm"
        showCloseButton
        actions={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectedItemForDetails(null)}
              sx={{ textTransform: "none", color: "#667085" }}
            >
              Close
            </Button>
            {selectedItemForDetails?.canStart && (
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedItemForDetails) handleStartAssessment(selectedItemForDetails);
                  setSelectedItemForDetails(null);
                }}
                sx={{
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  textTransform: "none",
                }}
              >
                Start Assessment
              </Button>
            )}
          </Box>
        }
      >
        {selectedItemForDetails && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={selectedItemForDetails.status}
                size="small"
                sx={{
                  bgcolor:
                    selectedItemForDetails.status === "Live"
                      ? "#ecfdf3"
                      : selectedItemForDetails.status === "Upcoming"
                      ? "#fff7ed"
                      : "#f1f5f9",
                  color:
                    selectedItemForDetails.status === "Live"
                      ? "#16a34a"
                      : selectedItemForDetails.status === "Upcoming"
                      ? "#ea580c"
                      : "#475467",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
              <Chip
                label={`Duration: ${selectedItemForDetails.durationMinutes} mins`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 12 }}
              />
              {selectedItemForDetails.totalQuestions && (
                <Chip
                  label={`Questions: ${selectedItemForDetails.totalQuestions}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 12 }}
                />
              )}
              {selectedItemForDetails.attended && selectedItemForDetails.score !== null && (
                <Chip
                  label={`Score: ${selectedItemForDetails.score} (${selectedItemForDetails.percentage}%)`}
                  size="small"
                  sx={{ bgcolor: "#ecfdf3", color: "#16a34a", fontWeight: 600, fontSize: 12 }}
                />
              )}
            </Box>

            <Box
              sx={{
                bgcolor: "#f9fafb",
                p: 2,
                borderRadius: "8px",
                border: "1px solid #eaecf0",
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#101828", mb: 0.5 }}>
                Schedule & Information:
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#475467" }}>
                • Time Slot: {selectedItemForDetails.timeDisplay}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#475467", mt: 0.25 }}>
                • Categories: {selectedItemForDetails.categories || selectedItemForDetails.categoryList?.join(" . ")}
              </Typography>
              {selectedItemForDetails.attended !== undefined && (
                <Typography sx={{ fontSize: "13px", color: "#475467", mt: 0.25 }}>
                  • Status: {selectedItemForDetails.attended ? "Attended" : "Not Attended Yet"}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default StudentAssessmentsPage;
