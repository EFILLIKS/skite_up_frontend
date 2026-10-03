import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    ApartmentOutlined,
    CheckCircleOutlined,
    EventAvailableOutlined,
    PaymentsOutlined,
    Search,
    ScheduleOutlined,
} from "@mui/icons-material";
import {
    Box,
    Chip,
    InputAdornment,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import Card from "../../components/common/Card";
import AreaChartCard from "../../components/common/AreaChartCard.tsx";
import Pagination from "../../components/common/Pagination";
import Table from "../../components/common/Table";
import type { AppTableColumn } from "../../types/Table.types";
import type { College, CollegeStatus } from "../../types/College.types.ts";



const colleges: College[] = [
    { id: 1, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "02 Oct 2026", status: "Plan Activated" },
    { id: 2, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "02 Oct 2026", status: "Trial Expired" },
    { id: 3, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "02 Oct 2026", status: "2 Days Left" },
    { id: 4, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "01 Oct 2026", status: "Plan Activated" },
    { id: 5, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "29 Sep 2026", status: "Plan Activated" },
    { id: 6, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "28 Sep 2026", status: "2 Days Left" },
    { id: 7, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "26 Sep 2026", status: "Trial Expired" },
    { id: 8, name: "KNCET College", students: 400, revenue: 230000, pending: 30000, initiatedDate: "24 Sep 2026", status: "Plan Activated" },
];

const formatRupees = (amount: number) => `₹ ${amount.toLocaleString("en-IN")}`;

const statusStyles: Record<CollegeStatus, { color: string; background: string; icon: typeof CheckCircleOutlined }> = {
    "Plan Activated": { color: "#238636", background: "#eaf7ec", icon: CheckCircleOutlined },
    "Trial Expired": { color: "#d92d3f", background: "#fff0f0", icon: ScheduleOutlined },
    "2 Days Left": { color: "#c76a08", background: "#fff5e9", icon: EventAvailableOutlined },
};

const Dashboard = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(0);
    const rowsPerPage = 3;

    const filteredColleges = useMemo(() => colleges.filter((college) => {
        const matchesSearch = college.name.toLowerCase().includes(search.trim().toLowerCase());
        const matchesStatus = statusFilter === "All Status" || college.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [search, statusFilter]);

    const columns: AppTableColumn<College>[] = [
        {
            id: "name",
            label: "College",
            minWidth: 180,
            render: (college) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box sx={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 1, color: "#24883f", bgcolor: "#edf8ef" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12H14M10 8H14M14 21V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V21M6 10H4C3.46957 10 2.96086 10.2107 2.58579 10.5858C2.21071 10.9609 2 11.4696 2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H18M6 21V5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3H16C16.5304 3 17.0391 3.21071 17.4142 3.58579C17.7893 3.96086 18 4.46957 18 5V21" stroke="#39AA16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202a3a" }}>{college.name}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#778397" }}>{college.students} Students</Typography>
                    </Box>
                </Box>
            ),
        },
        { id: "revenue", label: "Total Revenue", minWidth: 125, render: (college) => <MoneyCell amount={college.revenue} label="Total Revenue" /> },
        { id: "pending", label: "Pending", minWidth: 105, render: (college) => <MoneyCell amount={college.pending} label="Pending" /> },
        {
            id: "initiatedDate",
            label: "Initiated Date",
            minWidth: 120,
            render: (college) => <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#202a3a" }}>{college.initiatedDate}</Typography>,
        },
        {
            id: "status",
            label: "Plan Status",
            minWidth: 145,
            align: "right",
            render: (college) => {
                const style = statusStyles[college.status];
                const StatusIcon = style.icon;
                return (
                    <Chip
                        icon={<StatusIcon sx={{ color: `${style.color} !important`, fontSize: 16 }} />}
                        label={college.status}
                        size="small"
                        sx={{ height: 28, borderRadius: 1, bgcolor: style.background, color: style.color, fontSize: 10, fontWeight: 600 }}
                    />
                );
            },
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25, minWidth: 0 }}>
            <Box>
                <Typography sx={{ fontSize: 21, lineHeight: 1.25, fontWeight: 650, color: "#202a3a" }}>Dashboard</Typography>
                <Typography sx={{ mt: 0.35, fontSize: 12, color: "#778397" }}>Overview of your colleges, revenue and payments</Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
                <MetricCard title="Active Colleges" value="8" caption="Skiteup Clients" icon={<ApartmentOutlined />} />
                <MetricCard title="Amount Collected" value="₹ 12,40,000" caption="Total Payments Received" icon={<PaymentsOutlined />} />
                <MetricCard title="Pending Balance" value="₹ 3,60,000" caption="Yet to be collected" icon={<ScheduleOutlined />} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                <AreaChartCard title="Monthly Revenue" subtitle="Total revenue collected in the last 12 months" color="#bd5b91" values={[240000, 310000, 220000, 250000, 270000, 80000, 260000, 300000, 320000, 390000, 500000, 360000]} />
                <AreaChartCard title="Monthly Expenses" subtitle="Total expenses in the last 12 months" color="#5598dc" values={[180000, 230000, 150000, 190000, 300000, 210000, 180000, 270000, 410000, 450000, 370000, 340000]} />
            </Box>

            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#202a3a" }}>Colleges - {filteredColleges.length}</Typography>
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
                            {["All Status", ...Object.keys(statusStyles)].map((status) => <MenuItem key={status} value={status} sx={{ fontSize: 12 }}>{status}</MenuItem>)}
                        </TextField>
                    </Box>
                </Box>

                <Paper variant="outlined" sx={{ overflow: "hidden", borderColor: "#e5e9f0", borderRadius: 1.5, boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)" }}>
                    <Table
                        size="small"
                        columns={columns}
                        rows={filteredColleges.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                        getRowId={(college) => college.id}
                        sx={{
                            "& .MuiTableCell-root": { borderColor: "#edf0f4", px: 1.25, py: 0.85 },
                            "& .MuiTableHead-root .MuiTableCell-root": { color: "#778397", fontSize: 10, fontWeight: 600, bgcolor: "#fbfcfd", whiteSpace: "nowrap" },
                        }}
                    />
                    <Pagination
                        count={filteredColleges.length}
                        page={page}
                        onPageChange={(_, nextPage) => setPage(nextPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={() => setPage(0)}
                        rowsPerPageOptions={[rowsPerPage]}
                        labelRowsPerPage="Rows"
                        sx={{ borderTop: "1px solid #edf0f4", minHeight: 44, "& .MuiTablePagination-toolbar": { minHeight: 44, px: 1.5 }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 10, color: "#778397" } }}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

const MetricCard = ({ title, value, caption, icon }: { title: string; value: string; caption: string; icon: ReactNode }) => (
    <Card sx={{ border: "1px solid #e5e9f0", borderRadius: 1.5, boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)" }} contentSx={{ p: "13px 15px !important", "&:last-child": { pb: "13px !important" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography sx={{ fontSize: 11, color: "#344054", fontWeight: 500 }}>{title}</Typography>
            <Box sx={{ color: "#738197", display: "flex", "& svg": { fontSize: 17 } }}>{icon}</Box>
        </Box>
        <Typography sx={{ mt: 0.7, fontSize: 19, lineHeight: 1.25, fontWeight: 650, color: "#202a3a" }}>{value}</Typography>
        <Typography sx={{ mt: 0.4, fontSize: 10, color: "#778397" }}>{caption}</Typography>
    </Card>
);

const MoneyCell = ({ amount, label }: { amount: number; label: string }) => (
    <Box>
        <Typography sx={{ fontSize: 11, lineHeight: 1.35, fontWeight: 600, color: "#202a3a", whiteSpace: "nowrap" }}>{formatRupees(amount)}</Typography>
        <Typography sx={{ fontSize: 9, color: "#778397" }}>{label}</Typography>
    </Box>
);

export default Dashboard;