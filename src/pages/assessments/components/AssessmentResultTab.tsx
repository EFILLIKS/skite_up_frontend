import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import Card from "../../../components/common/Card";
import {
  useGetTeacherStudentResultsQuery,
} from "../../../features/assessment/AssessmentApi";
import type {
  TeacherStudentResultsQueryParams,
  TeacherStudentResultItem,
} from "../../../types/Assessment.types";
import AssessmentCalendarWidget from "./AssessmentCalendarWidget";

interface AssessmentResultTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const AssessmentResultTab: React.FC<AssessmentResultTabProps> = ({
  onSuccess,
  onError,
}) => {
  const navigate = useNavigate();

  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const [studentSearch, setStudentSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All Batches");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Depts");
  const [selectedSection, setSelectedSection] = useState<string>("All Sections");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>("All Tests");

  const [sortBy, setSortBy] = useState<string>("score");
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC");

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(studentSearch);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const queryParams: TeacherStudentResultsQueryParams = useMemo(() => {
    const p: TeacherStudentResultsQueryParams = {
      page,
      size: pageSize,
      sortBy,
      direction,
    };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (selectedTestFilter !== "All Tests") p.testTitle = selectedTestFilter;
    if (selectedBatch !== "All Batches") p.batch = selectedBatch;
    if (selectedDepartment !== "All Depts") p.department = selectedDepartment;
    if (selectedSection !== "All Sections") p.section = selectedSection;
    if (selectedStatus !== "All Status") p.status = selectedStatus;
    if (selectedDate) p.date = selectedDate;
    return p;
  }, [
    page,
    pageSize,
    sortBy,
    direction,
    debouncedSearch,
    selectedTestFilter,
    selectedBatch,
    selectedDepartment,
    selectedSection,
    selectedStatus,
    selectedDate,
  ]);

  const {
    data: resultsApiResponse,
    isLoading: isStudentResultsLoading,
    isFetching: isStudentResultsFetching,
    isError: isStudentResultsError,
    refetch: refetchStudentResults,
  } = useGetTeacherStudentResultsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const apiData = resultsApiResponse?.data;
  const studentRows: TeacherStudentResultItem[] = useMemo(() => {
    if (apiData?.content && Array.isArray(apiData.content)) {
      return apiData.content;
    }
    return [];
  }, [apiData?.content]);

  const totalElements = apiData?.totalElements ?? studentRows.length;
  const totalPages = apiData?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const filtersData = apiData?.filters;
  const testOptions = useMemo(() => {
    if (filtersData?.availableTestTitles && filtersData.availableTestTitles.length > 0) {
      return ["All Tests", ...filtersData.availableTestTitles];
    }
    const set = new Set(studentRows.map((r) => r.testTitle || r.testName).filter(Boolean) as string[]);
    return ["All Tests", ...Array.from(set)];
  }, [filtersData?.availableTestTitles, studentRows]);

  const batchOptions = useMemo(() => {
    if (filtersData?.availableBatches && filtersData.availableBatches.length > 0) {
      return ["All Batches", ...filtersData.availableBatches];
    }
    const set = new Set(studentRows.map((r) => r.batch).filter(Boolean));
    return ["All Batches", ...Array.from(set)];
  }, [filtersData?.availableBatches, studentRows]);

  const deptOptions = useMemo(() => {
    if (filtersData?.availableDepartments && filtersData.availableDepartments.length > 0) {
      return ["All Depts", ...filtersData.availableDepartments];
    }
    const set = new Set(studentRows.map((r) => r.department).filter(Boolean));
    return ["All Depts", ...Array.from(set)];
  }, [filtersData?.availableDepartments, studentRows]);

  const sectionOptions = useMemo(() => {
    if (filtersData?.availableSections && filtersData.availableSections.length > 0) {
      return ["All Sections", ...filtersData.availableSections];
    }
    const set = new Set(studentRows.map((r) => r.section).filter(Boolean));
    return ["All Sections", ...Array.from(set)];
  }, [filtersData?.availableSections, studentRows]);

  const statusOptions = useMemo(() => {
    if (filtersData?.availableStatuses && filtersData.availableStatuses.length > 0) {
      return ["All Status", ...filtersData.availableStatuses];
    }
    return ["All Status", "Passed", "Failed", "Needs Review", "Absent"];
  }, [filtersData?.availableStatuses]);

  const analytics = apiData?.analytics || apiData?.summary;
  const stats = useMemo(() => {
    const totalAssigned = analytics?.totalAssigned ?? totalElements;
    const totalAttended = analytics?.totalAttended ?? studentRows.filter((s) => s.status !== "Absent").length;
    const passedCount = analytics?.passedCount ?? studentRows.filter((s) => s.status === "Passed").length;
    const attendanceRate =
      analytics?.attendanceRate ?? (totalAssigned > 0 ? Math.round((totalAttended / totalAssigned) * 100) : 0);
    const avgScore =
      analytics?.averageScore ??
      analytics?.avgScore ??
      (studentRows.length > 0
        ? Math.round((studentRows.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / studentRows.length) * 10) / 10
        : 0);
    const maxScore =
      analytics?.highestScore ??
      analytics?.maxScore ??
      (studentRows.length > 0 ? Math.max(...studentRows.map((s) => s.score || 0)) : 0);
    const topStudent = studentRows.find((s) => s.score === maxScore);

    return {
      totalAssigned,
      totalAttended,
      attendanceRate,
      passedCount,
      passRate: analytics?.passRate ?? (totalAssigned > 0 ? Math.round((passedCount / totalAssigned) * 100) : 0),
      avgScore,
      maxScore,
      topStudentName: analytics?.topStudentName || topStudent?.studentName || "-",
      topStudentDept: analytics?.topStudentDept || (topStudent ? `${topStudent.department} (${topStudent.batch})` : ""),
    };
  }, [analytics, totalElements, studentRows]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setDirection("ASC");
    }
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    studentSearch.trim() ||
    selectedBatch !== "All Batches" ||
    selectedDepartment !== "All Depts" ||
    selectedSection !== "All Sections" ||
    selectedStatus !== "All Status" ||
    selectedTestFilter !== "All Tests" ||
    selectedDate
  );

  const handleClearAllFilters = () => {
    setStudentSearch("");
    setDebouncedSearch("");
    setSelectedBatch("All Batches");
    setSelectedDepartment("All Depts");
    setSelectedSection("All Sections");
    setSelectedStatus("All Status");
    setSelectedTestFilter("All Tests");
    setSelectedDate(null);
    setPage(0);
  };

  const handleToggleCalendar = () => {
    setShowCalendar((prev) => {
      const next = !prev;
      if (next && !selectedDate) {
        setSelectedDate(todayStr);
        setPage(0);
      }
      return next;
    });
  };

  const handleSelectCalendarDate = (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
    setPage(0);
  };

  const handleOpenStudentResult = (item: TeacherStudentResultItem) => {
    const resultId = item.id || item.studentId;
    if (resultId) {
      navigate(`/teacher/assessments/result/${resultId}`);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExportingCsv(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (selectedTestFilter !== "All Tests") params.append("testTitle", selectedTestFilter);
      if (selectedBatch !== "All Batches") params.append("batch", selectedBatch);
      if (selectedDepartment !== "All Depts") params.append("department", selectedDepartment);
      if (selectedSection !== "All Sections") params.append("section", selectedSection);
      if (selectedStatus !== "All Status") params.append("status", selectedStatus);
      if (selectedDate) params.append("date", selectedDate);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
      const exportUrl = `${baseUrl}/app/assessments/student-results/export-csv?${params.toString()}`;

      const res = await fetch(exportUrl, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `student_assessment_results_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        onSuccess("Student results CSV exported successfully");
      } else {
        if (studentRows.length > 0) {
          const headers = [
            "Student Name",
            "Register No",
            "Email",
            "Batch",
            "Department",
            "Section",
            "Assessment",
            "Score",
            "Total Marks",
            "Percentage",
            "Status",
            "Submitted At",
          ];
          const rows = studentRows.map((s) => [
            `"${s.studentName}"`,
            `"${s.registerNumber}"`,
            `"${s.email || ""}"`,
            `"${s.batch}"`,
            `"${s.department}"`,
            `"${s.section}"`,
            `"${s.testTitle || s.testName || ""}"`,
            s.score,
            s.totalMarks,
            `${s.percentage}%`,
            `"${s.status}"`,
            `"${s.submittedAtDisplay || s.submittedAt || ""}"`,
          ]);
          const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `student_assessment_results_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          onSuccess("Student results CSV exported successfully");
        } else {
          onError("No records available to export");
        }
      }
    } catch {
      onError("Failed to download CSV export");
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          pb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#101828", lineHeight: 1.25 }}>
            Student Assessment Results
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#667085", mt: 0.3 }}>
            Live evaluation records, attended student performances, individual scores, and section breakdowns.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {isStudentResultsError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetchStudentResults()}>
                  Retry
                </Button>
              }
            >
              Failed to load student assessment results from the server.
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.25,
            }}
          >
            <Card
              sx={{
                border: "1px solid #eaecf0",
                borderRadius: 2.5,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
              }}
              contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475467" }}>
                  Attended Candidates
                </Typography>
                <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "#eff8ff", color: "#1570ef" }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", mt: 1, lineHeight: 1 }}>
                {isStudentResultsLoading ? "-" : stats.totalAttended}{" "}
                <Typography component="span" sx={{ fontSize: 14, color: "#667085", fontWeight: 500 }}>
                  / {stats.totalAssigned}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#12b76a", mt: 0.75, fontWeight: 500 }}>
                {stats.attendanceRate}% attendance rate
              </Typography>
            </Card>

            <Card
              sx={{
                border: "1px solid #eaecf0",
                borderRadius: 2.5,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
              }}
              contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475467" }}>
                  Average Performance
                </Typography>
                <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "#fdf2fa", color: "#c11574" }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", mt: 1, lineHeight: 1 }}>
                {isStudentResultsLoading ? "-" : `${stats.avgScore}%`}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#667085", mt: 0.75 }}>
                Passing threshold: ≥ 50%
              </Typography>
            </Card>

            <Card
              sx={{
                border: "1px solid #eaecf0",
                borderRadius: 2.5,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
              }}
              contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475467" }}>
                  Qualified Students
                </Typography>
                <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "#ecfdf3", color: "#12b76a" }}>
                  <WorkspacePremiumOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", mt: 1, lineHeight: 1 }}>
                {isStudentResultsLoading ? "-" : stats.passedCount}{" "}
                <Typography component="span" sx={{ fontSize: 14, color: "#667085", fontWeight: 500 }}>
                  ({stats.passRate}%)
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#667085", mt: 0.75 }}>
                Cleared all assessment criteria
              </Typography>
            </Card>

            <Card
              sx={{
                border: "1px solid #eaecf0",
                borderRadius: 2.5,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
              }}
              contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475467" }}>
                  Highest Score
                </Typography>
                <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "#fff9eb", color: "#b54708" }}>
                  <EmojiEventsOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", mt: 1, lineHeight: 1 }}>
                {isStudentResultsLoading ? "-" : stats.maxScore}{" "}
                <Typography component="span" sx={{ fontSize: 14, color: "#667085", fontWeight: 500 }}>
                  / 100
                </Typography>
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#475467",
                  mt: 0.75,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {stats.topStudentName} {stats.topStudentDept ? `• ${stats.topStudentDept}` : ""}
              </Typography>
            </Card>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: showCalendar ? { xs: "1fr", lg: "1fr 340px" } : "1fr",
              gap: 3,
              alignItems: "start",
            }}
          >
            <Card
              sx={{
                border: "1px solid #eaecf0",
                borderRadius: 2.5,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                overflow: "hidden",
                position: "relative",
              }}
            contentSx={{ p: 0, "&:last-child": { pb: 0 } }}
          >
            {isStudentResultsFetching && !isStudentResultsLoading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(255, 255, 255, 0.55)",
                  zIndex: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={30} sx={{ color: "#1570ef" }} />
              </Box>
            )}

            <Box
              sx={{
                p: 2.25,
                display: "flex",
                flexDirection: "column",
                gap: 1.75,
                borderBottom: "1px solid #eaecf0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Search student name, roll number, test..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: "#98a2b3", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: studentSearch ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setStudentSearch("");
                              setDebouncedSearch("");
                            }}
                          >
                            <ClearRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    width: { xs: "100%", md: 320 },
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: 13,
                    },
                  }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Button
                    variant={showCalendar ? "contained" : "outlined"}
                    size="small"
                    startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={handleToggleCalendar}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: showCalendar ? "#1570ef" : "#d0d5dd",
                      bgcolor: showCalendar ? "#1570ef" : "#ffffff",
                      color: showCalendar ? "#ffffff" : "#344054",
                      fontSize: 13,
                      fontWeight: 600,
                      px: 2,
                      py: 0.8,
                      boxShadow: showCalendar ? "0 1px 2px rgba(16, 24, 40, 0.05)" : "none",
                      "&:hover": {
                        borderColor: showCalendar ? "#175cd3" : "#98a2b3",
                        bgcolor: showCalendar ? "#175cd3" : "#f9fafb",
                      },
                    }}
                  >
                    {showCalendar ? "Hide Calendar" : "Calendar View"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isExportingCsv || studentRows.length === 0}
                    startIcon={
                      isExportingCsv ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
                      )
                    }
                    onClick={handleExportCSV}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: "#d0d5dd",
                      color: "#344054",
                      fontSize: 13,
                      fontWeight: 600,
                      px: 2,
                      py: 0.8,
                      "&:hover": {
                        borderColor: "#98a2b3",
                        bgcolor: "#f9fafb",
                      },
                    }}
                  >
                    {isExportingCsv ? "Exporting..." : "Export CSV"}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <Select
                    value={selectedTestFilter}
                    onChange={(e) => {
                      setSelectedTestFilter(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: 2, fontSize: 13, bgcolor: "#ffffff" }}
                  >
                    {testOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 125 }}>
                  <Select
                    value={selectedBatch}
                    onChange={(e) => {
                      setSelectedBatch(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: 2, fontSize: 13, bgcolor: "#ffffff" }}
                  >
                    {batchOptions.map((b) => (
                      <MenuItem key={b} value={b} sx={{ fontSize: 13 }}>
                        {b === "All Batches" ? "All Batches" : `Batch ${b}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: 2, fontSize: 13, bgcolor: "#ffffff" }}
                  >
                    {deptOptions.map((d) => (
                      <MenuItem key={d} value={d} sx={{ fontSize: 13 }}>
                        {d === "All Depts" ? "All Depts" : `Dept: ${d}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedSection}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: 2, fontSize: 13, bgcolor: "#ffffff" }}
                  >
                    {sectionOptions.map((s) => (
                      <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                        {s === "All Sections" ? "All Sections" : `Section ${s}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: 2, fontSize: 13, bgcolor: "#ffffff" }}
                  >
                    {statusOptions.map((st) => (
                      <MenuItem key={st} value={st} sx={{ fontSize: 13 }}>
                        {st}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDate && (
                  <Chip
                    label={`Date: ${selectedDate}`}
                    onDelete={() => {
                      setSelectedDate(null);
                      setPage(0);
                    }}
                    size="small"
                    sx={{
                      bgcolor: "#eff8ff",
                      color: "#175cd3",
                      fontWeight: 600,
                      fontSize: 12,
                      border: "1px solid #b2ddff",
                    }}
                  />
                )}

                {hasActiveFilters && (
                  <Button
                    size="small"
                    onClick={handleClearAllFilters}
                    sx={{
                      fontSize: 12.5,
                      textTransform: "none",
                      color: "#b42318",
                      fontWeight: 600,
                      px: 1,
                      "&:hover": { bgcolor: "#fef3f2" },
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
              <MuiTable sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, width: 45 }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, minWidth: 200 }}>
                      <TableSortLabel
                        active={sortBy === "studentName"}
                        direction={sortBy === "studentName" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                        onClick={() => handleSort("studentName")}
                        sx={{ fontWeight: "inherit" }}
                      >
                        Student Details
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, minWidth: 120 }}>
                      <TableSortLabel
                        active={sortBy === "batch"}
                        direction={sortBy === "batch" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                        onClick={() => handleSort("batch")}
                        sx={{ fontWeight: "inherit" }}
                      >
                        Batch / Class
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, minWidth: 190 }}>
                      <TableSortLabel
                        active={sortBy === "testTitle" || sortBy === "testName"}
                        direction={direction.toLowerCase() as "asc" | "desc"}
                        onClick={() => handleSort("testTitle")}
                        sx={{ fontWeight: "inherit" }}
                      >
                        Assessment Title
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, minWidth: 160 }}>
                      <TableSortLabel
                        active={sortBy === "score"}
                        direction={sortBy === "score" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                        onClick={() => handleSort("score")}
                        sx={{ fontWeight: "inherit" }}
                      >
                        Score & Progress
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, minWidth: 130 }}>
                      <TableSortLabel
                        active={sortBy === "status"}
                        direction={sortBy === "status" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                        onClick={() => handleSort("status")}
                        sx={{ fontWeight: "inherit" }}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, minWidth: 140 }}>
                      Time & Date
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: 12.5, fontWeight: 700, color: "#475467", py: 1.5, width: 90 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isStudentResultsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} sx={{ color: "#1570ef" }} />
                        <Typography sx={{ color: "#667085", fontSize: 13, mt: 1.5 }}>
                          Loading student assessment results...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : studentRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: "#667085", fontSize: 14 }}>
                          No student results match the specified criteria.
                        </Typography>
                        {hasActiveFilters && (
                          <Button
                            size="small"
                            onClick={handleClearAllFilters}
                            sx={{ mt: 1, textTransform: "none", fontSize: 13, color: "#1570ef" }}
                          >
                            Reset all filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentRows.map((row, index) => {
                      const rowNumber = page * pageSize + index + 1;
                      const isPassing = (row.percentage ?? 0) >= 50;
                      const categoriesList = Array.isArray(row.categories)
                        ? row.categories
                        : typeof row.categories === "string"
                          ? row.categories.split(",").map((c) => c.trim())
                          : [];

                      return (
                        <TableRow
                          key={row.id || `${row.registerNumber}-${index}`}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <TableCell sx={{ fontSize: 13, color: "#667085", fontWeight: 500 }}>
                            {rowNumber}
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  bgcolor: row.avatarColor || "#2563eb",
                                  color: "#ffffff",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleOpenStudentResult(row)}
                              >
                                {row.studentName
                                  ? row.studentName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()
                                  : "ST"}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    color: "#101828",
                                    lineHeight: 1.3,
                                    cursor: "pointer",
                                    "&:hover": { color: "#1570ef", textDecoration: "underline" },
                                  }}
                                  onClick={() => handleOpenStudentResult(row)}
                                >
                                  {row.studentName}
                                </Typography>
                                <Typography sx={{ fontSize: 11.5, color: "#667085", mt: 0.2 }}>
                                  {row.registerNumber} {row.email ? `• ${row.email}` : ""}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#344054" }}>
                                {row.department} - {row.section}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: "#667085" }}>
                                Batch {row.batch}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#101828", lineHeight: 1.3 }}>
                                {row.testTitle || row.testName || "Assessment"}
                              </Typography>
                              {categoriesList.length > 0 && (
                                <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                                  {categoriesList.map((cat) => (
                                    <Chip
                                      key={cat}
                                      label={cat}
                                      size="small"
                                      sx={{
                                        fontSize: 10.5,
                                        height: 20,
                                        bgcolor: "#f2f4f7",
                                        color: "#344054",
                                        fontWeight: 600,
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            {row.status === "Absent" ? (
                              <Typography sx={{ fontSize: 13, color: "#98a2b3", fontWeight: 500 }}>
                                Not Attempted
                              </Typography>
                            ) : (
                              <Box sx={{ width: 140 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#101828" }}>
                                    {row.score ?? 0}{" "}
                                    <Typography component="span" sx={{ fontSize: 11.5, color: "#667085", fontWeight: 400 }}>
                                      / {row.totalMarks ?? 100}
                                    </Typography>
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: isPassing ? "#12b76a" : "#d92d20",
                                    }}
                                  >
                                    {row.percentage ?? 0}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, Math.max(0, row.percentage ?? 0))}
                                  sx={{
                                    height: 5,
                                    borderRadius: 3,
                                    bgcolor: "#eaecf0",
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 3,
                                      bgcolor: isPassing ? "#12b76a" : "#f04438",
                                    },
                                  }}
                                />
                              </Box>
                            )}
                          </TableCell>

                          <TableCell>
                            {row.status === "Passed" && (
                              <Chip
                                icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: "14px !important" }} />}
                                label="Passed"
                                size="small"
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  height: 24,
                                  bgcolor: "#ecfdf3",
                                  color: "#027a48",
                                  "& .MuiChip-icon": { color: "#12b76a" },
                                }}
                              />
                            )}
                            {row.status === "Failed" && (
                              <Chip
                                icon={<HighlightOffRoundedIcon sx={{ fontSize: "14px !important" }} />}
                                label="Failed"
                                size="small"
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  height: 24,
                                  bgcolor: "#fef3f2",
                                  color: "#b42318",
                                  "& .MuiChip-icon": { color: "#d92d20" },
                                }}
                              />
                            )}
                            {row.status === "Needs Review" && (
                              <Chip
                                label="Needs Review"
                                size="small"
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  height: 24,
                                  bgcolor: "#fffaf5",
                                  color: "#b54708",
                                  border: "1px solid #fedf89",
                                }}
                              />
                            )}
                            {row.status === "Absent" && (
                              <Chip
                                label="Absent"
                                size="small"
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  height: 24,
                                  bgcolor: "#f2f4f7",
                                  color: "#667085",
                                }}
                              />
                            )}
                            {row.status !== "Passed" &&
                              row.status !== "Failed" &&
                              row.status !== "Needs Review" &&
                              row.status !== "Absent" && (
                                <Chip
                                  label={row.status || "Completed"}
                                  size="small"
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    height: 24,
                                    bgcolor: "#eff8ff",
                                    color: "#175cd3",
                                  }}
                                />
                              )}
                          </TableCell>

                          <TableCell>
                            {row.status === "Absent" ? (
                              <Typography sx={{ fontSize: 12, color: "#98a2b3" }}>-</Typography>
                            ) : (
                              <Box>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: "#344054" }}>
                                  {row.submittedAtDisplay || row.submittedAt || "-"}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                                  <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "#98a2b3" }} />
                                  <Typography sx={{ fontSize: 11, color: "#667085" }}>
                                    Duration: {row.timeTakenDisplay || row.timeTaken || "-"}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title="View Full Evaluation Breakdown">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenStudentResult(row)}
                                sx={{
                                  color: "#1570ef",
                                  bgcolor: "#eff8ff",
                                  border: "1px solid #b2ddff",
                                  borderRadius: 1.5,
                                  "&:hover": { bgcolor: "#d1e9ff" },
                                }}
                              >
                                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </MuiTable>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1.5,
                borderTop: "1px solid #eaecf0",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: "#667085" }}>
                {totalElements === 0
                  ? "0 - 0 of 0"
                  : `${page * pageSize + 1} - ${Math.min((page + 1) * pageSize, totalElements)} of ${totalElements} students`}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  disabled={page <= 0 || isStudentResultsFetching}
                  onClick={() => setPage(0)}
                  sx={{ color: "#667085" }}
                >
                  <FirstPageIcon sx={{ fontSize: 19 }} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={page <= 0 || isStudentResultsFetching}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  sx={{ color: "#667085" }}
                >
                  <NavigateBeforeIcon sx={{ fontSize: 19 }} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1 || isStudentResultsFetching}
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  sx={{ color: "#667085" }}
                >
                  <NavigateNextIcon sx={{ fontSize: 19 }} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1 || isStudentResultsFetching}
                  onClick={() => setPage(Math.max(0, totalPages - 1))}
                  sx={{ color: "#667085" }}
                >
                  <LastPageIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 12, color: "#667085" }}>Rows:</Typography>
                  <Select
                    size="small"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                    sx={{ height: 28, fontSize: 12, borderRadius: 1.5 }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 12, color: "#667085" }}>
                    Page {page + 1} of {totalPages}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          {showCalendar && (
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
              <AssessmentCalendarWidget
                calendarData={apiData?.calendar}
                selectedDate={selectedDate || todayStr}
                onSelectDate={handleSelectCalendarDate}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AssessmentResultTab;
