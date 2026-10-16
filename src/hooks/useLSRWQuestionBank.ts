import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import useDebounce from "./useDebounce";
import { resolveAudioUrl } from "../utils/audioUtils";
import type {
  LSRWSubTab,
  LSRWLevel,
  AnyLSRWExerciseItem,
  ListeningExerciseItem,
  SpeakingExerciseItem,
  ReadingExerciseItem,
  WritingExerciseItem,
  LSRWFormData,
  LSRWFormValidationErrors,
  LSRWSubQuestion,
} from "../types/LSRW.types";
import {
  createDefaultLSRWFormData,
  createEmptySubQuestion,
  lsrwListeningVoiceSchema,
  lsrwListeningMCQSchema,
  lsrwSpeakingSchema,
  lsrwReadingSchema,
  lsrwWritingSchema,
} from "../utils/lsrwSchema";
import type { SnackbarState } from "../types/Snackbar.types";
import {
  useGetLSRWExercisesQuery,
  useCreateLSRWExerciseMutation,
  useUpdateLSRWExerciseMutation,
  useDeleteLSRWExerciseMutation,
  useUploadAudioFileMutation,
  useGetQuestionBankLimitsQuery,
} from "../features/assessment/QuestionBankApi";

export const useLSRWQuestionBank = () => {
  const [activeSubTab, setActiveSubTab] = useState<LSRWSubTab>("Listening");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const {
    data: apiExercisesData,
    isFetching: isApiFetching,
    refetch,
  } = useGetLSRWExercisesQuery({
    skill: activeSubTab,
    page,
    size: rowsPerPage,
    search: debouncedSearch.trim() || undefined,
    difficulty: selectedLevel !== "All Levels" ? selectedLevel : undefined,
    status: selectedStatus !== "All Status" ? selectedStatus : undefined,
  });

  const { data: limitsApiData } = useGetQuestionBankLimitsQuery();

  const [uploadAudioFileMutation, { isLoading: isUploadingAudio }] = useUploadAudioFileMutation();
  const [createExerciseMutation] = useCreateLSRWExerciseMutation();
  const [updateExerciseMutation] = useUpdateLSRWExerciseMutation();
  const [deleteExerciseMutation] = useDeleteLSRWExerciseMutation();

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

  const exercisesList: AnyLSRWExerciseItem[] = useMemo(() => {
    const content = apiExercisesData?.data?.content;
    if (!content || !Array.isArray(content)) return [];

    return content.map((item: any) => {
      const id = item.id || `lsrw-${Date.now()}`;
      const title =
        item.exerciseTitle || item.topic || item.questionText || "Untitled Exercise";
      const description =
        item.exerciseDescription || item.readableParagraph || "";
      const level = (item.difficulty || "Intermediate") as LSRWLevel;
      const marks = item.marks ?? 50;
      const negativeMarks = item.negativeMarks ?? 0;
      const status =
        item.status === "Published" ? "Published" : "Un-publish";

      if (activeSubTab === "Listening") {
        const rawAudioUrl =
          item.audioFileUrl ||
          item.audioUrl ||
          item.fileUrl ||
          item.url ||
          item.documentUrl ||
          "";
        const resolvedAudioUrl = resolveAudioUrl(rawAudioUrl || item.audioFileName);

        return {
          id,
          exerciseType: "LISTENING",
          title,
          description,
          level,
          types: item.questionType || (item.options?.length ? "MCQ" : "Voice Input"),
          duration: item.duration || "10 min",
          durationMinutes: 10,
          content: item.audioFileSize || `${item.marks || 0} marks`,
          audioFileName: item.audioFileName || item.fileName || "sportsplay-1.mp3",
          audioFileSize: item.audioFileSize || item.fileSize || "1.6 MB",
          audioUrl: resolvedAudioUrl,
          rawAudioUrl,
          marks,
          negativeMarks,
          status,
          attemptsCount: item.attemptsCount,
          attemptsDisplay: item.attemptsDisplay,
          subQuestions: item.options
            ? [
              {
                id: `sq-${id}`,
                questionNumber: 1,
                questionType: item.questionType === "MCQ" ? "MCQ" : "Voice Input",
                questionText: item.questionText || title,
                answer: item.voiceAnswer,
                options: item.options,
                marks,
                negativeMarks,
              },
            ]
            : [],
        } as ListeningExerciseItem;
      }

      if (activeSubTab === "Speaking") {
        return {
          id,
          exerciseType: "SPEAKING",
          title,
          description,
          level,
          duration: item.duration || "8 min",
          durationMinutes: 8,
          questionText: item.questionText || "",
          keywords: item.keywords || "",
          marks,
          negativeMarks,
          status,
          attemptsCount: item.attemptsCount,
          attemptsDisplay: item.attemptsDisplay,
        } as SpeakingExerciseItem;
      }

      if (activeSubTab === "Reading") {
        return {
          id,
          exerciseType: "READING",
          title: item.topic || title,
          description,
          level,
          duration: item.duration || "5 min",
          durationMinutes: 5,
          passageText: item.readableParagraph || "",
          marks,
          negativeMarks,
          status,
          attemptsCount: item.attemptsCount,
          attemptsDisplay: item.attemptsDisplay,
        } as ReadingExerciseItem;
      }

      return {
        id,
        exerciseType: "WRITING",
        title: item.topic || title,
        description,
        level,
        duration: item.duration || "15 min",
        durationMinutes: 15,
        words: item.wordLimit || item.numberOfWords || 120,
        keywords: item.keywords || "",
        marks,
        negativeMarks,
        status,
        attemptsCount: item.attemptsCount,
        attemptsDisplay: item.attemptsDisplay,
      } as WritingExerciseItem;
    });
  }, [apiExercisesData, activeSubTab]);

  const totalCount =
    apiExercisesData?.data?.totalElements ?? exercisesList.length;

  const lsrwLimit =
    limitsApiData?.data?.lsrwLimit ??
    apiExercisesData?.data?.lsrwLimit ??
    2000;

  const remainingLimit =
    limitsApiData?.data?.lsrwRemainingLimit ??
    apiExercisesData?.data?.remainingLimit ??
    1998;

  useEffect(() => {
    setPage(0);
  }, [activeSubTab, debouncedSearch, selectedLevel, selectedStatus]);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState<boolean>(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LSRWFormData>(() =>
    createDefaultLSRWFormData("Listening")
  );
  const [formErrors, setFormErrors] = useState<LSRWFormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isPreviewAudioOpen, setIsPreviewAudioOpen] = useState<boolean>(false);
  const [previewAudioInfo, setPreviewAudioInfo] = useState<{
    title: string;
    url?: string;
    fileName?: string;
  } | null>(null);

  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);

  const handleOpenCreateDialog = (tab?: LSRWSubTab) => {
    const targetTab = tab || activeSubTab;
    setEditingExerciseId(null);
    setFormData(createDefaultLSRWFormData(targetTab));
    setFormErrors({});
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (exercise: AnyLSRWExerciseItem) => {
    setEditingExerciseId(exercise.id);
    const subTab =
      exercise.exerciseType === "LISTENING"
        ? "Listening"
        : exercise.exerciseType === "SPEAKING"
          ? "Speaking"
          : exercise.exerciseType === "READING"
            ? "Reading"
            : "Writing";

    const baseForm = createDefaultLSRWFormData(subTab);
    baseForm.difficulty = exercise.level;
    baseForm.marks = exercise.marks;
    baseForm.negativeMarks = exercise.negativeMarks;

    if (exercise.exerciseType === "LISTENING") {
      baseForm.description = exercise.description || "";
      baseForm.duration = exercise.duration || "10 min";
      baseForm.audioFileName = exercise.audioFileName || "";
      baseForm.audioFileSize = exercise.audioFileSize || "";
      baseForm.audioUrl = exercise.audioUrl || "";
      baseForm.listeningType =
        exercise.types?.includes("MCQ") && !exercise.types?.includes("Voice")
          ? "MCQ"
          : "Voice Input";
      baseForm.subQuestions = exercise.subQuestions?.length
        ? exercise.subQuestions
        : [createEmptySubQuestion(1)];
      baseForm.currentQuestionIndex = 0;
    } else if (exercise.exerciseType === "SPEAKING") {
      baseForm.duration = exercise.duration || "8 min";
      baseForm.speakingQuestion = exercise.questionText || "";
      baseForm.speakingKeywords = exercise.keywords || "";
    } else if (exercise.exerciseType === "READING") {
      baseForm.readingTopic = exercise.title || "";
      baseForm.readingParagraph = exercise.passageText || "";
      baseForm.duration = exercise.duration || "5 min";
    } else if (exercise.exerciseType === "WRITING") {
      baseForm.writingTopic = exercise.title || "";
      baseForm.writingWords = exercise.words || 120;
      baseForm.writingKeywords = exercise.keywords || "";
      baseForm.duration = exercise.duration || "15 min";
    }

    setFormData(baseForm);
    setFormErrors({});
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setEditingExerciseId(null);
    setFormErrors({});
  };

  const updateFormField = <K extends keyof LSRWFormData>(
    field: K,
    value: LSRWFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field as string]) return prev;
      const copy = { ...prev };
      delete copy[field as string];
      return copy;
    });
  };

  const currentSubQuestion = useMemo(() => {
    if (formData.subQuestions.length === 0) return createEmptySubQuestion(1);
    const idx = Math.min(
      Math.max(0, formData.currentQuestionIndex),
      formData.subQuestions.length - 1
    );
    return formData.subQuestions[idx];
  }, [formData.subQuestions, formData.currentQuestionIndex]);

  const updateCurrentSubQuestion = (patch: Partial<LSRWSubQuestion>) => {
    setFormData((prev) => {
      const idx = prev.currentQuestionIndex;
      const updated = [...prev.subQuestions];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], ...patch };
      }
      return { ...prev, subQuestions: updated };
    });
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy["questionText"];
      delete copy["answer"];
      delete copy["options"];
      return copy;
    });
  };

  const addOptionToSubQuestion = () => {
    setFormData((prev) => {
      const idx = prev.currentQuestionIndex;
      const updated = [...prev.subQuestions];
      const q = updated[idx];
      if (q && q.options) {
        const nextChar = String.fromCharCode(65 + q.options.length);
        const newOption = {
          id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          optionKey: nextChar,
          optionText: "",
          isCorrect: false,
          optionOrder: q.options.length,
        };
        updated[idx] = { ...q, options: [...q.options, newOption] };
      }
      return { ...prev, subQuestions: updated };
    });
  };

  const removeOptionFromSubQuestion = (optionId: string) => {
    setFormData((prev) => {
      const idx = prev.currentQuestionIndex;
      const updated = [...prev.subQuestions];
      const q = updated[idx];
      if (q && q.options && q.options.length > 2) {
        const filtered = q.options
          .filter((opt) => opt.id !== optionId)
          .map((opt, i) => ({
            ...opt,
            optionKey: String.fromCharCode(65 + i),
            optionOrder: i,
          }));
        if (!filtered.some((opt) => opt.isCorrect) && filtered.length > 0) {
          filtered[0].isCorrect = true;
        }
        updated[idx] = { ...q, options: filtered };
      }
      return { ...prev, subQuestions: updated };
    });
  };

  const setCorrectOption = (optionId: string) => {
    setFormData((prev) => {
      const idx = prev.currentQuestionIndex;
      const updated = [...prev.subQuestions];
      const q = updated[idx];
      if (q && q.options) {
        const newOpts = q.options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === optionId,
        }));
        updated[idx] = { ...q, options: newOpts };
      }
      return { ...prev, subQuestions: updated };
    });
  };

  const handlePrevSubQuestion = () => {
    if (formData.currentQuestionIndex > 0) {
      setFormData((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const handleNextSubQuestion = () => {
    const currentQ = formData.subQuestions[formData.currentQuestionIndex];
    if (!currentQ.questionText.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        questionText: "Question text is required before proceeding",
      }));
      showSnackbar("Please enter a question text first", "warning");
      return;
    }

    if (formData.currentQuestionIndex < formData.subQuestions.length - 1) {
      setFormData((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      const newQuestionNum = formData.subQuestions.length + 1;
      const newQ = createEmptySubQuestion(newQuestionNum, formData.listeningType);
      setFormData((prev) => ({
        ...prev,
        subQuestions: [...prev.subQuestions, newQ],
        currentQuestionIndex: prev.subQuestions.length,
      }));
      showSnackbar(`Added Question ${newQuestionNum}`, "info");
    }
  };

  const handleAudioFileSelect = async (file: File) => {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const fallbackSizeStr = `${sizeInMb} MB`;
    const objectUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      audioFile: file,
      audioFileName: file.name,
      audioFileSize: fallbackSizeStr,
      audioUrl: objectUrl,
    }));

    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy["audioFileName"];
      return copy;
    });

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const uploadRes = await uploadAudioFileMutation(uploadFormData).unwrap();
      if (uploadRes?.data) {
        const uploadedUrl =
          uploadRes.data.audioFileUrl ||
          (uploadRes.data as any).fileUrl ||
          (uploadRes.data as any).url ||
          "";
        setFormData((prev) => ({
          ...prev,
          audioFileName: uploadRes.data.audioFileName || file.name,
          audioFileSize: uploadRes.data.audioFileSize || fallbackSizeStr,
          audioUrl: resolveAudioUrl(uploadedUrl) || objectUrl,
        }));
        showSnackbar("Audio file uploaded successfully", "success");
      }
    } catch (err: any) {
      console.warn("Audio upload server note:", err);
      showSnackbar("Audio uploaded locally. Will submit with exercise.", "info");
    }
  };

  const handlePublishExercise = async () => {
    setFormErrors({});
    setIsSubmitting(true);

    try {
      let payload: any = null;

      if (formData.subTab === "Listening") {
        const currentQ = currentSubQuestion;
        const payloadToValidate = {
          audioFileName: formData.audioFileName,
          description: formData.description,
          difficulty: formData.difficulty,
          duration: formData.duration,
          marks: Number(formData.marks),
          negativeMarks: Number(formData.negativeMarks || 0),
          questionText: currentQ.questionText,
          answer: currentQ.answer,
          options: currentQ.options,
        };

        if (formData.listeningType === "Voice Input") {
          await lsrwListeningVoiceSchema.validate(payloadToValidate, {
            abortEarly: false,
          });

          payload = {
            category: "LSRW",
            lsrwSubType: "LISTENING",
            questionType: "Voice input",
            difficulty: formData.difficulty,
            exerciseTitle:
              formData.description?.slice(0, 40) || "Campus Placement Briefing",
            exerciseDescription: formData.description,
            questionText: currentQ.questionText,
            voiceAnswer: currentQ.answer,
            audioFileUrl: formData.audioUrl,
            audioFileName: formData.audioFileName,
            audioFileSize: formData.audioFileSize,
            duration: formData.duration || "10 min",
            marks: Number(formData.marks),
            negativeMarks: Number(formData.negativeMarks || 0),
            status: "Published",
          };
        } else {
          await lsrwListeningMCQSchema.validate(payloadToValidate, {
            abortEarly: false,
          });

          payload = {
            category: "LSRW",
            lsrwSubType: "LISTENING",
            questionType: "MCQ",
            difficulty: formData.difficulty,
            exerciseTitle:
              formData.description?.slice(0, 40) || "Campus Placement Briefing",
            exerciseDescription: formData.description,
            questionText: currentQ.questionText,
            audioFileUrl: formData.audioUrl,
            audioFileName: formData.audioFileName,
            audioFileSize: formData.audioFileSize,
            duration: formData.duration || "10 min",
            marks: Number(formData.marks),
            negativeMarks: Number(formData.negativeMarks || 0),
            status: "Published",
            options: (currentQ.options || []).map((opt, idx) => ({
              optionKey: opt.optionKey,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              optionOrder: idx,
            })),
          };
        }
      } else if (formData.subTab === "Speaking") {
        await lsrwSpeakingSchema.validate(
          {
            duration: formData.duration,
            speakingQuestion: formData.speakingQuestion,
            speakingKeywords: formData.speakingKeywords,
            difficulty: formData.difficulty,
            marks: Number(formData.marks),
            negativeMarks: Number(formData.negativeMarks || 0),
          },
          { abortEarly: false }
        );

        payload = {
          category: "LSRW",
          lsrwSubType: "SPEAKING",
          questionType: "Voice input",
          exerciseTitle:
            formData.speakingQuestion?.slice(0, 40) || "Tell about Your self",
          exerciseDescription: `Speaking to a short team about yourself and answer the questions`,
          duration: formData.duration || "8 min",
          difficulty: formData.difficulty,
          questionText: formData.speakingQuestion,
          keywords: formData.speakingKeywords,
          marks: Number(formData.marks),
          negativeMarks: Number(formData.negativeMarks || 0),
          status: "Published",
        };
      } else if (formData.subTab === "Reading") {
        await lsrwReadingSchema.validate(
          {
            readingTopic: formData.readingTopic,
            readingParagraph: formData.readingParagraph,
            difficulty: formData.difficulty,
            duration: formData.duration,
            marks: Number(formData.marks),
            negativeMarks: Number(formData.negativeMarks || 0),
          },
          { abortEarly: false }
        );

        payload = {
          category: "LSRW",
          lsrwSubType: "READING",
          topic: formData.readingTopic,
          exerciseTitle: formData.readingTopic,
          difficulty: formData.difficulty,
          duration: formData.duration || "5 min",
          marks: Number(formData.marks),
          negativeMarks: Number(formData.negativeMarks || 0),
          readableParagraph: formData.readingParagraph,
          status: "Published",
        };
      } else if (formData.subTab === "Writing") {
        await lsrwWritingSchema.validate(
          {
            writingTopic: formData.writingTopic,
            writingWords: Number(formData.writingWords),
            writingKeywords: formData.writingKeywords,
            difficulty: formData.difficulty,
            duration: formData.duration,
            marks: Number(formData.marks),
            negativeMarks: Number(formData.negativeMarks || 0),
          },
          { abortEarly: false }
        );

        payload = {
          category: "LSRW",
          lsrwSubType: "WRITING",
          topic: formData.writingTopic,
          exerciseTitle: formData.writingTopic,
          difficulty: formData.difficulty,
          duration: formData.duration || "15 min",
          wordLimit: Number(formData.writingWords),
          numberOfWords: Number(formData.writingWords),
          marks: Number(formData.marks),
          negativeMarks: Number(formData.negativeMarks || 0),
          keywords: formData.writingKeywords,
          status: "Published",
        };
      }

      if (editingExerciseId) {
        await updateExerciseMutation({ id: editingExerciseId, body: payload }).unwrap();
        showSnackbar("Question updated successfully!", "success");
      } else {
        await createExerciseMutation(payload).unwrap();
        showSnackbar("Question published successfully to question bank!", "success");
      }

      refetch();
      handleCloseFormDialog();
    } catch (err: any) {
      if (err.inner && Array.isArray(err.inner)) {
        const fieldErrors: LSRWFormValidationErrors = {};
        err.inner.forEach((validationErr: any) => {
          if (validationErr.path && !fieldErrors[validationErr.path]) {
            fieldErrors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(fieldErrors);
        showSnackbar("Please fill in all required fields marked in red", "error");
      } else {
        const apiMsg =
          err?.data?.message || err?.message || "Failed to publish exercise";
        showSnackbar(apiMsg, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      await deleteExerciseMutation(id).unwrap();
      showSnackbar("Exercise deleted successfully", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.data?.message || "Failed to delete exercise", "error");
    }
  };

  const [currentPlayingExerciseId, setCurrentPlayingExerciseId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeAudioExercise, setActiveAudioExercise] = useState<ListeningExerciseItem | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);
  const activePlayingIdRef = useRef<string | null>(null);

  const handleTogglePlayInline = useCallback(
    (exercise: ListeningExerciseItem) => {
      const targetUrl = resolveAudioUrl(exercise.audioUrl || exercise.audioFileName);

      if (!targetUrl) {
        showSnackbar("No audio file found for this exercise", "warning");
        return;
      }

      if (activePlayingIdRef.current === exercise.id && sharedAudioRef.current) {
        const audio = sharedAudioRef.current;
        if (!audio.paused) {
          audio.pause();
          setIsPlayingAudio(false);
        } else {
          audio
            .play()
            .then(() => {
              setIsPlayingAudio(true);
            })
            .catch((err) => {
              console.error("Audio resume error:", err);
              setIsPlayingAudio(false);
              showSnackbar("Failed to resume audio playback.", "error");
            });
        }
        return;
      }

      if (sharedAudioRef.current) {
        sharedAudioRef.current.pause();
        sharedAudioRef.current.src = "";
      }

      const audio = new Audio(targetUrl);
      sharedAudioRef.current = audio;
      activePlayingIdRef.current = exercise.id;
      audio.volume = isAudioMuted ? 0 : audioVolume;

      setCurrentPlayingExerciseId(exercise.id);
      setActiveAudioExercise(exercise);
      setAudioCurrentTime(0);
      setAudioDuration(0);

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onpause = () => setIsPlayingAudio(false);

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime || 0);
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioDuration(audio.duration);
        }
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        setAudioCurrentTime(0);
      };

      audio.onerror = (e) => {
        console.error("Audio playback error on url:", targetUrl, e);
        setIsPlayingAudio(false);
        showSnackbar("Audio file could not be loaded from server", "error");
      };

      audio
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((err) => {
          console.error("Audio play failed:", err);
          setIsPlayingAudio(false);
          showSnackbar("Could not start audio playback. Please check server.", "error");
        });
    },
    [audioVolume, isAudioMuted, showSnackbar]
  );

  const handleStopAudio = useCallback(() => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      sharedAudioRef.current.src = "";
      sharedAudioRef.current = null;
    }
    activePlayingIdRef.current = null;
    setIsPlayingAudio(false);
    setCurrentPlayingExerciseId(null);
    setActiveAudioExercise(null);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  }, []);

  const handleSeekAudio = useCallback(
    (percent: number) => {
      if (sharedAudioRef.current && audioDuration > 0) {
        const targetTime = (percent / 100) * audioDuration;
        sharedAudioRef.current.currentTime = targetTime;
        setAudioCurrentTime(targetTime);
      }
    },
    [audioDuration]
  );

  const handleSkipAudio = useCallback(
    (seconds: number) => {
      if (sharedAudioRef.current) {
        const maxDuration = audioDuration || sharedAudioRef.current.duration || 0;
        const targetTime = Math.max(
          0,
          Math.min(sharedAudioRef.current.currentTime + seconds, maxDuration)
        );
        sharedAudioRef.current.currentTime = targetTime;
        setAudioCurrentTime(targetTime);
      }
    },
    [audioDuration]
  );

  const handleSetVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      setAudioVolume(clamped);
      if (sharedAudioRef.current) {
        sharedAudioRef.current.volume = clamped;
      }
      if (clamped === 0) {
        setIsAudioMuted(true);
      } else if (isAudioMuted) {
        setIsAudioMuted(false);
      }
    },
    [isAudioMuted]
  );

  const handleToggleMute = useCallback(() => {
    if (sharedAudioRef.current) {
      if (isAudioMuted) {
        sharedAudioRef.current.volume = audioVolume > 0 ? audioVolume : 0.8;
        setIsAudioMuted(false);
      } else {
        sharedAudioRef.current.volume = 0;
        setIsAudioMuted(true);
      }
    }
  }, [isAudioMuted, audioVolume]);

  useEffect(() => {
    return () => {
      if (sharedAudioRef.current) {
        sharedAudioRef.current.pause();
        sharedAudioRef.current.src = "";
        sharedAudioRef.current = null;
      }
    };
  }, [activeSubTab]);

  const handlePlayAudio = (exercise: ListeningExerciseItem) => {
    setPreviewAudioInfo({
      title: exercise.title,
      fileName: exercise.audioFileName,
      url: resolveAudioUrl(exercise.audioUrl || exercise.audioFileName),
    });
    setIsPreviewAudioOpen(true);
  };

  const handleCloseAudioPreview = () => {
    setIsPreviewAudioOpen(false);
    setPreviewAudioInfo(null);
  };

  const handleOpenBulkImport = () => setIsBulkImportOpen(true);
  const handleCloseBulkImport = () => setIsBulkImportOpen(false);

  return {
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
    remainingLimit,
    paginatedList: exercisesList,
    filteredList: exercisesList,
    isApiFetching,
    refetch,

    isFormDialogOpen,
    editingExerciseId,
    formData,
    formErrors,
    isSubmitting: isSubmitting || isUploadingAudio,
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
    activeAudioExercise,
    audioCurrentTime,
    audioDuration,
    audioVolume,
    isAudioMuted,
    handleTogglePlayInline,
    handleStopAudio,
    handleSeekAudio,
    handleSkipAudio,
    handleSetVolume,
    handleToggleMute,

    isBulkImportOpen,
    handleOpenBulkImport,
    handleCloseBulkImport,

    snackbar,
    showSnackbar,
    closeSnackbar,
  };
};
