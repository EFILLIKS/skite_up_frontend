import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AssignmentOutlined as AssignmentOutlinedIcon,
  AccessTimeOutlined as AccessTimeOutlinedIcon,
  HistoryToggleOffOutlined as HistoryToggleOffOutlinedIcon,
  Search as SearchIcon,
  KeyboardArrowDownRounded as KeyboardArrowDownRoundedIcon,
  KeyboardDoubleArrowLeftRounded as KeyboardDoubleArrowLeftRoundedIcon,
  KeyboardArrowLeftRounded as KeyboardArrowLeftRoundedIcon,
  KeyboardArrowRightRounded as KeyboardArrowRightRoundedIcon,
  KeyboardDoubleArrowRightRounded as KeyboardDoubleArrowRightRoundedIcon,
  ModeEditOutlineOutlined as ModeEditOutlineOutlinedIcon,
  DeleteOutlineOutlined as DeleteOutlineOutlinedIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import AppSkeleton from "../../components/common/Skeleton";
import type { AppTableColumn } from "../../types/Table.types";

import { useGetTeacherDashboardQuery } from "../../features/dashboard/DashboardApi";
import { useDeleteAssessmentTemplateMutation } from "../../features/assessment/AssessmentApi";
import type {
  TeacherAssignmentItem,
  TeacherUpcomingAssignmentItem,
} from "../../types/Dashboard.types";


