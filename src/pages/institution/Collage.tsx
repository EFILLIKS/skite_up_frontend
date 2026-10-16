import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import {
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ApartmentOutlined,
  DeleteOutlineOutlined,
  Edit,
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
  KeyboardDoubleArrowLeftOutlined,
  KeyboardDoubleArrowRightOutlined,
  SearchOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import Table from "../../components/common/Table";
import type { AppTableColumn } from "../../types/Table.types";
import {
  useGetInstitutionsQuery,
  useDeleteInstitutionMutation,
  type Institution,
} from "../../features/institutionservice/InstitutionApi";
import Button from "../../components/common/Button";
import Dialog from "../../components/common/Dialog";

type StatusType = "Active" | "Pending" | "Renewal Soon" | "Expired";

const statusStyles: Record<StatusType, { bg: string; color: string; dot: string }> = {
  Active: { bg: "#edfdf0", color: "#16a34a", dot: "#16a34a" },
  "Renewal Soon": { bg: "#fff8eb", color: "#d97706", dot: "#d97706" },
  Pending: { bg: "#eff6ff", color: "#2563eb", dot: "#2563eb" },
  Expired: { bg: "#fef3f2", color: "#dc2626", dot: "#dc2626" },
};

const iconColorPresets = [
  { bg: "#ecfdf3", color: "#16a34a" },
  { bg: "#fef2f2", color: "#ef4444" },
  { bg: "#f0f2f5", color: "#475467" },
  { bg: "#fff8eb", color: "#d97706" },
  { bg: "#eff6ff", color: "#2563eb" },
];

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "#";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "#";
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "#";
  }
};

const getDaysLeft = (dateString?: string | null): string => {
  if (!dateString) return "#";
  try {
    const target = new Date(dateString).getTime();
    if (isNaN(target)) return "#";
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    if (diff === 0) return "Today";
    return `${diff} days left`;
  } catch {
    return "#";
  }
};

const computeStatus = (item: Institution, currentFilter?: string): StatusType => {
  if (item.isRemoved) return "Expired";
  if (currentFilter && currentFilter !== "All") {
    if (currentFilter === "Renewal Soon" || currentFilter.toLowerCase() === "renewal") {
      return "Renewal Soon";
    }
    if (currentFilter === "Active") return "Active";
    if (currentFilter === "Pending") return "Pending";
    if (currentFilter === "Expired") return "Expired";
  }

  if (item.planRenewalDate) {
    const target = new Date(item.planRenewalDate).getTime();
    if (!isNaN(target)) {
      const diff = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
      if (diff <= 0) return "Expired";
      if (diff <= 15) return "Renewal Soon";
    }
  }
  if (item.isActivated === true) return "Active";
  if (item.isActivated === false) return "Expired";
  return "Active";
};

const getStudentCapacity = (item: Institution): number | null => {
  if (item.maxMembers != null && item.maxMembers > 0) return item.maxMembers;
  if (item.studentSlot != null && item.studentSlot > 0) return item.studentSlot;
  if (item.studentCapacity != null && item.studentCapacity > 0) return item.studentCapacity;
  if (item.studentCount != null && item.studentCount > 0) return item.studentCount;
  if (item.planCode === "TRIAL") return 20;
  if (item.planCode === "STANDARD") return 500;
  if (item.planCode === "ENTERPRISE") return 1000;
  return null;
};

const getCurrentStudents = (item: Institution): number => {
  if (item.currentStudentCount != null) return item.currentStudentCount;
  if (item.students != null) return item.students;
  return 0;
};

interface FilterPillProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
  bg: string;
  color: string;
}

