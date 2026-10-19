import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Chip,
  Alert,
  Dialog as MuiDialog,
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
import Snackbar from "../../components/common/Snackbar";
import AppSkeleton from "../../components/common/Skeleton";
import DonutChartCard from "../../components/common/DonutChartCard";
import type { SnackbarState } from "../../types/Snackbar.types";
import AssessmentCalendarWidget from "../assessments/components/AssessmentCalendarWidget";

import { useGetStudentDashboardQuery } from "../../features/dashboard/DashboardApi";
import { useGetAssessmentByIdQuery } from "../../features/assessment/AssessmentApi";
import type { StudentDashboardTaskItem } from "../../types/Dashboard.types";

export const StudentDashBoard: React.FC = () => {
  const navigate = useNavigate();

  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Live" | "Upcoming" | "Completed" | "Missed">("All");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [selectedTaskDetails, setSelectedTaskDetails] = useState<StudentDashboardTaskItem | null>(null);

  const assessmentIdToFetch =
    selectedTaskDetails?.assessmentId ||
    selectedTaskDetails?.id ||
    selectedTaskDetails?.assignmentId ||
    "";

  const {
    data: assessmentDetailResponse,
    isLoading: isAssessmentDetailLoading,
  } = useGetAssessmentByIdQuery(assessmentIdToFetch, {
    skip: !assessmentIdToFetch || !selectedTaskDetails,
  });

  const detailData = assessmentDetailResponse?.data;

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
    let list = [...tasksList];
    if (statusFilter && statusFilter !== "All") {
      list = list.filter(
        (item) => (item.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.categories?.toLowerCase().includes(q) ||
          item.categoryList?.some((cat) => cat.toLowerCase().includes(q)) ||
          item.timeDisplay?.toLowerCase().includes(q)
      );
    }
    const getPriority = (item: StudentDashboardTaskItem) => {
      const status = (item.status || "").toLowerCase();
      if (status === "live" || item.canStart) return 1;
      if (status === "upcoming") return 2;
      if (status === "missed") return 3;
      if (status === "completed") return 4;
      return 5;
    };

    return list.sort((a, b) => getPriority(a) - getPriority(b)).slice(0, 3);
  }, [tasksList, statusFilter, searchQuery]);

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
    const isDone =
      task.attended ||
      task.status === "Completed" ||
      detailData?.studentAttended ||
      detailData?.status === "COMPLETED";

    const resId =
      task.studentAssignmentId ||
      task.assignmentId ||
      task.assessmentId ||
      task.id;

    if (isDone) {
      if (resId) navigate(`/student/result/${resId}`);
      return;
    }
    if (resId) {
      navigate(`/student/assessments/take/${resId}`);
    }
  };

  const dialogTitle =
    detailData?.testName ||
    detailData?.title ||
    selectedTaskDetails?.title ||
    "";

  const rawStatus =
    detailData?.studentStatus ||
    detailData?.status ||
    selectedTaskDetails?.status ||
    "";

  const isCompleted =
    rawStatus.toLowerCase() === "completed" ||
    rawStatus.toLowerCase() === "passed" ||
    rawStatus.toLowerCase() === "failed" ||
    Boolean(detailData?.studentAttended) ||
    Boolean(selectedTaskDetails?.attended);

  const isLive = !isCompleted && rawStatus.toLowerCase() === "live";
  const isUpcoming = !isCompleted && rawStatus.toLowerCase() === "upcoming";
  const isStartDisabled =
    isCompleted ||
    !isLive ||
    (selectedTaskDetails ? !selectedTaskDetails.canStart : false);

  const dialogDuration =
    detailData?.durationMinutes ??
    selectedTaskDetails?.durationMinutes ??
    0;

  const dialogQuestions =
    detailData?.totalQuestions ??
    selectedTaskDetails?.totalQuestions ??
    (detailData?.mcqCount !== undefined
      ? ((detailData.mcqCount || 0) + (detailData.codingCount || 0) + (detailData.lsrwCount || 0) + (detailData.objectiveCount || 0))
      : 0);

  const dialogMarks =
    detailData?.totalMarks !== undefined
      ? Math.round(detailData.totalMarks)
      : (selectedTaskDetails?.totalMarks !== undefined ? Math.round(selectedTaskDetails.totalMarks) : 0);

  const dialogCategories =
    detailData?.categories ||
    (detailData?.categoriesList && detailData.categoriesList.length > 0 ? detailData.categoriesList.join(" . ") : "") ||
    selectedTaskDetails?.categories ||
    (selectedTaskDetails?.categoryList && selectedTaskDetails.categoryList.length > 0 ? selectedTaskDetails.categoryList.join(" . ") : "-");

  const dialogDateTime =
    selectedTaskDetails?.timeDisplay ||
    selectedTaskDetails?.dateDisplay ||
    detailData?.timeDisplay ||
    detailData?.dateDisplay ||
    "-";

  const dialogTotalAttempt =
    detailData?.studentTotalTestsAttended ??
    detailData?.attemptsAllowed ??
    (selectedTaskDetails?.attended ? 1 : 0);

  const dialogPassCount =
    detailData?.passCount ??
    detailData?.passedStudentsCount ??
    detailData?.studentTotalTestsPassed ??
    0;

  const dialogFailCount =
    detailData?.failCount ??
    detailData?.failedStudentsCount ??
    detailData?.studentTotalTestsFailed ??
    0;

  const dialogAssignedBy =
    detailData?.createdByName || "-";

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
            width: { xs: "100%", sm: 340, md: 380 },
            border: "1px solid #e4e7ec",
            borderRadius: "8px",
            px: 1.75,
            py: 0.75,
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Test name, Date..."
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
            <IconButton
              size="small"
              onClick={() => setSearchQuery("")}
              sx={{ p: 0.25 }}
            >
              <CloseIcon fontSize="small" sx={{ color: "#98a2b3" }} />
            </IconButton>
          )}
        </Box>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            p: "4px",
            borderRadius: "8px",
            border: "1px solid #e4e7ec",
            bgcolor: "#ffffff",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
          }}
        >
          {[
            {
              id: "All" as const,
              label: "All",
              count: summary?.totalTests ?? tasksList.length,
            },
            {
              id: "Live" as const,
              label: "Live",
              count:
                summary?.liveCount ??
                tasksList.filter((t) => (t.status || "").toLowerCase() === "live").length,
            },
            {
              id: "Upcoming" as const,
              label: "Upcoming",
              count:
                summary?.upcomingCount ??
                tasksList.filter((t) => (t.status || "").toLowerCase() === "upcoming").length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.85,
                  px: 1.75,
                  py: 0.55,
                  borderRadius: "6px",
                  bgcolor: isActive ? "#eff8ff" : "transparent",
                  color: isActive ? "#175cd3" : "#475467",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#eff8ff" : "#f8fafc",
                    color: isActive ? "#175cd3" : "#1d2939",
                  },
                }}
              >
                <span>{tab.label}</span>
                <Box
                  component="span"
                  sx={{
                    minWidth: 20,
                    height: 20,
                    px: 0.6,
                    borderRadius: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    bgcolor: isActive ? "#1570ef" : "#f2f4f7",
                    color: isActive ? "#ffffff" : "#475467",
                    lineHeight: 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.count}
                </Box>
              </Box>
            );
          })}
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
                      disabled={!task.canStart || Boolean(task.attended) || task.status === "Completed"}
                      onClick={() => handleStartTest(task)}
                      sx={{
                        bgcolor:
                          task.canStart && !task.attended && task.status !== "Completed"
                            ? "#2563eb"
                            : "#94a3b8 !important",
                        color: "#ffffff !important",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 2.5,
                        py: 0.6,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor:
                            task.canStart && !task.attended && task.status !== "Completed"
                              ? "#1d4ed8"
                              : "#94a3b8",
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

      <MuiDialog
        open={Boolean(selectedTaskDetails)}
        onClose={() => setSelectedTaskDetails(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxWidth: 550,
            bgcolor: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            p: 0,
          },
        }}
      >
        {selectedTaskDetails && (
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header: Title and Close button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2.25,
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "20px", sm: "22px" },
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.3,
                  pr: 1,
                }}
              >
                {dialogTitle}
              </Typography>
              <IconButton
                onClick={() => setSelectedTaskDetails(null)}
                size="small"
                sx={{
                  color: "#2563eb",
                  p: 0.75,
                  ml: 1,
                  "&:hover": { bgcolor: "rgba(37, 99, 235, 0.08)" },
                }}
              >
                <CloseIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>

            {/* Badges Row */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.25,
                mb: 2.5,
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: `1.5px solid ${isLive
                      ? "#86efac"
                      : isCompleted
                        ? "#cbd5e1"
                        : isUpcoming
                          ? "#fdba74"
                          : "#cbd5e1"
                    }`,
                  bgcolor: isLive
                    ? "#f0fdf4"
                    : isCompleted
                      ? "#ffffff"
                      : isUpcoming
                        ? "#fff7ed"
                        : "#f8fafc",
                  borderRadius: "6px",
                  px: 1.75,
                  py: 0.55,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: isLive
                      ? "#22c55e"
                      : isCompleted
                        ? "#64748b"
                        : isUpcoming
                          ? "#ea580c"
                          : "#64748b",
                    boxShadow: isLive ? "0 0 6px rgba(34, 197, 94, 0.6)" : "none",
                    mr: 0.8,
                  }}
                />
                <Typography
                  sx={{
                    color: isLive
                      ? "#16a34a"
                      : isCompleted
                        ? "#475467"
                        : isUpcoming
                          ? "#ea580c"
                          : "#475467",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {isCompleted
                    ? "Completed"
                    : isLive
                      ? "Live"
                      : (rawStatus || "Upcoming")}
                </Typography>
              </Box>

              {/* Duration Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  bgcolor: "#ffffff",
                  borderRadius: "6px",
                  px: 1.75,
                  py: 0.55,
                }}
              >
                <Typography sx={{ color: "#475467", fontSize: "14px", fontWeight: 500 }}>
                  {`Duration: ${dialogDuration} min`}
                </Typography>
              </Box>

              {/* Question Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  bgcolor: "#ffffff",
                  borderRadius: "6px",
                  px: 1.75,
                  py: 0.55,
                }}
              >
                <Typography sx={{ color: "#475467", fontSize: "14px", fontWeight: 500 }}>
                  {`Question: ${dialogQuestions}`}
                </Typography>
              </Box>

              {/* Mark Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  bgcolor: "#ffffff",
                  borderRadius: "6px",
                  px: 1.75,
                  py: 0.55,
                }}
              >
                <Typography sx={{ color: "#475467", fontSize: "14px", fontWeight: 500 }}>
                  {`Mark: ${dialogMarks}`}
                </Typography>
              </Box>
            </Box>

            {/* Information Container (Grey Box) */}
            <Box
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                p: { xs: "20px 18px", sm: "22px 24px" },
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {[
                { label: "Categories:", value: dialogCategories },
                { label: "Date & Time:", value: dialogDateTime },
                { label: "Total Attempt:", value: dialogTotalAttempt },
                { label: "Pass Count:", value: dialogPassCount },
                { label: "Fail Count:", value: dialogFailCount },
                { label: "Assigned by:", value: dialogAssignedBy },
              ].map((row, rIdx) => (
                <Box key={rIdx} sx={{ display: "flex", alignItems: "baseline" }}>
                  <Typography
                    sx={{
                      width: 130,
                      minWidth: 130,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 400,
                      color: "#0f172a",
                      ml: 1,
                      wordBreak: "break-word",
                    }}
                  >
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3.5,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setSelectedTaskDetails(null)}
                sx={{
                  border: "1.5px solid #0f172a !important",
                  bgcolor: "#ffffff !important",
                  color: "#0f172a !important",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  borderRadius: "8px",
                  px: 3.5,
                  py: 0.85,
                  minWidth: 100,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#f8fafc !important",
                    border: "1.5px solid #0f172a !important",
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                disabled={isStartDisabled}
                onClick={() => {
                  if (selectedTaskDetails && !isStartDisabled) {
                    handleStartTest(selectedTaskDetails);
                    setSelectedTaskDetails(null);
                  }
                }}
                sx={{
                  bgcolor: isStartDisabled ? "#94a3b8 !important" : "#2563eb !important",
                  color: "#ffffff !important",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  borderRadius: "8px",
                  px: 4,
                  py: 0.85,
                  minWidth: 100,
                  boxShadow: "none",
                  cursor: isStartDisabled ? "not-allowed !important" : "pointer",
                  "&:hover": {
                    bgcolor: isStartDisabled ? "#94a3b8 !important" : "#1d4ed8 !important",
                  },
                }}
              >
                Start
              </Button>
            </Box>
          </Box>
        )}
      </MuiDialog>

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
