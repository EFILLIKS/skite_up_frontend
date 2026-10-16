import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    IconButton,
    LinearProgress,
    CircularProgress,
} from "@mui/material";
import {
    Add as AddIcon,
    SearchOutlined,
    EditOutlined,
    DeleteOutlineOutlined,
    WarningAmberRounded as WarningIcon,
    KeyboardDoubleArrowLeftOutlined,
    KeyboardDoubleArrowRightOutlined,
} from "@mui/icons-material";

import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import useDebounce from "../../hooks/useDebounce";
import {
    useGetTeachersQuery,
    useDeleteTeacherMutation,
} from "../../features/teacherservice/TeacherApi";
import type { TeacherItem } from "../../types/Teacher.types";
import type { AppTableColumn } from "../../types/Table.types";
import type { SnackbarState } from "../../types/Snackbar.types";

const avatarColors = [
    { bg: "#dcfce7", color: "#15803d" },
    { bg: "#ffedd5", color: "#c2410c" },
    { bg: "#e0f2fe", color: "#0369a1" },
    { bg: "#ede9fe", color: "#6d28d9" },
    { bg: "#fef3c7", color: "#b45309" },
    { bg: "#fce7f3", color: "#be185d" },
    { bg: "#ccfbf1", color: "#0f766e" },
    { bg: "#fee2e2", color: "#b91c1c" },
];

const getAvatarStyle = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
};

const statusBadgeStyles: Record<string, { bg: string; color: string; dot: string }> = {
    Active: { bg: "#ecfdf3", color: "#16a34a", dot: "#16a34a" },
    Invited: { bg: "#fff7ed", color: "#d97706", dot: "#d97706" },
};

