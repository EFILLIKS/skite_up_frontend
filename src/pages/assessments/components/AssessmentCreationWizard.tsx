import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Checkbox,
  Chip,
  CircularProgress,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import {
  useCreateAssessmentTemplateMutation,
} from "../../../features/assessment/AssessmentApi";
import {
  useGetQuestionBankListQuery,
  useGetLSRWExercisesQuery,
  useGetCodingProblemsQuery,
} from "../../../features/assessment/QuestionBankApi";
import Pagination from "../../../components/common/Pagination";
import type { CreateAssessmentTemplateRequest } from "../../../types/Assessment.types";

interface AssessmentCreationWizardProps {
  onCancel: () => void;
  onFinishCreate: (createdAssessmentId: string, testName: string) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const AssessmentCreationWizard: React.FC<AssessmentCreationWizardProps> = ({
  onCancel,
  onFinishCreate,
  onSuccess,
  onError,
}) => {
  const [step, setStep] = useState<number>(1);

  const [testName, setTestName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [modules, setModules] = useState<{
    MCQ: boolean;
    LSRW: boolean;
    Coding: boolean;
    CognitiveGame: boolean;
  }>({
    MCQ: true,
    LSRW: true,
    Coding: true,
    CognitiveGame: false,
  });

  const [moduleCounts, setModuleCounts] = useState<{
    MCQ: number;
    LSRW: number;
    Coding: number;
    CognitiveGame: number;
  }>({
    MCQ: 10,
    LSRW: 5,
    Coding: 2,
    CognitiveGame: 1,
  });

  const [activeCategoryTab, setActiveCategoryTab] = useState<"MCQ" | "LSRW" | "Coding">("MCQ");
  const [questionSearch, setQuestionSearch] = useState<string>("");
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("All Question Type");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");

  const [selectedMcqIds, setSelectedMcqIds] = useState<string[]>([]);
  const [selectedLsrwIds, setSelectedLsrwIds] = useState<string[]>([]);
  const [selectedCodingIds, setSelectedCodingIds] = useState<string[]>([]);

  const selectedMcqCount = selectedMcqIds.length;
  const selectedLsrwCount = selectedLsrwIds.length;
  const selectedCodingCount = selectedCodingIds.length;

  const mcqLimit = modules.MCQ ? moduleCounts.MCQ : 0;
  const lsrwLimit = modules.LSRW ? moduleCounts.LSRW : 0;
  const codingLimit = modules.Coding ? moduleCounts.Coding : 0;

  const isMcqLimitReached = mcqLimit > 0 && selectedMcqCount >= mcqLimit;
  const isLsrwLimitReached = lsrwLimit > 0 && selectedLsrwCount >= lsrwLimit;
  const isCodingLimitReached = codingLimit > 0 && selectedCodingCount >= codingLimit;

  const currentCategoryLimit =
    activeCategoryTab === "MCQ"
      ? mcqLimit
      : activeCategoryTab === "LSRW"
        ? lsrwLimit
        : codingLimit;

  const currentCategorySelectedCount =
    activeCategoryTab === "MCQ"
      ? selectedMcqCount
      : activeCategoryTab === "LSRW"
        ? selectedLsrwCount
        : selectedCodingCount;

  const isCurrentCategoryLimitReached =
    activeCategoryTab === "MCQ"
      ? isMcqLimitReached
      : activeCategoryTab === "LSRW"
        ? isLsrwLimitReached
        : isCodingLimitReached;

  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [negativeMarks, setNegativeMarks] = useState<number>(0.25);
  const [attemptsAllowed, setAttemptsAllowed] = useState<number>(1);
  const [randomizeQuestionOrder, setRandomizeQuestionOrder] = useState<boolean>(true);
  const [shuffleAnswerOptions, setShuffleAnswerOptions] = useState<boolean>(true);
  const [resultVisibility, setResultVisibility] = useState<string>("After the test window closes");
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const { data: mcqRes, isLoading: isFetchingMcq } = useGetQuestionBankListQuery({
    page: 0,
    size: 200,
  });

  const { data: lsrwRes, isLoading: isFetchingLsrw } = useGetLSRWExercisesQuery({
    page: 0,
    size: 200,
  });

  const { data: codingRes, isLoading: isFetchingCoding } = useGetCodingProblemsQuery({
    page: 0,
    size: 200,
  });

  const [createTemplateMutation, { isLoading: isSubmitting }] = useCreateAssessmentTemplateMutation();

  const currentQuestionsList = useMemo(() => {
    let list: Array<{
      id: string;
      title: string;
      subtitle: string;
      difficulty: string;
      marks: number;
      questionType?: string;
    }> = [];

    if (activeCategoryTab === "MCQ") {
      const items = mcqRes?.data?.content || (Array.isArray(mcqRes?.data) ? mcqRes.data : []);
      list = items.map((q: any) => ({
        id: q.id,
        title: q.questionText || "MCQ Question",
        subtitle: `${q.topic || q.skill || "Quantitative"} · ${q.questionType || "Multiple choice"}`,
        difficulty: q.difficulty || "Medium",
        marks: q.marks || 2,
        questionType: q.questionType,
      }));
    } else if (activeCategoryTab === "LSRW") {
      const items = lsrwRes?.data?.content || (Array.isArray(lsrwRes?.data) ? lsrwRes.data : []);
      list = items.map((q: any) => ({
        id: q.id,
        title: q.title || q.prompt || q.questionText || q.exerciseTitle || "Communication Exercise",
        subtitle: `${q.skill || "Listening"} · ${q.level || q.difficulty || "Intermediate"}`,
        difficulty: q.level || q.difficulty || "Medium",
        marks: q.marks || 10,
        questionType: q.questionType || "Voice / Text",
      }));
    } else {
      const items = codingRes?.data?.content || (Array.isArray(codingRes?.data) ? codingRes.data : []);
      list = items.map((q: any) => ({
        id: q.id,
        title: q.problemTitle || q.title || "Coding Problem",
        subtitle: `${q.difficulty || "Easy"} · ${Array.isArray(q.supportedLanguages)
          ? q.supportedLanguages.join(", ")
          : q.supportedLanguages || "Python, Java"
          }`,
        difficulty: q.difficulty || "Easy",
        marks: q.marks || 50,
        questionType: "Coding",
      }));
    }

    return list.filter((q) => {
      if (questionSearch.trim()) {
        const query = questionSearch.trim().toLowerCase();
        const matchTitle = (q.title || "").toLowerCase().includes(query);
        const matchSub = (q.subtitle || "").toLowerCase().includes(query);
        if (!matchTitle && !matchSub) return false;
      }

      if (selectedQuestionType !== "All Question Type") {
        const qType = (q.questionType || "").toLowerCase();
        const targetType = selectedQuestionType.toLowerCase();
        if (!qType.includes(targetType) && !(q.subtitle || "").toLowerCase().includes(targetType)) {
          return false;
        }
      }

      if (selectedLevel !== "All Levels") {
        if ((q.difficulty || "").toLowerCase() !== selectedLevel.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategoryTab, mcqRes, lsrwRes, codingRes, questionSearch, selectedQuestionType, selectedLevel]);

  React.useEffect(() => {
    setPage(0);
  }, [activeCategoryTab, questionSearch, selectedQuestionType, selectedLevel]);

  React.useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(currentQuestionsList.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [currentQuestionsList.length, rowsPerPage, page]);

  const paginatedQuestionsList = useMemo(() => {
    const start = page * rowsPerPage;
    return currentQuestionsList.slice(start, start + rowsPerPage);
  }, [currentQuestionsList, page, rowsPerPage]);

  const isQuestionSelected = (id: string) => {
    if (activeCategoryTab === "MCQ") return selectedMcqIds.includes(id);
    if (activeCategoryTab === "LSRW") return selectedLsrwIds.includes(id);
    return selectedCodingIds.includes(id);
  };

  const toggleQuestionSelection = (id: string) => {
    if (activeCategoryTab === "MCQ") {
      if (selectedMcqIds.includes(id)) {
        setSelectedMcqIds((prev) => prev.filter((item) => item !== id));
      } else {
        if (mcqLimit > 0 && selectedMcqIds.length >= mcqLimit) {
          onError(`MCQ selection limit of ${mcqLimit} questions reached`);
          return;
        }
        setSelectedMcqIds((prev) => [...prev, id]);
      }
    } else if (activeCategoryTab === "LSRW") {
      if (selectedLsrwIds.includes(id)) {
        setSelectedLsrwIds((prev) => prev.filter((item) => item !== id));
      } else {
        if (lsrwLimit > 0 && selectedLsrwIds.length >= lsrwLimit) {
          onError(`LSRW selection limit of ${lsrwLimit} questions reached`);
          return;
        }
        setSelectedLsrwIds((prev) => [...prev, id]);
      }
    } else if (activeCategoryTab === "Coding") {
      if (selectedCodingIds.includes(id)) {
        setSelectedCodingIds((prev) => prev.filter((item) => item !== id));
      } else {
        if (codingLimit > 0 && selectedCodingIds.length >= codingLimit) {
          onError(`Coding selection limit of ${codingLimit} problems reached`);
          return;
        }
        setSelectedCodingIds((prev) => [...prev, id]);
      }
    }
  };

  const handleStep1Next = () => {
    if (!testName.trim()) {
      onError("Please enter a test name");
      return;
    }
    const enabledCategories = (["MCQ", "LSRW", "Coding", "CognitiveGame"] as const).filter(
      (k) => modules[k]
    );
    if (enabledCategories.length === 0) {
      onError("Please enable at least one module (MCQ, LSRW, Coding, etc.)");
      return;
    }

    if (modules.MCQ && (!moduleCounts.MCQ || moduleCounts.MCQ <= 0)) {
      onError("Please specify a valid question count for MCQ (minimum 1)");
      return;
    }
    if (modules.LSRW && (!moduleCounts.LSRW || moduleCounts.LSRW <= 0)) {
      onError("Please specify a valid question count for LSRW (minimum 1)");
      return;
    }
    if (modules.Coding && (!moduleCounts.Coding || moduleCounts.Coding <= 0)) {
      onError("Please specify a valid question count for Coding (minimum 1)");
      return;
    }

    if (modules.MCQ) setActiveCategoryTab("MCQ");
    else if (modules.LSRW) setActiveCategoryTab("LSRW");
    else if (modules.Coding) setActiveCategoryTab("Coding");

    setStep(2);
  };

  const handleStep2Next = () => {
    if (modules.MCQ && selectedMcqCount < moduleCounts.MCQ) {
      onError(
        `Please select all ${moduleCounts.MCQ} required MCQ questions (currently selected: ${selectedMcqCount})`
      );
      return;
    }
    if (modules.LSRW && selectedLsrwCount < moduleCounts.LSRW) {
      onError(
        `Please select all ${moduleCounts.LSRW} required LSRW exercises (currently selected: ${selectedLsrwCount})`
      );
      return;
    }
    if (modules.Coding && selectedCodingCount < moduleCounts.Coding) {
      onError(
        `Please select all ${moduleCounts.Coding} required Coding problems (currently selected: ${selectedCodingCount})`
      );
      return;
    }
    setStep(3);
  };

  const handleFinishCreate = async () => {
    const categories: string[] = [];
    if (modules.MCQ) categories.push("MCQ");
    if (modules.LSRW) categories.push("LSRW");
    if (modules.Coding) categories.push("Coding");
    if (modules.CognitiveGame) categories.push("Cognitive Game");

    const selectedQuestionIds = [
      ...(modules.MCQ ? selectedMcqIds : []),
      ...(modules.LSRW ? selectedLsrwIds : []),
      ...(modules.Coding ? selectedCodingIds : []),
    ];

    const payload: CreateAssessmentTemplateRequest = {
      testName: testName.trim(),
      description: description.trim(),
      categories,
      mcqCount: modules.MCQ ? moduleCounts.MCQ : 0,
      lsrwCount: modules.LSRW ? moduleCounts.LSRW : 0,
      codingCount: modules.Coding ? moduleCounts.Coding : 0,
      durationMinutes: Number(durationMinutes) || 60,
      negativeMarksPerWrong: Number(negativeMarks) || 0,
      attemptsAllowed: Number(attemptsAllowed) || 1,
      randomizeQuestionOrder,
      shuffleAnswerOptions,
      resultVisibility,
      showCorrectAnswers,
      selectedQuestionIds,
    };

    try {
      const res = await createTemplateMutation(payload).unwrap();
      const createdId = res?.data?.id || res?.data?.assessmentId || `tpl-${Date.now()}`;
      onSuccess("Assessment template created successfully!");
      onFinishCreate(createdId, testName.trim());
    } catch (err: any) {
      onError(err?.data?.message || err?.message || "Failed to create assessment template");
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: "12px",
        border: "1px solid #eaecf0",
        bgcolor: "#ffffff",
        minHeight: 520,
      }}
    >
      {step === 1 && (
        <Box sx={{ maxWidth: 800 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", mb: 3 }}>
            Test Details
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}>
                Test name <span style={{ color: "#d92d20" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Practice test"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13.5px",
                  },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054" }}>
                  Description
                </Typography>
                <Typography variant="caption" sx={{ color: "#667085" }}>
                  {description.length}/500
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description about the template..."
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13.5px",
                  },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={modules.MCQ}
                      onChange={(e) => setModules({ ...modules, MCQ: e.target.checked })}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>MCQ</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={modules.LSRW}
                      onChange={(e) => setModules({ ...modules, LSRW: e.target.checked })}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>LSRW</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={modules.Coding}
                      onChange={(e) => setModules({ ...modules, Coding: e.target.checked })}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>Coding</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={modules.CognitiveGame}
                      onChange={(e) => setModules({ ...modules, CognitiveGame: e.target.checked })}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>Cognitive Game</Typography>}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {modules.MCQ && (
                  <Box sx={{ width: 160 }}>
                    <Typography variant="caption" sx={{ color: "#475467", fontWeight: 600, mb: 0.5, display: "block" }}>
                      MCQ
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Number of Questions"
                      value={moduleCounts.MCQ || ""}
                      onChange={(e) =>
                        setModuleCounts({
                          ...moduleCounts,
                          MCQ: e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                    />
                  </Box>
                )}

                {modules.LSRW && (
                  <Box sx={{ width: 160 }}>
                    <Typography variant="caption" sx={{ color: "#475467", fontWeight: 600, mb: 0.5, display: "block" }}>
                      LSRW
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Number of Questions"
                      value={moduleCounts.LSRW || ""}
                      onChange={(e) =>
                        setModuleCounts({
                          ...moduleCounts,
                          LSRW: e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                    />
                  </Box>
                )}

                {modules.Coding && (
                  <Box sx={{ width: 160 }}>
                    <Typography variant="caption" sx={{ color: "#475467", fontWeight: 600, mb: 0.5, display: "block" }}>
                      Coding
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Number of Questions"
                      value={moduleCounts.Coding || ""}
                      onChange={(e) =>
                        setModuleCounts({
                          ...moduleCounts,
                          Coding: e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                    />
                  </Box>
                )}

                {modules.CognitiveGame && (
                  <Box sx={{ width: 160 }}>
                    <Typography variant="caption" sx={{ color: "#475467", fontWeight: 600, mb: 0.5, display: "block" }}>
                      Cognitive Game
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Number of Questions"
                      value={moduleCounts.CognitiveGame || ""}
                      onChange={(e) =>
                        setModuleCounts({
                          ...moduleCounts,
                          CognitiveGame: e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4 }}>
              <Button variant="outlined" size="small" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="contained" size="small" onClick={handleStep1Next} sx={{ bgcolor: "#1570ef" }}>
                Next &gt;&gt;
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box>
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
            <Box sx={{ flex: "1 1 280px", maxWidth: 380 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by Question, Type, marks ..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
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
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: "13.5px",
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                {modules.MCQ && (
                  <Chip
                    label={`● MCQ ${selectedMcqCount}/${moduleCounts.MCQ}${isMcqLimitReached ? " (Limit Reached)" : ""
                      }`}
                    size="small"
                    onClick={() => setActiveCategoryTab("MCQ")}
                    sx={{
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      bgcolor: isMcqLimitReached
                        ? "#fef3f2"
                        : activeCategoryTab === "MCQ"
                          ? "#eff8ff"
                          : "#f2f4f7",
                      color: isMcqLimitReached
                        ? "#d92d20"
                        : activeCategoryTab === "MCQ"
                          ? "#175cd3"
                          : "#344054",
                      border: isMcqLimitReached
                        ? "1.5px solid #fda29b"
                        : activeCategoryTab === "MCQ"
                          ? "1.5px solid #b2ddff"
                          : "1px solid #eaecf0",
                      boxShadow: isMcqLimitReached
                        ? "0 0 0 2px rgba(240, 68, 56, 0.15)"
                        : "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isMcqLimitReached
                          ? "#fee4e2"
                          : activeCategoryTab === "MCQ"
                            ? "#d1e9ff"
                            : "#e4e7ec",
                      },
                    }}
                  />
                )}
                {modules.LSRW && (
                  <Chip
                    label={`● LSRW ${selectedLsrwCount}/${moduleCounts.LSRW}${isLsrwLimitReached ? " (Limit Reached)" : ""
                      }`}
                    size="small"
                    onClick={() => setActiveCategoryTab("LSRW")}
                    sx={{
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      bgcolor: isLsrwLimitReached
                        ? "#fef3f2"
                        : activeCategoryTab === "LSRW"
                          ? "#eff8ff"
                          : "#f2f4f7",
                      color: isLsrwLimitReached
                        ? "#d92d20"
                        : activeCategoryTab === "LSRW"
                          ? "#175cd3"
                          : "#344054",
                      border: isLsrwLimitReached
                        ? "1.5px solid #fda29b"
                        : activeCategoryTab === "LSRW"
                          ? "1.5px solid #b2ddff"
                          : "1px solid #eaecf0",
                      boxShadow: isLsrwLimitReached
                        ? "0 0 0 2px rgba(240, 68, 56, 0.15)"
                        : "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isLsrwLimitReached
                          ? "#fee4e2"
                          : activeCategoryTab === "LSRW"
                            ? "#d1e9ff"
                            : "#e4e7ec",
                      },
                    }}
                  />
                )}
                {modules.Coding && (
                  <Chip
                    label={`● Coding ${selectedCodingCount}/${moduleCounts.Coding}${isCodingLimitReached ? " (Limit Reached)" : ""
                      }`}
                    size="small"
                    onClick={() => setActiveCategoryTab("Coding")}
                    sx={{
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      bgcolor: isCodingLimitReached
                        ? "#fef3f2"
                        : activeCategoryTab === "Coding"
                          ? "#eff8ff"
                          : "#f2f4f7",
                      color: isCodingLimitReached
                        ? "#d92d20"
                        : activeCategoryTab === "Coding"
                          ? "#175cd3"
                          : "#344054",
                      border: isCodingLimitReached
                        ? "1.5px solid #fda29b"
                        : activeCategoryTab === "Coding"
                          ? "1.5px solid #b2ddff"
                          : "1px solid #eaecf0",
                      boxShadow: isCodingLimitReached
                        ? "0 0 0 2px rgba(240, 68, 56, 0.15)"
                        : "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isCodingLimitReached
                          ? "#fee4e2"
                          : activeCategoryTab === "Coding"
                            ? "#d1e9ff"
                            : "#e4e7ec",
                      },
                    }}
                  />
                )}
              </Box>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <MenuItem value="All Question Type">All Question Type</MenuItem>
                  <MenuItem value="Single choice">Single choice</MenuItem>
                  <MenuItem value="Multiple choice">Multiple choice</MenuItem>
                  <MenuItem value="True/False">True/False</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 110 }}>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <MenuItem value="All Levels">All Levels</MenuItem>
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {isCurrentCategoryLimitReached ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#fef3f2",
                border: "1px solid #fee4e2",
                borderRadius: "8px",
                px: 2,
                py: 1,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "12.5px", color: "#b42318", fontWeight: 600 }}>
                Limit reached: You have selected {currentCategorySelectedCount} of{" "}
                {currentCategoryLimit} {activeCategoryTab} questions. Remaining questions are disabled.
              </Typography>
              <Chip
                label="Limit Reached"
                size="small"
                sx={{
                  bgcolor: "#fee4e2",
                  color: "#b42318",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: 22,
                  border: "1px solid #fda29b",
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#f8fafc",
                border: "1px solid #eaecf0",
                borderRadius: "8px",
                px: 2,
                py: 0.8,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "12.5px", color: "#475467", fontWeight: 500 }}>
                Selected <strong>{currentCategorySelectedCount}</strong> of{" "}
                <strong>{currentCategoryLimit}</strong> required {activeCategoryTab} questions.
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#667085" }}>
                {Math.max(0, currentCategoryLimit - currentCategorySelectedCount)} more needed
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              border: "1px solid #eaecf0",
              borderRadius: "10px",
              overflow: "hidden",
              bgcolor: "#ffffff",
              mb: 3,
            }}
          >
            {isFetchingMcq || isFetchingLsrw || isFetchingCoding ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} sx={{ color: "#1570ef" }} />
              </Box>
            ) : currentQuestionsList.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "#667085" }}>
                <Typography variant="body2">No questions found in this category.</Typography>
              </Box>
            ) : (
              paginatedQuestionsList.map((q: any) => {
                const isSelected = isQuestionSelected(q.id);
                const isDisabled = isCurrentCategoryLimitReached && !isSelected;
                const isEasy = q.difficulty?.toLowerCase() === "easy";
                const isMedium = q.difficulty?.toLowerCase() === "medium";

                return (
                  <Box
                    key={q.id}
                    onClick={() => {
                      if (!isDisabled) {
                        toggleQuestionSelection(q.id);
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid #f2f4f7",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      bgcolor: isSelected ? "#f8faff" : isDisabled ? "#fcfcfd" : "#ffffff",
                      opacity: isDisabled ? 0.6 : 1,
                      transition: "background-color 0.15s, opacity 0.15s",
                      "&:hover": {
                        bgcolor: isDisabled ? "#fcfcfd" : "#f9fafb",
                      },
                      "&:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, pr: 2 }}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => {
                          if (!isDisabled) {
                            toggleQuestionSelection(q.id);
                          }
                        }}
                        sx={{
                          p: 0,
                          mt: 0.3,
                          color: isDisabled ? "#e4e7ec" : "#d0d5dd",
                          "&.Mui-checked": { color: "#1570ef" },
                          "&.Mui-disabled": { color: "#e4e7ec" },
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isDisabled ? "#98a2b3" : "#101828",
                            fontSize: "13.5px",
                            lineHeight: 1.4,
                          }}
                        >
                          {q.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDisabled ? "#98a2b3" : "#667085",
                            fontSize: "12px",
                            mt: 0.3,
                          }}
                        >
                          {q.subtitle}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Chip
                        label={q.difficulty}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "11.5px",
                          fontWeight: 600,
                          bgcolor: isEasy ? "#ecfdf3" : isMedium ? "#fffaeb" : "#fef3f2",
                          color: isEasy ? "#16a34a" : isMedium ? "#b54708" : "#d92d20",
                          borderRadius: "16px",
                          opacity: isDisabled ? 0.7 : 1,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDisabled ? "#98a2b3" : "#667085",
                          fontWeight: 600,
                          minWidth: 50,
                          textAlign: "right",
                        }}
                      >
                        {q.marks} marks
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}

            <Pagination
              count={currentQuestionsList.length}
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
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button variant="text" size="small" onClick={onCancel} sx={{ color: "#667085" }}>
              Cancel
            </Button>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button variant="outlined" size="small" onClick={() => setStep(1)}>
                &lt;&lt; Back
              </Button>
              <Button variant="contained" size="small" onClick={handleStep2Next} sx={{ bgcolor: "#1570ef" }}>
                Next &gt;&gt;
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {step === 3 && (
        <Box sx={{ maxWidth: 780 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#101828", mb: 3 }}>
            Test Settings &amp; Rules
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}>
                  Duration (minutes) <span style={{ color: "#d92d20" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  placeholder="60"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}>
                  Negative marks per wrong answer
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(Number(e.target.value))}
                  placeholder="0.25"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}>
                  Attempts allowed
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={attemptsAllowed}
                  onChange={(e) => setAttemptsAllowed(Number(e.target.value))}
                  placeholder="1"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
                  Randomize question order
                </Typography>
                <Typography variant="caption" sx={{ color: "#667085" }}>
                  Each student sees questions in a different order.
                </Typography>
              </Box>
              <Switch
                checked={randomizeQuestionOrder}
                onChange={(e) => setRandomizeQuestionOrder(e.target.checked)}
                size="small"
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
                  Shuffle answer options
                </Typography>
              </Box>
              <Switch
                checked={shuffleAnswerOptions}
                onChange={(e) => setShuffleAnswerOptions(e.target.checked)}
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#344054", mb: 0.8, display: "block" }}>
                Result visibility
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={resultVisibility}
                  onChange={(e) => setResultVisibility(e.target.value)}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <MenuItem value="After the test window closes">After the test window closes</MenuItem>
                  <MenuItem value="Immediately after submission">Immediately after submission</MenuItem>
                  <MenuItem value="Never">Never</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#344054" }}>
                  Show correct answers with results
                </Typography>
                <Typography variant="caption" sx={{ color: "#667085" }}>
                  Off keeps questions reusable for future tests.
                </Typography>
              </Box>
              <Switch
                checked={showCorrectAnswers}
                onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                size="small"
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4 }}>
              <Button variant="text" size="small" onClick={onCancel} sx={{ color: "#667085" }}>
                Cancel
              </Button>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button variant="outlined" size="small" onClick={() => setStep(2)} disabled={isSubmitting}>
                  &lt;&lt; Back
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleFinishCreate}
                  disabled={isSubmitting}
                  sx={{ bgcolor: "#1570ef", px: 3 }}
                >
                  {isSubmitting ? "Saving..." : "Create & Assign >>"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default AssessmentCreationWizard;