const FilterPill = ({ label, count, active, onClick, dotColor, bg, color }: FilterPillProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.85,
      px: 1.5,
      py: 0.6,
      borderRadius: "20px",
      bgcolor: bg,
      color: color,
      cursor: "pointer",
      userSelect: "none",
      border: active ? `2px solid ${color}` : "2px solid transparent",
      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      transition: "all 0.15s ease",
      "&:hover": {
        opacity: 0.9,
      },
    }}
  >
    {dotColor && (
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: dotColor,
        }}
      />
    )}
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "inherit" }}>
      {label}
    </Typography>
    <Box
      sx={{
        px: 0.9,
        py: 0.15,
        borderRadius: "10px",
        bgcolor: "#ffffff",
        color: color,
        fontSize: 11,
        fontWeight: 700,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      {count}
    </Box>
  </Box>
);

const College = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [pageInput, setPageInput] = useState("1");

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedFilter]);

  const apiStatus = useMemo(() => {
    if (selectedFilter === "All") return undefined;
    if (selectedFilter === "Renewal Soon" || selectedFilter.toLowerCase() === "renewal") {
      return "renewal";
    }
    return selectedFilter.toLowerCase();
  }, [selectedFilter]);

  const { data: collegeResponse, isLoading } = useGetInstitutionsQuery({
    page,
    size: pageSize,
    search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
    status: apiStatus,
  });

  const [deleteInstitution] = useDeleteInstitutionMutation();

  const collegeData = collegeResponse?.data;
  const rawList: Institution[] = useMemo(() => {
    return collegeData?.content || [];
  }, [collegeData]);

  const filteredList = useMemo(() => {
    const searchLower = debouncedSearch.trim().toLowerCase();
    if (!searchLower) {
      return rawList;
    }
    return rawList.filter((item) => {
      const status = computeStatus(item, selectedFilter);
      return (
        item.institutionName?.toLowerCase().includes(searchLower) ||
        item.institutionCode?.toLowerCase().includes(searchLower) ||
        status.toLowerCase().includes(searchLower) ||
        item.planName?.toLowerCase().includes(searchLower) ||
        item.planCode?.toLowerCase().includes(searchLower) ||
        item.city?.toLowerCase().includes(searchLower)
      );
    });
  }, [rawList, debouncedSearch, selectedFilter]);

  const totalElements = collegeData?.totalElements ?? filteredList.length;
  const totalPages = collegeData?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const activeCount = collegeData?.activeCount ?? rawList.filter((i) => computeStatus(i) === "Active").length;
  const pendingCount = collegeData?.pendingCount ?? rawList.filter((i) => computeStatus(i) === "Pending").length;
  const renewalCount =
    collegeData?.renewalCount ??
    rawList.filter((i) => {
      const s = computeStatus(i);
      return s === "Renewal Soon" || (s as string) === "Renewal";
    }).length;
  const expiredCount = collegeData?.expiredCount ?? rawList.filter((i) => computeStatus(i) === "Expired").length;
  const allCount = totalElements;

  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDelete = (item: Institution) => {
    setDeleteTarget(item);
    setConfirmName("");
  };

  const handleCloseDelete = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
      setConfirmName("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (confirmName.trim() !== deleteTarget.institutionName.trim()) return;

    try {
      setIsDeleting(true);
      await deleteInstitution(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      setConfirmName("");
    } catch (err) {
      console.error("Failed to delete institution:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: AppTableColumn<Institution>[] = [
    {
      id: "index",
      label: "#",
      width: "5%",
      minWidth: 45,
      header: <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467" }}>#</Typography>,
      render: (_item, index) => (
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#344054" }}>
          {page * pageSize + index + 1}
        </Typography>
      ),
    },
    {
      id: "institutionName",
      label: "college Name",
      width: "32%",
      minWidth: 210,
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467" }}>
          college Name
        </Typography>
      ),
      render: (item, index) => {
        const preset = iconColorPresets[index % iconColorPresets.length];
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: preset.bg,
                color: preset.color,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ApartmentOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#101828",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.institutionName}
              </Typography>
              {item.institutionCode && (
                <Typography sx={{ fontSize: 11, color: "#667085" }}>
                  {item.institutionCode}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      id: "students",
      label: "Students",
      width: "20%",
      minWidth: 150,
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467" }}>
          Students
        </Typography>
      ),
      render: (item) => {
        const capacity = getStudentCapacity(item);
        const current = getCurrentStudents(item);

        if (capacity == null || capacity <= 0) {
          return (
            <Box sx={{ width: "88%" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>#</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={0}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#eaecf0",
                    "& .MuiLinearProgress-bar": { bgcolor: "#2563eb", borderRadius: 3 },
                  }}
                />
                <Typography sx={{ fontSize: 11, color: "#667085", minWidth: 26 }}>
                  #
                </Typography>
              </Box>
            </Box>
          );
        }

        const percent = Math.min(100, Math.round((current / capacity) * 100));

        return (
          <Box sx={{ width: "88%" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
              {current} / {capacity}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#eaecf0",
                  "& .MuiLinearProgress-bar": { bgcolor: "#2563eb", borderRadius: 3 },
                }}
              />
              <Typography sx={{ fontSize: 11, color: "#667085", minWidth: 28 }}>
                {percent}%
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "renewalDate",
      label: "Renewal Date",
      width: "18%",
      minWidth: 130,
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467" }}>
          Renewal Date
        </Typography>
      ),
      render: (item) => {
        const renewal = item.planRenewalDate || item.renewalDate;
        if (!renewal) {
          return (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>#</Typography>
              <Typography sx={{ fontSize: 11, color: "#667085" }}>#</Typography>
            </Box>
          );
        }

        return (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
              {formatDate(renewal)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#667085" }}>
              {getDaysLeft(renewal)}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "status",
      label: "Status",
      width: "13%",
      minWidth: 105,
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467" }}>
          Status
        </Typography>
      ),
      render: (item) => {
        const status = computeStatus(item, selectedFilter);
        const style = statusStyles[status] || statusStyles.Active;
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              borderRadius: 1,
              bgcolor: style.bg,
              color: style.color,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: style.dot,
              }}
            />
            {status}
          </Box>
        );
      },
    },
    {
      id: "actions",
      label: "Actions",
      width: "12%",
      minWidth: 95,
      align: "center",
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467", textAlign: "center" }}>
          Actions
        </Typography>
      ),
      render: (item) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <Button
            size="small"
            aria-label={`Edit ${item.institutionName}`}
            onClick={() => navigate(`/colleges/form/${item.id}`)}
            sx={{
              minWidth: "26px !important",
              width: "26px !important",
              height: "26px !important",
              p: "0 !important",
              borderRadius: 1.25,
              border: "1px solid #93c5fd",
              bgcolor: "#fff",
              color: "#2563eb",
              "&:hover": { bgcolor: "#eff6ff", borderColor: "#60a5fa" },
            }}
          >
            <Edit sx={{ fontSize: 14 }} />
          </Button>
          <Button
            size="small"
            aria-label={`Delete ${item.institutionName}`}
            onClick={() => handleOpenDelete(item)}
            sx={{
              minWidth: "26px !important",
              width: "26px !important",
              height: "26px !important",
              p: "0 !important",
              borderRadius: 1.25,
              border: "1px solid #fca5a5",
              bgcolor: "#fff",
              color: "#ef4444",
              "&:hover": { bgcolor: "#fef2f2", borderColor: "#f87171" },
            }}
          >
            <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
          </Button>
        </Box>
      ),
    },
  ];

  const handlePageGo = () => {
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p - 1);
    }
  };

  const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRecord = Math.min((page + 1) * pageSize, totalElements);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: "#101828",
              lineHeight: 1.3,
            }}
          >
            Colleges
          </Typography>
          <Typography sx={{ mt: 0.35, fontSize: 13, color: "#667085" }}>
            Manage college, student limits and renewal details.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 19 }} />}
          onClick={() => navigate("/colleges/form")}
          sx={{
            bgcolor: "#2563eb",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            px: 2,
            py: 0.85,
            borderRadius: 1.5,
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Add College
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <FilterPill
            label="All"
            count={allCount}
            active={selectedFilter === "All"}
            onClick={() => { setSelectedFilter("All"); setPage(0); }}
            bg="#f2f4f7"
            color="#344054"
          />
          <FilterPill
            label="Active"
            count={activeCount}
            active={selectedFilter === "Active"}
            onClick={() => { setSelectedFilter("Active"); setPage(0); }}
            dotColor="#16a34a"
            bg="#edfdf0"
            color="#16a34a"
          />
          <FilterPill
            label="Pending"
            count={pendingCount}
            active={selectedFilter === "Pending"}
            onClick={() => { setSelectedFilter("Pending"); setPage(0); }}
            dotColor="#2563eb"
            bg="#eff6ff"
            color="#2563eb"
          />
          <FilterPill
            label="Renewal Soon"
            count={renewalCount}
            active={selectedFilter === "Renewal Soon"}
            onClick={() => { setSelectedFilter("Renewal Soon"); setPage(0); }}
            dotColor="#d97706"
            bg="#fff8eb"
            color="#d97706"
          />
          <FilterPill
            label="Expired"
            count={expiredCount}
            active={selectedFilter === "Expired"}
            onClick={() => { setSelectedFilter("Expired"); setPage(0); }}
            dotColor="#dc2626"
            bg="#fef3f2"
            color="#dc2626"
          />
        </Box>

        <TextField
          size="small"
          placeholder="Search college name ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 18, color: "#98a2b3" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: "100%", sm: 280 },
            bgcolor: "#ffffff",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              borderColor: "#e4e7ec",
              fontSize: 12,
            },
            "& .MuiOutlinedInput-input": {
              py: 0.85,
            },
          }}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          borderColor: "#e5e9f0",
          borderRadius: 2,
          bgcolor: "#fff",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <Table
          columns={columns}
          rows={filteredList}
          getRowId={(item) => item.id}
          loading={isLoading}
          emptyMessage="No colleges found"
          sx={{
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              borderColor: "#edf0f4",
              px: 1.5,
              py: 1.25,
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              color: "#475467",
              fontSize: 12,
              fontWeight: 600,
              bgcolor: "#fbfcfd",
              whiteSpace: "nowrap",
              py: 1.35,
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.2,
            borderTop: "1px solid #edf0f4",
            bgcolor: "#fff",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#667085" }}>
            {totalElements > 0
              ? `${startRecord} - ${endRecord} of ${totalElements}`
              : "0 of 0"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => { setPage(0); setPageInput("1"); }}
              sx={{ color: "#667085", "&.Mui-disabled": { color: "#d0d5dd" } }}
            >
              <KeyboardDoubleArrowLeftOutlined sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => {
                const prev = Math.max(0, page - 1);
                setPage(prev);
                setPageInput(String(prev + 1));
              }}
              sx={{ color: "#667085", "&.Mui-disabled": { color: "#d0d5dd" } }}
            >
              <KeyboardArrowLeftOutlined sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => {
                const next = Math.min(totalPages - 1, page + 1);
                setPage(next);
                setPageInput(String(next + 1));
              }}
              sx={{ color: "#667085", "&.Mui-disabled": { color: "#d0d5dd" } }}
            >
              <KeyboardArrowRightOutlined sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => {
                setPage(totalPages - 1);
                setPageInput(String(totalPages));
              }}
              sx={{ color: "#667085", "&.Mui-disabled": { color: "#d0d5dd" } }}
            >
              <KeyboardDoubleArrowRightOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 12, color: "#667085" }}>Page</Typography>
            <TextField
              size="small"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePageGo();
              }}
              sx={{
                width: 46,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  fontSize: 12,
                },
                "& .MuiOutlinedInput-input": {
                  py: 0.4,
                  px: 0.8,
                  textAlign: "center",
                },
              }}
            />
            <Button
              size="small"
              onClick={handlePageGo}
              sx={{
                textTransform: "none",
                fontSize: 12,
                color: "#667085",
                fontWeight: 600,
                minWidth: "auto",
                p: "4px 8px",
                "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
              }}
            >
              Go
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={handleCloseDelete}
        title="Delete College"
        showCloseButton={!isDeleting}
        maxWidth="xs"
        actions={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseDelete}
              disabled={isDeleting}
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 1.5,
                color: "#344054",
                borderColor: "#d0d5dd",
                "&:hover": { bgcolor: "#f9fafb", borderColor: "#d0d5dd" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              disabled={confirmName.trim() !== deleteTarget?.institutionName.trim() || isDeleting}
              loading={isDeleting}
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: "#dc2626",
                color: "#fff",
                "&:hover": { bgcolor: "#b91c1c" },
                "&.Mui-disabled": {
                  bgcolor: "#fca5a5 !important",
                  color: "#fff !important",
                },
              }}
            >
              Delete
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, pt: 0.5 }}>
          <Typography sx={{ fontSize: 13, color: "#475467", lineHeight: 1.5 }}>
            This action cannot be undone. To confirm, please type{" "}
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: "#b42318",
                bgcolor: "#fef3f2",
                px: 0.75,
                py: 0.2,
                borderRadius: 1,
                fontFamily: "monospace",
              }}
            >
              {deleteTarget?.institutionName}
            </Typography>{" "}
            below:
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Type college name to confirm"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                fontSize: 13,
              },
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default College;