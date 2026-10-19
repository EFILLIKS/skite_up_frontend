import { useState, useMemo, useEffect } from "react";
import useDebounce from "./useDebounce";
import {
  useGetQuestionBankListQuery,
  useCreateQuestionMutation,
  useCreateBatchQuestionsMutation,
  useUploadQuestionsFileMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetSkillsTreeQuery,
  useGetQuestionBankLimitsQuery,
} from "../features/assessment/QuestionBankApi";
import {
  createEmptyQuestion,
  getQuestionTotalMarks,
  usesPerAnswerMarks,
  singleQuestionSchema,
  questionCountSchema,
  type QuestionFormData,
} from "../utils/QuestionBankSchema";
import {
  parseImportFile,
  toQuestionFormData,
  type ParsedQuestionRow,
} from "../utils/questionBankImportUtils";
import type { SnackbarState } from "../types/Snackbar.types";
import type {
  QuestionBankItem,
  QuestionBankRequestDto,
  DomainCategoryData,
  SkillTreeNode,
  TopicTreeNode,
} from "../types/QuestionBank.types";

export type CategoryTab = "MCQ" | "LSRW" | "Coding" | "Cognitive Games" | "Draft";

export const useQuestionBank = () => {
  const [activeTab, setActiveTab] = useState<CategoryTab>("MCQ");

  const [localQuestions, setLocalQuestions] = useState<QuestionBankItem[]>(() => {
    try {
      const saved = localStorage.getItem("skiteup_local_mcq_questions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("skiteup_local_mcq_questions", JSON.stringify(localQuestions));
    } catch {
    }
  }, [localQuestions]);

  const [createSingleQuestionMutation] = useCreateQuestionMutation();
  const [createBatchQuestionsMutation] = useCreateBatchQuestionsMutation();
  const [uploadQuestionsFileMutation] = useUploadQuestionsFileMutation();
  const [updateQuestionMutation] = useUpdateQuestionMutation();
  const [deleteQuestionMutation] = useDeleteQuestionMutation();

  const { data: skillsTreeApiData } = useGetSkillsTreeQuery();

  const { data: limitsApiData } = useGetQuestionBankLimitsQuery();

  const [viewingQuestion, setViewingQuestion] = useState<QuestionBankItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [selectedSkill, setSelectedSkill] = useState<string>("All skills");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({
    "Quantitative Ability": true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const {
    data: apiData,
    isFetching,
    refetch,
  } = useGetQuestionBankListQuery(
    {
      category: activeTab,
      skill: selectedSkill !== "All skills" ? selectedSkill : undefined,
      topic: selectedTopic !== "All" ? selectedTopic : undefined,
      type: selectedType !== "All Types" ? selectedType : undefined,
      difficulty: selectedLevel !== "All Levels" ? selectedLevel : undefined,
      status: selectedStatus !== "All Status" ? selectedStatus : undefined,
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      page,
      size: rowsPerPage,
      sortBy: "createdAt",
      direction: "DESC",
    },
    { refetchOnMountOrArgChange: true }
  );

  const rawSkillsTree = useMemo(() => {
    if (apiData?.data?.skills && apiData.data.skills.length > 0) {
      return apiData.data.skills;
    }
    if (apiData?.data?.skillsTree && apiData.data.skillsTree.length > 0) {
      return apiData.data.skillsTree;
    }
    if (skillsTreeApiData?.data && skillsTreeApiData.data.length > 0) {
      return skillsTreeApiData.data;
    }
    return [];
  }, [apiData, skillsTreeApiData]);

  const skillsTree: SkillTreeNode[] = useMemo(() => {
    if (!rawSkillsTree || rawSkillsTree.length === 0) {
      return [
        {
          skill: "Quantitative Ability",
          name: "Quantitative Ability",
          count: 0,
          topics: [
            { topic: "Percentages", count: 0 },
            { topic: "Profit & Loss", count: 0 },
            { topic: "Time & Work", count: 0 },
            { topic: "Ratio", count: 0 },
            { topic: "Probability", count: 0 },
          ],
        },
        {
          skill: "Logical Reasoning",
          name: "Logical Reasoning",
          count: 0,
          topics: [
            { topic: "Coding Decoding", count: 0 },
            { topic: "Syllogism", count: 0 },
            { topic: "Blood Relations", count: 0 },
            { topic: "Series", count: 0 },
          ],
        },
        {
          skill: "Verbal Ability",
          name: "Verbal Ability",
          count: 0,
          topics: [
            { topic: "Vocabulary", count: 0 },
            { topic: "Reading Comprehension", count: 0 },
            { topic: "Sentence Correction", count: 0 },
          ],
        },
        {
          skill: "Technical",
          name: "Technical",
          count: 0,
          topics: [
            { topic: "Data Structures", count: 0 },
            { topic: "Algorithms", count: 0 },
            { topic: "SQL", count: 0 },
            { topic: "Core Java", count: 0 },
          ],
        },
      ];
    }

    return rawSkillsTree.map((s: any) => {
      const skillName = s.skill || s.name || "";
      const topics = (s.topics || []).map((t: any) => {
        if (typeof t === "string") return { topic: t, count: 0 };
        return {
          topic: t.topic || t.name || "",
          count: t.count ?? 0,
        };
      });
      return {
        skill: skillName,
        name: skillName,
        count: s.count ?? 0,
        topics,
      };
    });
  }, [rawSkillsTree]);

  const categories: DomainCategoryData[] = useMemo(() => {
    if (!skillsTree || skillsTree.length === 0) return [];
    return [
      {
        domainName: "MCQ & Aptitude",
        totalQuestionsCount: localQuestions.length,
        skills: skillsTree.map((s) => ({
          skillName: s.skill || s.name || "",
          count:
            localQuestions.filter((q) => (q.skill ?? q.skillName) === (s.skill || s.name)).length ||
            s.count ||
            0,
          topics: (s.topics || []).map((t: any) => (typeof t === "string" ? t : t.topic)),
        })),
      },
    ];
  }, [skillsTree, localQuestions]);

  const allQuestions = useMemo(() => {
    const rawData = apiData?.data;
    const apiItems: QuestionBankItem[] = Array.isArray(rawData?.content)
      ? rawData.content
      : Array.isArray(rawData)
        ? rawData
        : Array.isArray(apiData)
          ? (apiData as any)
          : [];

    if (localQuestions.length === 0) return apiItems;
    if (apiItems.length === 0) return localQuestions;
    const existingIds = new Set(apiItems.map((q) => q.id));
    const uniqueLocals = localQuestions.filter((q) => !existingIds.has(q.id));
    return [...uniqueLocals, ...apiItems];
  }, [apiData, localQuestions]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const currentCategory = q.category ?? "MCQ";
      if (activeTab === "Draft") {
        if ((q.status ?? "").toUpperCase() !== "DRAFT") return false;
      } else if (activeTab === "MCQ") {
        if (currentCategory !== "MCQ" && (q.status ?? "").toUpperCase() === "DRAFT") return false;
      } else {
        if (currentCategory.toUpperCase() !== activeTab.toUpperCase()) return false;
      }

      const qSkill = q.skill ?? q.skillName;
      if (selectedSkill !== "All skills" && qSkill !== selectedSkill) {
        return false;
      }

      const qTopic = q.topic ?? q.topicName;
      if (selectedTopic !== "All" && qTopic !== selectedTopic) {
        return false;
      }

      const qType = q.questionType ?? (q.subtype === "MULTIPLE_CHOICE" ? "Multiple choice" : "Single choice");
      if (selectedType !== "All Types") {
        if (qType.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }
      }

      if (selectedLevel !== "All Levels") {
        if ((q.difficulty ?? "").toUpperCase() !== selectedLevel.toUpperCase()) {
          return false;
        }
      }

      if (selectedStatus !== "All Status") {
        if ((q.status ?? "").toUpperCase() !== selectedStatus.toUpperCase()) {
          return false;
        }
      }

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const matchQuestion = (q.questionText ?? "").toLowerCase().includes(query);
        const matchSkill = (qSkill ?? "").toLowerCase().includes(query);
        const matchTopic = (qTopic ?? "").toLowerCase().includes(query);
        const matchCreatedBy = (q.createdBy ?? q.createdByName ?? "").toLowerCase().includes(query);
        if (!matchQuestion && !matchSkill && !matchTopic && !matchCreatedBy) {
          return false;
        }
      }

      return true;
    });
  }, [
    allQuestions,
    activeTab,
    selectedSkill,
    selectedTopic,
    selectedType,
    selectedLevel,
    selectedStatus,
    debouncedSearch,
  ]);

  const mcqLimit = apiData?.data?.mcqLimit ?? limitsApiData?.data?.mcqLimit ?? 5000;
  const usedCount = apiData?.data?.mcqCount ?? limitsApiData?.data?.usedCount ?? localQuestions.length;
  const allSkillsCount =
    apiData?.data?.allSkillsCount ??
    apiData?.data?.totalElements ??
    apiData?.data?.totalQuestions ??
    localQuestions.length;

  const isServerPaginated = useMemo(() => {
    const rawData = apiData?.data;
    return Boolean(
      typeof rawData?.totalElements === "number" &&
      Array.isArray(rawData?.content) &&
      rawData.content.length <= rowsPerPage &&
      localQuestions.length === 0
    );
  }, [apiData, rowsPerPage, localQuestions.length]);

  const totalCount = useMemo(() => {
    if (isServerPaginated && typeof apiData?.data?.totalElements === "number") {
      return apiData.data.totalElements;
    }
    return filteredQuestions.length;
  }, [isServerPaginated, apiData, filteredQuestions.length]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / rowsPerPage));
  }, [totalCount, rowsPerPage]);

  const paginatedQuestions = useMemo(() => {
    if (isServerPaginated && apiData?.data?.content) {
      return apiData.data.content;
    }
    const start = page * rowsPerPage;
    return filteredQuestions.slice(start, start + rowsPerPage);
  }, [isServerPaginated, apiData, filteredQuestions, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [selectedSkill, selectedTopic, selectedType, selectedLevel, selectedStatus, debouncedSearch, activeTab]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [totalCount, rowsPerPage, page]);

  const toggleSkillAccordion = (skillName: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillName]: !prev[skillName],
    }));
  };

  const handleSelectSkill = (skillName: string) => {
    setSelectedSkill(skillName);
    setSelectedTopic("All");
    setPage(0);
  };

  const handleSelectTopic = (skillName: string, topicName: string) => {
    setSelectedSkill(skillName);
    setSelectedTopic(topicName);
    setPage(0);
  };

  const handleOpenViewDetail = (questionId: string) => {
    const found = allQuestions.find((q) => q.id === questionId) || null;
    setViewingQuestion(found);
    setIsDetailDialogOpen(true);
  };

  const handleCloseViewDetail = () => {
    setIsDetailDialogOpen(false);
    setViewingQuestion(null);
  };

  const handleOpenEdit = (question: QuestionBankItem) => {
    const questionType =
      question.questionType ||
      (question.subtype === "MULTIPLE_CHOICE" ? "Multiple choice" : "Single choice");
    const options = (question.options || []).map((opt, idx) => ({
      id: opt.id || `opt-${idx}`,
      optionKey: opt.optionKey || String.fromCharCode(65 + idx),
      optionText: opt.optionText,
      isCorrect: opt.isCorrect,
    }));
    const mapped: QuestionFormData = {
      questionNumber: 1,
      questionType,
      questionText: question.questionText,
      explanation: question.explanation || "",
      skill: question.skill || question.skillName || "Quantitative Ability",
      topic: question.topic || question.topicName || "Time & Work",
      difficulty: (question.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      marks: usesPerAnswerMarks(questionType)
        ? (question.marks || 2) / Math.max(1, options.filter((option) => option.isCorrect).length)
        : question.marks || 2,
      negativeMarks: Math.abs(question.negativeMarks || 0.5),
      status: (question.status as "Published" | "Draft") || "Published",
      options,
    };

    setIsEditMode(true);
    setEditingQuestionId(question.id);
    setQuestionList([mapped]);
    setCurrentQuestionIndex(0);
    setFormValidationErrors({});
    setIsQuestionFormDialogOpen(true);
  };

  const handleDuplicateQuestion = async (question: QuestionBankItem) => {
    const duplicatedDto: QuestionBankRequestDto = {
      category: question.category || "MCQ",
      questionType: question.questionType || "Single choice",
      skill: question.skill || question.skillName || "Quantitative Ability",
      topic: question.topic || question.topicName || "Time & Work",
      difficulty: question.difficulty || "Easy",
      questionText: `${question.questionText} (Copy)`,
      marks: question.marks || 2,
      negativeMarks: question.negativeMarks || -0.5,
      explanation: question.explanation || "",
      status: "Draft",
      options: (question.options || []).map((opt) => ({
        optionKey: opt.optionKey,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
      })),
    };

    try {
      const res = await createSingleQuestionMutation(duplicatedDto).unwrap();
      if (res?.data) {
        setLocalQuestions((prev) => [res.data, ...prev]);
      } else {
        throw new Error("No data");
      }
    } catch {
      const copyItem: QuestionBankItem = {
        ...question,
        id: `c1f76d4e-copy-${Date.now()}`,
        questionText: `${question.questionText} (Copy)`,
        status: "Draft",
        usedInTests: 0,
        usedInTestsDisplay: "Used in 0 tests",
        createdAt: new Date().toISOString(),
      };
      setLocalQuestions((prev) => [copyItem, ...prev]);
    }

    showSnackbar("Question duplicated into draft successfully", "success");
    void refetch();
  };

  const [isCountDialogOpen, setIsCountDialogOpen] = useState(false);
  const [questionCountInput, setQuestionCountInput] = useState<number>(1);
  const [countInputError, setCountInputError] = useState<string>("");

  const handleOpenCountDialog = () => {
    setIsEditMode(false);
    setEditingQuestionId(null);
    setQuestionCountInput(1);
    setCountInputError("");
    setIsCountDialogOpen(true);
  };

  const handleCloseCountDialog = () => {
    setIsCountDialogOpen(false);
    setCountInputError("");
  };

  const [isQuestionFormDialogOpen, setIsQuestionFormDialogOpen] = useState(false);
  const [questionList, setQuestionList] = useState<QuestionFormData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});
  const [isSubmittingQuestions, setIsSubmittingQuestions] = useState(false);

  const handleStartQuestionCreation = async () => {
    try {
      await questionCountSchema.validate({ count: questionCountInput });
      setCountInputError("");

      const defaultSkill =
        selectedSkill !== "All skills"
          ? selectedSkill
          : skillsTree[0]?.skill || skillsTree[0]?.name || "Quantitative Ability";

      const foundSkill = skillsTree.find((s) => (s.skill || s.name) === defaultSkill) || skillsTree[0];
      const firstTopic =
        foundSkill?.topics?.[0]
          ? typeof foundSkill.topics[0] === "string"
            ? foundSkill.topics[0]
            : (foundSkill.topics[0] as TopicTreeNode).topic
          : "Percentages";

      const defaultTopic = selectedTopic !== "All" ? selectedTopic : firstTopic;

      const initialBatch: QuestionFormData[] = Array.from({ length: questionCountInput }).map((_, i) =>
        createEmptyQuestion(i + 1, defaultSkill, defaultTopic)
      );

      setQuestionList(initialBatch);
      setCurrentQuestionIndex(0);
      setFormValidationErrors({});
      setIsCountDialogOpen(false);
      setIsQuestionFormDialogOpen(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setCountInputError((err as { message: string }).message);
      } else {
        setCountInputError("Please enter a valid number of questions");
      }
    }
  };

  const currentQuestion = useMemo(() => {
    return questionList[currentQuestionIndex] ?? createEmptyQuestion(1);
  }, [questionList, currentQuestionIndex]);

  const updateCurrentQuestion = (fields: Partial<QuestionFormData>) => {
    setQuestionList((prev) => {
      const copy = [...prev];
      if (copy[currentQuestionIndex]) {
        copy[currentQuestionIndex] = {
          ...copy[currentQuestionIndex],
          ...fields,
        };
      }
      return copy;
    });

    if (Object.keys(fields).length > 0) {
      setFormValidationErrors((prev) => {
        const nextErrors = { ...prev };
        Object.keys(fields).forEach((key) => {
          delete nextErrors[key];
        });
        return nextErrors;
      });
    }
  };

  const addOptionToCurrentQuestion = () => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const currentOpts = currentQuestion.options || [];
    const nextKey = letters[currentOpts.length] || `Opt${currentOpts.length + 1}`;
    const qType = (currentQuestion.questionType || "").toLowerCase();
    const isBlankOrDrag = qType.includes("blank") || qType.includes("drag");

    const newOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      optionKey: nextKey,
      optionText: "",
      isCorrect: isBlankOrDrag ? true : false,
    };

    updateCurrentQuestion({
      options: [...currentOpts, newOption],
    });
  };

  const removeOptionFromCurrentQuestion = (optionId: string) => {
    const qType = (currentQuestion.questionType || "").toLowerCase();
    const isBlankOrDrag = qType.includes("blank") || qType.includes("drag");
    const minOptions = isBlankOrDrag ? 1 : 2;

    if (currentQuestion.options.length <= minOptions) {
      showSnackbar(
        isBlankOrDrag
          ? "At least 1 item is required"
          : "At least 2 options are required for an MCQ question",
        "warning"
      );
      return;
    }

    const updated = currentQuestion.options.filter((o) => o.id !== optionId);
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const rekeyed = updated.map((opt, idx) => ({
      ...opt,
      optionKey: letters[idx] || `Opt${idx + 1}`,
    }));

    if (!rekeyed.some((o) => o.isCorrect) && rekeyed.length > 0) {
      rekeyed[0].isCorrect = true;
    }

    updateCurrentQuestion({ options: rekeyed });
  };

  const toggleCorrectOption = (optionId: string) => {
    const isMultiple = currentQuestion.questionType.toLowerCase().includes("multiple");

    const updated = currentQuestion.options.map((opt) => {
      if (isMultiple) {
        return opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt;
      }
      return { ...opt, isCorrect: opt.id === optionId };
    });

    updateCurrentQuestion({ options: updated });
    setFormValidationErrors((prev) => {
      const next = { ...prev };
      delete next.options;
      return next;
    });
  };

  const validateQuestion = async (question: QuestionFormData): Promise<boolean> => {
    try {
      await singleQuestionSchema.validate(question, { abortEarly: false });
      setFormValidationErrors({});
      return true;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "inner" in err) {
        const yupErr = err as { inner: Array<{ path?: string; message: string }> };
        const errorsMap: Record<string, string> = {};
        yupErr.inner.forEach((validationError) => {
          if (validationError.path) {
            errorsMap[validationError.path] = validationError.message;
          }
        });
        setFormValidationErrors(errorsMap);
      }
      return false;
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setFormValidationErrors({});
    }
  };

  const handleNextQuestion = async () => {
    const isValid = await validateQuestion(currentQuestion);
    if (!isValid) {
      showSnackbar("Please fill in all required fields before proceeding", "error");
      return;
    }

    if (currentQuestionIndex < questionList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setFormValidationErrors({});
    }
  };

  const handleJumpToQuestion = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < questionList.length) {
      setCurrentQuestionIndex(targetIndex);
      setFormValidationErrors({});
    }
  };

  const handlePublishQuestions = async () => {
    const isCurrentValid = await validateQuestion(currentQuestion);
    if (!isCurrentValid) {
      showSnackbar("Please complete the required fields for this question", "error");
      return;
    }

    for (let i = 0; i < questionList.length; i++) {
      try {
        await singleQuestionSchema.validate(questionList[i], { abortEarly: false });
      } catch {
        setCurrentQuestionIndex(i);
        await validateQuestion(questionList[i]);
        showSnackbar(`Question ${i + 1} has incomplete or invalid fields. Please review.`, "error");
        return;
      }
    }

    setIsSubmittingQuestions(true);

    try {
      const requestDtos: QuestionBankRequestDto[] = questionList.map((q) => ({
        category: "MCQ",
        questionType: q.questionType,
        skill: q.skill,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        marks: getQuestionTotalMarks(q),
        negativeMarks: q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks,
        explanation: q.explanation || "",
        status: "Published",
        options: q.options.map((opt) => ({
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      }));

      if (isEditMode && editingQuestionId) {
        try {
          await updateQuestionMutation({
            id: editingQuestionId,
            body: requestDtos[0],
          }).unwrap();
        } catch {
        }

        setLocalQuestions((prev) =>
          prev.map((q) => {
            if (q.id === editingQuestionId) {
              return {
                ...q,
                ...requestDtos[0],
                marksDisplay: `${requestDtos[0].marks} / ${requestDtos[0].negativeMarks}`,
                options: currentQuestion.options.map((opt) => ({
                  id: opt.id,
                  optionKey: opt.optionKey,
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect,
                })),
              };
            }
            return q;
          })
        );

        setIsQuestionFormDialogOpen(false);
        setIsEditMode(false);
        setEditingQuestionId(null);
        setQuestionList([]);
        showSnackbar("Question updated successfully", "success");
        void refetch();
        return;
      }

      let newItems: QuestionBankItem[] = [];

      try {
        if (requestDtos.length === 1) {
          const res = await createSingleQuestionMutation(requestDtos[0]).unwrap();
          if (res?.data) {
            newItems = [res.data];
          }
        } else {
          const res = await createBatchQuestionsMutation(requestDtos).unwrap();
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            newItems = res.data;
          }
        }
      } catch {
      }

      if (newItems.length === 0) {
        newItems = questionList.map((q, idx) => ({
          id: `c1f76d4e-${Date.now()}-${idx}`,
          category: "MCQ",
          questionType: q.questionType,
          skill: q.skill,
          topic: q.topic,
          difficulty: q.difficulty,
          questionText: q.questionText,
          marks: getQuestionTotalMarks(q),
          negativeMarks: q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks,
          marksDisplay: `${getQuestionTotalMarks(q)} / ${q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks}`,
          explanation: q.explanation,
          status: "Published",
          usedInTests: 0,
          usedInTestsDisplay: "Used in 0 tests",
          createdBy: localStorage.getItem("username") || "Teacher",
          createdByName: localStorage.getItem("username") || "Teacher",
          createdAt: new Date().toISOString(),
          options: q.options.map((opt) => ({
            id: opt.id,
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        }));
      }

      setLocalQuestions((prev) => [...newItems, ...prev]);

      setIsQuestionFormDialogOpen(false);
      setQuestionList([]);
      setCurrentQuestionIndex(0);
      showSnackbar(
        `Question added to question bank successfully (${newItems.length} ${
          newItems.length === 1 ? "question" : "questions"
        })`,
        "success"
      );
      void refetch();
    } catch {
      showSnackbar("An error occurred while publishing questions. Please try again.", "error");
    } finally {
      setIsSubmittingQuestions(false);
    }
  };

  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [parsedImportRows, setParsedImportRows] = useState<ParsedQuestionRow[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleOpenBulkImport = () => {
    setSelectedImportFile(null);
    setParsedImportRows([]);
    setIsBulkImportDialogOpen(true);
  };

  const handleCloseBulkImport = () => {
    setIsBulkImportDialogOpen(false);
    setSelectedImportFile(null);
    setParsedImportRows([]);
  };

  const handleFileChange = async (file: File) => {
    setSelectedImportFile(file);
    setIsParsingFile(true);

    try {
      const converted = await parseImportFile(file);

      if (converted.length === 0) {
        showSnackbar("No valid questions found in the uploaded file", "warning");
      } else {
        const validCount = converted.filter((c) => c.isValid).length;
        const invalidCount = converted.length - validCount;
        if (validCount === 0) {
          showSnackbar(
            `Parsed ${converted.length} rows, but all have validation issues. Please check Question text and Options.`,
            "warning"
          );
        } else {
          showSnackbar(
            `Parsed ${converted.length} questions (${validCount} valid, ${invalidCount} invalid)`,
            "success"
          );
        }
      }

      setParsedImportRows(converted);
    } catch (err: unknown) {
      console.error("File parse error:", err);
      showSnackbar("Failed to parse file. Please verify Excel / CSV / XML format.", "error");
      setParsedImportRows([]);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleExecuteBulkImport = async () => {
    const validRows = parsedImportRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showSnackbar("There are no valid questions to import", "error");
      return;
    }

    setIsImporting(true);

    try {
      if (selectedImportFile) {
        const formData = new FormData();
        formData.append("file", selectedImportFile);
        const instId = localStorage.getItem("institutionId");
        if (instId && instId !== "undefined" && instId !== "null") {
          formData.append("institutionId", instId);
        }

        try {
          const apiRes = await uploadQuestionsFileMutation(formData).unwrap();
          if (apiRes?.statusCode === 200 || apiRes?.data) {
            const uploadedQuestions =
              apiRes.data?.questions && apiRes.data.questions.length > 0
                ? apiRes.data.questions
                : validRows.map((r, i) => {
                    const q = toQuestionFormData(r, i);
                    return {
                      id: `c1f76d4e-bulk-${Date.now()}-${i}`,
                      category: "MCQ",
                      questionType: q.questionType,
                      skill: q.skill,
                      topic: q.topic,
                      difficulty: q.difficulty,
                      questionText: q.questionText,
                      marks: q.marks,
                      negativeMarks: q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks,
                      marksDisplay: `${q.marks} / ${q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks}`,
                      explanation: q.explanation,
                      status: "Published",
                      usedInTests: 0,
                      usedInTestsDisplay: "Used in 0 tests",
                      createdBy: localStorage.getItem("username") || "Teacher",
                      createdByName: localStorage.getItem("username") || "Teacher",
                      createdAt: new Date().toISOString(),
                      options: q.options.map((opt) => ({
                        id: opt.id,
                        optionKey: opt.optionKey,
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect,
                      })),
                    };
                  });

            setLocalQuestions((prev) => [...uploadedQuestions, ...prev]);
            setIsBulkImportDialogOpen(false);
            setSelectedImportFile(null);
            setParsedImportRows([]);
            showSnackbar(
              apiRes.message ||
                `Processed ${apiRes.data?.totalProcessed || validRows.length} questions. Imported: ${
                  apiRes.data?.successCount || validRows.length
                }, Failed: ${apiRes.data?.failedCount || 0}`,
              "success"
            );
            void refetch();
            setIsImporting(false);
            return;
          }
        } catch {
          try {
            const batchDtos: QuestionBankRequestDto[] = validRows.map((r, i) => {
              const q = toQuestionFormData(r, i);
              return {
                category: "MCQ",
                questionType: q.questionType,
                skill: q.skill,
                topic: q.topic,
                difficulty: q.difficulty,
                questionText: q.questionText,
                marks: q.marks,
                negativeMarks: q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks,
                explanation: q.explanation,
                status: "Published",
                options: q.options.map((opt) => ({
                  optionKey: opt.optionKey,
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect,
                })),
              };
            });
            const batchRes = await createBatchQuestionsMutation(batchDtos).unwrap();
            if (batchRes?.statusCode === 200 || batchRes?.data) {
              setIsBulkImportDialogOpen(false);
              setSelectedImportFile(null);
              setParsedImportRows([]);
              showSnackbar(
                `Processed ${validRows.length} questions. Successfully imported into Question Bank!`,
                "success"
              );
              void refetch();
              setIsImporting(false);
              return;
            }
          } catch {
          }
        }
      }

      const convertedQuestions: QuestionFormData[] = validRows.map((r, i) => toQuestionFormData(r, i));

      const newItems: QuestionBankItem[] = convertedQuestions.map((q, idx) => ({
        id: `c1f76d4e-bulk-${Date.now()}-${idx}`,
        category: "MCQ",
        questionType: q.questionType,
        skill: q.skill,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        marks: q.marks,
        negativeMarks: q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks,
        marksDisplay: `${q.marks} / ${q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : q.negativeMarks}`,
        explanation: q.explanation,
        status: "Published",
        usedInTests: 0,
        usedInTestsDisplay: "Used in 0 tests",
        createdBy: localStorage.getItem("username") || "Teacher",
        createdByName: localStorage.getItem("username") || "Teacher",
        createdAt: new Date().toISOString(),
        options: q.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      }));

      setLocalQuestions((prev) => [...newItems, ...prev]);
      setIsBulkImportDialogOpen(false);
      setSelectedImportFile(null);
      setParsedImportRows([]);
      showSnackbar(
        `Processed ${parsedImportRows.length} questions. Imported: ${validRows.length}, Failed: ${
          parsedImportRows.length - validRows.length
        }`,
        "success"
      );
      void refetch();
    } catch {
      showSnackbar("An error occurred during import. Please try again.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionMutation(id).unwrap();
    } catch {
    }
    setLocalQuestions((prev) => prev.filter((q) => q.id !== id));
    showSnackbar("Question deleted successfully", "info");
    void refetch();
  };

  return {
    activeTab,
    setActiveTab,

    categories,
    skillsTree,
    mcqLimit,
    usedCount,
    selectedSkill,
    setSelectedSkill,
    selectedTopic,
    setSelectedTopic,
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
    totalPages,
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
    editingQuestionId,
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
  };
};

export default useQuestionBank;
