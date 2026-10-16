import { useState, useMemo, useEffect, useCallback } from "react";
import useDebounce from "./useDebounce";
import type {
  CodingProblemItem,
  CodingFormData,
  CodingFormValidationErrors,
  CodingDifficulty,
  CodingStatus,
  CodingExampleItem,
  CodingTestCaseItem,
} from "../types/Coding.types";
import {
  createDefaultCodingFormData,
  createEmptyExample,
  createEmptyTestCase,
  codingProblemSchema,
} from "../utils/codingSchema";
import type { SnackbarState } from "../types/Snackbar.types";
import {
  useGetCodingProblemsQuery,
  useCreateCodingProblemMutation,
  useUpdateCodingProblemMutation,
  useDeleteCodingProblemMutation,
  useUploadCodingImageMutation,
  useGetQuestionBankLimitsQuery,
} from "../features/assessment/QuestionBankApi";

export const useCodingQuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const {
    data: apiProblemsData,
    isFetching: isApiFetching,
    refetch,
  } = useGetCodingProblemsQuery({
    page,
    size: rowsPerPage,
    search: debouncedSearch.trim() || undefined,
    difficulty: selectedLevel !== "All Levels" ? selectedLevel : "All Levels",
    status: selectedStatus !== "All Status" ? selectedStatus : "All Status",
  });

  const { data: limitsApiData } = useGetQuestionBankLimitsQuery();

  const [uploadImageMutation, { isLoading: isUploadingImage }] = useUploadCodingImageMutation();
  const [createCodingMutation] = useCreateCodingProblemMutation();
  const [updateCodingMutation] = useUpdateCodingProblemMutation();
  const [deleteCodingMutation] = useDeleteCodingProblemMutation();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const problemsList: CodingProblemItem[] = useMemo(() => {
    const apiContent = apiProblemsData?.data?.content || apiProblemsData?.data;
    if (!apiContent || !Array.isArray(apiContent)) return [];

    return apiContent.map((item: any) => ({
      id: item.id || `cp-${Math.random()}`,
      title: item.problemTitle || item.title || "Untitled Problem",
      subtitle:
        item.problemSubtitle || item.subtitle || `SKITEUP global · ${item.marks || 50} marks`,
      difficulty: (item.difficulty || "Easy") as CodingDifficulty,
      languagesCount:
        item.languagesCount ?? item.supportedLanguages?.length ?? 4,
      testCasesCount:
        item.totalTestCasesCount ?? item.testCasesCount ?? item.testCases?.length ?? 12,
      limitsDisplay: item.limitsDisplay ?? "10",
      keywordsCount: item.keywords ? Number(item.keywords) || 100 : item.keywordsCount || 100,
      status: (item.status === "Published" ? "Published" : "Un-publish") as CodingStatus,
      problemStatement: item.problemStatement || "",
      inputFormat: item.inputFormat || "",
      outputFormat: item.outputFormat || "",
      constraints: item.constraints || "",
      examples: item.examples || [],
      sampleTestCases: item.sampleTestCases || item.testCases || [],
      questionType: item.questionType || "Coding",
      timeLimitMs: item.timeLimitMs || 1000,
      memoryLimitMb: item.memoryLimitMb || 257,
      marks: item.marks || 50,
      hiddenTestsCount: item.hiddenTests ?? item.hiddenTestCasesCount ?? 10,
      supportedLanguages:
        item.supportedLanguages || ["Python 3", "Java 17", "C++ 17", "JavaScript"],
      imageUrl: item.imageUrl || "",
      createdAt: item.createdAt,
      createdBy: item.createdBy,
    }));
  }, [apiProblemsData]);

  const totalCount =
    apiProblemsData?.data?.totalElements ?? problemsList.length;

  const codingLimit =
    limitsApiData?.data?.codingLimit ??
    limitsApiData?.data?.categoryCounts?.Coding ??
    apiProblemsData?.data?.codingLimit ??
    3000;

  const remainingLimit =
    limitsApiData?.data?.codingRemainingLimit ??
    apiProblemsData?.data?.remainingLimit ??
    2997;

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedLevel, selectedStatus]);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState<boolean>(false);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CodingFormData>(createDefaultCodingFormData);
  const [formErrors, setFormErrors] = useState<CodingFormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpenCreateDialog = () => {
    setEditingProblemId(null);
    setFormData(createDefaultCodingFormData());
    setFormErrors({});
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (problem: CodingProblemItem) => {
    setEditingProblemId(problem.id);
    setFormData({
      title: problem.title,
      problemStatement: problem.problemStatement,
      inputFormat: problem.inputFormat || "",
      outputFormat: problem.outputFormat || "",
      constraints: problem.constraints || "",
      examples: problem.examples?.length ? problem.examples : [createEmptyExample()],
      sampleTestCases: problem.sampleTestCases?.length ? problem.sampleTestCases : [createEmptyTestCase()],
      questionType: problem.questionType || "Coding",
      difficulty: problem.difficulty,
      timeLimitMs: problem.timeLimitMs || 1000,
      memoryLimitMb: problem.memoryLimitMb || 257,
      marks: problem.marks || 50,
      hiddenTestsCount: problem.hiddenTestsCount || 10,
      supportedLanguages: problem.supportedLanguages || ["Python 3", "Java 17", "C++ 17", "JavaScript"],
      imageUrl: problem.imageUrl || "",
    });
    setFormErrors({});
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setEditingProblemId(null);
    setFormErrors({});
  };

  const updateFormField = <K extends keyof CodingFormData>(
    field: K,
    value: CodingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field as string]) return prev;
      const copy = { ...prev };
      delete copy[field as string];
      return copy;
    });
  };

  const handleUploadImage = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    updateFormField("imageFile", file);
    updateFormField("imageUrl", localUrl);
    updateFormField("imageFileName", file.name);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await uploadImageMutation(uploadFormData).unwrap();
      if (res?.data?.imageUrl) {
        updateFormField("imageUrl", res.data.imageUrl);
        updateFormField("imageFileName", res.data.imageFileName || file.name);
        showSnackbar("Image uploaded successfully", "success");
      }
    } catch (err: any) {
      console.warn("Image upload server note:", err);
      showSnackbar("Image selected locally", "info");
    }
  };

  const handleAddExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, createEmptyExample()],
    }));
  };

  const handleUpdateExample = (id: string, patch: Partial<CodingExampleItem>) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)),
    }));
  };

  const handleRemoveExample = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.length > 1 ? prev.examples.filter((ex) => ex.id !== id) : prev.examples,
    }));
  };

  const handleAddTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      sampleTestCases: [...prev.sampleTestCases, createEmptyTestCase()],
    }));
  };

  const handleUpdateTestCase = (id: string, patch: Partial<CodingTestCaseItem>) => {
    setFormData((prev) => ({
      ...prev,
      sampleTestCases: prev.sampleTestCases.map((tc) => (tc.id === id ? { ...tc, ...patch } : tc)),
    }));
  };

  const handleRemoveTestCase = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sampleTestCases:
        prev.sampleTestCases.length > 1
          ? prev.sampleTestCases.filter((tc) => tc.id !== id)
          : prev.sampleTestCases,
    }));
  };

  const handleToggleLanguage = (lang: string) => {
    setFormData((prev) => {
      const exists = prev.supportedLanguages.includes(lang);
      const updated = exists
        ? prev.supportedLanguages.filter((l) => l !== lang)
        : [...prev.supportedLanguages, lang];
      return { ...prev, supportedLanguages: updated };
    });
  };

  const handlePublishProblem = async () => {
    setFormErrors({});
    setIsSubmitting(true);

    try {
      await codingProblemSchema.validate(
        {
          title: formData.title,
          problemStatement: formData.problemStatement,
          difficulty: formData.difficulty,
          timeLimitMs: Number(formData.timeLimitMs),
          memoryLimitMb: Number(formData.memoryLimitMb),
          marks: Number(formData.marks),
          hiddenTestsCount: Number(formData.hiddenTestsCount || 0),
          supportedLanguages: formData.supportedLanguages,
        },
        { abortEarly: false }
      );

      const apiPayload = {
        category: "Coding",
        questionType: "Coding",
        title: formData.title,
        problemStatement: formData.problemStatement,
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        constraints: formData.constraints,
        examples: formData.examples.map((ex) => ({
          input: ex.input,
          output: ex.output,
          explanation: ex.explanation || "",
        })),
        sampleTestCases: formData.sampleTestCases.map((tc) => ({
          input: tc.input,
          output: tc.output,
          isHidden: false,
        })),
        difficulty: formData.difficulty,
        timeLimitMs: Number(formData.timeLimitMs),
        memoryLimitMb: Number(formData.memoryLimitMb),
        marks: Number(formData.marks),
        hiddenTests: Number(formData.hiddenTestsCount || 0),
        imageUrl: formData.imageUrl || "",
        supportedLanguages: formData.supportedLanguages,
        keywords: "100",
        status: "Published",
      };

      if (editingProblemId) {
        await updateCodingMutation({ id: editingProblemId, body: apiPayload }).unwrap();
        showSnackbar("Coding problem updated successfully!", "success");
      } else {
        await createCodingMutation(apiPayload).unwrap();
        showSnackbar("Coding problem created successfully!", "success");
      }

      handleCloseFormDialog();
      refetch();
    } catch (err: any) {
      if (err.inner && Array.isArray(err.inner)) {
        const fieldErrors: CodingFormValidationErrors = {};
        err.inner.forEach((validationErr: any) => {
          if (validationErr.path && !fieldErrors[validationErr.path]) {
            fieldErrors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(fieldErrors);
        showSnackbar("Please fill in all required fields marked in red", "error");
      } else {
        showSnackbar(err?.data?.message || err?.message || "Failed to publish coding problem", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    try {
      await deleteCodingMutation(id).unwrap();
      showSnackbar("Coding problem deleted successfully", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.data?.message || "Failed to delete problem", "error");
    }
  };

  return {
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
    remainingLimit,
    paginatedProblems: problemsList,
    filteredProblems: problemsList,
    isApiFetching,
    refetch,

    isFormDialogOpen,
    editingProblemId,
    formData,
    formErrors,
    isSubmitting: isSubmitting || isUploadingImage,
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
    showSnackbar,
    closeSnackbar,
  };
};
