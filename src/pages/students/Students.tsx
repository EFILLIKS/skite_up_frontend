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
    KeyboardArrowLeftOutlined,
    KeyboardArrowRightOutlined,
} from "@mui/icons-material";

import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import useDebounce from "../../hooks/useDebounce";
import {
    useGetStudentsQuery,
    useDeleteStudentMutation,
} from "../../features/studentservice/StudentApi";
import type { StudentItem } from "../../types/Student.types";
import type { AppTableColumn } from "../../types/Table.types";
import type { SnackbarState } from "../../types/Snackbar.types";

const statusBadgeStyles: Record<string, { bg: string; color: string; dot: string }> = {
    Active: { bg: "#ecfdf3", color: "#16a34a", dot: "#16a34a" },
    Inactive: { bg: "#fef2f2", color: "#ef4444", dot: "#ef4444" },
    Disable: { bg: "#f3f4f6", color: "#6b7280", dot: "#6b7280" },
};

const parseTestRatio = (
    val?: string | number | null
): { display: string; percent: number } => {
    if (
        val === undefined ||
        val === null ||
        val === "" ||
        val === "#" ||
        val === "-" ||
        val === 0 ||
        val === "0"
    ) {
        return { display: "#", percent: 0 };
    }

    const str = String(val).trim();
    if (str === "#" || str === "-" || str === "0" || str === "0/0" || str === "0 / 0") {
        return { display: "#", percent: 0 };
    }

    if (str.includes("/")) {
        const parts = str.split("/").map((p) => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            if (parts[1] <= 0 || (parts[0] === 0 && parts[1] === 0)) {
                return { display: "#", percent: 0 };
            }
            const percent = Math.min(100, Math.max(0, Math.round((parts[0] / parts[1]) * 100)));
            return { display: `${parts[0]} / ${parts[1]}`, percent };
        }
    }

    const num = parseFloat(str);
    if (!isNaN(num)) {
        if (num === 0) {
            return { display: "#", percent: 0 };
        }
        const percent = Math.min(100, Math.max(0, Math.round(num)));
        return { display: str, percent };
    }

    return { display: str, percent: 0 };
};

