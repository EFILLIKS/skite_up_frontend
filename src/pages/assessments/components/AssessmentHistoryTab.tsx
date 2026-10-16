import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Table from "../../../components/common/Table";
import Card from "../../../components/common/Card";
import Pagination from "../../../components/common/Pagination";
import { useGetAssessmentHistoryQuery } from "../../../features/assessment/AssessmentApi";
import type { AssessmentHistoryItem } from "../../../types/Assessment.types";
import type { AppTableColumn } from "../../../types/Table.types";

export const AssessmentHistoryTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [sortBy, setSortBy] = useState<string>("Date and Time");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const { data: historyRes, isLoading } = useGetAssessmentHistoryQuery({
    page,
    size: rowsPerPage,
    search: searchTerm.trim() || undefined,
    sortBy,
  });

  const historyItems: AssessmentHistoryItem[] = React.useMemo(() => {
    if (historyRes?.data?.content && Array.isArray(historyRes.data.content)) {
      return historyRes.data.content;
    }
    return [];
  }, [historyRes]);

  const totalCount = historyRes?.data?.totalElements ?? historyItems.length;

  const columns: AppTableColumn<AssessmentHistoryItem>[] = [
    {
      id: "title",
      label: "Test",
      minWidth: 280,
      render: (row) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", lineHeight: 1.4 }}>
            {row.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "#667085", display: "block", mt: 0.3 }}>
            {row.historySubtitle}
          </Typography>
        </Box>
      ),
    },
    {
      id: "batchesDisplay",
      label: "Batches",
      minWidth: 200,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px" }}>
          {row.batchesDisplay}
        </Typography>
      ),
    },
    {
      id: "submittedDisplay",
      label: "Submitted",
      minWidth: 120,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px" }}>
          {row.submittedDisplay}
        </Typography>
      ),
    },
    {
      id: "averageDisplay",
      label: "Average",
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054", fontSize: "13.5px" }}>
          {row.averageDisplay}
        </Typography>
      ),
    },
    {
      id: "highestDisplay",
      label: "Highest",
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", fontSize: "13.5px" }}>
          {row.highestDisplay}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: "1 1 320px", maxWidth: 420 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Test, mark, departement, ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "#667085", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              bgcolor: "#ffffff",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: "13.5px",
              },
            }}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={
              <CalendarMonthOutlinedIcon sx={{ color: "#667085", fontSize: 18, mr: 1 }} />
            }
            sx={{
              borderRadius: "8px",
              fontSize: "13px",
              bgcolor: "#ffffff",
            }}
          >
            <MenuItem value="Date and Time">Date and Time</MenuItem>
            <MenuItem value="Average Score">Average Score</MenuItem>
            <MenuItem value="Submissions">Submissions</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: "10px",
          border: "1px solid #eaecf0",
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <Table
          columns={columns}
          rows={historyItems}
          getRowId={(row) => row.assignmentId}
          loading={isLoading}
          emptyMessage="No assessment history found."
        />

        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Card>
    </Box>
  );
};

export default AssessmentHistoryTab;
