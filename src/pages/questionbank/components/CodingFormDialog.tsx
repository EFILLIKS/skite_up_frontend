import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  MenuItem,
  CircularProgress,
  TextField,
  Select,
  FormControl,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Button from "../../../components/common/Button";
import type {
  CodingFormData,
  CodingFormValidationErrors,
  CodingExampleItem,
  CodingTestCaseItem,
} from "../../../types/Coding.types";

const ALL_LANGUAGES = ["Python", "Java", "C++", "JavaScript", "C"];

interface CodingFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: CodingFormData;
  formErrors: CodingFormValidationErrors;
  isSubmitting: boolean;
  isUploadingImage?: boolean;
  isEditMode: boolean;
  onUpdateField: <K extends keyof CodingFormData>(field: K, value: CodingFormData[K]) => void;
  onUploadImage?: (file: File) => void;
  onAddExample: () => void;
  onUpdateExample: (id: string, patch: Partial<CodingExampleItem>) => void;
  onRemoveExample: (id: string) => void;
  onAddTestCase: () => void;
  onUpdateTestCase: (id: string, patch: Partial<CodingTestCaseItem>) => void;
  onRemoveTestCase: (id: string) => void;
  onToggleLanguage: (lang: string) => void;
  onPublish: () => void;
}

const CodingFormDialog: React.FC<CodingFormDialogProps> = ({
  open,
  onClose,
  formData,
  formErrors,
  isSubmitting,
  isUploadingImage = false,
  isEditMode,
  onUpdateField,
  onUploadImage,
  onAddExample,
  onUpdateExample,
  onRemoveExample,
  onAddTestCase,
  onUpdateTestCase,
  onRemoveTestCase,
  onToggleLanguage,
  onPublish,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onUpdateField("imageFile", file);
      onUpdateField("imageUrl", url);
      onUpdateField("imageFileName", file.name);
      if (onUploadImage) {
        onUploadImage(file);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            p: 0,
            boxShadow: "0 20px 48px rgba(16, 24, 40, 0.18)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3.5,
          pt: 2.5,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f2f4f7",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", fontSize: "18px" }}>
          {isEditMode ? "Edit coding problem" : "1. New coding problem"}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "#98a2b3", "&:hover": { color: "#344054" } }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, py: 3, overflowY: "auto", maxHeight: "72vh" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 270px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
              >
                Title <span style={{ color: "#d92d20" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Pair With Target Sum"
                value={formData.title}
                onChange={(e) => onUpdateField("title", e.target.value)}
                error={Boolean(formErrors.title)}
                helperText={formErrors.title}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13.5px",
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
              >
                Problem statement <span style={{ color: "#d92d20" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                value={formData.problemStatement}
                onChange={(e) => onUpdateField("problemStatement", e.target.value)}
                error={Boolean(formErrors.problemStatement)}
                helperText={formErrors.problemStatement}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                >
                  Input format
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="First line contains N and Target. Second line contains N integers."
                  value={formData.inputFormat}
                  onChange={(e) => onUpdateField("inputFormat", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                >
                  Output format
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Two space-separated indices."
                  value={formData.outputFormat}
                  onChange={(e) => onUpdateField("outputFormat", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
              >
                Constraints
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                value={formData.constraints}
                onChange={(e) => onUpdateField("constraints", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13px",
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "#98a2b3", mt: 0.5, display: "block" }}>
                One per line
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 1, display: "block" }}
              >
                Examples (visible to students)
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {formData.examples.map((example) => (
                  <Box
                    key={example.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: 1.5,
                      alignItems: "start",
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Input"
                      value={example.input}
                      onChange={(e) =>
                        onUpdateExample(example.id, { input: e.target.value })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13px",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Output"
                      value={example.output}
                      onChange={(e) =>
                        onUpdateExample(example.id, { output: e.target.value })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13px",
                        },
                      }}
                    />
                    {formData.examples.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveExample(example.id)}
                        sx={{ color: "#98a2b3", mt: 0.5, "&:hover": { color: "#d92d20" } }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Box>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={onAddExample}
                    sx={{
                      color: "#1570ef",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "13px",
                      p: 0.5,
                    }}
                  >
                    Add example
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 1, display: "block" }}
              >
                Sample Test Cases
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {formData.sampleTestCases.map((tc) => (
                  <Box
                    key={tc.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: 1.5,
                      alignItems: "start",
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Input"
                      value={tc.input}
                      onChange={(e) =>
                        onUpdateTestCase(tc.id, { input: e.target.value })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13px",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Output"
                      value={tc.output}
                      onChange={(e) =>
                        onUpdateTestCase(tc.id, { output: e.target.value })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13px",
                        },
                      }}
                    />
                    {formData.sampleTestCases.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveTestCase(tc.id)}
                        sx={{ color: "#98a2b3", mt: 0.5, "&:hover": { color: "#d92d20" } }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Box>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={onAddTestCase}
                    sx={{
                      color: "#1570ef",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "13px",
                      p: 0.5,
                    }}
                  >
                    Add Sample test case
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: "10px",
              bgcolor: "#f9fafb",
              border: "1px solid #eaecf0",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
              >
                Question Type
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.questionType}
                  onChange={(e) => onUpdateField("questionType", e.target.value)}
                  sx={{
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: "13px",
                  }}
                >
                  <MenuItem value="Coding">Coding</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
              >
                Difficulty <span style={{ color: "#d92d20" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={Boolean(formErrors.difficulty)}>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => onUpdateField("difficulty", e.target.value as any)}
                  sx={{
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: "13px",
                  }}
                >
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
                {formErrors.difficulty && (
                  <FormHelperText>{formErrors.difficulty}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                >
                  Time (ms) <span style={{ color: "#d92d20" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="1000"
                  value={formData.timeLimitMs}
                  onChange={(e) => onUpdateField("timeLimitMs", e.target.value)}
                  error={Boolean(formErrors.timeLimitMs)}
                  helperText={formErrors.timeLimitMs}
                  sx={{
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                >
                  Memory (MB) <span style={{ color: "#d92d20" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="257"
                  value={formData.memoryLimitMb}
                  onChange={(e) => onUpdateField("memoryLimitMb", e.target.value)}
                  error={Boolean(formErrors.memoryLimitMb)}
                  helperText={formErrors.memoryLimitMb}
                  sx={{
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                >
                  Marks <span style={{ color: "#d92d20" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="50"
                  value={formData.marks}
                  onChange={(e) => onUpdateField("marks", e.target.value)}
                  error={Boolean(formErrors.marks)}
                  helperText={formErrors.marks}
                  sx={{
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                >
                  Hidden tests
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="10"
                  value={formData.hiddenTestsCount}
                  onChange={(e) => onUpdateField("hiddenTestsCount", e.target.value)}
                  error={Boolean(formErrors.hiddenTestsCount)}
                  helperText={formErrors.hiddenTestsCount}
                  sx={{
                    bgcolor: "#ffffff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Box>
            </Box>

            <Box>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageChange}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: "1px dashed #d0d5dd",
                  borderRadius: "8px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  bgcolor: "#ffffff",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#1570ef",
                    bgcolor: "#f8f9fc",
                  },
                }}
              >
                <Typography variant="body2" sx={{ color: "#667085", fontSize: "13px" }}>
                  {isUploadingImage
                    ? "Uploading image..."
                    : formData.imageFileName || (formData.imageUrl ? "Image attached" : "Upload Image")}
                </Typography>
                {isUploadingImage ? (
                  <CircularProgress size={16} sx={{ color: "#1570ef" }} />
                ) : (
                  <CloudUploadOutlinedIcon sx={{ color: "#667085", fontSize: 18 }} />
                )}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#344054", mb: 0.5, display: "block" }}
              >
                Supported languages <span style={{ color: "#d92d20" }}>*</span>
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
                {ALL_LANGUAGES.map((lang) => {
                  const isChecked = formData.supportedLanguages.includes(lang);
                  return (
                    <FormControlLabel
                      key={lang}
                      control={
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => onToggleLanguage(lang)}
                          sx={{
                            color: "#d0d5dd",
                            "&.Mui-checked": { color: "#1570ef" },
                            p: 0.5,
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "13px", color: "#344054" }}>
                          {lang}
                        </Typography>
                      }
                      sx={{ ml: 0, mr: 0 }}
                    />
                  );
                })}
                {formErrors.supportedLanguages && (
                  <Typography variant="caption" sx={{ color: "#d92d20", mt: 0.5 }}>
                    {formErrors.supportedLanguages}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3.5,
          py: 2,
          borderTop: "1px solid #eaecf0",
          display: "flex",
          justifyContent: "space-between",
          bgcolor: "#ffffff",
        }}
      >
        <Button
          variant="text"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: "#475467",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13.5px",
            "&:hover": { bgcolor: "#f2f4f7" },
          }}
        >
          Cancel
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              borderColor: "#b2ddff",
              color: "#175cd3",
              bgcolor: "#eff8ff",
              fontSize: "13px",
              px: 2,
            }}
          >
            &lt;&lt; Prev
          </Button>

          <Button
            variant="contained"
            size="small"
            disabled
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              bgcolor: "#1570ef",
              color: "#ffffff",
              fontSize: "13px",
              px: 2.2,
            }}
          >
            Next &gt;&gt;
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={onPublish}
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              bgcolor: "#8a1d4a",
              color: "#ffffff",
              fontSize: "13.5px",
              px: 2.6,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              "&:hover": {
                bgcolor: "#73143c",
              },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                <span>Publishing...</span>
              </Box>
            ) : (
              "Publish"
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CodingFormDialog;