const Students = () => {
    const navigate = useNavigate();
    const role = sessionStorage.getItem("role") || localStorage.getItem("role");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [pageInput, setPageInput] = useState("1");

    const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });

    const {
        data: studentsResponse,
        isLoading,
        isFetching,
        refetch,
    } = useGetStudentsQuery({
        page,
        size: pageSize,
        search: debouncedSearch || undefined,
        batch: selectedBatch || undefined,
        department: selectedDept || undefined,
    });

    const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

    const pageData = studentsResponse?.data;
    const studentsList = pageData?.content || [];
    const totalElements = pageData?.totalElements ?? studentsList.length;
    const totalPages = pageData?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));
    const totalSeats = pageData?.totalSeats ?? 50;
    const usedSeats = pageData?.usedSeats ?? totalElements;
    const remainingSeats = pageData?.remainingSeats ?? Math.max(0, totalSeats - usedSeats);
    const batchList = pageData?.batchList || ["2026", "2027"];
    const departmentList = pageData?.departmentList || ["CSE", "ECE", "IT"];
    const institutionName = pageData?.institutionName || "SRG College";

    const seatUsagePercentage =
        totalSeats > 0 ? Math.min(100, Math.round((usedSeats / totalSeats) * 100)) : 0;

    const handleOpenDelete = (student: StudentItem) => {
        setStudentToDelete(student);
    };

    const handleCloseDelete = () => {
        setStudentToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await deleteStudent(studentToDelete.id).unwrap();
            setSnackbar({
                open: true,
                message: "Student record removed successfully",
                severity: "success",
            });
            handleCloseDelete();
            refetch();
        } catch (err: unknown) {
            let errMsg = "Failed to delete student";
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

    const handlePageGo = () => {
        const p = parseInt(pageInput, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            setPage(p - 1);
        } else {
            setPageInput(String(page + 1));
        }
    };

    const columns: AppTableColumn<StudentItem>[] = useMemo(
        () => [
            {
                id: "index",
                label: "#",
                width: 50,
                render: (_row, index) => (
                    <Typography sx={{ fontSize: 13, color: "#667085", fontWeight: 500 }}>
                        {page * pageSize + index + 1}
                    </Typography>
                ),
            },
            {
                id: "registerNumber",
                label: "Register number",
                minWidth: 150,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#101828", fontWeight: 600 }}>
                        {row.registerNumber || "-"}
                    </Typography>
                ),
            },
            {
                id: "studentName",
                label: "Student Name",
                minWidth: 150,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054", fontWeight: 500 }}>
                        {row.studentName || "-"}
                    </Typography>
                ),
            },
            {
                id: "noOfTest",
                label: "No. of Test",
                minWidth: 130,
                render: (row) => {
                    const testVal =
                        row.noOfTests ?? row.noOfTest ?? row.testsDisplay ?? (row as any).tests;
                    const { display, percent } = parseTestRatio(testVal);

                    return (
                        <Box sx={{ width: 85 }}>
                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    color: "#101828",
                                    mb: 0.4,
                                    lineHeight: 1.2,
                                }}
                            >
                                {display}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={percent}
                                sx={{
                                    height: 5,
                                    borderRadius: 3,
                                    bgcolor: "#e2e8f0",
                                    "& .MuiLinearProgress-bar": {
                                        bgcolor: "#2563eb",
                                        borderRadius: 3,
                                    },
                                }}
                            />
                        </Box>
                    );
                },
            },
            {
                id: "batch",
                label: "Batch",
                minWidth: 90,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054" }}>
                        {row.batch || "-"}
                    </Typography>
                ),
            },
            {
                id: "department",
                label: "Department",
                minWidth: 110,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054", fontWeight: 500 }}>
                        {row.department || "-"}
                    </Typography>
                ),
            },
            {
                id: "section",
                label: "Section",
                minWidth: 80,
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#344054" }}>
                        {row.section || "-"}
                    </Typography>
                ),
            },
            {
                id: "status",
                label: "Status",
                minWidth: 110,
                render: (row) => {
                    const status = row.status || "Active";
                    const style = statusBadgeStyles[status] || {
                        bg: "#f3f4f6",
                        color: "#6b7280",
                        dot: "#9ca3af",
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
                id: "action",
                label: "Action",
                minWidth: 100,
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
                            onClick={() => navigate(`/institution/students/form/${row.id}`)}
                            aria-label={`Edit ${row.studentName}`}
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
                            onClick={() => handleOpenDelete(row)}
                            aria-label={`Delete ${row.studentName}`}
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
        [page, pageSize, navigate]
    );

    const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
    const endRecord = Math.min((page + 1) * pageSize, totalElements);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75, pb: 4 }}>
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
                        Students
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 13.5, color: "#667085" }}>
                        Fix the students and monitor for {institutionName}.
                    </Typography>
                </Box>
                {role !== "ROLE_TEACHER" && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 19 }} />}
                        onClick={() => navigate("/institution/students/form")}
                        sx={{
                            bgcolor: "#2563eb",
                            color: "#ffffff",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: 13.5,
                            borderRadius: 2,
                            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                            "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                    >
                        Add Students
                    </Button>
                )}
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
                            {usedSeats} / {totalSeats} Student Seats
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
                        Only {remainingSeats} Students seats remaining on your plan.{" "}
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
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2.25,
                        gap: 2,
                        flexWrap: "wrap",
                        borderBottom: "1px solid #f2f4f7",
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search Students, Batch, department ..."
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
                            width: { xs: "100%", sm: 320 },
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

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Select
                            size="small"
                            value={selectedBatch}
                            displayEmpty
                            onChange={(e) => {
                                setSelectedBatch(e.target.value);
                                setPage(0);
                            }}
                            sx={{
                                minWidth: 120,
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
                                Batch
                            </MenuItem>
                            {batchList.map((b: string) => (
                                <MenuItem key={b} value={b} sx={{ fontSize: 13 }}>
                                    {b}
                                </MenuItem>
                            ))}
                        </Select>

                        <Select
                            size="small"
                            value={selectedDept}
                            displayEmpty
                            onChange={(e) => {
                                setSelectedDept(e.target.value);
                                setPage(0);
                            }}
                            sx={{
                                minWidth: 140,
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
                                Department
                            </MenuItem>
                            {departmentList.map((d: string) => (
                                <MenuItem key={d} value={d} sx={{ fontSize: 13 }}>
                                    {d}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>

                <Table
                    columns={columns}
                    rows={studentsList}
                    getRowId={(row) => row.id}
                    loading={isLoading || isFetching}
                    emptyMessage={
                        searchTerm
                            ? `No students found matching "${searchTerm}"`
                            : "No student records available"
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
                        {startRecord} - {endRecord} of {totalElements}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            size="small"
                            disabled={page === 0}
                            onClick={() => {
                                setPage(0);
                                setPageInput("1");
                            }}
                            sx={{ color: "#667085", "&.Mui-disabled": { color: "#d0d5dd" } }}
                        >
                            <KeyboardDoubleArrowLeftOutlined sx={{ fontSize: 18 }} />
                        </IconButton>

                        <IconButton
                            size="small"
                            disabled={page === 0}
                            onClick={() => {
                                setPage((prev) => Math.max(0, prev - 1));
                                setPageInput(String(page));
                            }}
                            sx={{ color: "#667085", "&.Mui-disabled": { color: "#d0d5dd" } }}
                        >
                            <KeyboardArrowLeftOutlined sx={{ fontSize: 18 }} />
                        </IconButton>

                        <IconButton
                            size="small"
                            disabled={page >= totalPages - 1}
                            onClick={() => {
                                setPage((prev) => Math.min(totalPages - 1, prev + 1));
                                setPageInput(String(page + 2));
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

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, ml: 1.5 }}>
                            <Typography sx={{ fontSize: 12.5, color: "#667085" }}>Page</Typography>
                            <TextField
                                size="small"
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handlePageGo();
                                }}
                                sx={{
                                    width: 44,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                        fontSize: 12.5,
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        py: 0.4,
                                        px: 0.7,
                                        textAlign: "center",
                                    },
                                }}
                            />
                            <Button
                                size="small"
                                onClick={handlePageGo}
                                sx={{
                                    textTransform: "none",
                                    fontSize: 12.5,
                                    color: "#667085",
                                    fontWeight: 600,
                                    minWidth: "auto",
                                    px: 1,
                                    py: 0.4,
                                    "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
                                }}
                            >
                                Go
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Dialog
                open={Boolean(studentToDelete)}
                onClose={isDeleting ? () => {} : handleCloseDelete}
                title="Delete Student"
                description={
                    studentToDelete
                        ? `Are you sure you want to remove ${studentToDelete.studentName} (${studentToDelete.registerNumber})? This action cannot be undone.`
                        : "Are you sure you want to remove this student record?"
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
                            onClick={handleCloseDelete}
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

export default Students;
