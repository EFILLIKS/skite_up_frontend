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
  Tooltip,
  CircularProgress,
  circularProgressClasses,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { formatAudioTime } from "../../../utils/audioUtils";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";
import Snackbar from "../../../components/common/Snackbar";
import { useLSRWQuestionBank } from "../../../hooks/useLSRWQuestionBank";
import type { LSRWSubTab, AnyLSRWExerciseItem, ListeningExerciseItem } from "../../../types/LSRW.types";
import type { AppTableColumn } from "../../../types/Table.types";
import LSRWFormDialog from "./LSRWFormDialog";
import LSRWAudioPreviewDialog from "./LSRWAudioPreviewDialog";
import BulkImportDialog from "./BulkImportDialog";

const LSRW_SUB_TABS: LSRWSubTab[] = ["Listening", "Speaking", "Reading", "Writing"];

const LSRWQuestionBankView: React.FC = () => {
  const {
    activeSubTab,
    setActiveSubTab,
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
    lsrwLimit,
    paginatedList,
    isApiFetching,

    isFormDialogOpen,
    editingExerciseId,
    formData,
    formErrors,
    isSubmitting,
    isUploadingAudio,
    currentSubQuestion,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseFormDialog,
    updateFormField,
    updateCurrentSubQuestion,
    addOptionToSubQuestion,
    removeOptionFromSubQuestion,
    setCorrectOption,
    handlePrevSubQuestion,
    handleNextSubQuestion,
    handleAudioFileSelect,
    handlePublishExercise,

    handleDeleteExercise,

    isPreviewAudioOpen,
    previewAudioInfo,
    handlePlayAudio,
    handleCloseAudioPreview,
    currentPlayingExerciseId,
    isPlayingAudio,
    audioCurrentTime,
    audioDuration,
    handleTogglePlayInline,

    isBulkImportOpen,
    handleOpenBulkImport,
    handleCloseBulkImport,

    snackbar,
    closeSnackbar,
  } = useLSRWQuestionBank();

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedExercise, setSelectedExercise] = useState<AnyLSRWExerciseItem | null>(null);

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, exercise: AnyLSRWExerciseItem) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedExercise(exercise);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedExercise(null);
  };

  const getCreateButtonLabel = () => {
    switch (activeSubTab) {
      case "Listening":
        return "New Listening Exercise";
      case "Speaking":
        return "New Speaking Exercise";
      case "Reading":
        return "New Reading Exercise";
      case "Writing":
        return "New Writing Exercise";
    }
  };

  const columns: AppTableColumn<AnyLSRWExerciseItem>[] = React.useMemo(() => {
    const commonColumns: AppTableColumn<AnyLSRWExerciseItem>[] = [];

    if (activeSubTab === "Listening") {
      commonColumns.push({
        id: "title",
        label: "Exercise",
        minWidth: 320,
        render: (row) => {
          const listeningItem = row as ListeningExerciseItem;
          const isCurrentlyPlaying =
            currentPlayingExerciseId === listeningItem.id && isPlayingAudio;
          const isCurrentActive = currentPlayingExerciseId === listeningItem.id;
          const progressValue =
            isCurrentActive && audioDuration > 0
              ? Math.min(100, Math.max(0, (audioCurrentTime / audioDuration) * 100))
              : 0;

          return (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.5 }}>
              <Tooltip
                title={
                  isCurrentActive
                    ? `${isCurrentlyPlaying ? "Pause" : "Play"} (${formatAudioTime(audioCurrentTime)} / ${formatAudioTime(audioDuration)})`
                    : "Play audio"
                }
              >
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePlayInline(listeningItem);
                  }}
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    mt: 0.2,
                    cursor: "pointer",
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={38}
                    thickness={3.5}
                    sx={{
                      color: isCurrentActive ? "#d1e9ff" : "#eaecf0",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />

                  {isCurrentActive && (
                    <CircularProgress
                      variant="determinate"
                      value={progressValue}
                      size={38}
                      thickness={3.5}
                      sx={{
                        color: "#1570ef",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        [`& .${circularProgressClasses.circle}`]: {
                          strokeLinecap: "round",
                          transition: "stroke-dashoffset 0.1s linear",
                        },
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: isCurrentlyPlaying ? "#d1e9ff" : "#eff8ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      zIndex: 1,
                      "&:hover": {
                        bgcolor: "#b2ddff",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    {isCurrentlyPlaying ? (
                      <PauseRoundedIcon sx={{ color: "#1570ef", fontSize: 18 }} />
                    ) : (
                      <PlayArrowRoundedIcon sx={{ color: "#1570ef", fontSize: 20, ml: 0.2 }} />
                    )}
                  </Box>
                </Box>
              </Tooltip>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: isCurrentActive ? "#1570ef" : "#101828",
                    lineHeight: 1.4,
                  }}
                >
                  {row.title}
                </Typography>
                {row.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#667085",
                      display: "block",
                      mt: 0.3,
                      lineHeight: 1.3,
                    }}
                  >
                    {row.description}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        },
      });
    } else {
      commonColumns.push({
        id: "title",
        label: "Exercise",
        minWidth: 280,
        render: (row) => (
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", lineHeight: 1.4 }}>
              {row.title}
            </Typography>
            {row.description && (
              <Typography variant="caption" sx={{ color: "#667085", display: "block", mt: 0.3 }}>
                {row.description}
              </Typography>
            )}
          </Box>
        ),
      });
    }

    commonColumns.push({
      id: "level",
      label: "Level",
      width: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontSize: "13.5px", fontWeight: 500 }}>
          {row.level}
        </Typography>
      ),
    });

    if (activeSubTab === "Listening") {
      commonColumns.push({
        id: "types",
        label: "Types",
        width: 140,
        render: (row) => {
          const item = row as ListeningExerciseItem;
          return (
            <Chip
              label={item.types || "Voice , MCQ"}
              size="small"
              sx={{
                bgcolor: "#ecfdf3",
                color: "#027a48",
                fontWeight: 600,
                fontSize: "12px",
                height: 24,
                borderRadius: "16px",
              }}
            />
          );
        },
      });
    }

    commonColumns.push({
      id: "duration",
      label: "Duration",
      width: 110,
      render: (row) => {
        const durationText =
          "duration" in row && (row as any).duration ? (row as any).duration : "10 min";
        return (
          <Typography variant="body2" sx={{ color: "#475467", fontSize: "13.5px" }}>
            {durationText}
          </Typography>
        );
      },
    });

    if (activeSubTab === "Writing") {
      commonColumns.push({
        id: "words",
        label: "Words",
        width: 100,
        render: (row) => {
          const wordsText = "words" in row ? row.words : "-";
          return (
            <Typography variant="body2" sx={{ color: "#475467", fontSize: "13.5px" }}>
              {wordsText}
            </Typography>
          );
        },
      });
    }

    if (activeSubTab === "Listening") {
      commonColumns.push({
        id: "content",
        label: "Content",
        minWidth: 170,
        render: (row) => {
          const item = row as ListeningExerciseItem;
          return (
            <Typography variant="body2" sx={{ color: "#475467", fontSize: "13px" }}>
              {item.content || "1mb audio • 2 questions"}
            </Typography>
          );
        },
      });
    }

    if (activeSubTab === "Speaking" || activeSubTab === "Writing") {
      commonColumns.push({
        id: "keywords",
        label: "Keywords",
        minWidth: 200,
        render: (row) => {
          const keywords = "keywords" in row ? row.keywords : "-";
          return (
            <Typography
              variant="body2"
              noWrap
              sx={{
                color: "#475467",
                fontSize: "13px",
                maxWidth: 240,
              }}
            >
              {keywords}
            </Typography>
          );
        },
      });
    }

    commonColumns.push({
      id: "marks",
      label: "Marks",
      width: 90,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#344054", fontWeight: 600, fontSize: "13.5px" }}>
          {row.marks}
        </Typography>
      ),
    });

    commonColumns.push({
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
    });

    commonColumns.push({
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
    });

    return commonColumns;
  }, [
    activeSubTab,
    currentPlayingExerciseId,
    isPlayingAudio,
    audioCurrentTime,
    audioDuration,
    handleTogglePlayInline,
  ]);

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
            p: 0.5,
            bgcolor: "#f2f4f7",
            borderRadius: "10px",
            gap: 0.5,
          }}
        >
          {LSRW_SUB_TABS.map((subTab) => {
            const isActive = activeSubTab === subTab;
            return (
              <Box
                key={subTab}
                onClick={() => setActiveSubTab(subTab)}
                sx={{
                  px: 2.2,
                  py: 0.8,
                  borderRadius: "8px",
                  cursor: "pointer",
                  bgcolor: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#1570ef" : "#475467",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "13.5px",
                  boxShadow: isActive ? "0 1px 3px rgba(16, 24, 40, 0.1)" : "none",
                  transition: "all 0.18s ease-in-out",
                  "&:hover": {
                    color: isActive ? "#1570ef" : "#101828",
                  },
                }}
              >
                {subTab}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
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
              LSRW Limits - {lsrwLimit}
            </Typography>
          </Box>

          {activeSubTab !== "Listening" && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenBulkImport}
              startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "#d0d5dd",
                color: "#344054",
                fontWeight: 600,
                fontSize: "13.5px",
                px: 2,
                py: 0.8,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                "&:hover": {
                  borderColor: "#98a2b3",
                  bgcolor: "#f9fafb",
                },
              }}
            >
              Bulk import
            </Button>
          )}

          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={() => handleOpenCreateDialog(activeSubTab)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: "#1570ef",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "13.5px",
              px: 2.2,
              py: 0.8,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              "&:hover": {
                bgcolor: "#175cd3",
              },
            }}
          >
            {getCreateButtonLabel()}
          </Button>
        </Box>
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
                { value: "Beginner", label: "Beginner" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Advanced", label: "Advanced" },
              ]}
              textFieldProps={{
                value: selectedLevel,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSelectedLevel(e.target.value),
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
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSelectedStatus(e.target.value),
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
          rows={paginatedList}
          getRowId={(row) => row.id}
          loading={isApiFetching}
          emptyMessage={`No ${activeSubTab.toLowerCase()} exercises found matching your search. Create one to get started.`}
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
        {activeSubTab === "Listening" && (
          <MenuItem
            onClick={() => {
              if (selectedExercise && selectedExercise.exerciseType === "LISTENING") {
                handlePlayAudio(selectedExercise as ListeningExerciseItem);
              }
              handleCloseActionMenu();
            }}
            sx={{ fontSize: 13 }}
          >
            <ListItemIcon>
              <GraphicEqRoundedIcon fontSize="small" sx={{ color: "#1570ef" }} />
            </ListItemIcon>
            <ListItemText primary="Audio Player Preview" />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            if (selectedExercise) {
              handleOpenEditDialog(selectedExercise);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: 13 }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" sx={{ color: "#475467" }} />
          </ListItemIcon>
          <ListItemText primary="Edit Exercise" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedExercise) {
              handleDeleteExercise(selectedExercise.id);
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

      <LSRWFormDialog
        open={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        isUploadingAudio={isUploadingAudio}
        isEditMode={Boolean(editingExerciseId)}
        currentSubQuestion={currentSubQuestion}
        onUpdateField={updateFormField}
        onUpdateSubQuestion={updateCurrentSubQuestion}
        onAddOption={addOptionToSubQuestion}
        onRemoveOption={removeOptionFromSubQuestion}
        onSetCorrectOption={setCorrectOption}
        onPrevQuestion={handlePrevSubQuestion}
        onNextQuestion={handleNextSubQuestion}
        onAudioFileSelect={handleAudioFileSelect}
        onPublish={handlePublishExercise}
      />

      <LSRWAudioPreviewDialog
        open={isPreviewAudioOpen}
        onClose={handleCloseAudioPreview}
        title={previewAudioInfo?.title || "Audio Preview"}
        fileName={previewAudioInfo?.fileName}
        audioUrl={previewAudioInfo?.url}
      />

      <BulkImportDialog
        open={isBulkImportOpen}
        onClose={handleCloseBulkImport}
        file={null}
        parsedRows={[]}
        isParsing={false}
        isImporting={false}
        onFileSelect={() => { }}
        onExecuteImport={() => {
          handleCloseBulkImport();
        }}
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

export default LSRWQuestionBankView;
