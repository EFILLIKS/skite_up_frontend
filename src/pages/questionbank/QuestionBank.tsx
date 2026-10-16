import React, { useState } from "react";
import {
  Box,
  Typography,
  InputAdornment,
  MenuItem,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Table from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import Snackbar from "../../components/common/Snackbar";
import { useQuestionBank, type CategoryTab } from "../../hooks/useQuestionBank";
import AddQuestionCountDialog from "./components/AddQuestionCountDialog";
import QuestionFormDialog from "./components/QuestionFormDialog";
import BulkImportDialog from "./components/BulkImportDialog";
import QuestionDetailDialog from "./components/QuestionDetailDialog";
import LSRWQuestionBankView from "./components/LSRWQuestionBankView";
import CodingQuestionBankView from "./components/CodingQuestionBankView";
import type { AppTableColumn } from "../../types/Table.types";
import type { MCQQuestionResponse, QuestionBankItem } from "../../types/QuestionBank.types";

export const QuestionBank: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    skillsTree,
    mcqLimit,
    selectedSkill,
    selectedTopic,
    expandedSkills,
    toggleSkillAccordion,
    handleSelectSkill,
    handleSelectTopic,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedLevel,
    setSelectedLevel,
    selectedStatus,
    setSelectedStatus,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filteredQuestions,
    paginatedQuestions,
    totalCount,
    allSkillsCount,
    isFetching,
    handleDeleteQuestion,

    isCountDialogOpen,
    questionCountInput,
    setQuestionCountInput,
    countInputError,
    handleOpenCountDialog,
    handleCloseCountDialog,
    handleStartQuestionCreation,

    isQuestionFormDialogOpen,
    setIsQuestionFormDialogOpen,
    isEditMode,
    questionList,
    currentQuestionIndex,
    currentQuestion,
    formValidationErrors,
    isSubmittingQuestions,
    updateCurrentQuestion,
    addOptionToCurrentQuestion,
    removeOptionFromCurrentQuestion,
    toggleCorrectOption,
    handlePrevQuestion,
    handleNextQuestion,
    handleJumpToQuestion,
    handlePublishQuestions,
    handleOpenEdit,

    viewingQuestion,
    isDetailDialogOpen,
    handleOpenViewDetail,
    handleCloseViewDetail,
    handleDuplicateQuestion,
    apiData,

    isBulkImportDialogOpen,
    selectedImportFile,
    parsedImportRows,
    isParsingFile,
    isImporting,
    handleOpenBulkImport,
    handleCloseBulkImport,
    handleFileChange,
    handleExecuteBulkImport,

    snackbar,
    showSnackbar,
    closeSnackbar,
  } = useQuestionBank();

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, questionId: string) => {
    setActionMenuAnchor(event.currentTarget);
    setActiveQuestionId(questionId);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActiveQuestionId(null);
  };

  const totalSkillsCount =
    allSkillsCount ||
    apiData?.data?.allSkillsCount ||
    apiData?.data?.totalElements ||
    skillsTree.reduce((acc, s) => acc + (s.count || 0), 0) ||
    totalCount;

  const typeOptions = React.useMemo(() => {
    const list = apiData?.data?.types ?? apiData?.data?.typesList;
    if (list && list.length > 0) {
      return ["All Types", ...list.filter((t) => t !== "All Types")];
    }
    return ["All Types", "Single choice", "Multiple choice", "True/False"];
  }, [apiData]);

  const levelOptions = React.useMemo(() => {
    const list = apiData?.data?.levels ?? apiData?.data?.levelsList;
    if (list && list.length > 0) {
      return ["All Levels", ...list.filter((l) => l !== "All Levels")];
    }
    return ["All Levels", "Easy", "Medium", "Hard"];
  }, [apiData]);

  const statusOptions = React.useMemo(() => {
    const list = apiData?.data?.statuses ?? apiData?.data?.statusesList;
    if (list && list.length > 0) {
      return ["All Status", ...list.filter((s) => s !== "All Status")];
    }
    return ["All Status", "Published", "Draft", "Archived"];
  }, [apiData]);

  const tableColumns: AppTableColumn<QuestionBankItem>[] = [
    {
      id: "questionText",
      label: "Question",
      minWidth: 280,
      render: (row) => (
        <Box sx={{ py: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#101828",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {row.questionText}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#667085", mt: 0.5, display: "block" }}
          >
            {row.usedInTestsDisplay ?? `Used in ${row.usedInTests ?? row.usedInTestsCount ?? 0} tests`}
          </Typography>
        </Box>
      ),
    },
    {
      id: "skillName",
      label: "Skill - Topic",
      minWidth: 170,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
            {row.skill ?? row.skillName ?? "-"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#667085" }}>
            {row.topic ?? row.topicName ?? "-"}
          </Typography>
        </Box>
      ),
    },
    {
      id: "subtype",
      label: "Type",
      minWidth: 120,
      render: (row) => {
        const typeDisplay =
          row.questionType ??
          (row.subtype === "MULTIPLE_CHOICE"
            ? "Multiple choice"
            : row.subtype === "TRUE_FALSE"
              ? "True / False"
              : "Single choice");
        return (
          <Typography variant="body2" sx={{ color: "#475467", fontSize: 13 }}>
            {typeDisplay}
          </Typography>
        );
      },
    },
    {
      id: "difficulty",
      label: "Difficulty",
      width: 100,
      render: (row) => {
        const diff = row.difficulty?.toUpperCase();
        const isEasy = diff === "EASY";
        const isMedium = diff === "MEDIUM";

        return (
          <Chip
            label={isEasy ? "Easy" : isMedium ? "Medium" : "Hard"}
            size="small"
            sx={{
              bgcolor: isEasy ? "#ecfdf3" : isMedium ? "#fffaeb" : "#fef3f2",
              color: isEasy ? "#16a34a" : isMedium ? "#b54708" : "#d92d20",
              fontWeight: 600,
              fontSize: 12,
              borderRadius: "6px",
              height: 24,
            }}
          />
        );
      },
    },
    {
      id: "marks",
      label: "Marks",
      width: 90,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
          {row.marksDisplay ?? `${row.marks} / ${row.negativeMarks}`}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 120,
      render: (row) => {
        const isPublished = row.status?.toUpperCase() === "PUBLISHED";
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              borderRadius: "16px",
              bgcolor: isPublished ? "#ecfdf3" : "#f2f4f7",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isPublished ? "#16a34a" : "#667085",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: isPublished ? "#16a34a" : "#475467",
              }}
            >
              {isPublished ? "Published" : "Draft"}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "createdByName",
      label: "Created by",
      width: 110,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#475467" }}>
          {row.createdBy || row.createdByName || "-"}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "",
      width: 50,
      align: "center",
      render: (row) => (
        <IconButton
          size="small"
          onClick={(e) => handleOpenActionMenu(e, row.id)}
          sx={{ color: "#667085" }}
        >
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  return (
    <Box sx={{ pb: { xs: 8, md: 12 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#101828", fontSize: "24px", letterSpacing: "-0.02em" }}
        >
          Question bank
        </Typography>
        <Typography variant="body2" sx={{ color: "#475467", mt: 0.5, fontSize: "14px" }}>
          MCQ and aptitude questions organized by Domain &rarr; Skill &rarr; Topic. Reused across practice and tests.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: "1px solid #eaecf0", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            if (val === "Cognitive Games") return;
            setActiveTab(val as CategoryTab);
          }}
          sx={{
            minHeight: 44,
            "& .MuiTabs-indicator": {
              backgroundColor: "#b42318",
              height: 2.5,
              borderRadius: "2px",
            },
          }}
        >
          {(["MCQ", "LSRW", "Coding", "Cognitive Games", "Draft"] as CategoryTab[]).map(
            (tab) => {
              const isDisabled = tab === "Cognitive Games";
              return (
                <Tab
                  key={tab}
                  value={tab}
                  label={tab}
                  disabled={isDisabled}
                  sx={{
                    textTransform: "none",
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: "14px",
                    color: activeTab === tab ? "#b42318" : "#667085",
                    minHeight: 44,
                    px: 2,
                    "&.Mui-selected": {
                      color: "#b42318",
                    },
                    "&.Mui-disabled": {
                      color: "#98a2b3",
                      opacity: 0.5,
                      cursor: "not-allowed",
                      pointerEvents: "auto",
                    },
                  }}
                />
              );
            }
          )}
        </Tabs>
      </Box>

      {activeTab === "LSRW" ? (
        <LSRWQuestionBankView />
      ) : activeTab === "MCQ" || activeTab === "Draft" ? (
        <>
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
            gap: 1,
            px: 1.5,
            py: 0.6,
            borderRadius: "16px",
            bgcolor: "#fffaf5",
            border: "1px solid #fedf89",
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid #b54708",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: "#b54708",
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#b54708", fontSize: "13px" }}>
            MCQ Limits - {mcqLimit}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleOpenBulkImport}
            startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "#d0d5dd",
              color: "#344054",
              fontWeight: 600,
              fontSize: "14px",
              px: 2.2,
              py: 0.9,
              bgcolor: "#ffffff",
              "&:hover": { borderColor: "#98a2b3", bgcolor: "#f9fafb" },
            }}
          >
            Bulk import
          </Button>

          <Button
            variant="contained"
            onClick={handleOpenCountDialog}
            startIcon={<AddRoundedIcon sx={{ fontSize: 20 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: "#1570ef",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "14px",
              px: 2.5,
              py: 0.9,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              "&:hover": { bgcolor: "#175cd3" },
            }}
          >
            Add question
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "260px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "12px",
            border: "1px solid #eaecf0",
            bgcolor: "#ffffff",
            position: { lg: "sticky" },
            top: { lg: 16 },
            maxHeight: { lg: "calc(100vh - 120px)" },
            overflowY: "auto",
          }}
          contentSx={{ p: 0, "&:last-child": { pb: 0 } }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#101828", mb: 1.5, px: 1 }}
          >
            MCQ &amp; Aptitude
          </Typography>

          <Box
            onClick={() => handleSelectSkill("All skills")}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: selectedSkill === "All skills" ? "#f9fafb" : "transparent",
              "&:hover": { bgcolor: "#f2f4f7" },
              mb: 0.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: selectedSkill === "All skills" ? 700 : 500,
                color: selectedSkill === "All skills" ? "#1570ef" : "#344054",
                fontSize: "13.5px",
              }}
            >
              All skills
            </Typography>
            <Chip
              label={totalSkillsCount}
              size="small"
              sx={{
                height: 20,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "#f2f4f7",
                color: "#475467",
              }}
            />
          </Box>

          {skillsTree.map((skill) => {
            const skillName = skill.skill || skill.name || "";
            const isExpanded = Boolean(expandedSkills[skillName]);
            const isSkillSelected = selectedSkill === skillName;

            return (
              <Box key={skillName} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderRadius: "8px",
                    cursor: "pointer",
                    bgcolor: isSkillSelected && selectedTopic === "All" ? "#f8f9fc" : "transparent",
                    "&:hover": { bgcolor: "#f9fafb" },
                  }}
                  onClick={() => {
                    toggleSkillAccordion(skillName);
                    handleSelectSkill(skillName);
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {isExpanded ? (
                      <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: "#667085" }} />
                    ) : (
                      <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: "#667085" }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSkillSelected ? 700 : 500,
                        color: isSkillSelected ? "#1570ef" : "#344054",
                        fontSize: "13.5px",
                      }}
                    >
                      {skillName}
                    </Typography>
                  </Box>

                  <Chip
                    label={skill.count ?? 0}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: isSkillSelected ? "#eff8ff" : "#f2f4f7",
                      color: isSkillSelected ? "#175cd3" : "#475467",
                    }}
                  />
                </Box>

                {isExpanded && (
                  <Box sx={{ pl: 3.5, pr: 1, py: 0.5 }}>
                    {(skill.topics || []).map((t) => {
                      const topicName = typeof t === "string" ? t : t.topic;
                      const topicCount = typeof t === "string" ? undefined : t.count;
                      const isTopicSelected =
                        isSkillSelected && selectedTopic === topicName;
                      return (
                        <Box
                          key={topicName}
                          onClick={() => handleSelectTopic(skillName, topicName)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 0.6,
                            px: 1,
                            borderRadius: "6px",
                            cursor: "pointer",
                            bgcolor: isTopicSelected ? "#eff8ff" : "transparent",
                            "&:hover": { bgcolor: "#f2f4f7" },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isTopicSelected ? 700 : 500,
                              color: isTopicSelected ? "#1570ef" : "#475467",
                              fontSize: "12.5px",
                              display: "block",
                            }}
                          >
                            {topicName}
                          </Typography>
                          {typeof topicCount === "number" && topicCount > 0 && (
                            <Typography variant="caption" sx={{ color: "#98a2b3", fontSize: "11px" }}>
                              {topicCount}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Card>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 280px" }, maxWidth: { sm: 380 } }}>
              <Input
                type="text"
                textFieldProps={{
                  size: "small",
                  placeholder: "Search by Test name, Date, Batch ...",
                  value: searchTerm,
                  onChange: (e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  },
                  slotProps: {
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: "#667085", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  },
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#ffffff",
                      fontSize: "13.5px",
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 120 }}>
                <Input
                  type="select"
                  options={typeOptions.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  textFieldProps={{
                    size: "small",
                    value: selectedType,
                    onChange: (e) => {
                      setSelectedType(e.target.value);
                      setPage(0);
                    },
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        fontSize: "13px",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 120 }}>
                <Input
                  type="select"
                  options={levelOptions.map((lvl) => ({
                    value: lvl,
                    label: lvl,
                  }))}
                  textFieldProps={{
                    size: "small",
                    value: selectedLevel,
                    onChange: (e) => {
                      setSelectedLevel(e.target.value);
                      setPage(0);
                    },
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        fontSize: "13px",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 120 }}>
                <Input
                  type="select"
                  options={statusOptions.map((st) => ({
                    value: st,
                    label: st,
                  }))}
                  textFieldProps={{
                    size: "small",
                    value: selectedStatus,
                    onChange: (e) => {
                      setSelectedStatus(e.target.value);
                      setPage(0);
                    },
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        fontSize: "13px",
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {(selectedSkill !== "All skills" ||
            selectedTopic !== "All" ||
            selectedType !== "All Types" ||
            selectedLevel !== "All Levels" ||
            selectedStatus !== "All Status" ||
            searchTerm.trim()) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="caption" sx={{ color: "#667085", fontWeight: 600 }}>
                  Active filters:
                </Typography>
                {selectedSkill !== "All skills" && (
                  <Chip
                    label={`Skill: ${selectedSkill}`}
                    size="small"
                    onDelete={() => handleSelectSkill("All skills")}
                    sx={{ borderRadius: "6px" }}
                  />
                )}
                {selectedTopic !== "All" && (
                  <Chip
                    label={`Topic: ${selectedTopic}`}
                    size="small"
                    onDelete={() => handleSelectTopic(selectedSkill, "All")}
                    sx={{ borderRadius: "6px" }}
                  />
                )}
                {selectedType !== "All Types" && (
                  <Chip
                    label={`Type: ${selectedType}`}
                    size="small"
                    onDelete={() => setSelectedType("All Types")}
                    sx={{ borderRadius: "6px" }}
                  />
                )}
                {selectedLevel !== "All Levels" && (
                  <Chip
                    label={`Level: ${selectedLevel}`}
                    size="small"
                    onDelete={() => setSelectedLevel("All Levels")}
                    sx={{ borderRadius: "6px" }}
                  />
                )}
                {selectedStatus !== "All Status" && (
                  <Chip
                    label={`Status: ${selectedStatus}`}
                    size="small"
                    onDelete={() => setSelectedStatus("All Status")}
                    sx={{ borderRadius: "6px" }}
                  />
                )}
                {searchTerm.trim() && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    size="small"
                    onDelete={() => setSearchTerm("")}
                    sx={{ borderRadius: "6px" }}
                  />
                )}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setSelectedSkill("All skills");
                    setSelectedTopic("All");
                    setSelectedType("All Types");
                    setSelectedLevel("All Levels");
                    setSelectedStatus("All Status");
                    setSearchTerm("");
                  }}
                  sx={{
                    fontSize: 12,
                    p: 0,
                    textTransform: "none",
                    color: "#1570ef",
                    fontWeight: 600,
                  }}
                >
                  Clear all
                </Button>
              </Box>
            )}

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
              columns={tableColumns}
              rows={paginatedQuestions}
              getRowId={(row) => row.id}
              loading={isFetching}
              emptyMessage="No questions match the selected criteria. Try adjusting your filters or add a new question."
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
        </Box>
      </Box>
        </>
      ) : activeTab === "Coding" ? (
        <CodingQuestionBankView />
      ) : (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            bgcolor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #eaecf0",
          }}
        >
          <Typography variant="h6" sx={{ color: "#344054", fontWeight: 600 }}>
            {activeTab} Module
          </Typography>
          <Typography variant="body2" sx={{ color: "#667085", mt: 1 }}>
            This module is currently being configured.
          </Typography>
        </Box>
      )}

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
              minWidth: 150,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeQuestionId) {
              handleOpenViewDetail(activeQuestionId);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13 }}
        >
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" sx={{ color: "#475467" }} />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            const found = filteredQuestions.find((q) => q.id === activeQuestionId);
            if (found) {
              handleOpenEdit(found);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13 }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" sx={{ color: "#475467" }} />
          </ListItemIcon>
          <ListItemText primary="Edit Question" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            const found = filteredQuestions.find((q) => q.id === activeQuestionId);
            if (found) {
              handleDuplicateQuestion(found);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13 }}
        >
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" sx={{ color: "#475467" }} />
          </ListItemIcon>
          <ListItemText primary="Duplicate" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeQuestionId) {
              handleDeleteQuestion(activeQuestionId);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13, color: "#d92d20" }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" sx={{ color: "#d92d20" }} />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      <AddQuestionCountDialog
        open={isCountDialogOpen}
        onClose={handleCloseCountDialog}
        count={questionCountInput}
        onCountChange={(val) => setQuestionCountInput(val)}
        error={countInputError}
        onContinue={handleStartQuestionCreation}
      />

      <QuestionFormDialog
        open={isQuestionFormDialogOpen}
        onClose={() => setIsQuestionFormDialogOpen(false)}
        questions={questionList}
        currentIndex={currentQuestionIndex}
        currentQuestion={currentQuestion}
        errors={formValidationErrors}
        isSubmitting={isSubmittingQuestions}
        isEditMode={isEditMode}
        skillsTree={skillsTree}
        onUpdateQuestion={updateCurrentQuestion}
        onAddOption={addOptionToCurrentQuestion}
        onRemoveOption={removeOptionFromCurrentQuestion}
        onToggleCorrectOption={toggleCorrectOption}
        onPrev={handlePrevQuestion}
        onNext={handleNextQuestion}
        onJumpToQuestion={handleJumpToQuestion}
        onPublish={handlePublishQuestions}
      />

      <BulkImportDialog
        open={isBulkImportDialogOpen}
        onClose={handleCloseBulkImport}
        file={selectedImportFile}
        parsedRows={parsedImportRows}
        isParsing={isParsingFile}
        isImporting={isImporting}
        onFileSelect={handleFileChange}
        onExecuteImport={handleExecuteBulkImport}
      />

      <QuestionDetailDialog
        open={isDetailDialogOpen}
        onClose={handleCloseViewDetail}
        question={viewingQuestion}
        onEdit={handleOpenEdit}
      />

      <Snackbar
        open={snackbar.open}
        onClose={closeSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
};

export default QuestionBank;
