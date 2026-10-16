import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    ApartmentOutlined,
    CheckCircleOutlined,
    EventAvailableOutlined,
    PaymentsOutlined,
    RefreshOutlined,
    ScheduleOutlined,
    Search,
} from "@mui/icons-material";
import {
    Box,
    Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Card from "../../components/common/Card";
import AreaChartCard from "../../components/common/AreaChartCard.tsx";
import Pagination from "../../components/common/Pagination";
import Table from "../../components/common/Table";
import type { AppTableColumn } from "../../types/Table.types";
import type { DashboardCollegeItem } from "../../types/Dashboard.types";
import { useGetSuperAdminDashboardQuery } from "../../features/dashboard/DashboardApi";

const formatRupees = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "₹ 0";
    return `₹ ${num.toLocaleString("en-IN")}`;
};

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const day = String(d.getDate()).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    } catch {
        return dateString || "-";
    }
};

const getStatusStyle = (status?: string | null): { color: string; background: string; icon: typeof CheckCircleOutlined } => {
    const s = (status || "").toLowerCase().trim();
    if (s.includes("active") || s.includes("activated")) {
        return { color: "#238636", background: "#eaf7ec", icon: CheckCircleOutlined };
    }
    if (s.includes("pending")) {
        return { color: "#2563eb", background: "#eff6ff", icon: ScheduleOutlined };
    }
    if (s.includes("expired")) {
        return { color: "#d92d3f", background: "#fff0f0", icon: ScheduleOutlined };
    }
    if (s.includes("left") || s.includes("soon") || s.includes("renewal")) {
        return { color: "#c76a08", background: "#fff5e9", icon: EventAvailableOutlined };
    }
    return { color: "#475467", background: "#f0f2f5", icon: CheckCircleOutlined };
};

