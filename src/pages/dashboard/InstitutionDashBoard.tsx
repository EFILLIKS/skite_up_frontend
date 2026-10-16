import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
    Chip,
    InputAdornment,
    Tooltip,
    TableSortLabel,
} from "@mui/material";
import {
    ApartmentOutlined,
    FolderSharedOutlined,
    DoorSlidingOutlined,
    AccessTimeOutlined,
    KeyboardArrowDownOutlined,
    ChevronLeft,
    ChevronRight,
    FirstPage,
    LastPage,
    NavigateBefore,
    NavigateNext,
    Search as SearchIcon,
    Clear as ClearIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";

import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Snackbar from "../../components/common/Snackbar";
import type { SnackbarState } from "../../types/Snackbar.types";
import { useGetInstitutionAdminDashboardQuery } from "../../features/dashboard/DashboardApi";
import type { AppTableColumn } from "../../types/Table.types";
import type {
    InstitutionDashboardQueryParams,
    InstitutionDashboardTableItem,
} from "../../types/Dashboard.types";

interface DisplayTestRow {
    id: string;
    indexNum: number;
    batch: string;
    department: string;
    section: string;
    testName: string;
    testType: string;
    averageMark: string;
    attendedRatio: string;
    status?: string;
    raw: InstitutionDashboardTableItem;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const getCalendarGrid = (
    year: number,
    month: number,
    completedDates: string[] = [],
    todayDates: string[] = [],
    upcomingDates: string[] = [],
    selectedDate: string | null = null
) => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startOffset = (firstDayOfWeek + 6) % 7;

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const formatYmd = (y: number, m: number, d: number) => {
        const mm = String(m + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
    };

    const completedSet = new Set(completedDates);
    const todaySet = new Set(todayDates);
    const upcomingSet = new Set(upcomingDates);

    const cells: Array<{
        day: number;
        isCurrentMonth: boolean;
        dateStr: string;
        type?: "completed" | "today" | "upcoming";
        isSelected: boolean;
    }> = [];

    for (let i = startOffset - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const prevMonthYear = month === 0 ? year - 1 : year;
        const prevMonthIdx = month === 0 ? 11 : month - 1;
        const dateStr = formatYmd(prevMonthYear, prevMonthIdx, d);
        cells.push({
            day: d,
            isCurrentMonth: false,
            dateStr,
            type: completedSet.has(dateStr)
                ? "completed"
                : todaySet.has(dateStr)
                    ? "today"
                    : upcomingSet.has(dateStr)
                        ? "upcoming"
                        : undefined,
            isSelected: selectedDate === dateStr,
        });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
        const dateStr = formatYmd(year, month, d);
        cells.push({
            day: d,
            isCurrentMonth: true,
            dateStr,
            type: completedSet.has(dateStr)
                ? "completed"
                : todaySet.has(dateStr)
                    ? "today"
                    : upcomingSet.has(dateStr)
                        ? "upcoming"
                        : undefined,
            isSelected: selectedDate === dateStr,
        });
    }

    const remainingCells = (7 - (cells.length % 7)) % 7;
    const targetTotal = cells.length + remainingCells < 35 ? 35 : cells.length + remainingCells;
    const paddingNeeded = targetTotal - cells.length;

    for (let d = 1; d <= paddingNeeded; d++) {
        const nextMonthYear = month === 11 ? year + 1 : year;
        const nextMonthIdx = month === 11 ? 0 : month + 1;
        const dateStr = formatYmd(nextMonthYear, nextMonthIdx, d);
        cells.push({
            day: d,
            isCurrentMonth: false,
            dateStr,
            type: completedSet.has(dateStr)
                ? "completed"
                : todaySet.has(dateStr)
                    ? "today"
                    : upcomingSet.has(dateStr)
                        ? "upcoming"
                        : undefined,
            isSelected: selectedDate === dateStr,
        });
    }

    return cells;
};

const InstitutionDashBoard = () => {
    const navigate = useNavigate();

    const [page, setPage] = useState<number>(0);
    const [pageSize] = useState<number>(5);
    const [sortBy, setSortBy] = useState<string>("opensAt");
    const [direction, setDirection] = useState<"ASC" | "DESC">("DESC");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [pageInput, setPageInput] = useState<string>("1");

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
        } else {
            setSortBy(field);
            setDirection("ASC");
        }
        setPage(0);
    };

    const [batchAnchor, setBatchAnchor] = useState<null | HTMLElement>(null);
    const [deptAnchor, setDeptAnchor] = useState<null | HTMLElement>(null);
    const [sectionAnchor, setSectionAnchor] = useState<null | HTMLElement>(null);

    const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const queryParams: InstitutionDashboardQueryParams = useMemo(() => {
        const p: InstitutionDashboardQueryParams = {
            page,
            size: pageSize,
            sortBy,
            direction,
        };
        if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
        if (selectedBatch && selectedBatch !== "ALL") p.batch = selectedBatch;
        if (selectedDepartment && selectedDepartment !== "ALL") p.department = selectedDepartment;
        if (selectedSection && selectedSection !== "ALL") p.section = selectedSection;
        if (selectedStatus && selectedStatus !== "ALL") p.status = selectedStatus;
        if (selectedDate) p.date = selectedDate;
        return p;
    }, [page, pageSize, sortBy, direction, debouncedSearch, selectedBatch, selectedDepartment, selectedSection, selectedStatus, selectedDate]);

    const {
        data: apiResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetInstitutionAdminDashboardQuery(queryParams, {
        refetchOnMountOrArgChange: true,
    });

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "error",
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    useEffect(() => {
        if (isError && error) {
            const errObj = error as any;
            const isPlanExpired =
                errObj?.status === 403 ||
                errObj?.data?.statusCode === 403 ||
                errObj?.data?.data?.isExpired === true ||
                errObj?.data?.isExpired === true ||
                (typeof errObj?.data?.message === "string" &&
                    errObj.data.message.toLowerCase().includes("expired"));

            const errorMsg =
                errObj?.data?.message ||
                errObj?.message ||
                "Plan has expired. Please renew your subscription to continue using services.";

            setSnackbar({
                open: true,
                message: errorMsg,
                severity: "error",
            });

            if (isPlanExpired) {
                localStorage.setItem("isExpired", "true");
                const timer = setTimeout(() => {
                    navigate("/subscription", { replace: true });
                }, 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [isError, error, navigate]);

    const dashboardData = apiResponse?.data;
    const summary = dashboardData?.summary;
    const cards = dashboardData?.cards || [];
    const tableData = dashboardData?.table;
    const filters = dashboardData?.filters;
    const calendar = dashboardData?.calendar;

    useEffect(() => {
        if (calendar?.year) {
            setCalendarYear(calendar.year);
        }
        if (calendar?.monthValue) {
            setCalendarMonth(calendar.monthValue - 1);
        }
    }, [calendar?.year, calendar?.monthValue]);

    useEffect(() => {
        setPageInput(String(page + 1));
    }, [page]);

    const getCardInfo = (key: string) => cards.find((c) => c.key === key);

    const studentsCard = getCardInfo("students");
    const teachersCard = getCardInfo("teachers");
    const departmentsCard = getCardInfo("departments");
    const trialCard = getCardInfo("trial");

    const studentsCount = studentsCard?.value ?? (studentsCard?.count !== undefined ? String(studentsCard.count) : summary?.studentsCount !== undefined ? String(summary.studentsCount) : "0");
    const studentsDesc = studentsCard?.description || "Total number of Students count";

    const teachersCount = teachersCard?.value ?? (teachersCard?.count !== undefined ? String(teachersCard.count) : summary?.teachersCount !== undefined ? String(summary.teachersCount) : "0");
    const teachersDesc = teachersCard?.description || "Total number of teachers";

    const departmentsCount = departmentsCard?.value ?? (departmentsCard?.count !== undefined ? String(departmentsCard.count) : summary?.departmentsCount !== undefined ? String(summary.departmentsCount) : "0");
    const departmentsDesc = departmentsCard?.description || "Total number of departments";

    const trialValue = trialCard?.value || summary?.planValue || (summary?.planTitle ? `${summary.planTitle} Plan` : "Trial");
    const trialDesc = trialCard?.description || summary?.planStatus || "Yet to be activated";

    const filteredContent = useMemo(() => {
        const rawContent = tableData?.content;
        if (!rawContent || !Array.isArray(rawContent)) return [];

        return rawContent.filter((item) => {
            if (selectedBatch && selectedBatch !== "ALL" && item.batch && item.batch !== selectedBatch) {
                return false;
            }
            if (
                selectedDepartment &&
                selectedDepartment !== "ALL" &&
                item.department &&
                item.department.toLowerCase() !== selectedDepartment.toLowerCase()
            ) {
                return false;
            }
            if (
                selectedSection &&
                selectedSection !== "ALL" &&
                item.section &&
                item.section.toUpperCase() !== selectedSection.toUpperCase()
            ) {
                return false;
            }
            if (
                selectedStatus &&
                selectedStatus !== "ALL" &&
                item.status &&
                item.status.toUpperCase() !== selectedStatus.toUpperCase()
            ) {
                return false;
            }
            return true;
        });
    }, [tableData?.content, selectedBatch, selectedDepartment, selectedSection, selectedStatus]);

    const sortedContent = useMemo(() => {
        const list = [...filteredContent];

        list.sort((a, b) => {
            let valA: any = "";
            let valB: any = "";

            switch (sortBy) {
                case "batch":
                    valA = a.batch ?? "";
                    valB = b.batch ?? "";
                    break;
                case "department":
                    valA = a.department ?? "";
                    valB = b.department ?? "";
                    break;
                case "section":
                    valA = a.section ?? "";
                    valB = b.section ?? "";
                    break;
                case "testName":
                    valA = a.testName ?? "";
                    valB = b.testName ?? "";
                    break;
                case "averageMark": {
                    const getScore = (item: InstitutionDashboardTableItem) => {
                        if (typeof item.averageMark === "number") return item.averageMark;
                        if (item.averageMarkDisplay) {
                            const parsed = parseFloat(item.averageMarkDisplay.split("/")[0]);
                            if (!isNaN(parsed)) return parsed;
                        }
                        return 0;
                    };
                    const scoreA = getScore(a);
                    const scoreB = getScore(b);
                    return direction === "ASC" ? scoreA - scoreB : scoreB - scoreA;
                }
                case "opensAt":
                    valA = a.opensAt ? new Date(a.opensAt).getTime() : 0;
                    valB = b.opensAt ? new Date(b.opensAt).getTime() : 0;
                    if (typeof valA === "number" && typeof valB === "number") {
                        return direction === "ASC" ? valA - valB : valB - valA;
                    }
                    break;
                case "index":
                case "indexNum":
                    valA = a.index ?? 0;
                    valB = b.index ?? 0;
                    return direction === "ASC" ? valA - valB : valB - valA;
                default:
                    valA = (a as any)[sortBy] ?? "";
                    valB = (b as any)[sortBy] ?? "";
                    break;
            }

            if (typeof valA === "string" && typeof valB === "string") {
                const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" });
                return direction === "ASC" ? cmp : -cmp;
            }

            if (valA < valB) return direction === "ASC" ? -1 : 1;
            if (valA > valB) return direction === "ASC" ? 1 : -1;
            return 0;
        });

        return list;
    }, [filteredContent, sortBy, direction]);

    const isClientPaginated = sortedContent.length > pageSize;

    const paginatedContent = useMemo(() => {
        if (isClientPaginated) {
            const start = page * pageSize;
            return sortedContent.slice(start, start + pageSize);
        }
        return sortedContent;
    }, [sortedContent, isClientPaginated, page, pageSize]);

    const rows: DisplayTestRow[] = useMemo(() => {
        return paginatedContent.map((item, idx) => ({
            id: `${item.assignmentId || item.assessmentId || "test"}-${item.batch || ""}-${item.department || ""}-${item.section || ""}-${page * pageSize + idx}`,
            indexNum: page * pageSize + idx + 1,
            batch: item.batch || "-",
            department: item.department || "-",
            section: item.section || "-",
            testName: item.testName || "-",
            testType: item.categories || "-",
            averageMark: item.averageMarkDisplay || `${item.averageMark ?? 0} / ${item.totalMarks ?? 100}`,
            attendedRatio: item.attendanceDisplay || `${item.attendedStudents ?? 0} / ${item.totalStudents ?? 0} Students attended`,
            status: item.status,
            raw: item,
        }));
    }, [paginatedContent, page, pageSize]);

    const totalElements = isClientPaginated
        ? sortedContent.length
        : (tableData?.totalElements ?? sortedContent.length);

    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const currentPage = page;

    const startRow = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    const endRow = Math.min((currentPage + 1) * pageSize, totalElements);

    const handleJumpPage = () => {
        const p = parseInt(pageInput, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            setPage(p - 1);
        } else {
            setPageInput(String(currentPage + 1));
        }
    };

    const handlePrevMonth = () => {
        setCalendarMonth((prev) => {
            if (prev === 0) {
                setCalendarYear((y) => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    const handleNextMonth = () => {
        setCalendarMonth((prev) => {
            if (prev === 11) {
                setCalendarYear((y) => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    const handleSelectDate = (dateStr: string) => {
        if (selectedDate === dateStr) {
            setSelectedDate(null);
        } else {
            setSelectedDate(dateStr);
            setPage(0);
        }
    };

    const calendarDays = useMemo(() => {
        return getCalendarGrid(
            calendarYear,
            calendarMonth,
            calendar?.completedDates || [],
            calendar?.todayDates || [],
            calendar?.upcomingDates || [],
            selectedDate
        );
    }, [calendarYear, calendarMonth, calendar?.completedDates, calendar?.todayDates, calendar?.upcomingDates, selectedDate]);

    const availableBatches = filters?.availableBatches || [];
    const availableDepartments = filters?.availableDepartments || [];
    const availableSections = filters?.availableSections || [];

    const hasActiveFilters = Boolean(selectedBatch || selectedDepartment || selectedSection || selectedStatus || selectedDate || debouncedSearch);

    const handleClearAllFilters = () => {
        setSelectedBatch(null);
        setSelectedDepartment(null);
        setSelectedSection(null);
        setSelectedStatus(null);
        setSelectedDate(null);
        setSearchTerm("");
        setDebouncedSearch("");
        setPage(0);
    };

    const sortLabelSx = (active: boolean) => ({
        fontSize: 12.5,
        fontWeight: active ? 700 : 600,
        color: active ? "#2563eb !important" : "#475467 !important",
        "&:hover": {
            color: "#2563eb !important",
        },
        "& .MuiTableSortLabel-icon": {
            fontSize: 16,
            color: active ? "#2563eb !important" : "#98a2b3 !important",
        },
    });

    const columns: AppTableColumn<DisplayTestRow>[] = useMemo(
        () => [
            {
                id: "indexNum",
                label: "#",
                width: 55,
                header: (
                    <TableSortLabel
                        active={sortBy === "indexNum" || sortBy === "opensAt" || sortBy === "index"}
                        direction={direction.toLowerCase() as "asc" | "desc"}
                        onClick={() => handleSort(sortBy === "indexNum" ? "opensAt" : "indexNum")}
                        sx={sortLabelSx(sortBy === "indexNum" || sortBy === "opensAt" || sortBy === "index")}
                    >
                        #
                    </TableSortLabel>
                ),
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#667085", fontWeight: 500 }}>
                        {row.indexNum}
                    </Typography>
                ),
            },
            {
                id: "batch",
                label: "Batch",
                minWidth: 100,
                header: (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                        <TableSortLabel
                            active={sortBy === "batch"}
                            direction={sortBy === "batch" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                            onClick={() => handleSort("batch")}
                            sx={sortLabelSx(sortBy === "batch")}
                        >
                            <span>{selectedBatch ? `Batch: ${selectedBatch}` : "Batch"}</span>
                        </TableSortLabel>
                        <Tooltip title="Filter by batch">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setBatchAnchor(e.currentTarget);
                                }}
                                sx={{
                                    p: 0.25,
                                    color: selectedBatch ? "#2563eb" : "#667085",
                                    "&:hover": { bgcolor: "#f2f4f7" },
                                }}
                            >
                                <KeyboardArrowDownOutlined sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#101828", fontWeight: 500 }}>
                        {row.batch}
                    </Typography>
                ),
            },
            {
                id: "department",
                label: "Department",
                minWidth: 120,
                header: (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                        <TableSortLabel
                            active={sortBy === "department"}
                            direction={sortBy === "department" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                            onClick={() => handleSort("department")}
                            sx={sortLabelSx(sortBy === "department")}
                        >
                            <span>{selectedDepartment ? `Dept: ${selectedDepartment}` : "Department"}</span>
                        </TableSortLabel>
                        <Tooltip title="Filter by department">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeptAnchor(e.currentTarget);
                                }}
                                sx={{
                                    p: 0.25,
                                    color: selectedDepartment ? "#2563eb" : "#667085",
                                    "&:hover": { bgcolor: "#f2f4f7" },
                                }}
                            >
                                <KeyboardArrowDownOutlined sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#101828", fontWeight: 500 }}>
                        {row.department}
                    </Typography>
                ),
            },
            {
                id: "section",
                label: "Section",
                minWidth: 95,
                header: (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                        <TableSortLabel
                            active={sortBy === "section"}
                            direction={sortBy === "section" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                            onClick={() => handleSort("section")}
                            sx={sortLabelSx(sortBy === "section")}
                        >
                            <span>{selectedSection ? `Sec: ${selectedSection}` : "Section"}</span>
                        </TableSortLabel>
                        <Tooltip title="Filter by section">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSectionAnchor(e.currentTarget);
                                }}
                                sx={{
                                    p: 0.25,
                                    color: selectedSection ? "#2563eb" : "#667085",
                                    "&:hover": { bgcolor: "#f2f4f7" },
                                }}
                            >
                                <KeyboardArrowDownOutlined sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
                render: (row) => (
                    <Typography sx={{ fontSize: 13, color: "#101828", fontWeight: 500 }}>
                        {row.section}
                    </Typography>
                ),
            },
            {
                id: "testName",
                label: "Test name",
                minWidth: 160,
                header: (
                    <TableSortLabel
                        active={sortBy === "testName"}
                        direction={sortBy === "testName" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                        onClick={() => handleSort("testName")}
                        sx={sortLabelSx(sortBy === "testName")}
                    >
                        Test name
                    </TableSortLabel>
                ),
                render: (row) => (
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828", lineHeight: 1.25 }}>
                            {row.testName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#667085", mt: 0.35 }}>
                            {row.testType}
                        </Typography>
                    </Box>
                ),
            },
            {
                id: "averageMark",
                label: "Average mark",
                minWidth: 160,
                header: (
                    <TableSortLabel
                        active={sortBy === "averageMark"}
                        direction={sortBy === "averageMark" ? (direction.toLowerCase() as "asc" | "desc") : "asc"}
                        onClick={() => handleSort("averageMark")}
                        sx={sortLabelSx(sortBy === "averageMark")}
                    >
                        Average mark
                    </TableSortLabel>
                ),
                render: (row) => (
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828", lineHeight: 1.25 }}>
                            {row.averageMark}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#667085", mt: 0.35 }}>
                            {row.attendedRatio}
                        </Typography>
                    </Box>
                ),
            },
        ],
        [selectedBatch, selectedDepartment, selectedSection, sortBy, direction]
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75, pb: 5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                <Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#101828", lineHeight: 1.25 }}>
                        {dashboardData?.title || "Dashboard"}
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 13, color: "#667085" }}>
                        {dashboardData?.subtitle || "Overview of your colleges, revenue and payments"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Tooltip title="Refresh dashboard">
                        <IconButton
                            onClick={() => refetch()}
                            disabled={isFetching}
                            size="small"
                            sx={{ border: "1px solid #eaecf0", bgcolor: "#fff", "&:hover": { bgcolor: "#f8f9fc" } }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: isFetching ? "#98a2b3" : "#475467" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: 2.5,
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
                        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "#344054" }}>
                            {studentsCard?.title || "Students count"}
                        </Typography>
                        <ApartmentOutlined sx={{ fontSize: 20, color: "#98a2b3" }} />
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", my: 0.75, lineHeight: 1 }}>
                        {isLoading ? "-" : studentsCount}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }}>
                        {studentsDesc}
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
                        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "#344054" }}>
                            {teachersCard?.title || "Number of Teachers"}
                        </Typography>
                        <FolderSharedOutlined sx={{ fontSize: 20, color: "#98a2b3" }} />
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", my: 0.75, lineHeight: 1 }}>
                        {isLoading ? "-" : teachersCount}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }}>
                        {teachersDesc}
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
                        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "#344054" }}>
                            {departmentsCard?.title || "Departments"}
                        </Typography>
                        <DoorSlidingOutlined sx={{ fontSize: 20, color: "#98a2b3" }} />
                    </Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#101828", my: 0.75, lineHeight: 1 }}>
                        {isLoading ? "-" : departmentsCount}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }}>
                        {departmentsDesc}
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
                        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "#344054" }}>
                            {trialCard?.title || summary?.planTitle || "Trial"}
                        </Typography>
                        <AccessTimeOutlined sx={{ fontSize: 20, color: "#98a2b3" }} />
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#101828", my: 1.1, lineHeight: 1.1 }}>
                        {isLoading ? "-" : trialValue}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }}>
                        {trialDesc}
                    </Typography>
                </Card>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 310px", xl: "1fr 330px" },
                    gap: 2.5,
                    alignItems: "start",
                    width: "100%",
                }}
            >
                <Card
                    sx={{
                        border: "1px solid #eaecf0",
                        borderRadius: 2.5,
                        bgcolor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                        overflow: "hidden",
                        minWidth: 0,
                    }}
                    contentSx={{ p: 0, "&:last-child": { pb: 0 } }}
                >
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1.5,
                            borderBottom: "1px solid #eaecf0",
                        }}
                    >
                        <TextField
                            size="small"
                            placeholder="Search tests, batch, department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: { xs: "100%", sm: 280 },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    fontSize: 13,
                                    height: 36,
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: "#98a2b3" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearchTerm("")}>
                                                <ClearIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                        />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            {selectedBatch && (
                                <Chip
                                    label={`Batch: ${selectedBatch}`}
                                    size="small"
                                    onDelete={() => setSelectedBatch(null)}
                                    sx={{ fontSize: 11.5, height: 26, bgcolor: "#eff8ff", color: "#175cd3" }}
                                />
                            )}
                            {selectedDepartment && (
                                <Chip
                                    label={`Dept: ${selectedDepartment}`}
                                    size="small"
                                    onDelete={() => setSelectedDepartment(null)}
                                    sx={{ fontSize: 11.5, height: 26, bgcolor: "#eff8ff", color: "#175cd3" }}
                                />
                            )}
                            {selectedSection && (
                                <Chip
                                    label={`Sec: ${selectedSection}`}
                                    size="small"
                                    onDelete={() => setSelectedSection(null)}
                                    sx={{ fontSize: 11.5, height: 26, bgcolor: "#eff8ff", color: "#175cd3" }}
                                />
                            )}
                            {selectedDate && (
                                <Chip
                                    label={`Date: ${selectedDate}`}
                                    size="small"
                                    onDelete={() => setSelectedDate(null)}
                                    sx={{ fontSize: 11.5, height: 26, bgcolor: "#fdf2fa", color: "#c11574" }}
                                />
                            )}
                            {hasActiveFilters && (
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={handleClearAllFilters}
                                    sx={{ fontSize: 12, textTransform: "none", color: "#b42318", p: 0.5 }}
                                >
                                    Clear all
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ overflowX: "auto", width: "100%", position: "relative" }}>
                        {isFetching && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: "rgba(255,255,255,0.6)",
                                    zIndex: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CircularProgress size={28} />
                            </Box>
                        )}

                        <Table
                            columns={columns}
                            rows={rows}
                            getRowId={(r) => r.id}
                            emptyMessage={isLoading ? "Loading test data..." : "No test records found"}
                            sx={{
                                minWidth: 540,
                                "& .MuiTableCell-root": {
                                    px: { xs: 1.25, sm: 2 },
                                },
                                "& .MuiTableCell-head": {
                                    bgcolor: "#f9fafb",
                                    color: "#475467",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    py: 1.5,
                                    borderBottom: "1px solid #eaecf0",
                                    whiteSpace: "nowrap",
                                },
                                "& .MuiTableCell-body": {
                                    py: 1.75,
                                    borderBottom: "1px solid #f2f4f7",
                                },
                            }}
                        />
                    </Box>

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
                        <Typography sx={{ fontSize: 12, color: "#667085" }}>
                            {totalElements === 0 ? "0 - 0 of 0" : `${startRow} - ${endRow} of ${totalElements}`}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <IconButton
                                size="small"
                                disabled={currentPage <= 0 || isFetching}
                                onClick={() => setPage(0)}
                                sx={{ color: "#667085" }}
                            >
                                <FirstPage sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                                size="small"
                                disabled={currentPage <= 0 || isFetching}
                                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                                sx={{ color: "#667085" }}
                            >
                                <NavigateBefore sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                                size="small"
                                disabled={currentPage >= totalPages - 1 || isFetching}
                                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                sx={{ color: "#667085" }}
                            >
                                <NavigateNext sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                                size="small"
                                disabled={currentPage >= totalPages - 1 || isFetching}
                                onClick={() => setPage(Math.max(0, totalPages - 1))}
                                sx={{ color: "#667085" }}
                            >
                                <LastPage sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 12, color: "#667085" }}>
                                Page
                            </Typography>
                            <TextField
                                size="small"
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleJumpPage();
                                }}
                                sx={{
                                    width: 44,
                                    "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                                    "& .MuiOutlinedInput-input": {
                                        py: 0.35,
                                        px: 0.5,
                                        textAlign: "center",
                                        fontSize: 12,
                                    },
                                }}
                            />
                            <Typography sx={{ fontSize: 12, color: "#667085" }}>
                                of {totalPages}
                            </Typography>
                            <Button
                                variant="text"
                                onClick={handleJumpPage}
                                sx={{
                                    minWidth: "unset",
                                    p: 0.5,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#475467",
                                    textTransform: "none",
                                    "&:hover": { bgcolor: "transparent", color: "#101828" },
                                }}
                            >
                                Go
                            </Button>
                        </Box>
                    </Box>
                </Card>

                <Card
                    sx={{
                        border: "1px solid #eaecf0",
                        borderRadius: 2.5,
                        bgcolor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                        minWidth: 0,
                        width: "100%",
                    }}
                    contentSx={{ p: { xs: 2, sm: 2.25 }, "&:last-child": { pb: { xs: 2, sm: 2.25 } } }}
                >
                    <Box sx={{ mb: 1.75 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2563eb", lineHeight: 1.2 }}>
                            {calendarYear}
                        </Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#101828", mt: 0.35 }}>
                            {selectedDate
                                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "long",
                                    day: "numeric",
                                })
                                : calendar?.selectedDateDisplay || `${MONTH_NAMES[calendarMonth]} ${calendarYear}`}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1.25,
                            px: 0.25,
                        }}
                    >
                        <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.5, color: "#2563eb" }}>
                            <ChevronLeft sx={{ fontSize: 20 }} />
                        </IconButton>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#101828" }}>
                            {MONTH_NAMES[calendarMonth]}
                        </Typography>
                        <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.5, color: "#2563eb" }}>
                            <ChevronRight sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            textAlign: "center",
                            mb: 1,
                        }}
                    >
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                            <Typography
                                key={day}
                                sx={{ fontSize: 11.5, fontWeight: 500, color: "#667085", py: 0.5 }}
                            >
                                {day}
                            </Typography>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            rowGap: 0.75,
                            textAlign: "center",
                        }}
                    >
                        {calendarDays.map((item, idx) => {
                            let bgcolor = "transparent";
                            let color = item.isCurrentMonth ? "#344054" : "#cbd5e1";
                            let fontWeight = 500;

                            if (item.type === "completed") {
                                bgcolor = "#16a34a";
                                color = "#ffffff";
                                fontWeight = 700;
                            } else if (item.type === "today") {
                                bgcolor = "#2563eb";
                                color = "#ffffff";
                                fontWeight = 700;
                            } else if (item.type === "upcoming") {
                                bgcolor = "#f97316";
                                color = "#ffffff";
                                fontWeight = 700;
                            }

                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        py: 0.25,
                                    }}
                                >
                                    <Box
                                        onClick={() => handleSelectDate(item.dateStr)}
                                        sx={{
                                            width: 27,
                                            height: 27,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor,
                                            color,
                                            fontSize: 11.5,
                                            fontWeight,
                                            cursor: "pointer",
                                            boxShadow: item.isSelected ? "0 0 0 2px #0f172a" : "none",
                                            transition: "all 0.15s ease",
                                            "&:hover": {
                                                bgcolor: bgcolor === "transparent" ? "#f1f5f9" : bgcolor,
                                                transform: "scale(1.08)",
                                            },
                                        }}
                                    >
                                        {item.day}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 2.75,
                            pt: 1.75,
                            borderTop: "1px solid #f2f4f7",
                            flexWrap: "wrap",
                            gap: 0.75,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#16a34a", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 10, color: "#475467", fontWeight: 500, whiteSpace: "nowrap" }}>
                                Completed test
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#2563eb", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 10, color: "#475467", fontWeight: 500, whiteSpace: "nowrap" }}>
                                Today test
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#f97316", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 10, color: "#475467", fontWeight: 500, whiteSpace: "nowrap" }}>
                                Upcoming test
                            </Typography>
                        </Box>
                    </Box>


                </Card>
            </Box>

            <Menu
                anchorEl={batchAnchor}
                open={Boolean(batchAnchor)}
                onClose={() => setBatchAnchor(null)}
                slotProps={{ paper: { sx: { minWidth: 140, borderRadius: 2 } } }}
            >
                <MenuItem
                    selected={!selectedBatch}
                    onClick={() => {
                        setSelectedBatch(null);
                        setBatchAnchor(null);
                        setPage(0);
                    }}
                    sx={{ fontSize: 13 }}
                >
                    All Batches
                </MenuItem>
                {availableBatches.map((b) => (
                    <MenuItem
                        key={b}
                        selected={selectedBatch === b}
                        onClick={() => {
                            setSelectedBatch(b);
                            setBatchAnchor(null);
                            setPage(0);
                        }}
                        sx={{ fontSize: 13 }}
                    >
                        {b}
                    </MenuItem>
                ))}
            </Menu>

            <Menu
                anchorEl={deptAnchor}
                open={Boolean(deptAnchor)}
                onClose={() => setDeptAnchor(null)}
                slotProps={{ paper: { sx: { minWidth: 140, borderRadius: 2 } } }}
            >
                <MenuItem
                    selected={!selectedDepartment}
                    onClick={() => {
                        setSelectedDepartment(null);
                        setDeptAnchor(null);
                        setPage(0);
                    }}
                    sx={{ fontSize: 13 }}
                >
                    All Departments
                </MenuItem>
                {availableDepartments.map((d) => (
                    <MenuItem
                        key={d}
                        selected={selectedDepartment === d}
                        onClick={() => {
                            setSelectedDepartment(d);
                            setDeptAnchor(null);
                            setPage(0);
                        }}
                        sx={{ fontSize: 13 }}
                    >
                        {d}
                    </MenuItem>
                ))}
            </Menu>

            <Menu
                anchorEl={sectionAnchor}
                open={Boolean(sectionAnchor)}
                onClose={() => setSectionAnchor(null)}
                slotProps={{ paper: { sx: { minWidth: 120, borderRadius: 2 } } }}
            >
                <MenuItem
                    selected={!selectedSection}
                    onClick={() => {
                        setSelectedSection(null);
                        setSectionAnchor(null);
                        setPage(0);
                    }}
                    sx={{ fontSize: 13 }}
                >
                    All Sections
                </MenuItem>
                {availableSections.map((s) => (
                    <MenuItem
                        key={s}
                        selected={selectedSection === s}
                        onClick={() => {
                            setSelectedSection(s);
                            setSectionAnchor(null);
                            setPage(0);
                        }}
                        sx={{ fontSize: 13 }}
                    >
                        Section {s}
                    </MenuItem>
                ))}
            </Menu>

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </Box>
    );
};

export default InstitutionDashBoard;