const Teacher = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [statusFilter, setStatusFilter] = useState("");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [teacherToDelete, setTeacherToDelete] = useState<TeacherItem | null>(null);

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });

    const {
        data: teachersResponse,
        isLoading,
        isFetching,
        refetch,
    } = useGetTeachersQuery({
        page,
        size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
    });

    const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

    const pageData = teachersResponse?.data;
    const teachersList = pageData?.content || [];
    const totalElements = pageData?.totalElements || 0;
    const totalPages = pageData?.totalPages || 1;
    const totalSeats = pageData?.totalSeats ?? 10;
    const usedSeats = pageData?.usedSeats ?? totalElements;
    const remainingSeats = pageData?.remainingSeats ?? Math.max(0, totalSeats - usedSeats);
    const institutionName = pageData?.institutionName || "SRG College";

    const seatUsagePercentage =
        totalSeats > 0 ? Math.min(100, Math.round((usedSeats / totalSeats) * 100)) : 0;

    const handleOpenAddModal = () => {
        navigate("/institution/teachers/form");
    };

    const handleOpenEditModal = (teacher: TeacherItem) => {
        navigate(`/institution/teachers/form/${teacher.id}`);
    };

    const handleOpenDeleteConfirm = (teacher: TeacherItem) => {
        setTeacherToDelete(teacher);
    };

    const handleCloseDeleteConfirm = () => {
        setTeacherToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!teacherToDelete) return;
        try {
            await deleteTeacher(teacherToDelete.id).unwrap();
            setSnackbar({
                open: true,
                message: "Faculty member removed successfully",
                severity: "success",
            });
            handleCloseDeleteConfirm();
            refetch();
        } catch (err: unknown) {
            let errMsg = "Failed to delete teacher";
            if (typeof err === "object" && err !== null && "data" in err) {
                const errorData = (err as { data?: { message?: string } }).data;
                if (errorData?.message) errMsg = errorData.message;
            }
            setSnackbar({
                open: true,
                message: errMsg,
                severity: "error",
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const columns: AppTableColumn<TeacherItem>[] = useMemo(
        () => [
            {
                id: "teacher",
                label: "Teacher",
                minWidth: 260,
                render: (row) => {
                    const initials =
                        row.initials ||
                        `${row.firstName?.[0] || ""}${row.lastName?.[0] || ""}`.toUpperCase() ||
                        "T";
                    const fullName =
                        row.fullName ||
                        [row.firstName, row.lastName]
                            .filter((part) => part && part !== "null" && part !== "undefined")
                            .join(" ")
                            .trim();
                    const avatarStyle = getAvatarStyle(fullName || initials);

                    return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "50%",
                                    bgcolor: avatarStyle.bg,
                                    color: avatarStyle.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {initials}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        color: "#101828",
                                        lineHeight: 1.25,
                                    }}
                                >
                                    {fullName}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: "#667085",
                                        mt: 0.25,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {row.subject || "-"}
                                </Typography>
                            </Box>
                        </Box>
                    );
                },
            },
            {
                id: "email",
                label: "Email",
                minWidth: 130,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054", fontWeight: 500 }}>
                        {row.email || "-"}
                    </Typography>
                ),
            },
            {
                id: "phoneNumber",
                label: "Phone Number",
                minWidth: 130,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054", fontWeight: 500 }}>
                        {row.phoneNumber || "-"}
                    </Typography>
                ),
            },
            {
                id: "department",
                label: "Department",
                minWidth: 130,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054", fontWeight: 500 }}>
                        {row.department || "-"}
                    </Typography>
                ),
            },
            {
                id: "status",
                label: "Status",
                minWidth: 130,
                render: (row) => {
                    const status = row.status || "Active";
                    const style = statusBadgeStyles[status] || {
                        bg: "#f3f4f6",
                        color: "#475467",
                        dot: "#98a2b3",
                    };

                    return (
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.75,
                                bgcolor: style.bg,
                                color: style.color,
                                px: 1.25,
                                py: 0.35,
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 500,
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
                minWidth: 110,
                align: "right",
                render: (row) => (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => handleOpenEditModal(row)}
                            aria-label={`Edit ${row.firstName}`}
                            sx={{
                                border: "1px solid #bfdbfe",
                                borderRadius: 1.75,
                                p: 0.6,
                                color: "#2563eb",
                                bgcolor: "#ffffff",
                                "&:hover": {
                                    bgcolor: "#eff6ff",
                                    borderColor: "#93c5fa",
                                },
                            }}
                        >
                            <EditOutlined sx={{ fontSize: 17 }} />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteConfirm(row)}
                            aria-label={`Delete ${row.firstName}`}
                            sx={{
                                border: "1px solid #fecaca",
                                borderRadius: 1.75,
                                p: 0.6,
                                color: "#ef4444",
                                bgcolor: "#ffffff",
                                "&:hover": {
                                    bgcolor: "#fef2f2",
                                    borderColor: "#fca5a5",
                                },
                            }}
                        >
                            <DeleteOutlineOutlined sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Box>
                ),
            },
        ],
        []
    );

    const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
    const endRecord = Math.min((page + 1) * pageSize, totalElements);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#101828",
                            lineHeight: 1.25,
                        }}
                    >
                        Teachers
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13.5, color: "#667085" }}>
                        Manage faculty accounts and login access for {institutionName}.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: 19 }} />}
                    onClick={handleOpenAddModal}
                    sx={{
                        bgcolor: "#2563eb",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13.5,
                        borderRadius: 2,
                        px: 2.25,
                        py: 0.85,
                        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                        "&:hover": { bgcolor: "#1d4ed8" },
                    }}
                >
                    Add teacher
                </Button>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2.5,
                }}
            >
                <Box sx={{ flex: 1, maxWidth: { md: 480 } }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#101828" }}>
                            {usedSeats}
                            <Typography
                                component="span"
                                sx={{ fontSize: 13.5, fontWeight: 400, color: "#667085" }}
                            >
                                /{totalSeats} teacher seats
                            </Typography>
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: "#c2410c",
                            }}
                        >
                            {remainingSeats} left
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={seatUsagePercentage}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#f2f4f7",
                            "& .MuiLinearProgress-bar": {
                                bgcolor: "#ea580c",
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        bgcolor: "#fff7ed",
                        border: "1px solid #fed7aa",
                        borderRadius: 2.5,
                        px: 2,
                        py: 1.2,
                    }}
                >
                    <WarningIcon sx={{ color: "#d97706", fontSize: 20, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, color: "#9a3412" }}>
                        Only {remainingSeats} teacher seat{remainingSeats === 1 ? "" : "s"} remaining on
                        your plan.{" "}
                        <Typography
                            component="span"
                            onClick={() => navigate("/subscription")}
                            sx={{
                                fontWeight: 700,
                                color: "#c2410c",
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            Upgrade plan
                        </Typography>
                    </Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    border: "1px solid #eaecf0",
                    borderRadius: 2.5,
                    bgcolor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" },
                        p: 2.5,
                        gap: 2,
                        borderBottom: "1px solid #f2f4f7",
                    }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>
                        Faculty registry
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        <TextField
                            size="small"
                            placeholder="Search by name, ID or department"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchOutlined sx={{ color: "#98a2b3", fontSize: 19 }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                width: { xs: "100%", sm: 280 },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    fontSize: 13,
                                    bgcolor: "#ffffff",
                                },
                                "& .MuiOutlinedInput-input": {
                                    py: 0.8,
                                },
                            }}
                        />

                        <Select
                            size="small"
                            value={statusFilter}
                            displayEmpty
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            sx={{
                                minWidth: 130,
                                borderRadius: 2,
                                fontSize: 13,
                                bgcolor: "#ffffff",
                                "& .MuiSelect-select": {
                                    py: 0.8,
                                    px: 1.5,
                                },
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: 13 }}>
                                All Status
                            </MenuItem>
                            <MenuItem value="Active" sx={{ fontSize: 13 }}>
                                Active
                            </MenuItem>
                            <MenuItem value="Invited" sx={{ fontSize: 13 }}>
                                Invited
                            </MenuItem>
                        </Select>
                    </Box>
                </Box>

                <Table
                    columns={columns}
                    rows={teachersList}
                    getRowId={(row) => row.id}
                    loading={isLoading || isFetching}
                    emptyMessage={
                        searchTerm
                            ? `No faculties found matching "${searchTerm}"`
                            : "No faculty members registered yet"
                    }
                    sx={{
                        "& .MuiTableCell-head": {
                            bgcolor: "#f9fafb",
                            color: "#475467",
                            fontSize: 12.5,
                            fontWeight: 600,
                            py: 1.5,
                            borderBottom: "1px solid #eaecf0",
                        },
                        "& .MuiTableCell-body": {
                            py: 1.75,
                            borderBottom: "1px solid #f2f4f7",
                        },
                    }}
                />

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        px: 2.5,
                        borderTop: "1px solid #eaecf0",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Typography sx={{ fontSize: 13, color: "#667085" }}>
                        Showing{" "}
                        <Typography component="span" sx={{ fontWeight: 600, color: "#344054" }}>
                            {startRecord} to {endRecord} of {totalElements}
                        </Typography>{" "}
                        faculties
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Select
                            size="small"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(0);
                            }}
                            sx={{
                                borderRadius: 2,
                                fontSize: 12.5,
                                color: "#344054",
                                bgcolor: "#ffffff",
                                "& .MuiSelect-select": {
                                    py: 0.5,
                                    px: 1.25,
                                },
                            }}
                        >
                            <MenuItem value={10} sx={{ fontSize: 12.5 }}>
                                10 / page
                            </MenuItem>
                            <MenuItem value={25} sx={{ fontSize: 12.5 }}>
                                25 / page
                            </MenuItem>
                            <MenuItem value={50} sx={{ fontSize: 12.5 }}>
                                50 / page
                            </MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <IconButton
                            size="small"
                            disabled={page === 0}
                            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                            aria-label="Previous page"
                            sx={{
                                border: "1px solid #eaecf0",
                                borderRadius: 1.5,
                                color: "#667085",
                                bgcolor: "#f9fafb",
                                p: 0.6,
                                "&.Mui-disabled": { color: "#d0d5dd", bgcolor: "#ffffff" },
                                "&:hover": { bgcolor: "#f2f4f7" },
                            }}
                        >
                            <KeyboardDoubleArrowLeftOutlined sx={{ fontSize: 17 }} />
                        </IconButton>

                        <Box
                            sx={{
                                minWidth: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: "#2563eb",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12.5,
                                fontWeight: 600,
                                px: 1,
                            }}
                        >
                            {page + 1}
                        </Box>

                        <IconButton
                            size="small"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                            aria-label="Next page"
                            sx={{
                                border: "1px solid #eaecf0",
                                borderRadius: 1.5,
                                color: "#667085",
                                bgcolor: "#f9fafb",
                                p: 0.6,
                                "&.Mui-disabled": { color: "#d0d5dd", bgcolor: "#ffffff" },
                                "&:hover": { bgcolor: "#f2f4f7" },
                            }}
                        >
                            <KeyboardDoubleArrowRightOutlined sx={{ fontSize: 17 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>


            <Dialog
                open={Boolean(teacherToDelete)}
                onClose={isDeleting ? () => {} : handleCloseDeleteConfirm}
                title="Delete Faculty Member"
                description={
                    teacherToDelete
                        ? `Are you sure you want to remove ${
                            teacherToDelete.fullName ||
                            [teacherToDelete.firstName, teacherToDelete.lastName]
                              .filter((p) => p && p !== "null" && p !== "undefined")
                              .join(" ")
                              .trim()
                          }? This action cannot be undone.`
                        : "Are you sure you want to remove this faculty member?"
                }
                showCloseButton={!isDeleting}
                maxWidth="xs"
                actions={
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1.25,
                            width: "100%",
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleCloseDeleteConfirm}
                            disabled={isDeleting}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 1.75,
                                color: "#475467",
                                borderColor: "#d0d5dd",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 1.75,
                                bgcolor: "#dc2626",
                                color: "#ffffff",
                                "&:hover": { bgcolor: "#b91c1c" },
                            }}
                        >
                            {isDeleting ? <CircularProgress size={18} color="inherit" /> : "Delete"}
                        </Button>
                    </Box>
                }
            />

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </Box>
    );
};

export default Teacher;