const Dashboard = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const {
        data: dashboardResponse,
        isLoading,
        isFetching,
        refetch,
    } = useGetSuperAdminDashboardQuery();

    const summary = dashboardResponse?.data?.summary;
    const monthlyRevenue = useMemo(() => dashboardResponse?.data?.monthlyRevenue || [], [dashboardResponse]);
    const monthlyExpenses = useMemo(() => dashboardResponse?.data?.monthlyExpenses || [], [dashboardResponse]);
    const collegesList = useMemo(() => dashboardResponse?.data?.colleges?.content || [], [dashboardResponse]);

    const revenueValues = useMemo(() => {
        if (!monthlyRevenue.length) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        return monthlyRevenue.map((item) => Number(item.amount) || 0);
    }, [monthlyRevenue]);

    const revenueCategories = useMemo(() => {
        if (!monthlyRevenue.length) return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthlyRevenue.map((item) => item.month);
    }, [monthlyRevenue]);

    const expenseValues = useMemo(() => {
        if (!monthlyExpenses.length) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        return monthlyExpenses.map((item) => Number(item.amount) || 0);
    }, [monthlyExpenses]);

    const expenseCategories = useMemo(() => {
        if (!monthlyExpenses.length) return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthlyExpenses.map((item) => item.month);
    }, [monthlyExpenses]);

    const statusOptions = useMemo(() => {
        const defaultOptions = ["All Status", "Plan Activated", "Pending", "Trial Expired", "2 Days Left"];
        const fromData = collegesList.map((c) => c.planStatus).filter(Boolean);
        return Array.from(new Set([...defaultOptions, ...fromData]));
    }, [collegesList]);

    const filteredColleges = useMemo(() => {
        return collegesList.filter((college) => {
            const matchesSearch =
                search.trim() === "" ||
                college.collegeName.toLowerCase().includes(search.trim().toLowerCase()) ||
                (college.institutionCode && college.institutionCode.toLowerCase().includes(search.trim().toLowerCase()));

            const matchesStatus =
                statusFilter === "All Status" ||
                (college.planStatus && college.planStatus.toLowerCase() === statusFilter.toLowerCase());

            return matchesSearch && matchesStatus;
        });
    }, [collegesList, search, statusFilter]);

    const safePage = useMemo(() => {
        const maxPage = Math.max(0, Math.ceil(filteredColleges.length / rowsPerPage) - 1);
        return Math.min(page, maxPage);
    }, [filteredColleges.length, page, rowsPerPage]);

    const columns: AppTableColumn<DashboardCollegeItem>[] = [
        {
            id: "collegeName",
            label: "College",
            minWidth: 180,
            render: (college) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box sx={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 1, color: "#24883f", bgcolor: "#edf8ef", flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12H14M10 8H14M14 21V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V21M6 10H4C3.46957 10 2.96086 10.2107 2.58579 10.5858C2.21071 10.9609 2 11.4696 2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H18M6 21V5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3H16C16.5304 3 17.0391 3.21071 17.4142 3.58579C17.7893 3.96086 18 4.46957 18 5V21" stroke="#39AA16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202a3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {college.collegeName}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "#778397" }}>
                            {college.currentStudentCount ?? 0}{college.maxMembers ? ` / ${college.maxMembers}` : ""} Students
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            id: "totalRevenue",
            label: "Total Revenue",
            minWidth: 125,
            render: (college) => (
                <MoneyCell
                    amountText={college.formattedTotalRevenue || formatRupees(college.totalRevenue ?? 0)}
                    label="Total Revenue"
                />
            ),
        },
        {
            id: "pending",
            label: "Pending",
            minWidth: 105,
            render: (college) => (
                <MoneyCell
                    amountText={college.formattedPending || formatRupees(college.pending ?? 0)}
                    label="Pending"
                />
            ),
        },
        {
            id: "initiatedDate",
            label: "Initiated Date",
            minWidth: 120,
            render: (college) => (
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#202a3a" }}>
                    {college.formattedInitiatedDate || formatDate(college.initiatedDate)}
                </Typography>
            ),
        },
        {
            id: "planStatus",
            label: "Plan Status",
            minWidth: 145,
            align: "right",
            render: (college) => {
                const style = getStatusStyle(college.planStatus);
                const StatusIcon = style.icon;
                return (
                    <Chip
                        icon={<StatusIcon sx={{ color: `${style.color} !important`, fontSize: 16 }} />}
                        label={college.planStatus || "Unknown"}
                        size="small"
                        sx={{
                            height: 28,
                            borderRadius: 1,
                            bgcolor: style.background,
                            color: style.color,
                            fontSize: 10,
                            fontWeight: 600,
                        }}
                    />
                );
            },
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25, minWidth: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                <Box>
                    <Typography sx={{ fontSize: 21, lineHeight: 1.25, fontWeight: 650, color: "#202a3a" }}>Dashboard</Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 12, color: "#778397" }}>Overview of your colleges, revenue and payments</Typography>
                </Box>
                <Tooltip title="Refresh dashboard data">
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => void refetch()}
                            disabled={isLoading || isFetching}
                            sx={{
                                border: "1px solid #e5e9f0",
                                bgcolor: "#fff",
                                color: "#475467",
                                "&:hover": { bgcolor: "#f8fafc" },
                            }}
                        >
                            <RefreshOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1.5 }}>
                <MetricCard
                    title="Total Colleges"
                    value={String(summary?.totalColleges ?? 0)}
                    caption="Registered Institutions"
                    icon={<ApartmentOutlined />}
                    loading={isLoading}
                />
                <MetricCard
                    title="Active Colleges"
                    value={String(summary?.activeColleges ?? 0)}
                    caption="Active Subscriptions"
                    icon={<CheckCircleOutlined />}
                    loading={isLoading}
                />
                <MetricCard
                    title="Amount Collected"
                    value={summary?.formattedAmountCollected ?? (summary?.amountCollected != null ? formatRupees(summary.amountCollected) : "₹ 0")}
                    caption="Total Payments Received"
                    icon={<PaymentsOutlined />}
                    loading={isLoading}
                />
                <MetricCard
                    title="Pending Balance"
                    value={summary?.formattedPendingBalance ?? (summary?.pendingBalance != null ? formatRupees(summary.pendingBalance) : "₹ 0")}
                    caption="Yet to be collected"
                    icon={<ScheduleOutlined />}
                    loading={isLoading}
                />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                <AreaChartCard
                    title="Monthly Revenue"
                    subtitle="Total revenue collected in the last 12 months"
                    color="#bd5b91"
                    values={revenueValues}
                    categories={revenueCategories}
                />
                <AreaChartCard
                    title="Monthly Expenses"
                    subtitle="Total expenses in the last 12 months"
                    color="#5598dc"
                    values={expenseValues}
                    categories={expenseCategories}
                />
            </Box>

            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#202a3a" }}>
                        Colleges - {filteredColleges.length}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
                        <TextField
                            size="small"
                            placeholder="Search colleges..."
                            value={search}
                            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
                            slotProps={{
                                htmlInput: { "aria-label": "Search colleges" },
                                input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 17, color: "#778397" }} /></InputAdornment> },
                            }}
                            sx={{ flex: { xs: 1, sm: "none" }, width: { sm: 245 }, bgcolor: "#fff", "& .MuiOutlinedInput-root": { fontSize: 11, borderRadius: 1.5 }, "& .MuiOutlinedInput-input": { py: 0.9 } }}
                        />
                        <TextField
                            select
                            size="small"
                            value={statusFilter}
                            onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }}
                            slotProps={{ select: { "aria-label": "Filter by college plan status" } }}
                            sx={{ width: { xs: 132, sm: 150 }, bgcolor: "#fff", "& .MuiOutlinedInput-root": { fontSize: 11, borderRadius: 1.5 }, "& .MuiSelect-select": { py: 0.9 } }}
                        >
                            {statusOptions.map((status) => <MenuItem key={status} value={status} sx={{ fontSize: 12 }}>{status}</MenuItem>)}
                        </TextField>
                    </Box>
                </Box>

                <Paper variant="outlined" sx={{ overflow: "hidden", borderColor: "#e5e9f0", borderRadius: 1.5, boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)" }}>
                    <Table
                        size="small"
                        loading={isLoading}
                        emptyMessage="No colleges found"
                        columns={columns}
                        rows={filteredColleges.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage)}
                        getRowId={(college) => college.id}
                        sx={{
                            "& .MuiTableCell-root": { borderColor: "#edf0f4", px: 1.25, py: 0.85 },
                            "& .MuiTableHead-root .MuiTableCell-root": { color: "#778397", fontSize: 10, fontWeight: 600, bgcolor: "#fbfcfd", whiteSpace: "nowrap" },
                        }}
                    />
                    <Pagination
                        count={filteredColleges.length}
                        page={safePage}
                        onPageChange={(_, nextPage) => setPage(nextPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 20]}
                        labelRowsPerPage="Rows"
                        sx={{ borderTop: "1px solid #edf0f4", minHeight: 44, "& .MuiTablePagination-toolbar": { minHeight: 44, px: 1.5 }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 10, color: "#778397" } }}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

