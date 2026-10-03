import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { Box, Typography } from "@mui/material";
import Card from "./Card";

interface AreaChartCardProps {
    title: string;
    subtitle: string;
    color: string;
    values: number[];
    categories?: string[];
}

const defaultCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatRupees = (amount: number) => `₹ ${amount.toLocaleString("en-IN")}`;

const AreaChartCard = ({ title, subtitle, color, values, categories = defaultCategories }: AreaChartCardProps) => {
    const maximum = Math.ceil(Math.max(...values) / 100000) * 100000 || 100000;
    const options: ApexOptions = {
        chart: {
            type: "area",
            height: 195,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "inherit",
            parentHeightOffset: 0,
        },
        colors: [color],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2.5 },
        fill: { type: "gradient", gradient: { shadeIntensity: 0.15, opacityFrom: 0.42, opacityTo: 0.02, stops: [0, 90, 100] } },
        grid: { borderColor: "#edf0f4", strokeDashArray: 3, padding: { left: 4, right: 6 } },
        xaxis: {
            categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#778397", fontSize: "10px" } },
        },
        yaxis: {
            min: 0,
            max: maximum,
            tickAmount: 5,
            labels: {
                formatter: (value) => value === 0 ? "₹ 0" : `₹ ${Math.round(value / 1000).toLocaleString("en-IN")},000`,
                style: { colors: "#778397", fontSize: "10px" },
            },
        },
        tooltip: { y: { formatter: formatRupees } },
    };

    return (
        <Card sx={{ border: "1px solid #e5e9f0", borderRadius: 1.5, boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)" }} contentSx={{ p: "13px 14px 7px !important", "&:last-child": { pb: "7px !important" } }}>
            <Typography sx={{ fontSize: 13, lineHeight: 1.3, fontWeight: 600, color: "#202a3a" }}>{title}</Typography>
            <Typography sx={{ mt: 0.2, fontSize: 10, color: "#778397" }}>{subtitle}</Typography>
            <Box sx={{ mt: 1, mx: -0.5, minWidth: 0 }}>
                <Chart options={options} series={[{ name: title, data: values }]} type="area" height={195} />
            </Box>
        </Card>
    );
};

export default AreaChartCard;