import React from "react";
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  IconButton,
  Radio,
  Checkbox,
  Stack,
  Chip,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import Dialog from "../../../components/common/Dialog";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import {
  getQuestionTotalMarks,
  usesPerAnswerMarks,
  type QuestionFormData,
} from "../../../utils/QuestionBankSchema";
import type { SkillTreeNode } from "../../../types/QuestionBank.types";

interface QuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  questions: QuestionFormData[];
  currentIndex: number;
  currentQuestion: QuestionFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isEditMode?: boolean;
  skillsTree?: SkillTreeNode[];
  onUpdateQuestion: (fields: Partial<QuestionFormData>) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onToggleCorrectOption: (optionId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToQuestion: (index: number) => void;
  onPublish: () => void;
}

const defaultSkillOptions = [
  "Quantitative Ability",
  "Logical Reasoning",
  "Verbal Ability",
  "Technical",
];

const topicOptionsMap: Record<string, string[]> = {
  "Quantitative Ability": [
    "Percentages",
    "Profit & Loss",
    "Time & Work",
    "Ratio",
    "Probability",
  ],
  "Logical Reasoning": [
    "Coding Decoding",
    "Syllogism",
    "Blood Relations",
    "Series",
  ],
  "Verbal Ability": [
    "Vocabulary",
    "Reading Comprehension",
    "Sentence Correction",
  ],
  Technical: [
    "Data Structures",
    "Algorithms",
    "SQL",
    "Core Java",
  ],
};

const questionTypeOptions = [
  { value: "Single choice", label: "Single choice" },
  { value: "Multiple choice", label: "Multiple choice" },
  { value: "True/False", label: "True / False" },
  { value: "Fill in the blanks", label: "Fill in the blanks" },
  { value: "Drag and drop", label: "Drag and drop" },
];

const difficultyOptions = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

