import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Popover,
  Select,
  MenuItem,
  FormControl,
  Button,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

export interface DateTimePickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string | Date;
  disablePast?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function parseDateTimeString(val: string): {
  year: number;
  month: number;
  day: number;
  hour12: number;
  minute: number;
  ampm: "AM" | "PM";
} {
  const now = new Date();
  const defaultRes = {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    hour12: 10,
    minute: 0,
    ampm: "AM" as const,
  };

  if (!val || typeof val !== "string") return defaultRes;

  const trimmed = val.trim();

  const dmyMatch = trimmed.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i
  );
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    let hour12 = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 10;
    const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    let ampm: "AM" | "PM" = dmyMatch[6]?.toUpperCase() === "PM" ? "PM" : "AM";

    if (hour12 > 12) {
      hour12 = hour12 % 12 || 12;
      ampm = "PM";
    }
    if (hour12 === 0) hour12 = 12;

    return {
      year: isNaN(year) ? defaultRes.year : year,
      month: isNaN(month) ? defaultRes.month : Math.max(0, Math.min(11, month)),
      day: isNaN(day) ? defaultRes.day : Math.max(1, Math.min(31, day)),
      hour12,
      minute: isNaN(minute) ? 0 : Math.max(0, Math.min(59, minute)),
      ampm,
    };
  }

  const isoMatch = trimmed.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/i
  );
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const h24 = isoMatch[4] ? parseInt(isoMatch[4], 10) : 10;
    const minute = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
    const ampm: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const hour12 = h24 % 12 || 12;

    return {
      year: isNaN(year) ? defaultRes.year : year,
      month: isNaN(month) ? defaultRes.month : Math.max(0, Math.min(11, month)),
      day: isNaN(day) ? defaultRes.day : Math.max(1, Math.min(31, day)),
      hour12,
      minute: isNaN(minute) ? 0 : Math.max(0, Math.min(59, minute)),
      ampm,
    };
  }

  return defaultRes;
}

export function formatToDateTimeString(
  year: number,
  month: number,
  day: number,
  hour12: number,
  minute: number,
  ampm: "AM" | "PM"
): string {
  const dd = String(day).padStart(2, "0");
  const mm = String(month + 1).padStart(2, "0");
  const yyyy = String(year);
  const hh = String(hour12).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
}

export const DateTimePickerInput: React.FC<DateTimePickerInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "DD-MM-YYYY 10:00 AM",
  disabled = false,
  minDate,
  disablePast = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const todayStart = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
  }, []);

  const effectiveMinDate = useMemo(() => {
    let minD: Date | null = null;
    if (minDate) {
      if (minDate instanceof Date) {
        minD = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0);
      } else if (typeof minDate === "string") {
        const p = parseDateTimeString(minDate);
        minD = new Date(p.year, p.month, p.day, 0, 0, 0, 0);
      }
    }

    if (disablePast) {
      if (!minD || minD < todayStart) {
        return todayStart;
      }
      return minD;
    }

    return minD;
  }, [minDate, disablePast, todayStart]);

  const parsed = useMemo(() => parseDateTimeString(value), [value]);

  const [viewYear, setViewYear] = useState<number>(parsed.year);
  const [viewMonth, setViewMonth] = useState<number>(parsed.month);
  const [selectedDay, setSelectedDay] = useState<number>(parsed.day);
  const [hour12, setHour12] = useState<number>(parsed.hour12);
  const [minute, setMinute] = useState<number>(parsed.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(parsed.ampm);

  useEffect(() => {
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
    setSelectedDay(parsed.day);
    setHour12(parsed.hour12);
    setMinute(parsed.minute);
    setAmpm(parsed.ampm);
  }, [parsed]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    const p = parseDateTimeString(value);
    const parsedDate = new Date(p.year, p.month, p.day, 0, 0, 0, 0);

    if (effectiveMinDate && parsedDate < effectiveMinDate) {
      setViewYear(effectiveMinDate.getFullYear());
      setViewMonth(effectiveMinDate.getMonth());
      setSelectedDay(effectiveMinDate.getDate());
    } else {
      setViewYear(p.year);
      setViewMonth(p.month);
      setSelectedDay(p.day);
    }

    setHour12(p.hour12);
    setMinute(p.minute);
    setAmpm(p.ampm);
    setAnchorEl(containerRef.current || e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const applyChange = (
    y: number,
    m: number,
    d: number,
    h: number,
    min: number,
    meridiem: "AM" | "PM"
  ) => {
    const formatted = formatToDateTimeString(y, m, d, h, min, meridiem);
    onChange(formatted);
  };

  const canGoPrevMonth = useMemo(() => {
    if (!effectiveMinDate) return true;
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0, 23, 59, 59, 999);
    return prevMonthLastDay >= effectiveMinDate;
  }, [viewYear, viewMonth, effectiveMinDate]);

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    applyChange(viewYear, viewMonth, day, hour12, minute, ampm);
  };

  const handleHourChange = (newHour: number) => {
    setHour12(newHour);
    applyChange(viewYear, viewMonth, selectedDay, newHour, minute, ampm);
  };

  const handleMinuteChange = (newMin: number) => {
    setMinute(newMin);
    applyChange(viewYear, viewMonth, selectedDay, hour12, newMin, ampm);
  };

  const handleAmpmToggle = (newAmpm: "AM" | "PM") => {
    setAmpm(newAmpm);
    applyChange(viewYear, viewMonth, selectedDay, hour12, minute, newAmpm);
  };

  const handleSetNow = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const h24 = now.getHours();
    const min = now.getMinutes();
    const mer: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;

    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(d);
    setHour12(h12);
    setMinute(min);
    setAmpm(mer);

    applyChange(y, m, d, h12, min, mer);
  };

  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, isCurrentMonth: true });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const isCellDisabled = (cell: { day: number; isCurrentMonth: boolean }) => {
    if (!cell.isCurrentMonth) return true;
    if (!effectiveMinDate) return false;
    const cellDate = new Date(viewYear, viewMonth, cell.day, 0, 0, 0, 0);
    return cellDate < effectiveMinDate;
  };

  const isCellToday = (cell: { day: number; isCurrentMonth: boolean }) => {
    if (!cell.isCurrentMonth) return false;
    const now = new Date();
    return (
      cell.day === now.getDate() &&
      viewMonth === now.getMonth() &&
      viewYear === now.getFullYear()
    );
  };

  return (
    <Box ref={containerRef}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={handleOpen}
        placeholder={placeholder}
        disabled={disabled}
        slotProps={{
          input: {
            endAdornment: (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(e);
                }}
                disabled={disabled}
                sx={{ p: 0.5, color: "#667085", "&:hover": { color: "#1570ef" } }}
              >
                <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: "13px",
            bgcolor: "#ffffff",
            cursor: "pointer",
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(16, 24, 40, 0.12)",
              border: "1px solid #eaecf0",
              width: 320,
              bgcolor: "#ffffff",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <IconButton
            size="small"
            onClick={handlePrevMonth}
            disabled={!canGoPrevMonth}
            sx={{
              color: canGoPrevMonth ? "#667085" : "#d0d5dd",
              cursor: canGoPrevMonth ? "pointer" : "not-allowed",
              opacity: canGoPrevMonth ? 1 : 0.35,
            }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#101828" }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Typography>

          <IconButton size="small" onClick={handleNextMonth} sx={{ color: "#667085" }}>
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
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#667085",
                py: 0.5,
              }}
            >
              {wd}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "3px",
            mb: 2,
          }}
        >
          {calendarCells.map((cell, idx) => {
            const isSelected =
              cell.isCurrentMonth &&
              cell.day === selectedDay &&
              viewMonth === parsed.month &&
              viewYear === parsed.year;

            const disabledDay = isCellDisabled(cell);
            const todayDay = isCellToday(cell);

            return (
              <Box
                key={idx}
                onClick={() => {
                  if (!disabledDay) {
                    handleSelectDay(cell.day);
                  }
                }}
                sx={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: isSelected || todayDay ? 700 : 500,
                  cursor: disabledDay ? "not-allowed" : "pointer",
                  color: isSelected
                    ? "#ffffff"
                    : disabledDay
                    ? "#d0d5dd"
                    : todayDay
                    ? "#1570ef"
                    : cell.isCurrentMonth
                    ? "#101828"
                    : "#d0d5dd",
                  bgcolor: isSelected ? "#1570ef" : "transparent",
                  border: !isSelected && todayDay ? "1.5px solid #1570ef" : "1.5px solid transparent",
                  opacity: disabledDay ? (cell.isCurrentMonth ? 0.35 : 0.2) : 1,
                  pointerEvents: disabledDay ? "none" : "auto",
                  transition: "background-color 0.15s, border-color 0.15s",
                  "&:hover": {
                    bgcolor: isSelected
                      ? "#1570ef"
                      : disabledDay
                      ? "transparent"
                      : "#f2f4f7",
                  },
                }}
              >
                {cell.day}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            pt: 1.5,
            borderTop: "1px solid #f2f4f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 16, color: "#667085" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#344054" }}>
              Time
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <FormControl size="small">
              <Select
                value={hour12}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                sx={{
                  height: 30,
                  fontSize: "12px",
                  borderRadius: "6px",
                  minWidth: 54,
                  bgcolor: "#f8f9fa",
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <MenuItem key={h} value={h} sx={{ fontSize: "12px" }}>
                    {String(h).padStart(2, "0")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography sx={{ fontWeight: 700, color: "#667085", fontSize: "12px" }}>:</Typography>

            <FormControl size="small">
              <Select
                value={minute}
                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                sx={{
                  height: 30,
                  fontSize: "12px",
                  borderRadius: "6px",
                  minWidth: 54,
                  bgcolor: "#f8f9fa",
                }}
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: "12px" }}>
                    {String(m).padStart(2, "0")}
                  </MenuItem>
                ))}
                {![0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].includes(minute) && (
                  <MenuItem value={minute} sx={{ fontSize: "12px" }}>
                    {String(minute).padStart(2, "0")}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <Box
              sx={{
                display: "inline-flex",
                border: "1px solid #eaecf0",
                borderRadius: "6px",
                overflow: "hidden",
                height: 30,
              }}
            >
              <Box
                onClick={() => handleAmpmToggle("AM")}
                sx={{
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  bgcolor: ampm === "AM" ? "#1570ef" : "#f8f9fa",
                  color: ampm === "AM" ? "#ffffff" : "#475467",
                  transition: "all 0.15s",
                }}
              >
                AM
              </Box>
              <Box
                onClick={() => handleAmpmToggle("PM")}
                sx={{
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  bgcolor: ampm === "PM" ? "#1570ef" : "#f8f9fa",
                  color: ampm === "PM" ? "#ffffff" : "#475467",
                  transition: "all 0.15s",
                }}
              >
                PM
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #f2f4f7" }}>
          <Button
            size="small"
            variant="text"
            onClick={handleSetNow}
            sx={{ fontSize: "12px", color: "#1570ef", textTransform: "none", p: 0.5 }}
          >
            Set to Now
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleClose}
            sx={{
              fontSize: "12px",
              bgcolor: "#1570ef",
              "&:hover": { bgcolor: "#175cd3" },
              textTransform: "none",
              px: 2,
              py: 0.4,
              borderRadius: "6px",
            }}
          >
            Done
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateTimePickerInput;
