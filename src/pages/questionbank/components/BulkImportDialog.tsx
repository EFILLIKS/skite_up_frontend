import React, { useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Dialog from "../../../components/common/Dialog";
import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";
import {
  downloadSampleQuestionCSV,
  downloadSampleQuestionExcel,
  downloadSampleQuestionXML,
  type ParsedQuestionRow,
} from "../../../utils/questionBankImportUtils";
import type { AppTableColumn } from "../../../types/Table.types";

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  file: File | null;
  parsedRows: ParsedQuestionRow[];
  isParsing: boolean;
  isImporting: boolean;
  onFileSelect: (file: File) => void;
  onExecuteImport: () => void;
}

export const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  open,
  onClose,
  file,
  parsedRows,
  isParsing,
  isImporting,
  onFileSelect,
  onExecuteImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const columns: AppTableColumn<ParsedQuestionRow>[] = [
    {
      id: "rowNumber",
      label: "#",
      width: 45,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#667085", fontWeight: 600 }}>
          {row.rowNumber}
        </Typography>
      ),
    },
    {
      id: "questionText",
      label: "Question",
      minWidth: 260,
      render: (row) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#101828",
              maxWidth: 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.questionText || "(No question text)"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#667085" }}>
            {row.options.length} options • Type: {row.questionType}
          </Typography>
        </Box>
      ),
    },
    {
      id: "skill",
      label: "Skill & Topic",
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
            {row.skill}
          </Typography>
          <Typography variant="caption" sx={{ color: "#667085" }}>
            {row.topic}
          </Typography>
        </Box>
      ),
    },
    {
      id: "difficulty",
      label: "Level",
      width: 90,
      render: (row) => {
        const bg =
          row.difficulty === "Easy"
            ? "#ecfdf3"
            : row.difficulty === "Medium"
            ? "#fffaeb"
            : "#fef3f2";
        const color =
          row.difficulty === "Easy"
            ? "#16a34a"
            : row.difficulty === "Medium"
            ? "#b54708"
            : "#d92d20";
        return (
          <Chip
            label={row.difficulty}
            size="small"
            sx={{
              bgcolor: bg,
              color,
              fontWeight: 600,
              fontSize: 11,
              borderRadius: "4px",
              height: 22,
            }}
          />
        );
      },
    },
    {
      id: "marks",
      label: "Marks",
      width: 80,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#344054" }}>
          {row.marks} / -{row.negativeMarks}
        </Typography>
      ),
    },
    {
      id: "isValid",
      label: "Validation",
      width: 120,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {row.isValid ? (
            <Chip
              icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: "14px !important" }} />}
              label="Valid"
              size="small"
              sx={{
                bgcolor: "#ecfdf3",
                color: "#16a34a",
                fontWeight: 600,
                fontSize: 11,
                borderRadius: "4px",
                height: 22,
              }}
            />
          ) : (
            <Chip
              icon={<ErrorOutlineRoundedIcon sx={{ fontSize: "14px !important" }} />}
              label={row.errors[0] || "Error"}
              size="small"
              sx={{
                bgcolor: "#fef3f2",
                color: "#d92d20",
                fontWeight: 600,
                fontSize: 11,
                borderRadius: "4px",
                height: 22,
                maxWidth: 120,
              }}
              title={row.errors.join("; ")}
            />
          )}
        </Box>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bulk Import Questions"
      description="Upload MCQ questions in bulk via CSV, Excel, XML, or TXT file format."
      maxWidth="md"
      showCloseButton
      contentSx={{
        px: { xs: 2.5, sm: 3.5 },
        py: 2,
        maxHeight: "75vh",
        overflowY: "auto",
      }}
      actions={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            pt: 1.5,
            borderTop: "1px solid #f2f4f7",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#344054",
              borderColor: "#d0d5dd",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={onExecuteImport}
            loading={isImporting}
            disabled={validRows.length === 0}
            sx={{
              bgcolor: "#1570ef",
              color: "#ffffff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              px: 3.5,
              "&:hover": { bgcolor: "#175cd3" },
            }}
          >
            Import {validRows.length > 0 ? `(${validRows.length}) Questions` : ""}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            bgcolor: "#f9fafb",
            borderRadius: 2,
            border: "1px solid #eaecf0",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828" }}>
              Need a starting template?
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085" }}>
              Download pre-formatted sample files matching the question bank schema.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={downloadSampleQuestionExcel}
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                borderRadius: "6px",
                borderColor: "#1570ef",
                color: "#1570ef",
                bgcolor: "#f8faff",
                fontWeight: 600,
                fontSize: 12,
                "&:hover": { bgcolor: "#eff8ff" },
              }}
            >
              Excel (.xlsx) Template
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={downloadSampleQuestionCSV}
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                borderRadius: "6px",
                borderColor: "#d0d5dd",
                color: "#344054",
                bgcolor: "#ffffff",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              CSV Template
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={downloadSampleQuestionXML}
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                borderRadius: "6px",
                borderColor: "#d0d5dd",
                color: "#344054",
                bgcolor: "#ffffff",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              XML Template
            </Button>
          </Stack>
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.xlsx,.xls,.xml,.txt,.json"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileSelect(e.target.files[0]);
            }
          }}
        />

        {!file ? (
          <Paper
            elevation={0}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              border: "2px dashed #d0d5dd",
              bgcolor: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#1570ef",
                bgcolor: "#f8faff",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#f2f4f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <CloudUploadOutlinedIcon sx={{ color: "#475467", fontSize: 24 }} />
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", mb: 0.5 }}>
              Click to upload <span style={{ color: "#1570ef" }}>or drag and drop</span>
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085" }}>
              CSV, XLSX, XML or JSON files (max. 10MB)
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: 2,
              border: "1px solid #b2ddff",
              bgcolor: "#eff8ff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <InsertDriveFileOutlinedIcon sx={{ color: "#1570ef", fontSize: 32 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828" }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#667085" }}>
                  {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} questions parsed
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                onFileSelect(null as unknown as File);
              }}
              sx={{ color: "#667085" }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {isParsing && (
          <Box sx={{ width: "100%", py: 1 }}>
            <LinearProgress sx={{ borderRadius: 1 }} />
            <Typography variant="caption" sx={{ color: "#667085", mt: 0.5, display: "block" }}>
              Validating and parsing rows...
            </Typography>
          </Box>
        )}

        {parsedRows.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#344054" }}>
                Preview Questions ({parsedRows.length})
              </Typography>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${validRows.length} Valid`}
                  size="small"
                  sx={{
                    bgcolor: "#ecfdf3",
                    color: "#16a34a",
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                {invalidRows.length > 0 && (
                  <Chip
                    label={`${invalidRows.length} Invalid`}
                    size="small"
                    sx={{
                      bgcolor: "#fef3f2",
                      color: "#d92d20",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Box sx={{ maxHeight: 280, overflowY: "auto", border: "1px solid #eaecf0", borderRadius: 2 }}>
              <Table
                columns={columns}
                rows={parsedRows}
                getRowId={(row) => row.rowNumber}
                size="small"
                emptyMessage="No questions parsed"
              />
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default BulkImportDialog;