export const QuestionFormDialog: React.FC<QuestionFormDialogProps> = ({
  open,
  onClose,
  questions,
  currentIndex,
  currentQuestion,
  errors,
  isSubmitting,
  isEditMode = false,
  skillsTree = [],
  onUpdateQuestion,
  onAddOption,
  onRemoveOption,
  onToggleCorrectOption,
  onPrev,
  onNext,
  onJumpToQuestion,
  onPublish,
}) => {
  const totalCount = questions.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCount - 1;
  const qTypeNorm = (currentQuestion.questionType || "").toLowerCase();
  const isMultipleChoice = qTypeNorm.includes("multiple");
  const isFillInTheBlanks = qTypeNorm.includes("blank") || qTypeNorm.includes("fill");
  const isDragAndDrop = qTypeNorm.includes("drag") || qTypeNorm.includes("drop");

  const availableSkills = React.useMemo(() => {
    if (skillsTree && skillsTree.length > 0) {
      const mapped = skillsTree
        .map((s) => s.skill || s.name || "")
        .filter((name): name is string => Boolean(name && name.trim().length > 0));
      if (mapped.length > 0) return mapped;
    }
    return defaultSkillOptions;
  }, [skillsTree]);

  const availableTopics = React.useMemo(() => {
    const activeSkill = currentQuestion.skill;
    if (skillsTree && skillsTree.length > 0) {
      const found = skillsTree.find(
        (s) => (s.skill || s.name || "").toLowerCase() === activeSkill.toLowerCase()
      );
      if (found && found.topics && found.topics.length > 0) {
        const list = found.topics
          .map((t: any) => (typeof t === "string" ? t : t.topic))
          .filter((t): t is string => Boolean(t && t.trim().length > 0));
        if (list.length > 0) return list;
      }
    }
    return topicOptionsMap[activeSkill] || ["General Topic"];
  }, [skillsTree, currentQuestion.skill]);

  const correctAnswerCount = currentQuestion.options.filter((option) => option.isCorrect).length;
  const marksPerCorrectAnswer =
    qTypeNorm.includes("multiple") && correctAnswerCount > 0
      ? currentQuestion.marks / correctAnswerCount
      : currentQuestion.marks;
  const questionTotalMarks = getQuestionTotalMarks(currentQuestion);
  const formatMarks = (marks: number) =>
    Number.isInteger(marks) ? String(marks) : String(Number(marks.toFixed(2)));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Question" : `${currentIndex + 1}. New question`}
      description={
        isEditMode
          ? "Update question in your institution question bank."
          : "Saved to your institution question bank."
      }
      maxWidth="md"
      showCloseButton
      contentSx={{
        px: { xs: 2.5, sm: 3.5 },
        py: 2,
        maxHeight: "78vh",
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
              fontWeight: 500,
              px: 3,
              py: 0.8,
              "&:hover": { borderColor: "#98a2b3", bgcolor: "#f9fafb" },
            }}
          >
            Cancel
          </Button>

          {isEditMode ? (
            <Button
              variant="contained"
              onClick={onPublish}
              loading={isSubmitting}
              sx={{
                bgcolor: "#1570ef",
                color: "#ffffff",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
                px: 3.5,
                py: 0.8,
                "&:hover": { bgcolor: "#175cd3" },
              }}
            >
              Save Changes
            </Button>
          ) : (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Button
                variant="outlined"
                onClick={onPrev}
                disabled={isFirst}
                startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: 13 }} />}
                sx={{
                  color: isFirst ? "#98a2b3" : "#344054",
                  borderColor: "#d0d5dd",
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  px: 2.5,
                  py: 0.8,
                  "&:hover": { borderColor: "#98a2b3", bgcolor: "#f9fafb" },
                }}
              >
                Prev
              </Button>

              {!isLast && (
                <Button
                  variant="contained"
                  onClick={onNext}
                  endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    bgcolor: "#1570ef",
                    color: "#ffffff",
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    px: 3,
                    py: 0.8,
                    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                    "&:hover": { bgcolor: "#175cd3" },
                  }}
                >
                  Next
                </Button>
              )}

              {isLast && (
                <Button
                  variant="contained"
                  onClick={onPublish}
                  loading={isSubmitting}
                  sx={{
                    bgcolor: "#8a1d4a",
                    color: "#ffffff",
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    px: 3.5,
                    py: 0.8,
                    boxShadow: "0 2px 4px rgba(138, 29, 74, 0.25)",
                    "&:hover": { bgcolor: "#75173e" },
                  }}
                >
                  Publish
                </Button>
              )}
            </Stack>
          )}
        </Box>
      }
    >
      {!isEditMode && totalCount > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
            p: 1.25,
            bgcolor: "#f8f9fc",
            borderRadius: 2,
            border: "1px solid #eaecf0",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
            Question {currentIndex + 1} of {totalCount}
          </Typography>

          <Stack direction="row" spacing={0.8} sx={{ overflowX: "auto" }}>
            {questions.map((q, idx) => (
              <Chip
                key={idx}
                label={`Q${idx + 1}`}
                size="small"
                onClick={() => onJumpToQuestion(idx)}
                sx={{
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: "6px",
                  bgcolor:
                    idx === currentIndex
                      ? "#1570ef"
                      : q.questionText.trim()
                        ? "#ecfdf3"
                        : "#f2f4f7",
                  color:
                    idx === currentIndex
                      ? "#ffffff"
                      : q.questionText.trim()
                        ? "#16a34a"
                        : "#475467",
                  border:
                    idx === currentIndex
                      ? "1px solid #1570ef"
                      : q.questionText.trim()
                        ? "1px solid #bbf7d0"
                        : "1px solid #e4e7ec",
                  "&:hover": {
                    bgcolor: idx === currentIndex ? "#175cd3" : "#e0e2e7",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.35fr 1fr" },
          gap: 3.5,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
            >
              Question type
            </Typography>

            <Input
              type="select"
              options={questionTypeOptions}
              textFieldProps={{
                value: currentQuestion.questionType,
                onChange: (e) => {
                  const newType = e.target.value;
                  const isBlank =
                    newType.toLowerCase().includes("blank") ||
                    newType.toLowerCase().includes("fill");
                  const isDrag =
                    newType.toLowerCase().includes("drag") ||
                    newType.toLowerCase().includes("drop");
                  const isTf = newType.toLowerCase().includes("true");

                  let updatedOptions = [...(currentQuestion.options || [])];
                  if (isTf) {
                    updatedOptions = [
                      { id: "opt-1", optionKey: "A", optionText: "True", isCorrect: true },
                      { id: "opt-2", optionKey: "B", optionText: "False", isCorrect: false },
                    ];
                  } else if (isBlank || isDrag) {
                    if (updatedOptions.length === 0) {
                      updatedOptions = [
                        { id: "opt-1", optionKey: "A", optionText: "", isCorrect: true },
                        { id: "opt-2", optionKey: "B", optionText: "", isCorrect: true },
                      ];
                    } else {
                      updatedOptions = updatedOptions.map((opt, i) => ({
                        ...opt,
                        optionKey: String.fromCharCode(65 + i),
                        isCorrect: true,
                      }));
                    }
                  } else {
                    if (!updatedOptions.some((o) => o.isCorrect) && updatedOptions.length > 0) {
                      updatedOptions[0].isCorrect = true;
                    }
                  }
                  onUpdateQuestion({ questionType: newType, options: updatedOptions });
                },
                error: Boolean(errors.questionType),
                helperText: errors.questionType,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: 14,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
            >
              Question *
            </Typography>

            <Input
              type="textarea"
              textFieldProps={{
                minRows: 3.5,
                placeholder: isFillInTheBlanks
                  ? "e.g., Which _A_____ will be on the face _B____ to the face with symbol _C____ with the console panel to link _D____"
                  : isDragAndDrop
                  ? "e.g., Which [Symbol] Calculation method is converted into coding to [      ] Calculation method..."
                  : "Write the question as students will see it",
                value: currentQuestion.questionText,
                onChange: (e) => onUpdateQuestion({ questionText: e.target.value }),
                error: Boolean(errors.questionText),
                helperText:
                  errors.questionText ||
                  (isFillInTheBlanks
                    ? "Tip: Use _A_____, _B_____ or [A], [B] in your text where blanks should appear."
                    : isDragAndDrop
                    ? "Tip: Use [      ] or [A], [B] in your text where draggable items should be dropped."
                    : undefined),
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: 14,
                    lineHeight: 1.5,
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#475467", fontWeight: 600, mb: 1, display: "block" }}
            >
              {isFillInTheBlanks
                ? "Blank answers - provide the correct answer for each blank"
                : isDragAndDrop
                ? "Draggable items - options students will drag into blanks"
                : "Options - select the correct answer"}
            </Typography>

            {errors.options && (
              <Typography
                variant="caption"
                sx={{ color: "#d92d20", fontWeight: 500, display: "block", mb: 1 }}
              >
                {errors.options}
              </Typography>
            )}

            <Stack spacing={1.25}>
              {currentQuestion.options.map((option, idx) => (
                <Box
                  key={option.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    p: 0.75,
                    borderRadius: "8px",
                    bgcolor:
                      isFillInTheBlanks || isDragAndDrop
                        ? "#f8fdf9"
                        : option.isCorrect
                        ? "#f6fef9"
                        : "transparent",
                    border:
                      isFillInTheBlanks || isDragAndDrop
                        ? "1px solid #e2e8f0"
                        : "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {isFillInTheBlanks ? (
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: "6px",
                        bgcolor: "#16a34a",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        minWidth: "68px",
                        textAlign: "center",
                      }}
                    >
                      Blank {option.optionKey || String.fromCharCode(65 + idx)}
                    </Box>
                  ) : isDragAndDrop ? (
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: "16px",
                        bgcolor: "#16a34a",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        minWidth: "60px",
                        textAlign: "center",
                      }}
                    >
                      Item {option.optionKey || String.fromCharCode(65 + idx)}
                    </Box>
                  ) : isMultipleChoice ? (
                    <Checkbox
                      checked={option.isCorrect}
                      onChange={() => onToggleCorrectOption(option.id)}
                      size="small"
                      sx={{
                        color: "#98a2b3",
                        "&.Mui-checked": { color: "#16a34a" },
                      }}
                      title="Mark as correct answer"
                    />
                  ) : (
                    <Radio
                      checked={option.isCorrect}
                      onChange={() => onToggleCorrectOption(option.id)}
                      size="small"
                      sx={{
                        color: "#98a2b3",
                        "&.Mui-checked": { color: "#16a34a" },
                      }}
                      title="Mark as correct answer"
                    />
                  )}

                  <Input
                    type="text"
                    textFieldProps={{
                      placeholder: isFillInTheBlanks
                        ? `Correct answer for Blank ${option.optionKey || String.fromCharCode(65 + idx)} (e.g. Symbol)`
                        : isDragAndDrop
                        ? `Draggable item text (e.g. Console, Symbol)`
                        : `Option ${option.optionKey || String.fromCharCode(65 + idx)}`,
                      value: option.optionText,
                      onChange: (e) => {
                        const updatedOpts = currentQuestion.options.map((o) =>
                          o.id === option.id ? { ...o, optionText: e.target.value } : o
                        );
                        onUpdateQuestion({ options: updatedOpts });
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          bgcolor: "#ffffff",
                          fontSize: 14,
                          borderColor: option.isCorrect ? "#a6f4c5" : "#d0d5dd",
                        },
                      },
                    }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => onRemoveOption(option.id)}
                    disabled={
                      isFillInTheBlanks || isDragAndDrop
                        ? currentQuestion.options.length <= 1
                        : currentQuestion.options.length <= 2
                    }
                    sx={{
                      color: "#98a2b3",
                      "&:hover": { color: "#d92d20", bgcolor: "#fef3f2" },
                    }}
                    title={
                      isFillInTheBlanks
                        ? "Remove blank"
                        : isDragAndDrop
                        ? "Remove item"
                        : "Remove option"
                    }
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={onAddOption}
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: "#1570ef",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  p: 0,
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                {isFillInTheBlanks
                  ? "Add blank"
                  : isDragAndDrop
                  ? "Add draggable item"
                  : "Add option"}
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
            >
              Explanation
            </Typography>

            <Input
              type="textarea"
              textFieldProps={{
                minRows: 2.5,
                placeholder: "Shown to students in practice, and in tests only if answers are visible.",
                value: currentQuestion.explanation,
                onChange: (e) => onUpdateQuestion({ explanation: e.target.value }),
                helperText: "Shown to students in practice, and in tests only if answers are visible.",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: 13,
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#667085",
                    fontSize: 11,
                    mt: 0.5,
                  },
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
            >
              Skill
            </Typography>

            <Autocomplete
              freeSolo
              options={availableSkills}
              value={currentQuestion.skill || ""}
              onInputChange={(_, value, reason) => {
                if (reason === "input" || reason === "clear") {
                  onUpdateQuestion({ skill: value });
                }
              }}
              onChange={(_, value) => {
                const newSkill = value || "";
                const found = skillsTree.find(
                  (skill) =>
                    (skill.skill || skill.name || "").toLowerCase() === newSkill.toLowerCase()
                );
                const firstTopic = found?.topics[0]
                  ? typeof found.topics[0] === "string"
                    ? found.topics[0]
                    : found.topics[0].topic
                  : (topicOptionsMap[newSkill] || [])[0];

                onUpdateQuestion({
                  skill: newSkill,
                  ...(firstTopic ? { topic: firstTopic } : {}),
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search or enter a skill"
                  error={Boolean(errors.skill)}
                  helperText={errors.skill}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#ffffff",
                      fontSize: 14,
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
            >
              Topic
            </Typography>

            <Autocomplete
              freeSolo
              options={availableTopics}
              value={currentQuestion.topic || ""}
              onInputChange={(_, value, reason) => {
                if (reason === "input" || reason === "clear") {
                  onUpdateQuestion({ topic: value });
                }
              }}
              onChange={(_, value) => onUpdateQuestion({ topic: value || "" })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search or enter a topic"
                  error={Boolean(errors.topic)}
                  helperText={errors.topic}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#ffffff",
                      fontSize: 14,
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
            >
              Difficulty
            </Typography>

            <Input
              type="select"
              options={difficultyOptions}
              textFieldProps={{
                value: currentQuestion.difficulty,
                onChange: (e) =>
                  onUpdateQuestion({
                    difficulty: e.target.value as "Easy" | "Medium" | "Hard",
                  }),
                error: Boolean(errors.difficulty),
                helperText: errors.difficulty,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: 14,
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
              >
                {isMultipleChoice
                  ? "Total Mark"
                  : usesPerAnswerMarks(currentQuestion.questionType)
                    ? "Mark / answer"
                    : "Marks"}
              </Typography>

              <Input
                type="number"
                textFieldProps={{
                  placeholder: "2",
                  value: currentQuestion.marks,
                  onChange: (e) =>
                    onUpdateQuestion({
                      marks: parseFloat(e.target.value) || 0,
                    }),
                  error: Boolean(errors.marks),
                  helperText: errors.marks,
                  slotProps: {
                    htmlInput: { min: 0.5, step: 0.5 },
                  },
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#ffffff",
                      fontSize: 14,
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#344054", fontWeight: 600, mb: 0.75, display: "block" }}
              >
                Negative
              </Typography>

              <Input
                type="number"
                textFieldProps={{
                  placeholder: "0.5",
                  value: currentQuestion.negativeMarks,
                  onChange: (e) =>
                    onUpdateQuestion({
                      negativeMarks: Math.abs(parseFloat(e.target.value) || 0),
                    }),
                  error: Boolean(errors.negativeMarks),
                  helperText: errors.negativeMarks,
                  slotProps: {
                    htmlInput: { min: 0, step: 0.25 },
                  },
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#ffffff",
                      fontSize: 14,
                    },
                  },
                }}
              />
            </Box>
          </Box>
          {(isMultipleChoice || isFillInTheBlanks || isDragAndDrop) && (
            <Box
              sx={{
                mt: -1.5,
                px: 1.5,
                py: 1,
                bgcolor: "#f8f9fc",
                borderRadius: "8px",
                border: "1px solid #eaecf0",
              }}
            >
              <Typography variant="caption" sx={{ display: "block", color: "#344054" }}>
                Total Mark: {formatMarks(questionTotalMarks)}
              </Typography>
              {isMultipleChoice && (
                <Typography variant="caption" sx={{ display: "block", color: "#344054" }}>
                  Correct answer mark:{" "}
                  {correctAnswerCount > 0 ? formatMarks(marksPerCorrectAnswer) : "--"}
                  {correctAnswerCount > 0 && " each"}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default QuestionFormDialog;
