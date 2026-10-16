import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Chip,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  DoneAll as DoneAllIcon,
  MoreHoriz as MoreHorizIcon,
  CalendarMonthRounded as CalendarMonthIcon,
  RemoveCircleOutlineOutlined,
} from "@mui/icons-material";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import Table from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import type { SnackbarState } from "../../types/Snackbar.types";
import type { AppTableColumn } from "../../types/Table.types";

import {
  useGetViolationsQuery,
  useUpdateViolationStatusMutation,
} from "../../features/violation/ViolationApi";
import type { ViolationItem } from "../../types/Violation.types";

export const TeacherViolationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const [selectedViolation, setSelectedViolation] = useState<ViolationItem | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: rawResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetViolationsQuery({
    search: searchQuery.trim() || undefined,
    batch: selectedBatch === "All" ? undefined : selectedBatch,
    status: statusFilter === "All" || statusFilter === "All Status" ? undefined : statusFilter,
    startDate: selectedDate || undefined,
    endDate: selectedDate || undefined,
    page,
    size: pageSize,
  });

  const [updateStatusTrigger, { isLoading: isUpdatingStatus }] = useUpdateViolationStatusMutation();

  const data = rawResponse?.data;
  const violationsData = data?.violations || data;
  const violationsList: ViolationItem[] =
    violationsData?.content || (Array.isArray(violationsData) ? violationsData : data?.content || []);
  const summary = data?.summary || data?.kpis;
  const totalElements = violationsData?.totalElements ?? data?.totalElements ?? violationsList.length;

  const distinctBatches: string[] = data?.distinctBatches || ["2026", "2025", "2024", "2021 - 2025"];
  const distinctStatuses: string[] = data?.distinctStatuses || ["Pending", "Allowed", "Disqualified"];

  const kpiStats = [
    {
      title: "Total Violated Test",
      value: summary?.totalViolatedTest ?? summary?.totalViolations ?? totalElements,
      subtext: "Total Test Violated by Students",
      icon: <SecurityIcon sx={{ color: "#475467", fontSize: 22 }} />,
      bg: "#f8fafc",
    },
    {
      title: "Pending Count",
      value: summary?.pendingCount ?? summary?.pendingReviews ?? 0,
      subtext: "Not reviewed test count",
      icon: <RemoveCircleOutlineOutlined sx={{ color: "#475467", fontSize: 22 }} />,
      bg: "#f8fafc",
    },
    {
      title: "Allowed Count",
      value: summary?.allowedCount ?? 0,
      subtext: "Review and allowed test count",
      icon: <DoneAllIcon sx={{ color: "#16a34a", fontSize: 22 }} />,
      bg: "#f8fafc",
    },
  ];

  const renderReasonBadge = (reason?: string) => {
    if (!reason) return <Typography sx={{ fontSize: "13px", color: "#94a3b8" }}>-</Typography>;
    const rLower = reason.toLowerCase();
    let bg = "#f1f5f9";
    let color = "#475467";

    if (rLower.includes("tab")) {
      bg = "#fff7ed";
      color = "#ea580c";
    } else if (rLower.includes("screen") || rLower.includes("fullscreen")) {
      bg = "#f3e8ff";
      color = "#7c3aed";
    } else if (rLower.includes("ctrl") || rLower.includes("shift") || rLower.includes("function") || rLower.includes("key")) {
      bg = "#ecfeff";
      color = "#0891b2";
    }

    return (
      <Chip
        size="small"
        label={reason}
        sx={{
          bgcolor: bg,
          color,
          fontSize: "11.5px",
          fontWeight: 700,
          borderRadius: "14px",
          border: "none",
          px: 0.75,
          height: 24,
        }}
      />
    );
  };

  const renderStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "allowed":
        return (
          <Chip
            size="small"
            label="Allowed"
            sx={{
              bgcolor: "#ecfdf3",
              color: "#16a34a",
              fontWeight: 700,
              fontSize: "11.5px",
              borderRadius: "14px",
              border: "none",
              height: 24,
            }}
          />
        );
      case "disqualified":
        return (
          <Chip
            size="small"
            label="Disqualified"
            sx={{
              bgcolor: "#fef2f2",
              color: "#dc2626",
              fontWeight: 700,
              fontSize: "11.5px",
              borderRadius: "14px",
              border: "none",
              height: 24,
            }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label="Pending"
            sx={{
              bgcolor: "#fff7ed",
              color: "#ea580c",
              fontWeight: 700,
              fontSize: "11.5px",
              borderRadius: "14px",
              border: "none",
              height: 24,
            }}
          />
        );
    }
  };

  const columns: AppTableColumn<ViolationItem>[] = [
    {
      id: "assessmentName",
      label: "Assessment",
      minWidth: 160,
      render: (row) => (
        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#101828" }}>
          {row.assessmentName || row.testName || row.assessmentTitle || "Assessment"}
        </Typography>
      ),
    },
    {
      id: "studentName",
      label: "Student",
      minWidth: 140,
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#101828" }}>
            {row.studentName || "Student"}
          </Typography>
          {row.registerNumber && (
            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
              {row.registerNumber}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "department",
      label: "Dept",
      minWidth: 80,
      render: (row) => (
        <Typography sx={{ fontSize: "13px", color: "#475467" }}>
          {row.department || row.dept || "-"}
        </Typography>
      ),
    },
    {
      id: "section",
      label: "Section",
      minWidth: 70,
      render: (row) => (
        <Typography sx={{ fontSize: "13px", color: "#475467" }}>
          {row.section || "-"}
        </Typography>
      ),
    },
    {
      id: "batch",
      label: "Batch",
      minWidth: 90,
      render: (row) => (
        <Typography sx={{ fontSize: "13px", color: "#475467" }}>
          {row.batch || "-"}
        </Typography>
      ),
    },
    {
      id: "time",
      label: "Time",
      minWidth: 130,
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
            {row.dateDisplay || (row.time ? new Date(row.time).toLocaleDateString() : "-")}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
            {row.timeDisplay || (row.time ? new Date(row.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
          </Typography>
        </Box>
      ),
    },
    {
      id: "reason",
      label: "Reason",
      minWidth: 140,
      render: (row) => renderReasonBadge(row.reason || row.violationType),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 100,
      render: (row) => renderStatusBadge(row.status),
    },
    {
      id: "action",
      label: "Action",
      align: "center",
      minWidth: 70,
      render: (row) => (
        <IconButton
          size="small"
          onClick={() => setSelectedViolation(row)}
          sx={{ color: "#98a2b3", "&:hover": { color: "#101828", bgcolor: "#f1f5f9" } }}
          title="Inspect incident"
        >
          <MoreHorizIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  const handleUpdateStatus = async (violationId: string, newStatus: "Allowed" | "Disqualified" | "Pending") => {
    try {
      await updateStatusTrigger({
        id: violationId,
        body: {
          status: newStatus,
          reviewerName: "Teacher",
        },
      }).unwrap();

      setSnackbar({
        open: true,
        message: `Violation status successfully updated to ${newStatus}.`,
        severity: "success",
      });

      if (selectedViolation && selectedViolation.id === violationId) {
        setSelectedViolation((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      refetch();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.data?.message || err?.message || "Failed to update violation status.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "100vh", bgcolor: "#fbfcfe" }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: "#101828", fontSize: "24px" }}>
            Violation
          </Typography>
          <Typography variant="body2" sx={{ color: "#667085", mt: 0.5, fontSize: "13.5px" }}>
            MCQ and aptitude questions organized by Domain → Skill → Topic. Reused across practice and tests.
          </Typography>
        </Box>

        <IconButton
          onClick={() => refetch()}
          title="Refresh Violations"
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
          Failed to retrieve violation incidents. Please check your connection and retry.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        {kpiStats.map((kpi) => (
          <Card
            key={kpi.title}
            elevation={0}
            sx={{
              border: "1px solid #eaecf0",
              bgcolor: "#ffffff",
              borderRadius: "14px",
              p: 2.75,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography sx={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                  {kpi.title}
                </Typography>
                <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#101828", mt: 0.75 }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#94a3b8", mt: 0.5 }}>
                  {kpi.subtext}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #eaecf0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#ffffff",
                }}
              >
                {kpi.icon}
              </Box>
            </Box>
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
            width: { xs: "100%", sm: 360 },
            border: "1px solid #e4e7ec",
            borderRadius: "10px",
            px: 2,
            py: 0.8,
            bgcolor: "#ffffff",
          }}
        >
          <SearchIcon sx={{ color: "#98a2b3", fontSize: 20, mr: 1.25 }} />
          <InputBase
            placeholder="Search by Department, name, Year ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ width: "100%", fontSize: "13.5px", color: "#101828" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Select
            size="small"
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setPage(0);
            }}
            displayEmpty
            sx={{
              height: 40,
              borderRadius: "10px",
              bgcolor: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 500,
              color: "#344054",
              minWidth: 130,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e4e7ec" },
            }}
          >
            <MenuItem value="All">Batch</MenuItem>
            {distinctBatches.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            displayEmpty
            sx={{
              height: 40,
              borderRadius: "10px",
              bgcolor: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 500,
              color: "#344054",
              minWidth: 130,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e4e7ec" },
            }}
          >
            <MenuItem value="All">All Status</MenuItem>
            {distinctStatuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>

          <Box
            component="label"
            sx={{
              height: 40,
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              borderRadius: "10px",
              border: "1px solid #e4e7ec",
              bgcolor: "#ffffff",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: 500,
              color: selectedDate ? "#101828" : "#344054",
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 18, color: "#667085" }} />
            <Typography sx={{ fontSize: "13.5px", fontWeight: 500 }}>
              {selectedDate ? selectedDate : "Date and Time"}
            </Typography>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(0);
              }}
              style={{
                position: "absolute",
                opacity: 0,
                width: 0,
                height: 0,
                pointerEvents: "none",
              }}
            />
          </Box>
          {selectedDate && (
            <Button
              variant="text"
              size="small"
              onClick={() => setSelectedDate("")}
              sx={{ fontSize: "12px", textTransform: "none", color: "#64748b" }}
            >
              Clear Date
            </Button>
          )}
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{
          border: "1px solid #eaecf0",
          borderRadius: "12px",
          bgcolor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <Table<ViolationItem>
          columns={columns}
          rows={violationsList}
          getRowId={(row) => row.id}
          loading={isLoading}
          emptyMessage="No proctoring violations recorded"
          sx={{
            "& .MuiTableCell-head": {
              bgcolor: "#fcfcfd",
              color: "#475467",
              fontSize: "12px",
              fontWeight: 600,
              borderBottom: "1px solid #eaecf0",
              py: 1.5,
            },
            "& .MuiTableCell-body": {
              borderBottom: "1px solid #f2f4f7",
              py: 1.75,
            },
          }}
        />

        <Box sx={{ borderTop: "1px solid #eaecf0", bgcolor: "#ffffff" }}>
          <Pagination
            count={totalElements}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      </Card>

      <Dialog
        open={Boolean(selectedViolation)}
        onClose={() => setSelectedViolation(null)}
        title="Proctoring Incident Report"
        maxWidth="sm"
        showCloseButton
        actions={
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectedViolation(null)}
              sx={{ textTransform: "none", color: "#64748b", borderRadius: "8px" }}
            >
              Close
            </Button>
            {selectedViolation && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  disabled={isUpdatingStatus || selectedViolation.status === "Allowed"}
                  onClick={() => handleUpdateStatus(selectedViolation.id, "Allowed")}
                  sx={{
                    borderColor: "#16a34a",
                    color: "#16a34a",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Mark Allowed
                </Button>
                <Button
                  variant="contained"
                  disabled={isUpdatingStatus || selectedViolation.status === "Disqualified"}
                  onClick={() => handleUpdateStatus(selectedViolation.id, "Disqualified")}
                  sx={{
                    bgcolor: "#dc2626",
                    color: "#ffffff",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                >
                  Disqualify
                </Button>
              </Box>
            )}
          </Box>
        }
      >
        {selectedViolation && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#101828" }}>
                {selectedViolation.studentName}
              </Typography>
              <Typography sx={{ fontSize: "12.5px", color: "#64748b", mt: 0.25 }}>
                Reg: {selectedViolation.registerNumber || "N/A"} • Test: {selectedViolation.assessmentName || selectedViolation.testName || "Assessment"}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>
                Dept: {selectedViolation.department || "-"} • Sec: {selectedViolation.section || "-"} • Batch: {selectedViolation.batch || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                VIOLATION REASON
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {renderReasonBadge(selectedViolation.reason || selectedViolation.violationType)}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                INCIDENT DETAILS
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#334155", mt: 0.5, lineHeight: 1.5 }}>
                {selectedViolation.details || selectedViolation.description || "Proctoring sensor detected unauthorized action."}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid #f1f5f9" }}>
              <Box>
                <Typography sx={{ fontSize: "11px", color: "#64748b" }}>TIMESTAMP</Typography>
                <Typography sx={{ fontSize: "12.5px", color: "#101828", fontWeight: 600 }}>
                  {selectedViolation.dateDisplay || ""} {selectedViolation.timeDisplay || selectedViolation.time || "Recent"}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "11px", color: "#64748b" }}>CURRENT STATUS</Typography>
                <Box sx={{ mt: 0.25 }}>{renderStatusBadge(selectedViolation.status)}</Box>
              </Box>
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

export default TeacherViolationPage;