const MetricCard = ({
    title,
    value,
    caption,
    icon,
    loading = false,
}: {
    title: string;
    value: string;
    caption: string;
    icon: ReactNode;
    loading?: boolean;
}) => (
    <Card sx={{ border: "1px solid #e5e9f0", borderRadius: 1.5, boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)" }} contentSx={{ p: "13px 15px !important", "&:last-child": { pb: "13px !important" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography sx={{ fontSize: 11, color: "#344054", fontWeight: 500 }}>{title}</Typography>
            <Box sx={{ color: "#738197", display: "flex", "& svg": { fontSize: 17 } }}>{icon}</Box>
        </Box>
        {loading ? (
            <Skeleton variant="text" width="60%" height={28} sx={{ mt: 0.5 }} />
        ) : (
            <Typography sx={{ mt: 0.7, fontSize: 19, lineHeight: 1.25, fontWeight: 650, color: "#202a3a" }}>{value}</Typography>
        )}
        {loading ? (
            <Skeleton variant="text" width="45%" height={16} sx={{ mt: 0.2 }} />
        ) : (
            <Typography sx={{ mt: 0.4, fontSize: 10, color: "#778397" }}>{caption}</Typography>
        )}
    </Card>
);

const MoneyCell = ({ amountText, label }: { amountText: string; label: string }) => (
    <Box>
        <Typography sx={{ fontSize: 11, lineHeight: 1.35, fontWeight: 600, color: "#202a3a", whiteSpace: "nowrap" }}>{amountText}</Typography>
        <Typography sx={{ fontSize: 9, color: "#778397" }}>{label}</Typography>
    </Box>
);

export default Dashboard;