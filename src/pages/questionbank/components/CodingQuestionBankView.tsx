import React, { useState } from "react";
import {
  Box,
  Typography,
  InputAdornment,
  MenuItem,
  IconButton,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";
import Snackbar from "../../../components/common/Snackbar";
import { useCodingQuestionBank } from "../../../hooks/useCodingQuestionBank";
import type { CodingProblemItem } from "../../../types/Coding.types";
import type { AppTableColumn } from "../../../types/Table.types";
import CodingFormDialog from "./CodingFormDialog";

const CodingQuestionBankView: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalCount,
    codingLimit,
    paginatedProblems,
    filteredProblems,
    isApiFetching,

    isFormDialogOpen,
    editingProblemId,
    formData,
    formErrors,
    isSubmitting,
    isUploadingImage,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseFormDialog,
    updateFormField,
    handleUploadImage,
    handleAddExample,
    handleUpdateExample,
    handleRemoveExample,
    handleAddTestCase,
    handleUpdateTestCase,
    handleRemoveTestCase,
    handleToggleLanguage,
    handlePublishProblem,
    handleDeleteProblem,

    snackbar,
    closeSnackbar,
  } = useCodingQuestionBank();

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblemItem | null>(null);

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    problem: CodingProblemItem
  ) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedProblem(problem);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedProblem(null);
  };

  const columns: AppTableColumn<CodingProblemItem>[] = [
    {
      id: "title",
      label: "Problem",
      minWidth: 300,
      render: (row) => (
        <Box sx={{ py: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#101828", lineHeight: 1.4 }}
          >
            {row.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "#667085", display: "block", mt: 0.3 }}>
            {row.subtitle || `SKITEUP global · ${row.marks} marks`}
          </Typography>
        </Box>
      ),
    },
    {
      id: "difficulty",
      label: "Difficulty",
      width: 120,
      render: (row) => {
        const isEasy = row.difficulty?.toLowerCase() === "easy";
        const isMedium = row.difficulty?.toLowerCase() === "medium";
        return (
          <Chip
            label={row.difficulty}
            size="small"
            sx={{
              height: 24,
              fontSize: "12px",
              fontWeight: 600,
              bgcolor: isEasy ? "#ecfdf3" : isMedium ? "#fffaeb" : "#fef3f2",
              color: isEasy ? "#16a34a" : isMedium ? "#b54708" : "#d92d20",
              borderRadius: "16px",
            }}
          />
        );
      },
    },
    {
      id: "languagesCount",
      label: "Languages",
      width: 110,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px" }}>
          {row.languagesCount ?? row.supportedLanguages?.length ?? 4}
        </Typography>
      ),
    },
    {
      id: "testCasesCount",
      label: "Test cases",
      width: 110,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px" }}>
          {row.testCasesCount ?? 12}
        </Typography>
      ),
    },
    {
      id: "limitsDisplay",
      label: "Limits",
      width: 100,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px" }}>
          {row.limitsDisplay ?? "10"}
        </Typography>
      ),
    },
    {
      id: "keywordsCount",
      label: "Keywords",
      width: 110,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px" }}>
          {row.keywordsCount ?? 100}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 130,
      render: (row) => {
        const isPublished = row.status?.toLowerCase() === "published";
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isPublished ? "#12b76a" : "#f04438",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: isPublished ? "#027a48" : "#b42318",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {isPublished ? "Published" : "Un-publish"}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "actions",
      label: "",
      width: 50,
      align: "center",
      render: (row) => (
        <IconButton
          size="small"
          onClick={(e) => handleOpenActionMenu(e, row)}
          sx={{ color: "#98a2b3", "&:hover": { color: "#344054" } }}
        >
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>
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
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            px: 1.5,
            py: 0.7,
            borderRadius: "16px",
            bgcolor: "#fffaf5",
            border: "1px solid #fedf89",
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: "#b54708" }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#b54708", fontSize: "13px" }}>
            Coding Limits - {codingLimit}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={handleOpenCreateDialog}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            bgcolor: "#1570ef",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "13.5px",
            px: 2.4,
            py: 0.8,
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
            "&:hover": {
              bgcolor: "#175cd3",
            },
          }}
        >
          New Problem
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box sx={{ flex: "1 1 320px", maxWidth: { xs: "100%", md: 400 } }}>
          <Input
            type="text"
            label=""
            textFieldProps={{
              placeholder: "Search by Levels, Duration, Questions ...",
              value: searchTerm,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
              size: "small",
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "#667085", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
              sx: {
                bgcolor: "#ffffff",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  borderColor: "#d0d5dd",
                },
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "nowrap" }}>
          <Box sx={{ minWidth: 140 }}>
            <Input
              type="select"
              label=""
              options={[
                { value: "All Levels", label: "All Levels" },
                { value: "Easy", label: "Easy" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
              ]}
              textFieldProps={{
                value: selectedLevel,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedLevel(e.target.value),
                size: "small",
                sx: {
                  bgcolor: "#ffffff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13.5px",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ minWidth: 140 }}>
            <Input
              type="select"
              label=""
              options={[
                { value: "All Status", label: "All Status" },
                { value: "Published", label: "Published" },
                { value: "Un-publish", label: "Un-publish" },
              ]}
              textFieldProps={{
                value: selectedStatus,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedStatus(e.target.value),
                size: "small",
                sx: {
                  bgcolor: "#ffffff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13.5px",
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: "10px",
          border: "1px solid #eaecf0",
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
        contentSx={{ p: 0, "&:last-child": { pb: 0 } }}
      >
        <Table
          columns={columns}
          rows={paginatedProblems}
          getRowId={(row) => row.id}
          loading={isApiFetching}
          emptyMessage="No coding problems found. Click 'New Problem' to create one."
        />

        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          sx={{
            borderTop: "1px solid #eaecf0",
            bgcolor: "#ffffff",
            "& .MuiTablePagination-toolbar": {
              minHeight: 52,
              px: 2.5,
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: 13,
              color: "#475467",
              fontWeight: 500,
            },
            "& .MuiTablePagination-select": {
              fontSize: 13,
              color: "#344054",
            },
          }}
        />
      </Card>

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        slotProps={{
          paper: {
            sx: {
              boxShadow: "0 4px 16px rgba(16, 24, 40, 0.12)",
              borderRadius: "8px",
              border: "1px solid #eaecf0",
              minWidth: 140,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedProblem) {
              handleOpenEditDialog(selectedProblem);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13 }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" sx={{ color: "#475467" }} />
          </ListItemIcon>
          <ListItemText primary="Edit Problem" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedProblem) {
              handleDeleteProblem(selectedProblem.id);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13, color: "#d92d20" }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" sx={{ color: "#d92d20" }} />
          </ListItemIcon>
          <ListItemText primary="Delete" sx={{ "& .MuiTypography-root": { color: "#d92d20" } }} />
        </MenuItem>
      </Menu>

      <CodingFormDialog
        open={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        isUploadingImage={isUploadingImage}
        isEditMode={Boolean(editingProblemId)}
        onUpdateField={updateFormField}
        onUploadImage={handleUploadImage}
        onAddExample={handleAddExample}
        onUpdateExample={handleUpdateExample}
        onRemoveExample={handleRemoveExample}
        onAddTestCase={handleAddTestCase}
        onUpdateTestCase={handleUpdateTestCase}
        onRemoveTestCase={handleRemoveTestCase}
        onToggleLanguage={handleToggleLanguage}
        onPublish={handlePublishProblem}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
};

export default CodingQuestionBankView;