const formatDate = (isoString?: string): string => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} / ${month} / ${year}`;
  } catch {
    return isoString;
  }
};

const formatTime = (timeStr?: string): string => {
  if (!timeStr) return "";
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return "";
    return d
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  } catch {
    return "";
  }
};

const formatTimeRange = (opensAt?: string, closesAt?: string): string => {
  const start = formatTime(opensAt);
  const end = formatTime(closesAt);
  if (start && end) return `${start} to ${end}`;
  if (start) return start;
  return "-";
};

const cleanBatchString = (batch?: string): string => {
  if (!batch) return "-";
  const unique = Array.from(
    new Set(
      batch
        .split(/[·,]/)
        .map((b) => b.trim())
        .filter(Boolean)
    )
  );
  return unique.length > 0 ? unique.join(", ") : batch;
};



export const TeacherDashBoard: React.FC = () => {
  const navigate = useNavigate();

  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");

  const [batchAnchor, setBatchAnchor] = useState<null | HTMLElement>(null);
  const [deptAnchor, setDeptAnchor] = useState<null | HTMLElement>(null);
  const [sectionAnchor, setSectionAnchor] = useState<null | HTMLElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const pageSize = 10;

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "error";
  }>({
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
  } = useGetTeacherDashboardQuery({
    page: currentPage - 1,
    size: pageSize,
    search: searchQuery.trim() || undefined,
  });

  const [deleteAssessment, { isLoading: isDeleting }] =
    useDeleteAssessmentTemplateMutation();

  const dashboardData = dashboardResponse?.data;
  const summary = dashboardData?.summary;
  const assignmentsPage = dashboardData?.assignments;
  const rawAssignments: TeacherAssignmentItem[] = assignmentsPage?.content || [];

  const welcomeMessage =
    dashboardData?.welcomeMessage ||
    (dashboardData?.firstName
      ? `${dashboardData.firstName} 👋`
      : dashboardData?.teacherName
        ? ` ${dashboardData.teacherName} 👋`
        : " 👋");

  const bannerBadge =
    dashboardData?.bannerBadge ||
    (dashboardData?.staffId
      ? `${dashboardData.staffId} • ${dashboardData.department || ""}`
      : dashboardData?.department || "STAF-002 . ECE");

  const filteredRows = useMemo(() => {
    return rawAssignments.filter((row) => {
      const matchBatch =
        selectedBatch === "All" ||
        row.batch.toLowerCase().includes(selectedBatch.toLowerCase());
      const matchDept =
        selectedDept === "All" ||
        row.department.toLowerCase().includes(selectedDept.toLowerCase());
      const matchSection =
        selectedSection === "All" ||
        row.section.toLowerCase().includes(selectedSection.toLowerCase());

      return matchBatch && matchDept && matchSection;
    });
  }, [rawAssignments, selectedBatch, selectedDept, selectedSection]);

  const batchOptions = useMemo(() => {
    const set = new Set<string>();
    rawAssignments.forEach((item) => {
      item.batch
        .split(/[·,]/)
        .map((b) => b.trim())
        .filter(Boolean)
        .forEach((b) => set.add(b));
    });
    return ["All", ...Array.from(set)];
  }, [rawAssignments]);

  const deptOptions = useMemo(() => {
    const set = new Set<string>();
    rawAssignments.forEach((item) => {
      item.department
        .split(/[·,]/)
        .map((d) => d.trim())
        .filter(Boolean)
        .forEach((d) => set.add(d));
    });
    return ["All", ...Array.from(set)];
  }, [rawAssignments]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    rawAssignments.forEach((item) => {
      item.section
        .split(/[·,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s));
    });
    return ["All", ...Array.from(set)];
  }, [rawAssignments]);

  const totalElements = assignmentsPage?.totalElements ?? filteredRows.length;
  const totalPages = Math.max(1, assignmentsPage?.totalPages ?? Math.ceil(totalElements / pageSize));

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  };

  const handlePageInputGo = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      handlePageChange(parsed);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteAssessment(deletingId).unwrap();
      setSnackbar({
        open: true,
        message: "Assessment removed successfully.",
        severity: "info",
      });
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to remove assessment. Please try again.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const statKpis = [
    {
      title: "Total Test Record",
      value: summary?.totalTestRecord ?? 0,
      subtext: "Total Test assigned to Students",
      icon: <AssignmentOutlinedIcon sx={{ color: "#98a2b3", fontSize: 22 }} />,
    },
    {
      title: "Upcomming Test",
      value: summary?.upcomingTest ?? 0,
      subtext: "Assigned test for future",
      icon: <AccessTimeOutlinedIcon sx={{ color: "#98a2b3", fontSize: 22 }} />,
    },
    {
      title: "Completed Test",
      value: summary?.completedTest ?? 0,
      subtext: "Number of test completed",
      icon: <HistoryToggleOffOutlinedIcon sx={{ color: "#98a2b3", fontSize: 22 }} />,
    },
  ];

  const columns: AppTableColumn<TeacherAssignmentItem>[] = [
    {
      id: "index",
      label: "#",
      header: (
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
          #
        </Typography>
      ),
      width: "50px",
      render: (_, index) => (
        <Typography sx={{ fontSize: "13px", color: "#344054", fontWeight: 500 }}>
          {(currentPage - 1) * pageSize + index + 1}
        </Typography>
      ),
    },
    {
      id: "testName",
      label: "Test name",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Test name
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#101828" }}>
            {row.testName}
          </Typography>
          <Typography sx={{ fontSize: "11.5px", color: "#667085", mt: 0.25 }}>
            {row.categories || "MCQ, LSRW, Coding"}
          </Typography>
        </Box>
      ),
    },
    {
      id: "batch",
      label: "Batch",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Batch
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 90,
      render: (row) => (
        <Typography sx={{ fontSize: "13px", color: "#344054", fontWeight: 500 }}>
          {cleanBatchString(row.batch)}
        </Typography>
      ),
    },
    {
      id: "department",
      label: "Department",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Department
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 120,
      render: (row) => (
        <Typography sx={{ fontSize: "13px", color: "#344054", fontWeight: 500 }}>
          {row.department}
        </Typography>
      ),
    },
    {
      id: "section",
      label: "Section",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Section
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 80,
      render: (row) => (
        <Typography sx={{ fontSize: "13px", color: "#344054", fontWeight: 500 }}>
          {row.section}
        </Typography>
      ),
    },
    {
      id: "date",
      label: "Date and Time",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Date and Time
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#101828" }}>
            {formatDate(row.opensAt)}
          </Typography>
          <Typography sx={{ fontSize: "11.5px", color: "#667085", mt: 0.25 }}>
            {formatTimeRange(row.opensAt, row.closesAt)}
          </Typography>
        </Box>
      ),
    },
    {
      id: "averageMark",
      label: "Average mark",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Average mark
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#101828" }}>
            {row.averageMarkDisplay || `${row.averageMark} / ${row.totalMarks}`}
          </Typography>
          <Typography sx={{ fontSize: "11.5px", color: "#667085", mt: 0.25 }}>
            {row.attendanceDisplay || `${row.totalStudentsAttended} / ${row.totalStudentsAssigned} Students attended`}
          </Typography>
        </Box>
      ),
    },
    {
      id: "status",
      label: "Status",
      header: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
            Status
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
        </Box>
      ),
      minWidth: 130,
      render: (row) => {
        const normalized = (row.status || "").toLowerCase();
        let bg = "#ecfdf3";
        let text = "#16a34a";
        let dot = "#16a34a";
        let label = "completed";

        if (normalized.includes("curr") || normalized.includes("active") || normalized.includes("ongoing")) {
          bg = "#e0f2fe";
          text = "#0284c7";
          dot = "#0284c7";
          label = "Current";
        } else if (normalized.includes("upcom") || normalized.includes("sched")) {
          bg = "#fff7ed";
          text = "#ea580c";
          dot = "#ea580c";
          label = "Upcomming";
        }

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: "16px",
              bgcolor: bg,
              color: text,
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: dot,
              }}
            />
            {label}
          </Box>
        );
      },
    },
  ];

  const upcomingAssignments: TeacherUpcomingAssignmentItem[] =
    dashboardData?.upcomingAssignments && dashboardData.upcomingAssignments.length > 0
      ? dashboardData.upcomingAssignments
      : (rawAssignments.filter((r) =>
        (r.status || "").toLowerCase().includes("upcom")
      ) as unknown as TeacherUpcomingAssignmentItem[]);

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
      </Box>

      {isError && (
        <Alert
          severity="error"
          action={
            <MuiButton color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </MuiButton>
          }
          sx={{ mb: 3, borderRadius: "10px" }}
        >
          Failed to load dashboard data. Please check backend connection or retry.
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
            {welcomeMessage}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "20px", sm: "24px", md: "26px" },
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            Let’s inspire young minds today!
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
          mb: 2,
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
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
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <MuiButton
            onClick={(e) => setBatchAnchor(e.currentTarget)}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            sx={{
              textTransform: "none",
              color: "#344054",
              border: "1px solid #d0d5dd",
              borderRadius: "8px",
              px: 1.75,
              py: 0.65,
              fontSize: "13px",
              fontWeight: 500,
              bgcolor: "#ffffff",
              "&:hover": { bgcolor: "#f9fafb", borderColor: "#98a2b3" },
            }}
          >
            {selectedBatch === "All" ? "Batch" : `Batch: ${selectedBatch}`}
          </MuiButton>
          <Menu
            anchorEl={batchAnchor}
            open={Boolean(batchAnchor)}
            onClose={() => setBatchAnchor(null)}
          >
            {batchOptions.map((b) => (
              <MenuItem
                key={b}
                selected={selectedBatch === b}
                onClick={() => {
                  setSelectedBatch(b);
                  setCurrentPage(1);
                  setBatchAnchor(null);
                }}
                sx={{ fontSize: "13px" }}
              >
                {b === "All" ? "All Batches" : b}
              </MenuItem>
            ))}
          </Menu>

          <MuiButton
            onClick={(e) => setDeptAnchor(e.currentTarget)}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            sx={{
              textTransform: "none",
              color: "#344054",
              border: "1px solid #d0d5dd",
              borderRadius: "8px",
              px: 1.75,
              py: 0.65,
              fontSize: "13px",
              fontWeight: 500,
              bgcolor: "#ffffff",
              "&:hover": { bgcolor: "#f9fafb", borderColor: "#98a2b3" },
            }}
          >
            {selectedDept === "All" ? "Department" : `Dept: ${selectedDept}`}
          </MuiButton>
          <Menu
            anchorEl={deptAnchor}
            open={Boolean(deptAnchor)}
            onClose={() => setDeptAnchor(null)}
          >
            {deptOptions.map((dept) => (
              <MenuItem
                key={dept}
                selected={selectedDept === dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setCurrentPage(1);
                  setDeptAnchor(null);
                }}
                sx={{ fontSize: "13px" }}
              >
                {dept === "All" ? "All Departments" : dept}
              </MenuItem>
            ))}
          </Menu>

          <MuiButton
            onClick={(e) => setSectionAnchor(e.currentTarget)}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            sx={{
              textTransform: "none",
              color: "#344054",
              border: "1px solid #d0d5dd",
              borderRadius: "8px",
              px: 1.75,
              py: 0.65,
              fontSize: "13px",
              fontWeight: 500,
              bgcolor: "#ffffff",
              "&:hover": { bgcolor: "#f9fafb", borderColor: "#98a2b3" },
            }}
          >
            {selectedSection === "All" ? "Section" : `Sec: ${selectedSection}`}
          </MuiButton>
          <Menu
            anchorEl={sectionAnchor}
            open={Boolean(sectionAnchor)}
            onClose={() => setSectionAnchor(null)}
          >
            {sectionOptions.map((sec) => (
              <MenuItem
                key={sec}
                selected={selectedSection === sec}
                onClick={() => {
                  setSelectedSection(sec);
                  setCurrentPage(1);
                  setSectionAnchor(null);
                }}
                sx={{ fontSize: "13px" }}
              >
                {sec === "All" ? "All Sections" : `Section ${sec}`}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Box
        sx={{
          border: "1px solid #eaecf0",
          borderRadius: "12px",
          overflow: "hidden",
          bgcolor: "#ffffff",
          mb: 1.5,
        }}
      >
        <Table<TeacherAssignmentItem>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.assignmentId || row.assessmentId}
          loading={isLoading || isFetching}
          emptyMessage="No tests found matching criteria."
          sx={{
            "& .MuiTableCell-head": {
              bgcolor: "#f9fafb",
              py: 1.5,
              borderBottom: "1px solid #eaecf0",
            },
            "& .MuiTableCell-body": {
              py: 1.8,
              borderBottom: "1px solid #f2f4f7",
            },
            "& .MuiTableRow-root:last-child .MuiTableCell-body": {
              borderBottom: "none",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          py: 1.5,
          px: 1,
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "13px", color: "#667085", fontWeight: 500 }}>
          {totalElements === 0
            ? "0 of 0"
            : `${(currentPage - 1) * pageSize + 1} - ${Math.min(
              currentPage * pageSize,
              totalElements
            )} of ${totalElements}`}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => handlePageChange(1)}
            sx={{ color: "#667085", "&:disabled": { color: "#d0d5dd" } }}
          >
            <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => handlePageChange(currentPage - 1)}
            sx={{ color: "#667085", "&:disabled": { color: "#d0d5dd" } }}
          >
            <KeyboardArrowLeftRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            disabled={currentPage >= totalPages || isFetching}
            onClick={() => handlePageChange(currentPage + 1)}
            sx={{ color: "#667085", "&:disabled": { color: "#d0d5dd" } }}
          >
            <KeyboardArrowRightRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            disabled={currentPage >= totalPages || isFetching}
            onClick={() => handlePageChange(totalPages)}
            sx={{ color: "#667085", "&:disabled": { color: "#d0d5dd" } }}
          >
            <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "13px", color: "#667085", fontWeight: 500 }}>
            Page
          </Typography>
          <InputBase
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePageInputGo();
            }}
            sx={{
              width: 36,
              height: 28,
              border: "1px solid #d0d5dd",
              borderRadius: "4px",
              px: 0.5,
              fontSize: "12px",
              textAlign: "center",
              "& input": { textAlign: "center", p: 0 },
            }}
          />
          <MuiButton
            size="small"
            onClick={handlePageInputGo}
            sx={{
              minWidth: "auto",
              p: 0,
              fontSize: "13px",
              fontWeight: 600,
              color: "#344054",
              textTransform: "none",
              "&:hover": { color: "#2563eb", bgcolor: "transparent" },
            }}
          >
            Go
          </MuiButton>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {isLoading || isFetching ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <AppSkeleton
              key={idx}
              variant="rectangular"
              height={78}
              sx={{ borderRadius: "12px" }}
            />
          ))
        ) : upcomingAssignments.length === 0 ? (
          <Box
            sx={{
              p: 3,
              border: "1px dashed #eaecf0",
              borderRadius: "12px",
              textAlign: "center",
              bgcolor: "#fafafa",
            }}
          >
            <Typography sx={{ fontSize: "13.5px", color: "#667085", fontWeight: 500 }}>
              No upcoming scheduled tests available.
            </Typography>
          </Box>
        ) : (
          upcomingAssignments.map((card, idx) => {
            const cardId = card.assignmentId || card.assessmentId || String(idx);
            return (
              <Card
                key={cardId}
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
                  p: { xs: 2, sm: "16px 20px" },
                  "&:last-child": { pb: { xs: 2, sm: "16px" } },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 200 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        bgcolor: "#fff7ed",
                        border: "1px solid #ffedd5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ea580c",
                        flexShrink: 0,
                      }}
                    >
                      <AssignmentOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828" }}>
                        {card.testName || "Assessment"}
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.25 }}>
                        {card.categories || "MCQ, LSRW, Coding"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 100 }}>
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#101828" }}>
                      {card.department || "-"} {card.section ? `- ${card.section}` : ""}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.25 }}>
                      {cleanBatchString(card.batch)} Batch
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 140 }}>
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#101828" }}>
                      {formatDate(card.opensAt)}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.25 }}>
                      {formatTimeRange(card.opensAt, card.closesAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 110 }}>
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#101828" }}>
                      {card.totalStudentsAssigned ?? card.students ?? 0} Students
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.25 }}>
                      {card.totalMarks ?? card.marks ?? 0} Marks
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate("/teacher/assessments")}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        border: "1.5px solid #60a5fa",
                        color: "#2563eb",
                        bgcolor: "#ffffff",
                        "&:hover": {
                          bgcolor: "#eff6ff",
                          borderColor: "#2563eb",
                        },
                      }}
                    >
                      <ModeEditOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => setDeletingId(card.assessmentId || card.assignmentId || null)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        border: "1.5px solid #f87171",
                        color: "#ef4444",
                        bgcolor: "#ffffff",
                        "&:hover": {
                          bgcolor: "#fef2f2",
                          borderColor: "#dc2626",
                        },
                      }}
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            );
          })
        )}
      </Box>

      <Dialog
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: { borderRadius: "14px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", color: "#101828" }}>
          Delete Assessment
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "14px", color: "#475467" }}>
            Are you sure you want to remove this assessment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton
            onClick={() => setDeletingId(null)}
            disabled={isDeleting}
            sx={{ textTransform: "none", color: "#667085", fontWeight: 600 }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={handleDeleteConfirm}
            sx={{
              textTransform: "none",
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
              fontWeight: 600,
              borderRadius: "8px",
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: "8px", fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherDashBoard;