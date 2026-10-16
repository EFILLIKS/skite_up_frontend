import React from "react";
import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { Box, Typography } from "@mui/material";
import Card from "./Card";

export interface DonutChartCardProps {
  series: number[];
  labels: string[];
  colors: string[];
  title?: string;
  subtitle?: string;
  height?: number;
}

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  series,
  labels,
  colors,
  title,
  subtitle,
  height = 195,
}) => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors,
    labels,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
      colors: ["#ffffff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: false,
          },
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #eaecf0",
        borderRadius: "12px",
        bgcolor: "#ffffff",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
        height: "100%",
      }}
      contentSx={{
        p: "20px !important",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {title && (
        <Box sx={{ width: "100%", mb: 1 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          my: 1,
          minHeight: height,
        }}
      >
        <Chart options={options} series={series} type="donut" height={height} width="100%" />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          mt: 2,
          width: "100%",
          px: 1,
        }}
      >
        {labels.map((label, idx) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: colors[idx] || "#667085",
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#344054" }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default DonutChartCard;
