import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import type { AssessmentCalendarData } from "../../../types/Assessment.types";
import type { StudentDashboardCalendar } from "../../../types/Dashboard.types";

export interface AssessmentCalendarWidgetProps {
  calendarData?: AssessmentCalendarData | StudentDashboardCalendar;
  selectedDate?: string | null;
  onSelectDate: (date: string) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const AssessmentCalendarWidget: React.FC<AssessmentCalendarWidgetProps> = ({
  calendarData,
  selectedDate,
  onSelectDate,
}) => {
  const getInitialYear = (): number => {
    if (calendarData && "year" in calendarData && calendarData.year) {
      return calendarData.year;
    }
    const targetDate = selectedDate || calendarData?.selectedDate;
    if (targetDate) {
      const parts = targetDate.split("-");
      if (parts.length >= 1) {
        const y = parseInt(parts[0], 10);
        if (!isNaN(y)) return y;
      }
    }
    return 2026;
  };

  const getInitialMonth = (): number => {
    if (calendarData && "monthValue" in calendarData && calendarData.monthValue) {
      return calendarData.monthValue - 1;
    }
    if (calendarData && "month" in calendarData && typeof calendarData.month === "string") {
      const idx = MONTH_NAMES.findIndex(
        (m) => m.toLowerCase() === (calendarData.month as string).toLowerCase()
      );
      if (idx !== -1) return idx;
    }
    const targetDate = selectedDate || calendarData?.selectedDate;
    if (targetDate) {
      const parts = targetDate.split("-");
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(m) && m >= 0 && m <= 11) return m;
      }
    }
    return 9;
  };

  const [currentYear, setCurrentYear] = useState<number>(getInitialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(getInitialMonth);
  const lastSyncedDateRef = React.useRef<string | null>(null);

  useEffect(() => {
    const targetDate = selectedDate || calendarData?.selectedDate;
    if (targetDate && targetDate !== lastSyncedDateRef.current) {
      lastSyncedDateRef.current = targetDate;
      const parts = targetDate.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y)) setCurrentYear(y);
        if (!isNaN(m) && m >= 0 && m <= 11) setCurrentMonth(m);
      }
    } else if (!targetDate && calendarData) {
      if ("year" in calendarData && calendarData.year) {
        setCurrentYear(calendarData.year);
      }
      if ("monthValue" in calendarData && calendarData.monthValue) {
        setCurrentMonth(calendarData.monthValue - 1);
      }
    }
  }, [calendarData, selectedDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells: Array<{
    day: number;
    monthOffset: number;
    dateStr: string;
  }> = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, monthOffset: -1, dateStr });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, monthOffset: 0, dateStr });
  }

  const totalGridSlots = cells.length > 35 ? 42 : 35;
  const remaining = totalGridSlots - cells.length;
  if (remaining > 0) {
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, monthOffset: 1, dateStr });
    }
  }

  const completedDates = calendarData?.completedDates || [];
  const todayDates = calendarData?.todayDates || [];
  const upcomingDates = calendarData?.upcomingDates || [];

  const effectiveSelectedDate =
    selectedDate !== undefined ? selectedDate : calendarData?.selectedDate || "";

  const formatDisplayDate = (dStr: string) => {
    if (calendarData?.selectedDate === dStr && calendarData?.selectedDateDisplay) {
      return calendarData.selectedDateDisplay;
    }
    try {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = days[date.getDay()];
        const mName = MONTH_NAMES[date.getMonth()];
        return `${dayName}, ${mName} ${date.getDate()}`;
      }
    } catch {
    }
    return dStr;
  };

  const handleCellClick = (cell: { day: number; monthOffset: number; dateStr: string }) => {
    onSelectDate(cell.dateStr);
    if (cell.monthOffset === -1) {
      handlePrevMonth();
    } else if (cell.monthOffset === 1) {
      handleNextMonth();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #eaecf0",
        p: 2.5,
        width: "100%",
        maxWidth: { xs: "100%", lg: 320 },
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{ color: "#667085", fontWeight: 500, fontSize: "13px" }}
        >
          {currentYear}
        </Typography>
        <Typography
          sx={{ fontWeight: 700, color: "#101828", fontSize: "18px", lineHeight: 1.25, mt: 0.25 }}
        >
          {effectiveSelectedDate
            ? formatDisplayDate(effectiveSelectedDate)
            : `${MONTH_NAMES[currentMonth]} ${currentYear}`}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1,
          px: 0.5,
          mb: 1.5,
          borderTop: "1px solid #f2f4f7",
        }}
      >
        <IconButton
          size="small"
          onClick={handlePrevMonth}
          title="Previous month"
          sx={{
            bgcolor: "#eff6ff",
            color: "#2563eb",
            p: 0.5,
            borderRadius: "50%",
            "&:hover": { bgcolor: "#dbeafe" },
          }}
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontWeight: 600, color: "#101828", fontSize: "14px" }}>
          {MONTH_NAMES[currentMonth]}
        </Typography>
        <IconButton
          size="small"
          onClick={handleNextMonth}
          title="Next month"
          sx={{
            bgcolor: "#eff6ff",
            color: "#2563eb",
            p: 0.5,
            borderRadius: "50%",
            "&:hover": { bgcolor: "#dbeafe" },
          }}
        >
          <ChevronRightRoundedIcon fontSize="small" />
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
        {WEEK_DAYS.map((wd) => (
          <Typography
            key={wd}
            sx={{ fontWeight: 500, color: "#667085", fontSize: "12px", py: 0.5 }}
          >
            {wd}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
          textAlign: "center",
          mb: 2,
        }}
      >
        {cells.map((cell, idx) => {
          const isCurrentMonth = cell.monthOffset === 0;
          const isSelected = effectiveSelectedDate === cell.dateStr;
          const isToday = todayDates.includes(cell.dateStr);
          const isCompleted = completedDates.includes(cell.dateStr);
          const isUpcoming = upcomingDates.includes(cell.dateStr);
          const hasTest = isToday || isCompleted || isUpcoming;

          let badgeBg = "transparent";
          let badgeColor = isCurrentMonth ? "#344054" : "#cbd5e1";
          let badgeWeight = isCurrentMonth ? 500 : 400;
          let borderStyle = "none";

          if (isToday) {
            badgeBg = "#2563eb";
            badgeColor = "#ffffff";
            badgeWeight = 600;
          } else if (isCompleted) {
            badgeBg = "#16a34a";
            badgeColor = "#ffffff";
            badgeWeight = 600;
          } else if (isUpcoming) {
            badgeBg = "#ea580c";
            badgeColor = "#ffffff";
            badgeWeight = 600;
          } else if (isSelected) {
            badgeBg = "#eff6ff";
            badgeColor = "#2563eb";
            badgeWeight = 600;
            borderStyle = "1.5px solid #2563eb";
          }

          return (
            <Box
              key={`${cell.dateStr}-${idx}`}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 32,
              }}
            >
              <Box
                onClick={() => handleCellClick(cell)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  cursor: "pointer",
                  bgcolor: badgeBg,
                  color: badgeColor,
                  fontWeight: badgeWeight,
                  border: borderStyle,
                  boxShadow:
                    isSelected && hasTest
                      ? "0 0 0 2px #ffffff, 0 0 0 3.5px #2563eb"
                      : "none",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor:
                      badgeBg === "transparent"
                        ? "#f2f4f7"
                        : badgeBg,
                  },
                }}
              >
                {cell.day}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          borderTop: "1px solid #f2f4f7",
          pt: 1.75,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#16a34a" }} />
          <Typography sx={{ color: "#475467", fontSize: "11px", fontWeight: 500 }}>
            Completed test
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#2563eb" }} />
          <Typography sx={{ color: "#475467", fontSize: "11px", fontWeight: 500 }}>
            Today test
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#ea580c" }} />
          <Typography sx={{ color: "#475467", fontSize: "11px", fontWeight: 500 }}>
            Upcoming test
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AssessmentCalendarWidget;
