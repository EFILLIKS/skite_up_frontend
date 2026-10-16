import { useEffect, useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ApartmentOutlined,
  DeleteOutlineOutlined,
  EditOutlined,
  KeyboardArrowDown,
  RefreshOutlined,
} from "@mui/icons-material";
import Table from "../../components/common/Table";
import type { AppTableColumn } from "../../types/Table.types";
import { useGetPlanQuery, type Plan } from "../../features/plan/PlanApi";

const formatPricePerMember = (price: number | null | undefined): string => {
  if (price === 0) return "₹ 0.00";
  if (price != null) {
    return `₹ ${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return "Custom";
};

const formatDurationLabel = (days: number | null | undefined): string => {
  if (!days) return "-";
  if (days === 7) return "1 Week plan";
  if (days === 30) return "1 Month plan";
  if (days === 180 || days === 182 || days === 183) return "6 Month plan";
  if (days === 365) return "1 Year plan";
  if (days % 30 === 0) return `${days / 30} Month plan`;
  return `${days} Days plan`;
};

const iconThemePresets = [
  { bgColor: "#f0f2f5", color: "#475467" },
  { bgColor: "#eaf7ec", color: "#238636" },
  { bgColor: "#fff4e5", color: "#ea580c" },
  { bgColor: "#eff6ff", color: "#2563eb" },
  { bgColor: "#fbf1f6", color: "#c026d3" },
];

const ColumnHeaderWithSort = ({ title }: { title: string }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center" }}>
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467" }}>{title}</Typography>
    <KeyboardArrowDown sx={{ fontSize: 16, color: "#667085" }} />
  </Box>
);

const PlanPage = () => {
  const {
    data: planList,
    isLoading,
    isFetching,
    refetch,
  } = useGetPlanQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const plans: Plan[] = useMemo(() => {
    if (planList?.data) {
      return Array.isArray(planList.data) ? planList.data : [planList.data];
    }
    return [];
  }, [planList]);

  const columns: AppTableColumn<Plan>[] = [
    {
      id: "index",
      label: "#",
      width: "5%",
      minWidth: 48,
      header: <ColumnHeaderWithSort title="#" />,
      render: (_plan, index) => (
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#344054" }}>
          {index + 1}
        </Typography>
      ),
    },
    {
      id: "name",
      label: "Plan Details",
      width: "28%",
      minWidth: 200,
      header: <ColumnHeaderWithSort title="Plan Details" />,
      render: (plan, index) => {
        const preset = iconThemePresets[index % iconThemePresets.length];
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: preset.bgColor,
                color: preset.color,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ApartmentOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
                {plan.name || plan.planDetails || "Plan"}
              </Typography>
              {plan.code && (
                <Typography sx={{ fontSize: 11, color: "#667085", fontWeight: 500 }}>
                  Code: {plan.code}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      id: "pricePerMember",
      label: "Price / Member",
      width: "17%",
      minWidth: 130,
      header: <ColumnHeaderWithSort title="Price / Member" />,
      render: (plan) => {
        const isCustom = plan.pricePerMember == null;
        return (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
              {formatPricePerMember(plan.pricePerMember)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#667085" }}>
              {isCustom ? "Contact sales" : plan.pricePerMember === 0 ? "Free tier" : "Per member"}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "maxMembers",
      label: "Max Members",
      width: "17%",
      minWidth: 130,
      header: <ColumnHeaderWithSort title="Max Members" />,
      render: (plan) => (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
            {plan.maxMembers != null ? `${plan.maxMembers.toLocaleString("en-IN")} Members` : "-"}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#667085" }}>
            Teachers {plan.teachersIncluded ? "Included" : "Excluded"}
          </Typography>
        </Box>
      ),
    },
    {
      id: "durationDays",
      label: "Duration",
      width: "14%",
      minWidth: 110,
      header: <ColumnHeaderWithSort title="Duration" />,
      render: (plan) => (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>
            {plan.durationDays != null ? `${plan.durationDays} Days` : "-"}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#667085" }}>
            {formatDurationLabel(plan.durationDays)}
          </Typography>
        </Box>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: "9%",
      minWidth: 80,
      align: "center",
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467", textAlign: "center" }}>
          Status
        </Typography>
      ),
      render: (plan) => {
        const isActive = plan.isActivated !== false;
        return (
          <Chip
            size="small"
            label={isActive ? "Active" : "Inactive"}
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: isActive ? "#eaf7ec" : "#fee2e2",
              color: isActive ? "#238636" : "#dc2626",
              borderRadius: 1,
            }}
          />
        );
      },
    },
    {
      id: "action",
      label: "Action",
      width: "10%",
      minWidth: 95,
      align: "center",
      header: (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475467", textAlign: "center" }}>
          Action
        </Typography>
      ),
      render: (plan) => (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            aria-label={`Edit ${plan.name || "plan"}`}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.25,
              border: "1px solid #93c5fd",
              bgcolor: "#fff",
              color: "#2563eb",
              "&:hover": { bgcolor: "#eff6ff", borderColor: "#60a5fa" },
            }}
          >
            <EditOutlined sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`Delete ${plan.name || "plan"}`}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.25,
              border: "1px solid #fca5a5",
              bgcolor: "#fff",
              color: "#ef4444",
              "&:hover": { bgcolor: "#fef2f2", borderColor: "#f87171" },
            }}
          >
            <DeleteOutlineOutlined sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      ),
    },
  ];

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
            Offers
          </Typography>
          <Typography sx={{ mt: 0.35, fontSize: 13, color: "#667085" }}>
            College plans and offers details
          </Typography>
        </Box>
        <Tooltip title="Refresh plans">
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
          rows={plans}
          getRowId={(plan) => plan.id}
          loading={isLoading || isFetching}
          emptyMessage="No plans available"
          sx={{
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              borderColor: "#edf0f4",
              px: 1.5,
              py: 1.2,
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              color: "#475467",
              fontSize: 12,
              fontWeight: 600,
              bgcolor: "#fbfcfd",
              whiteSpace: "nowrap",
              py: 1.25,
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default PlanPage;