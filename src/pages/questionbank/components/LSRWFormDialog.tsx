import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Radio,
  MenuItem,
  CircularProgress,
  TextField,
  Select,
  FormControl,
  FormHelperText,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AudioFileOutlinedIcon from "@mui/icons-material/AudioFileOutlined";
import Button from "../../../components/common/Button";
import type {
  LSRWFormData,
  LSRWFormValidationErrors,
  LSRWSubQuestion,
} from "../../../types/LSRW.types";

interface LSRWFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: LSRWFormData;
  formErrors: LSRWFormValidationErrors;
  isSubmitting: boolean;
  isUploadingAudio?: boolean;
  isEditMode: boolean;
  currentSubQuestion: LSRWSubQuestion;
  onUpdateField: <K extends keyof LSRWFormData>(field: K, value: LSRWFormData[K]) => void;
  onUpdateSubQuestion: (patch: Partial<LSRWSubQuestion>) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onSetCorrectOption: (optionId: string) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onAudioFileSelect: (file: File) => void;
  onPublish: () => void;
}

const LSRWFormDialog: React.FC<LSRWFormDialogProps> = ({
  open,
  onClose,
  formData,
  formErrors,
  isSubmitting,
  isUploadingAudio = false,
  isEditMode,
  currentSubQuestion,
  onUpdateField,
  onUpdateSubQuestion,
  onAddOption,
  onRemoveOption,
  onSetCorrectOption,
  onPrevQuestion,
  onNextQuestion,
  onAudioFileSelect,
  onPublish,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAudioFileSelect(e.target.files[0]);
    }
  };

  const isListening = formData.subTab === "Listening";
  const isSpeaking = formData.subTab === "Speaking";
  const isReading = formData.subTab === "Reading";
  const isWriting = formData.subTab === "Writing";

  const questionIndex = isListening ? formData.currentQuestionIndex + 1 : 1;
  const isFirstQuestion = isListening ? formData.currentQuestionIndex === 0 : true;

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
          pt: 3,
          pb: 1.5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          borderBottom: "1px solid #f2f4f7",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#101828", fontSize: "19px" }}
          >
            {isEditMode ? `Edit ${formData.subTab} question` : "New question"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#667085", fontSize: "13px", mt: 0.3 }}>
            Saved to your institution question bank.
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "#98a2b3", "&:hover": { color: "#344054" } }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, py: 3, overflowY: "auto", maxHeight: "70vh" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 260px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {isListening && (
              <>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                  >
                    Audio Question <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="audio/*,.mkv,.mp3,.wav,.ogg,.m4a"
                    onChange={handleFileChange}
                  />

                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: "1px dashed",
                      borderColor: formErrors.audioFileName ? "#d92d20" : "#d0d5dd",
                      borderRadius: "8px",
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      bgcolor: formErrors.audioFileName ? "#fef3f2" : "#fcfcfd",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#1570ef",
                        bgcolor: "#f8f9fc",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      {isUploadingAudio ? (
                        <CircularProgress size={18} sx={{ color: "#1570ef" }} />
                      ) : formData.audioFileName ? (
                        <AudioFileOutlinedIcon sx={{ color: "#1570ef", fontSize: 20 }} />
                      ) : (
                        <CloudUploadOutlinedIcon sx={{ color: "#667085", fontSize: 20 }} />
                      )}
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          color: formData.audioFileName ? "#101828" : "#667085",
                          fontWeight: formData.audioFileName ? 600 : 400,
                          fontSize: "13px",
                        }}
                      >
                        {isUploadingAudio
                          ? "Uploading audio to server..."
                          : formData.audioFileName
                          ? `${formData.audioFileName} (${formData.audioFileSize || "Audio"})`
                          : "Upload audio file .mkv, .mp3"}
                      </Typography>
                    </Box>
                    <CloudUploadOutlinedIcon sx={{ color: "#667085", fontSize: 18 }} />
                  </Box>
                  {formErrors.audioFileName && (
                    <Typography variant="caption" sx={{ color: "#d92d20", mt: 0.5, display: "block" }}>
                      {formErrors.audioFileName}
                    </Typography>
                  )}
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
                      Type <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formData.listeningType}
                        onChange={(e) => {
                          const newType = e.target.value as "Voice Input" | "MCQ";
                          onUpdateField("listeningType", newType);
                          onUpdateSubQuestion({ questionType: newType });
                        }}
                        sx={{
                          borderRadius: "8px",
                          fontSize: "13.5px",
                          bgcolor: "#ffffff",
                        }}
                      >
                        <MenuItem value="Voice Input">Voice Input</MenuItem>
                        <MenuItem value="MCQ">MCQ</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                    >
                      Duration <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="hr : min : sec"
                      value={formData.duration}
                      onChange={(e) => onUpdateField("duration", e.target.value)}
                      error={Boolean(formErrors.duration)}
                      helperText={formErrors.duration || "e.g. 10 min or 00:10:00"}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13.5px",
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
                    Description <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="AI Technology based listening skill"
                    value={formData.description}
                    onChange={(e) => onUpdateField("description", e.target.value)}
                    error={Boolean(formErrors.description)}
                    helperText={formErrors.description}
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
                    {questionIndex}. Question <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Which coding is called AI Technology code ?"
                    value={currentSubQuestion.questionText}
                    onChange={(e) => onUpdateSubQuestion({ questionText: e.target.value })}
                    error={Boolean(formErrors.questionText)}
                    helperText={formErrors.questionText}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "13.5px",
                      },
                    }}
                  />
                </Box>

                {formData.listeningType === "Voice Input" ? (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                    >
                      Answer <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Dot code, LLM, Python"
                      value={currentSubQuestion.answer || ""}
                      onChange={(e) => onUpdateSubQuestion({ answer: e.target.value })}
                      error={Boolean(formErrors.answer)}
                      helperText={formErrors.answer}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13.5px",
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#344054", mb: 1, display: "block" }}
                    >
                      Options &mdash; select the correct answer <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                      {(currentSubQuestion.options || []).map((opt) => (
                        <Box
                          key={opt.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Radio
                            checked={opt.isCorrect}
                            onChange={() => onSetCorrectOption(opt.id)}
                            size="small"
                            sx={{
                              color: "#d0d5dd",
                              "&.Mui-checked": { color: "#1570ef" },
                            }}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            placeholder={`Option ${opt.optionKey}`}
                            value={opt.optionText}
                            onChange={(e) => {
                              const opts = currentSubQuestion.options || [];
                              const updated = opts.map((item) =>
                                item.id === opt.id ? { ...item, optionText: e.target.value } : item
                              );
                              onUpdateSubQuestion({ options: updated });
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                fontSize: "13.5px",
                              },
                            }}
                          />
                          {(currentSubQuestion.options?.length || 0) > 2 && (
                            <IconButton
                              size="small"
                              onClick={() => onRemoveOption(opt.id)}
                              sx={{
                                color: "#98a2b3",
                                "&:hover": { color: "#d92d20" },
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          )}
                        </Box>
                      ))}

                      <Box sx={{ mt: 0.5 }}>
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                          onClick={onAddOption}
                          sx={{
                            color: "#1570ef",
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "13px",
                            p: 0.5,
                          }}
                        >
                          Add option
                        </Button>
                      </Box>
                      {formErrors.options && (
                        <Typography variant="caption" sx={{ color: "#d92d20" }}>
                          {formErrors.options}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}

            {isSpeaking && (
              <>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                  >
                    Duration <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="hr : min : sec"
                    value={formData.duration}
                    onChange={(e) => onUpdateField("duration", e.target.value)}
                    error={Boolean(formErrors.duration)}
                    helperText={formErrors.duration || "e.g. 10 min or 00:10:00"}
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
                    1. Question <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="What is AI ?"
                    value={formData.speakingQuestion}
                    onChange={(e) => onUpdateField("speakingQuestion", e.target.value)}
                    error={Boolean(formErrors.speakingQuestion)}
                    helperText={formErrors.speakingQuestion}
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
                    Key words <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    placeholder="LLM, Artificial Intelligent, Data scientist"
                    value={formData.speakingKeywords}
                    onChange={(e) => onUpdateField("speakingKeywords", e.target.value)}
                    error={Boolean(formErrors.speakingKeywords)}
                    helperText={formErrors.speakingKeywords}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "13.5px",
                      },
                    }}
                  />
                </Box>
              </>
            )}

            {isReading && (
              <>
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
                      1. Topic <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Java new SE 27"
                      value={formData.readingTopic}
                      onChange={(e) => onUpdateField("readingTopic", e.target.value)}
                      error={Boolean(formErrors.readingTopic)}
                      helperText={formErrors.readingTopic}
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
                      Duration <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="hr : min : sec"
                      value={formData.duration}
                      onChange={(e) => onUpdateField("duration", e.target.value)}
                      error={Boolean(formErrors.duration)}
                      helperText={formErrors.duration || "e.g. 5 min or 00:05:00"}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13.5px",
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
                    Readable Paragraph <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={7}
                    placeholder="The on-line Java Platform, Standard Edition (Java SE) Documentation contains API specifications, feature descriptions, developer guides, reference pages for JDK tools and utilities, and links to related information..."
                    value={formData.readingParagraph}
                    onChange={(e) => onUpdateField("readingParagraph", e.target.value)}
                    error={Boolean(formErrors.readingParagraph)}
                    helperText={formErrors.readingParagraph}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "13px",
                        lineHeight: 1.6,
                      },
                    }}
                  />
                </Box>
              </>
            )}

            {isWriting && (
              <>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}
                  >
                    1. Topic <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Java new SE 27"
                    value={formData.writingTopic}
                    onChange={(e) => onUpdateField("writingTopic", e.target.value)}
                    error={Boolean(formErrors.writingTopic)}
                    helperText={formErrors.writingTopic}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "13.5px",
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
                      Number of Words <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="120"
                      value={formData.writingWords}
                      onChange={(e) => onUpdateField("writingWords", e.target.value)}
                      error={Boolean(formErrors.writingWords)}
                      helperText={formErrors.writingWords}
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
                      Duration <span style={{ color: "#d92d20" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="hr : min : sec"
                      value={formData.duration}
                      onChange={(e) => onUpdateField("duration", e.target.value)}
                      error={Boolean(formErrors.duration)}
                      helperText={formErrors.duration || "e.g. 15 min or 00:15:00"}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "13.5px",
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
                    Keywords <span style={{ color: "#d92d20" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Placement, Procedure, Objectives, class, interface, extends, implements, new, this, super, and enum"
                    value={formData.writingKeywords}
                    onChange={(e) => onUpdateField("writingKeywords", e.target.value)}
                    error={Boolean(formErrors.writingKeywords)}
                    helperText={formErrors.writingKeywords}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "13px",
                        lineHeight: 1.5,
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </Box>

          <Box
            sx={{
              p: 2.2,
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
                Difficulty <span style={{ color: "#d92d20" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={Boolean(formErrors.difficulty)}>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => onUpdateField("difficulty", e.target.value as any)}
                  displayEmpty
                  sx={{
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: "13px",
                  }}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
                {formErrors.difficulty && (
                  <FormHelperText>{formErrors.difficulty}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
              }}
            >
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
                  Negative
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="0"
                  value={formData.negativeMarks}
                  onChange={(e) => onUpdateField("negativeMarks", e.target.value)}
                  error={Boolean(formErrors.negativeMarks)}
                  helperText={formErrors.negativeMarks}
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
          {isListening && (
            <Button
              variant="outlined"
              size="small"
              onClick={onPrevQuestion}
              disabled={isFirstQuestion || isSubmitting}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                borderColor: "#b2ddff",
                color: "#175cd3",
                bgcolor: "#eff8ff",
                fontSize: "13px",
                px: 2,
                "&:hover": {
                  bgcolor: "#d1e9ff",
                  borderColor: "#84caff",
                },
              }}
            >
              &lt;&lt; Prev
            </Button>
          )}

          {isListening && (
            <Button
              variant="contained"
              size="small"
              onClick={onNextQuestion}
              disabled={isSubmitting}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                bgcolor: "#1570ef",
                color: "#ffffff",
                fontSize: "13px",
                px: 2.2,
                "&:hover": { bgcolor: "#175cd3" },
              }}
            >
              Next &gt;&gt;
            </Button>
          )}

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

export default LSRWFormDialog;
