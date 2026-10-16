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
  AssignmentOutlined as AssignmentOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  AccessTimeOutlined as AccessTimeOutlinedIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import AppSkeleton from "../../components/common/Skeleton";
import DonutChartCard from "../../components/common/DonutChartCard";
import type { SnackbarState } from "../../types/Snackbar.types";
import AssessmentCalendarWidget from "../assessments/components/AssessmentCalendarWidget";

import { useGetStudentDashboardQuery } from "../../features/dashboard/DashboardApi";
import type { StudentDashboardTaskItem } from "../../types/Dashboard.types";

export const StudentDashBoard: React.FC = () => {
  const navigate = useNavigate();

  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Live" | "Upcoming" | "Completed" | "Missed">("All");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [selectedTaskDetails, setSelectedTaskDetails] = useState<StudentDashboardTaskItem | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: dashboardResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentDashboardQuery({
    search: searchQuery.trim() || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    date: selectedCalendarDate || undefined,
  });

  const studentData = dashboardResponse?.data;
  const summary = studentData?.summary;
  const testDistribution = studentData?.testDistribution;
  const calendarData = studentData?.calendar;
  const tasksList: StudentDashboardTaskItem[] = selectedCalendarDate
    ? (calendarData?.testsForSelectedDate ?? studentData?.tasks ?? studentData?.tasksPage?.content ?? [])
    : (studentData?.tasks || studentData?.tasksPage?.content || calendarData?.testsForSelectedDate || []);

  const displayedTasks = React.useMemo(() => {
    const list = [...tasksList];
    const getPriority = (item: StudentDashboardTaskItem) => {
      const status = (item.status || "").toLowerCase();
      if (status === "live" || item.canStart) return 1;
      if (status === "upcoming") return 2;
      if (status === "missed") return 3;
      if (status === "completed") return 4;
      return 5;
    };

    return list.sort((a, b) => getPriority(a) - getPriority(b)).slice(0, 3);
  }, [tasksList]);

  const welcomeTitle = studentData?.welcomeTitle || "Welcome, Ramesh 👋";
  const welcomeSubtitle = studentData?.welcomeSubtitle || "Let’s learn something new today!";
  const bannerBadge = studentData?.bannerBadge || "2026 . B.E . ECE . A";

  const statKpis = [
    {
      title: "Total Test",
      value: summary?.totalTests ?? 0,
      subtext: "Total Test assigned",
      icon: <AssignmentOutlinedIcon sx={{ color: "#98a2b3", fontSize: 22 }} />,
    },
    {
      title: "Average score",
      value: summary?.averageScoreDisplay || `${summary?.averageScore ?? 0}%`,
      subtext: "Total test mark score in percentage",
      icon: <TrendingUpOutlinedIcon sx={{ color: "#98a2b3", fontSize: 22 }} />,
    },
    {
      title: "Time spend",
      value: summary?.timeSpentDisplay || `${summary?.timeSpentHours ?? 0} hr`,
      subtext: "Total time spend for your practice",
      icon: <AccessTimeOutlinedIcon sx={{ color: "#98a2b3", fontSize: 22 }} />,
    },
  ];

  const donutSeries = [
    testDistribution?.totalAttended ?? 0,
    testDistribution?.currentTest ?? 0,
    testDistribution?.totalMissed ?? 0,
  ];

  const handleStartTest = (task: StudentDashboardTaskItem) => {
    if (!task.canStart) return;
    const testId = task.assignmentId || task.assessmentId || task.id;
    if (testId) {
      navigate(`/student/assessments/take/${testId}`);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, bgcolor: "#ffffff", minHeight: "100vh" }}>
      <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, color: "#101828", fontSize: { xs: "22px", md: "26px" } }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#667085", mt: 0.5, fontSize: "13.5px" }}>
            Analyse assigned work and manage
          </Typography>
        </Box>

        <IconButton
          onClick={() => refetch()}
          title="Refresh Dashboard"
          disabled={isFetching}
          sx={{ border: "1px solid #eaecf0", borderRadius: "8px" }}
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
          Failed to load student dashboard data. Please check connection and retry.
        </Alert>
      )}

      {showBanner && (
        <Box
          sx={{
            position: "relative",
            p: { xs: 2.5, sm: 3 },
            borderRadius: "14px",
            background: "linear-gradient(90deg, #1b2e65 0%, #224d9c 48%, #2b74cf 100%)",
            color: "#ffffff",
            mb: 3,
            boxShadow: "0 4px 16px rgba(27, 46, 101, 0.2)",
          }}
        >
          <IconButton
            size="small"
            onClick={() => setShowBanner(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "#ffffff",
              opacity: 0.85,
              "&:hover": { opacity: 1, bgcolor: "rgba(255, 255, 255, 0.15)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 0.5 }}>
            {welcomeTitle}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "20px", sm: "24px", md: "26px" },
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            {welcomeSubtitle}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: { xs: 1.5, sm: 0 },
            }}
          >
            <Typography
              sx={{
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "rgba(255, 255, 255, 0.9)",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                px: 1.5,
                py: 0.4,
                borderRadius: "6px",
                textTransform: "uppercase",
              }}
            >
              {bannerBadge}
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        {isLoading || isFetching
          ? Array.from({ length: 3 }).map((_, idx) => (
              <AppSkeleton
                key={idx}
                variant="rectangular"
                height={115}
                sx={{ borderRadius: "12px" }}
              />
            ))
          : statKpis.map((stat) => (
              <Card
                key={stat.title}
                title={stat.title}
                headerAction={stat.icon}
                elevation={0}
                sx={{
                  border: "1px solid #eaecf0",
                  borderRadius: "12px",
                  bgcolor: "#ffffff",
                  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
                  "& .MuiCardHeader-root": {
                    p: "18px 20px 4px 20px",
                  },
                  "& .MuiCardHeader-title": {
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#344054",
                  },
                  "& .MuiCardHeader-action": {
                    m: 0,
                    alignSelf: "center",
                  },
                }}
                contentSx={{
                  p: "0 20px 18px 20px !important",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#101828",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 400 }}>
                  {stat.subtext}
                </Typography>
              </Card>
            ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 380 },
            border: "1px solid #e4e7ec",
            borderRadius: "24px",
            px: 2,
            py: 0.75,
            bgcolor: "#ffffff",
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            onClick={() => setStatusFilter((prev) => (prev === "Live" ? "All" : "Live"))}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.75,
              py: 0.65,
              borderRadius: "20px",
              bgcolor: "#ecfdf3",
              border: statusFilter === "Live" ? "1.5px solid #16a34a" : "1px solid #d1fae5",
              color: "#16a34a",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              userSelect: "none",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#e0fbe9" },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#16a34a",
              }}
            />
            <span>Live</span>
            <Typography
              component="span"
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#16a34a",
                ml: 0.5,
              }}
            >
              {summary?.liveCount ?? 0}
            </Typography>
          </Box>

          <Box
            onClick={() => setStatusFilter((prev) => (prev === "Upcoming" ? "All" : "Upcoming"))}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.75,
              py: 0.65,
              borderRadius: "20px",
              bgcolor: "#fff7ed",
              border: statusFilter === "Upcoming" ? "1.5px solid #ea580c" : "1px solid #ffedd5",
              color: "#ea580c",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              userSelect: "none",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#ffedd5" },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#ea580c",
              }}
            />
            <span>Upcoming</span>
            <Typography
              component="span"
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#ea580c",
                ml: 0.5,
              }}
            >
              {summary?.upcomingCount ?? 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "270px 1fr 310px",
          },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {isLoading || isFetching ? (
          <AppSkeleton variant="rectangular" height={320} sx={{ borderRadius: "12px" }} />
        ) : (
          <DonutChartCard
            series={donutSeries}
            labels={["Total Attended", "Current test", "Total Missed"]}
            colors={["#9d174d", "#4a044e", "#18181b"]}
            height={195}
          />
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 0.5 }}>
            {selectedCalendarDate ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
                  Selected Date: {calendarData?.selectedDateDisplay || selectedCalendarDate}
                </Typography>
                <Chip
                  label="Clear Filter"
                  size="small"
                  onClick={() => setSelectedCalendarDate(null)}
                  onDelete={() => setSelectedCalendarDate(null)}
                  sx={{ height: 22, fontSize: "11px", bgcolor: "#f2f4f7" }}
                />
              </Box>
            ) : (
              <Box />
            )}

            {tasksList.length > 3 && (
              <Typography
                onClick={() => {
                  navigate("/student/assessments");
                }}
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#2563eb",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                All Tasks
              </Typography>
            )}
          </Box>

          {isLoading || isFetching ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <AppSkeleton
                key={idx}
                variant="rectangular"
                height={100}
                sx={{ borderRadius: "12px" }}
              />
            ))
          ) : displayedTasks.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                border: "1px dashed #eaecf0",
                borderRadius: "12px",
                bgcolor: "#fafafa",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "14px", color: "#667085" }}>
                No tasks found matching the criteria.
              </Typography>
            </Card>
          ) : (
            displayedTasks.map((task, idx) => (
              <Card
                key={task.studentAssignmentId || task.assignmentId || task.id || idx}
                elevation={0}
                sx={{
                  border: "1px solid #eaecf0",
                  borderRadius: "12px",
                  bgcolor: "#ffffff",
                  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
                  transition: "box-shadow 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 24, 40, 0.06)",
                  },
                }}
                contentSx={{
                  p: "18px 20px !important",
                  "&:last-child": { pb: "18px !important" },
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
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.65,
                        mb: 0.75,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor:
                            task.statusColor ||
                            (task.status === "Live" ? "#16a34a" : "#ea580c"),
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color:
                            task.statusColor ||
                            (task.status === "Live" ? "#16a34a" : "#ea580c"),
                        }}
                      >
                        {task.status}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#101828",
                        lineHeight: 1.3,
                      }}
                    >
                      {task.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#667085",
                        mt: 0.4,
                      }}
                    >
                      {task.categories || task.categoryList?.join(" . ") || "MCQ . Coding"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#667085",
                        mt: 0.25,
                      }}
                    >
                      {task.timeDisplay}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedTaskDetails(task)}
                      sx={{
                        borderColor: "#be185d",
                        color: "#be185d",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 2,
                        py: 0.6,
                        "&:hover": {
                          borderColor: "#9d174d",
                          bgcolor: "#fdf2f8",
                        },
                      }}
                    >
                      Details
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={!task.canStart}
                      onClick={() => handleStartTest(task)}
                      sx={{
                        bgcolor: task.canStart ? "#2563eb" : "#94a3b8 !important",
                        color: "#ffffff !important",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 2.5,
                        py: 0.6,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: task.canStart ? "#1d4ed8" : "#94a3b8",
                        },
                      }}
                    >
                      Start
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))
          )}
        </Box>

        {isLoading || isFetching ? (
          <AppSkeleton variant="rectangular" height={340} sx={{ borderRadius: "12px" }} />
        ) : (
          <AssessmentCalendarWidget
            calendarData={calendarData}
            selectedDate={selectedCalendarDate || calendarData?.selectedDate}
            onSelectDate={(newDate) => {
              setSelectedCalendarDate((prev) => (prev === newDate ? null : newDate));
            }}
          />
        )}
      </Box>

      <Dialog
        open={Boolean(selectedTaskDetails)}
        onClose={() => setSelectedTaskDetails(null)}
        title={selectedTaskDetails?.title || "Test Details"}
        maxWidth="sm"
        showCloseButton
        actions={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectedTaskDetails(null)}
              sx={{ textTransform: "none", color: "#667085" }}
            >
              Close
            </Button>
            {selectedTaskDetails?.canStart && (
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedTaskDetails) handleStartTest(selectedTaskDetails);
                  setSelectedTaskDetails(null);
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
        {selectedTaskDetails && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={selectedTaskDetails.status}
                size="small"
                sx={{
                  bgcolor: selectedTaskDetails.status === "Live" ? "#ecfdf3" : "#fff7ed",
                  color: selectedTaskDetails.status === "Live" ? "#16a34a" : "#ea580c",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
              <Chip
                label={`Duration: ${selectedTaskDetails.durationMinutes} mins`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 12 }}
              />
              {selectedTaskDetails.totalQuestions && (
                <Chip
                  label={`Questions: ${selectedTaskDetails.totalQuestions}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 12 }}
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
                Schedule & Format:
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#475467" }}>
                • Time Slot: {selectedTaskDetails.timeDisplay}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#475467" }}>
                • Categories: {selectedTaskDetails.categories || selectedTaskDetails.categoryList?.join(" . ")}
              </Typography>
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

export default StudentDashBoard;
