import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Collapse,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
  Code as CodeIcon,
  Headphones as HeadphonesIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  MenuBook as MenuBookIcon,
  EditNote as EditNoteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  RateReviewOutlined as RateReviewOutlinedIcon,
  AutoFixHigh as AutoFixHighIcon,
  FactCheck as FactCheckIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";

import Card from "../../components/common/Card";
import {
  useGetAssessmentResultQuery,
  useSaveStudentResultFeedbackMutation,
  useCheckGrammarMutation,
} from "../../features/assessment/AssessmentApi";
import { resolveAudioUrl, formatAudioTime } from "../../utils/audioUtils";
import type {
  StudentTestResultData,
  StudentQuestionEvaluation,
} from "../../types/Assessment.types";
import type { GrammarCheckResponse, LsrwSection } from "../../types/Grammar.types";
import { GrammarAnalysisPanel } from "../../components/grammar/GrammarAnalysisPanel";

export const AssessmentResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [checkGrammarTrigger] = useCheckGrammarMutation();
  const [questionGrammarMap, setQuestionGrammarMap] = useState<Record<string, GrammarCheckResponse>>({});
  const [analyzingQuestionMap, setAnalyzingQuestionMap] = useState<Record<string, boolean>>({});
  const [grammarErrorMap, setGrammarErrorMap] = useState<Record<string, string>>({});

  const handleAnalyzeQuestionGrammar = async (
    section: LsrwSection,
    text: string,
    questionId: string
  ) => {
    if (!text || !text.trim() || !questionId) return;
    if (analyzingQuestionMap[questionId]) return;

    setAnalyzingQuestionMap((prev) => ({ ...prev, [questionId]: true }));
    setGrammarErrorMap((prev) => ({ ...prev, [questionId]: "" }));

    try {
      const res = await checkGrammarTrigger({
        section,
        text: text.trim(),
        questionId,
        assessmentId: id,
      }).unwrap();

      const payload = (res as any)?.data ?? res;
      if (
        payload &&
        typeof payload === "object" &&
        ("finalScore" in payload || "grammarScore" in payload || "errors" in payload)
      ) {
        setQuestionGrammarMap((prev) => ({
          ...prev,
          [questionId]: payload as GrammarCheckResponse,
        }));
      }
    } catch (err: any) {
      console.warn("Result detail grammar analysis failed:", err);
      setGrammarErrorMap((prev) => ({
        ...prev,
        [questionId]: "Grammar analysis is temporarily unavailable.",
      }));
    } finally {
      setAnalyzingQuestionMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAssessmentResultQuery(id || "", {
    skip: !id,
  });

  const data: StudentTestResultData | undefined = apiResponse?.data;

  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackAlert, setFeedbackAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [saveStudentResultFeedback, { isLoading: isSavingFeedback }] =
    useSaveStudentResultFeedbackMutation();

  useEffect(() => {
    if (data?.instructorFeedback || data?.feedback) {
      setFeedbackText(data.instructorFeedback || data.feedback || "");
    }
  }, [data?.instructorFeedback, data?.feedback]);

  const handleSaveFeedback = async () => {
    if (!id) return;
    try {
      await saveStudentResultFeedback({ id, feedback: feedbackText }).unwrap();
      setFeedbackAlert({
        type: "success",
        message: "Instructor feedback and recommendations saved successfully!",
      });
      setTimeout(() => setFeedbackAlert(null), 4000);
    } catch (err: any) {
      setFeedbackAlert({
        type: "error",
        message: err?.data?.message || "Failed to save feedback. Please try again.",
      });
      setTimeout(() => setFeedbackAlert(null), 4000);
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const [paletteFilter, setPaletteFilter] = useState<"all" | "wrong" | "partial" | "skipped">("all");

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  const questions = useMemo(() => data?.questionEvaluations || [], [data?.questionEvaluations]);
  const currentQuestion: StudentQuestionEvaluation | undefined = questions[selectedQuestionIndex];

  const [isPlayingAudioPrompt, setIsPlayingAudioPrompt] = useState<boolean>(false);
  const [isPlayingStudentAudio, setIsPlayingStudentAudio] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showExpectedAnswer, setShowExpectedAnswer] = useState<boolean>(true);
  const [expandedTestCases, setExpandedTestCases] = useState<Record<number, boolean>>({ 1: true });

  const studentAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioPromptPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [studentAudioCurrentTime, setStudentAudioCurrentTime] = useState<number>(0);
  const [studentAudioDuration, setStudentAudioDuration] = useState<number>(0);
  const [audioPromptCurrentTime, setAudioPromptCurrentTime] = useState<number>(0);
  const [audioPromptDuration, setAudioPromptDuration] = useState<number>(0);

  const durationCacheRef = useRef<Record<string, number>>({});

  const parseDurationSeconds = (val: any): number => {
    if (!val) return 0;
    if (typeof val === "number" && isFinite(val) && val > 0) return val;
    if (typeof val === "string") {
      const str = val.trim();
      if (!str || str === "00:00" || str === "0:00") return 0;
      if (/^\d+(\.\d+)?$/.test(str)) {
        return parseFloat(str);
      }
      if (str.includes(":")) {
        const parts = str.split(":").map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return parts[0] * 60 + parts[1];
        }
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }
    }
    return 0;
  };

  const probeAudioDuration = async (audioUrl: string, callback: (dur: number) => void) => {
    if (!audioUrl) return;
    if (durationCacheRef.current[audioUrl]) {
      callback(durationCacheRef.current[audioUrl]);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const res = await fetch(audioUrl);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          const ctx = new AudioCtx();
          const audioBuffer = await ctx.decodeAudioData(ab);
          if (audioBuffer && isFinite(audioBuffer.duration) && audioBuffer.duration > 0) {
            durationCacheRef.current[audioUrl] = audioBuffer.duration;
            callback(audioBuffer.duration);
            ctx.close();
            return;
          }
          ctx.close();
        }
      }
    } catch {
    }

    try {
      const probe = new Audio(audioUrl);
      probe.onloadedmetadata = () => {
        if (isFinite(probe.duration) && probe.duration > 0) {
          durationCacheRef.current[audioUrl] = probe.duration;
          callback(probe.duration);
          probe.src = "";
        } else {
          probe.currentTime = 1e7;
        }
      };
      probe.onseeked = () => {
        const d = isFinite(probe.duration) && probe.duration > 0 ? probe.duration : probe.currentTime;
        if (isFinite(d) && d > 0 && d < 1e6) {
          durationCacheRef.current[audioUrl] = d;
          callback(d);
        }
        probe.src = "";
      };
      probe.onerror = () => {
        probe.src = "";
      };
    } catch (e) {
      console.warn("Probe audio duration error:", e);
    }
  };

  useEffect(() => {
    if (studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
      studentAudioPlayerRef.current = null;
    }
    if (audioPromptPlayerRef.current) {
      audioPromptPlayerRef.current.pause();
      audioPromptPlayerRef.current = null;
    }
    setIsPlayingStudentAudio(false);
    setIsPlayingAudioPrompt(false);
    setStudentAudioCurrentTime(0);
    setAudioPromptCurrentTime(0);
    setStudentAudioDuration(0);
    setAudioPromptDuration(0);

    if (currentQuestion?.studentAudioUrl) {
      const resolved = resolveAudioUrl(currentQuestion.studentAudioUrl);
      if (resolved) {
        probeAudioDuration(resolved, (dur) => {
          setStudentAudioDuration(dur);
        });
      }
    }

    if (currentQuestion?.audioPromptUrl) {
      const resolved = resolveAudioUrl(currentQuestion.audioPromptUrl);
      if (resolved) {
        probeAudioDuration(resolved, (dur) => {
          setAudioPromptDuration(dur);
        });
      }
    }
  }, [selectedQuestionIndex, currentQuestion?.studentAudioUrl, currentQuestion?.audioPromptUrl]);

  const handleToggleStudentAudio = (rawUrl?: string | null) => {
    if (!rawUrl) return;
    const resolved = resolveAudioUrl(rawUrl);
    if (!resolved) return;

    if (isPlayingStudentAudio && studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
      setIsPlayingStudentAudio(false);
      return;
    }

    if (audioPromptPlayerRef.current) {
      audioPromptPlayerRef.current.pause();
      setIsPlayingAudioPrompt(false);
    }

    if (!studentAudioPlayerRef.current || studentAudioPlayerRef.current.src !== resolved) {
      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
      }
      const audio = new Audio(resolved);
      studentAudioPlayerRef.current = audio;

      audio.ontimeupdate = () => {
        setStudentAudioCurrentTime(audio.currentTime);
        if (isFinite(audio.duration) && audio.duration > 0) {
          setStudentAudioDuration(audio.duration);
        } else {
          setStudentAudioDuration((prev) => Math.max(prev, audio.currentTime));
        }
      };

      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          setStudentAudioDuration(audio.duration);
        } else {
          probeAudioDuration(resolved, (dur) => setStudentAudioDuration(dur));
        }
      };

      audio.onended = () => {
        setIsPlayingStudentAudio(false);
        setStudentAudioCurrentTime(0);
        if (audio.currentTime > 0) {
          setStudentAudioDuration((prev) => Math.max(prev, audio.currentTime));
        }
      };

      audio.onerror = (e) => {
        console.warn("Student audio error:", e);
        setIsPlayingStudentAudio(false);
      };
    }

    studentAudioPlayerRef.current
      .play()
      .then(() => setIsPlayingStudentAudio(true))
      .catch((err) => {
        console.warn("Student audio play failed:", err);
        setIsPlayingStudentAudio(false);
      });
  };

  const handleToggleAudioPrompt = (rawUrl?: string | null) => {
    if (!rawUrl) return;
    const resolved = resolveAudioUrl(rawUrl);
    if (!resolved) return;

    if (isPlayingAudioPrompt && audioPromptPlayerRef.current) {
      audioPromptPlayerRef.current.pause();
      setIsPlayingAudioPrompt(false);
      return;
    }

    if (studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
      setIsPlayingStudentAudio(false);
    }

    if (!audioPromptPlayerRef.current || audioPromptPlayerRef.current.src !== resolved) {
      if (audioPromptPlayerRef.current) {
        audioPromptPlayerRef.current.pause();
      }
      const audio = new Audio(resolved);
      audioPromptPlayerRef.current = audio;

      audio.ontimeupdate = () => {
        setAudioPromptCurrentTime(audio.currentTime);
        if (isFinite(audio.duration) && audio.duration > 0) {
          setAudioPromptDuration(audio.duration);
        } else {
          setAudioPromptDuration((prev) => Math.max(prev, audio.currentTime));
        }
      };

      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          setAudioPromptDuration(audio.duration);
        } else {
          probeAudioDuration(resolved, (dur) => setAudioPromptDuration(dur));
        }
      };

      audio.onended = () => {
        setIsPlayingAudioPrompt(false);
        setAudioPromptCurrentTime(0);
      };

      audio.onerror = (e) => {
        console.warn("Audio prompt error:", e);
        setIsPlayingAudioPrompt(false);
      };
    }

    audioPromptPlayerRef.current
      .play()
      .then(() => setIsPlayingAudioPrompt(true))
      .catch((err) => {
        console.warn("Audio prompt play failed:", err);
        setIsPlayingAudioPrompt(false);
      });
  };

  const parsedStudentDuration = parseDurationSeconds(currentQuestion?.studentAudioDuration);
  const effectiveStudentDuration =
    studentAudioDuration > 0
      ? studentAudioDuration
      : parsedStudentDuration > 0
        ? parsedStudentDuration
        : Math.max(studentAudioCurrentTime, 15);

  const parsedPromptDuration = parseDurationSeconds(currentQuestion?.audioPromptDuration);
  const effectivePromptDuration =
    audioPromptDuration > 0
      ? audioPromptDuration
      : parsedPromptDuration > 0
        ? parsedPromptDuration
        : Math.max(audioPromptCurrentTime, 15);

  const renderAudioWaveform = (
    currentTime: number,
    totalDuration: number,
    playerRef: React.MutableRefObject<HTMLAudioElement | null>,
    setTimeState: (t: number) => void
  ) => {
    const bars = [14, 20, 24, 18, 28, 16, 22, 14, 26, 12, 18, 24, 10, 22, 16, 14, 20, 18, 24, 16];
    const dur = totalDuration > 0 ? totalDuration : 15;
    const ratio = Math.min(1, Math.max(0, currentTime / dur));
    const activeCount = Math.round(ratio * bars.length);

    const onWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const clickRatio = rect.width > 0 ? clickX / rect.width : 0;
      const targetTime = clickRatio * dur;
      if (playerRef.current) {
        playerRef.current.currentTime = targetTime;
      }
      setTimeState(targetTime);
    };

    return (
      <Box
        onClick={onWaveformClick}
        title="Click to seek"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "2.5px",
          height: 30,
          cursor: "pointer",
          px: 0.5,
          borderRadius: "4px",
          transition: "background-color 0.15s ease",
          "&:hover": { bgcolor: "#f1f5f9" },
        }}
      >
        {bars.map((h, i) => {
          const isPlayed = i < activeCount || (currentTime > 0 && i === 0);
          return (
            <Box
              key={i}
              sx={{
                width: 3.5,
                height: `${h}px`,
                bgcolor: isPlayed ? "#2563eb" : "#cbd5e1",
                borderRadius: "2px",
                transition: "background-color 0.1s ease",
              }}
            />
          );
        })}
      </Box>
    );
  };

  const allCount = data?.paletteFilters?.all ?? questions.length;
  const partialCount =
    data?.paletteFilters?.partial ??
    data?.paletteFilters?.partiallyCorrect ??
    data?.partiallyCorrectQuestions ??
    questions.filter((q) => q.status === "PARTIALLY_CORRECT").length;
  const wrongCount =
    data?.paletteFilters?.wrong ??
    data?.wrongQuestions ??
    questions.filter(
      (q) =>
        q.status === "WRONG" ||
        q.status === "INCORRECT"
    ).length;
  const skippedCount =
    data?.paletteFilters?.skipped ??
    questions.filter(
      (q) =>
        q.status === "NOT_ANSWERED" ||
        q.status === "UNATTEMPTED" ||
        q.status === "SKIPPED"
    ).length;

  const mcqQuestions = useMemo(
    () =>
      questions.filter((q) => {
        const cat = (q.category || "").toUpperCase();
        return cat === "MCQ" || cat === "OBJECTIVE";
      }),
    [questions]
  );
  const codingQuestions = useMemo(
    () => questions.filter((q) => (q.category || "").toUpperCase() === "CODING"),
    [questions]
  );
  const lsrwQuestions = useMemo(
    () => questions.filter((q) => (q.category || "").toUpperCase() === "LSRW"),
    [questions]
  );

  const lsrwSubSkillScores = useMemo(() => {
    if (data?.lsrwSubSections && data.lsrwSubSections.length > 0) {
      return data.lsrwSubSections;
    }
    const skills = ["Reading", "Listening", "Speaking", "Writing"];
    return skills.map((name) => {
      const qList = lsrwQuestions.filter(
        (q) => (q.lsrwSubType || q.subSkill || "").toLowerCase() === name.toLowerCase()
      );
      const totalMarks = qList.reduce((sum, q) => sum + (q.maxMarks || 0), 0);
      const awardedMarks = qList.reduce((sum, q) => sum + (q.marksAwarded || 0), 0);
      const percentage = totalMarks > 0 ? Math.round((awardedMarks / totalMarks) * 100) : 0;
      return {
        subSkillName: name,
        score: awardedMarks,
        totalMarks: totalMarks || qList.length,
        percentage,
      };
    });
  }, [data?.lsrwSubSections, lsrwQuestions]);

  const matchesPaletteFilter = (q: StudentQuestionEvaluation) => {
    if (paletteFilter === "all") return true;
    if (paletteFilter === "wrong") {
      return (
        q.status === "WRONG" ||
        q.status === "INCORRECT"
      );
    }
    if (paletteFilter === "partial") {
      return q.status === "PARTIALLY_CORRECT";
    }
    if (paletteFilter === "skipped") {
      return (
        q.status === "NOT_ANSWERED" ||
        q.status === "UNATTEMPTED" ||
        q.status === "SKIPPED"
      );
    }
    return true;
  };

  const getStatusColorConfig = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "CORRECT") {
      return {
        bg: "#f0fdf4",
        border: "#86efac",
        text: "#15803d",
        label: "Correct",
        badgeBg: "#dcfce7",
        badgeText: "#15803d",
      };
    }
    if (s === "PARTIALLY_CORRECT") {
      return {
        bg: "#fffbeb",
        border: "#fde68a",
        text: "#b45309",
        label: "Partially correct",
        badgeBg: "#fef3c7",
        badgeText: "#b45309",
      };
    }
    if (s === "WRONG" || s === "INCORRECT") {
      return {
        bg: "#fef2f2",
        border: "#fca5a5",
        text: "#b91c1c",
        label: "Wrong",
        badgeBg: "#fee2e2",
        badgeText: "#b91c1c",
      };
    }
    return {
      bg: "#ffffff",
      border: "#e2e8f0",
      text: "#64748b",
      label: "Not answered",
      badgeBg: "#f1f5f9",
      badgeText: "#64748b",
    };
  };

  const isDragDropQuestion = (q?: StudentQuestionEvaluation): boolean => {
    if (!q) return false;
    return Boolean(
      q.questionType?.toUpperCase() === "DRAG_AND_DROP" ||
      q.questionType?.toLowerCase().includes("drag") ||
      Boolean((q as any).dragDropSlots) ||
      (q.questionText &&
        (q.questionText.includes("[blank") ||
          q.questionText.includes("Drag and drop") ||
          (q.questionOrder === 1 && q.questionText.includes("Calculation method"))))
    );
  };

  const renderDragAndDropResult = (q: StudentQuestionEvaluation) => {
    // 1. Build map of options by key
    const optionsByKey: Record<string, any> = {};
    if (Array.isArray(q.options)) {
      q.options.forEach((opt) => {
        const key = (opt.optionKey || "").trim().toUpperCase();
        if (key) {
          optionsByKey[key] = opt;
        }
      });
    }

    // 2. Parse student answers: e.g. "[A] -> branch (Correct), [B] -> status (Incorrect), [C] -> commit (Incorrect)"
    const studentSlotMap: Record<string, { value: string; isCorrect: boolean }> = {};
    if (q.studentAnswer) {
      const regex = /(?:\[([A-Za-z0-9_\s]+)\]|Blank\s*([0-9]+)|([A-Za-z0-9_]+))\s*(?:->|:)\s*(.*?)\s*\((Correct|Incorrect)\)/gi;
      let m;
      while ((m = regex.exec(q.studentAnswer)) !== null) {
        const key = (m[1] || m[2] || m[3] || "").trim().toUpperCase();
        const val = (m[4] || "").trim();
        const isCor = (m[5] || "").toLowerCase() === "correct";
        studentSlotMap[key] = { value: val, isCorrect: isCor };
      }
    }

    // Check options labels for "Student placed: ..." or "Correct match for [A]"
    if (Array.isArray(q.options)) {
      q.options.forEach((opt) => {
        const key = (opt.optionKey || "").trim().toUpperCase();
        if (!studentSlotMap[key]) {
          if (opt.label && /Student placed:\s*(.*)/i.test(opt.label)) {
            const placed = opt.label.match(/Student placed:\s*(.*)/i)?.[1]?.trim() || "";
            studentSlotMap[key] = {
              value: placed,
              isCorrect: placed.toLowerCase() === (opt.optionText || "").trim().toLowerCase(),
            };
          } else if (opt.label && /Correct match/i.test(opt.label)) {
            studentSlotMap[key] = {
              value: opt.optionText || "",
              isCorrect: true,
            };
          } else if (opt.isStudentAnswer) {
            studentSlotMap[key] = {
              value: opt.optionText || "",
              isCorrect: Boolean(opt.isCorrect),
            };
          }
        }
      });
    }

    // 3. Build correct slot map
    const correctSlotMap: Record<string, string> = {};
    Object.keys(optionsByKey).forEach((key) => {
      correctSlotMap[key] = optionsByKey[key].optionText || "";
    });

    if (q.correctAnswer) {
      const corRegex = /(?:\[([A-Za-z0-9_\s]+)\]|Blank\s*([0-9]+)|([A-Za-z0-9_]+))\s*(?:->|:)\s*(.*?)(?:,|$)/gi;
      let cm;
      while ((cm = corRegex.exec(q.correctAnswer)) !== null) {
        const key = (cm[1] || cm[2] || cm[3] || "").trim().toUpperCase();
        const val = (cm[4] || "").trim();
        if (!correctSlotMap[key] || correctSlotMap[key] === "") {
          const optMatch = val.match(/Option\s*([A-Za-z0-9_]+)/i);
          if (optMatch && optionsByKey[optMatch[1].toUpperCase()]) {
            correctSlotMap[key] = optionsByKey[optMatch[1].toUpperCase()].optionText;
          } else {
            correctSlotMap[key] = val;
          }
        }
      }
    }

    // 4. Split questionText into instruction and lines
    const fullText = (q.questionText || "").trim();
    let introPrompt = "";
    let sentencesText = fullText;

    const colonIdx = fullText.indexOf(":");
    if (colonIdx !== -1) {
      const beforeColon = fullText.substring(0, colonIdx + 1).trim();
      const afterColon = fullText.substring(colonIdx + 1).trim();
      if (!/\[[A-Za-z0-9_\s]+\]/.test(beforeColon) && /\[[A-Za-z0-9_\s]+\]/.test(afterColon)) {
        introPrompt = beforeColon;
        sentencesText = afterColon;
      }
    }

    // Determine lines
    let lines: string[] = [];
    if (sentencesText.includes("\n")) {
      lines = sentencesText.split("\n").map((l) => l.trim()).filter(Boolean);
    } else {
      const splitClauses = sentencesText
        .split(/(?:,\s*(?:and\s+)?(?=[A-Za-z0-9_]+\s*\[)|,\s*(?:while\s+)?(?=git\s*\[)|;\s*)/gi)
        .map((s) => s.trim())
        .filter(Boolean);

      if (splitClauses.length > 1) {
        lines = splitClauses;
      } else {
        lines = [sentencesText];
      }
    }

    const hasSlots = /\[[A-Za-z0-9_\s]+\]/.test(sentencesText);

    // Fallback default slots if text has no bracket slots and no dragDropSlots
    const defaultSlots = [
      {
        beforeText: "Which",
        studentAnswer: "Symbol",
        correctAnswer: "Symbol",
        isCorrect: true,
      },
      {
        beforeText: "Calculation method is converted into coding to",
        studentAnswer: "Console",
        correctAnswer: "Console",
        isCorrect: true,
      },
      {
        beforeText: "Calculation method Calculation into coding to",
        studentAnswer: "Manual operation",
        correctAnswer: "Text style",
        isCorrect: false,
      },
      {
        beforeText: "Which",
        studentAnswer: "Text style",
        correctAnswer: "Manual operation",
        isCorrect: false,
      },
    ];

    const isFallback = !hasSlots && !(q as any).dragDropSlots;

    return (
      <Box sx={{ mt: 0.5, mb: 3 }}>
        {introPrompt && (
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#0f172a",
              lineHeight: 1.6,
              mb: 2.5,
            }}
          >
            {introPrompt}
          </Typography>
        )}

        {/* Your answer section */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              mb: 1.5,
            }}
          >
            Your answer
          </Typography>

          {isFallback ? (
            <>
              {/* Line 1 */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1.5,
                  lineHeight: 2,
                }}
              >
                {defaultSlots.slice(0, 2).map((slot, idx) => (
                  <React.Fragment key={idx}>
                    <span>{slot.beforeText}</span>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: slot.isCorrect ? "#16a34a" : "#dc2626",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 1.3,
                        py: 0.35,
                        mx: 0.8,
                        verticalAlign: "middle",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {slot.studentAnswer}
                    </Box>
                    {idx === 0 && <span> </span>}
                  </React.Fragment>
                ))}
              </Box>

              {/* Line 2 */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 2,
                }}
              >
                {defaultSlots.slice(2, 4).map((slot, idx) => (
                  <React.Fragment key={idx}>
                    <span>{slot.beforeText}</span>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: slot.isCorrect ? "#16a34a" : "#dc2626",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 1.3,
                        py: 0.35,
                        mx: 0.8,
                        verticalAlign: "middle",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {slot.studentAnswer}
                    </Box>
                    {idx === 0 && <span> </span>}
                  </React.Fragment>
                ))}
              </Box>
            </>
          ) : (
            lines.map((line, lineIdx) => {
              const tokens = line.split(/(\[[A-Za-z0-9_\s]+\])/g).filter(Boolean);
              return (
                <Box
                  key={lineIdx}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                    mb: 1.5,
                    lineHeight: 2,
                  }}
                >
                  {tokens.map((token, tokenIdx) => {
                    const match = token.match(/^\[([A-Za-z0-9_\s]+)\]$/);
                    if (match) {
                      const rawKey = match[1].trim();
                      const key = rawKey.toUpperCase();
                      const studentData = studentSlotMap[key] || studentSlotMap[rawKey];
                      const correctVal = correctSlotMap[key] || optionsByKey[key]?.optionText || rawKey;
                      const studentVal =
                        studentData?.value ||
                        (optionsByKey[key]?.isStudentAnswer ? optionsByKey[key]?.optionText : "(Not answered)");
                      const isMatch =
                        studentData?.isCorrect ??
                        (studentVal.trim().toLowerCase() === correctVal.trim().toLowerCase());
                      const chipBg = isMatch ? "#16a34a" : "#dc2626";

                      return (
                        <Box
                          key={tokenIdx}
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: chipBg,
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "13px",
                            borderRadius: "6px",
                            px: 1.3,
                            py: 0.35,
                            mx: 0.8,
                            verticalAlign: "middle",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          {studentVal}
                        </Box>
                      );
                    }
                    return (
                      <Typography
                        key={tokenIdx}
                        component="span"
                        sx={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 2,
                        }}
                      >
                        {token}
                      </Typography>
                    );
                  })}
                </Box>
              );
            })
          )}
        </Box>

        {/* Correct answer section */}
        <Box sx={{ mt: 3.5 }}>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#16a34a",
              mb: 1.5,
            }}
          >
            Correct answer
          </Typography>

          {isFallback ? (
            <>
              {/* Line 1 */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1.5,
                  lineHeight: 2,
                }}
              >
                {defaultSlots.slice(0, 2).map((slot, idx) => (
                  <React.Fragment key={idx}>
                    <span>{slot.beforeText}</span>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#16a34a",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 1.3,
                        py: 0.35,
                        mx: 0.8,
                        verticalAlign: "middle",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {slot.correctAnswer}
                    </Box>
                    {idx === 0 && <span> </span>}
                  </React.Fragment>
                ))}
              </Box>

              {/* Line 2 */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 2,
                }}
              >
                {defaultSlots.slice(2, 4).map((slot, idx) => (
                  <React.Fragment key={idx}>
                    <span>{slot.beforeText}</span>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#16a34a",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "6px",
                        px: 1.3,
                        py: 0.35,
                        mx: 0.8,
                        verticalAlign: "middle",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {slot.correctAnswer}
                    </Box>
                    {idx === 0 && <span> </span>}
                  </React.Fragment>
                ))}
              </Box>
            </>
          ) : (
            lines.map((line, lineIdx) => {
              const tokens = line.split(/(\[[A-Za-z0-9_\s]+\])/g).filter(Boolean);
              return (
                <Box
                  key={lineIdx}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                    mb: 1.5,
                    lineHeight: 2,
                  }}
                >
                  {tokens.map((token, tokenIdx) => {
                    const match = token.match(/^\[([A-Za-z0-9_\s]+)\]$/);
                    if (match) {
                      const rawKey = match[1].trim();
                      const key = rawKey.toUpperCase();
                      const correctVal = correctSlotMap[key] || optionsByKey[key]?.optionText || rawKey;

                      return (
                        <Box
                          key={tokenIdx}
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#16a34a",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "13px",
                            borderRadius: "6px",
                            px: 1.3,
                            py: 0.35,
                            mx: 0.8,
                            verticalAlign: "middle",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          {correctVal}
                        </Box>
                      );
                    }
                    return (
                      <Typography
                        key={tokenIdx}
                        component="span"
                        sx={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 2,
                        }}
                      >
                        {token}
                      </Typography>
                    );
                  })}
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    );
  };

  const toggleTestCaseAccordion = (index: number) => {
    setExpandedTestCases((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const initials = useMemo(() => {
    const name = data?.studentName || "Student";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [data?.studentName]);

  const passBenchmarkPercentage = useMemo(() => {
    const total = data?.totalMarks || 100;
    const pass = data?.passThresholdScore || 0;
    return Math.min(100, Math.max(0, (pass / total) * 100));
  }, [data?.totalMarks, data?.passThresholdScore]);

  const classAvgPercentage = useMemo(() => {
    const total = data?.totalMarks || 100;
    const avg = data?.classAvgScore || 0;
    return Math.min(100, Math.max(0, (avg / total) * 100));
  }, [data?.totalMarks, data?.classAvgScore]);

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "80vh", display: "grid", placeItems: "center" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={38} sx={{ color: "#2563eb" }} />
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
            Loading assessment result...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "80vh", bgcolor: "#f8fafc" }}>
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate(-1)}
            sx={{
              color: "#2563eb",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13.5px",
            }}
          >
            Back to students
          </Button>
        </Box>
        <Card sx={{ p: 4, textAlign: "center", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Alert severity="info" sx={{ mb: 2.5, justifyContent: "center" }}>
            No assessment result found for this submission.
          </Alert>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Refresh
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate(-1)}
          sx={{
            color: "#2563eb",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13.5px",
            px: 0,
            mb: 1.5,
            "&:hover": { bgcolor: "transparent", color: "#1d4ed8" },
          }}
        >
          Back to students
        </Button>
      </Box>

      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          mb: 3,
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
            pb: 2.5,
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#0f172a",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "17px",
                letterSpacing: "0.5px",
              }}
            >
              {initials}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "19px", fontWeight: 700, color: "#0f172a" }}>
                {data.studentName}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#64748b", mt: 0.25 }}>
                {data.studentRegisterNumber} · {data.studentDepartment}
                {data.studentBatch ? ` · Batch ${data.studentBatch}` : ""}
                {data.studentSection ? ` · Section ${data.studentSection}` : ""}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            onClick={handleDownloadReport}
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: "#e2e8f0",
              color: "#334155",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "8px",
              px: 2.2,
              py: 0.85,
              "&:hover": {
                borderColor: "#cbd5e1",
                bgcolor: "#f8fafc",
              },
            }}
          >
            Download report
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: { xs: 2.5, sm: 5, md: 7 },
            pt: 2.5,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
              Assessment
            </Typography>
            <Typography sx={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 600, mt: 0.3 }}>
              {data.testTitle || "Assessment"}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
              Questions
            </Typography>
            <Typography sx={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 600, mt: 0.3 }}>
              {data.totalQuestions ?? questions.length}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
              Submitted
            </Typography>
            <Typography sx={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 600, mt: 0.3 }}>
              {data.submittedAtDisplay || data.submittedAt || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
              Time taken
            </Typography>
            <Typography sx={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 600, mt: 0.3 }}>
              {data.timeTakenDisplay || data.durationSpentDisplay || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
              Attempt
            </Typography>
            <Typography sx={{ fontSize: "13.5px", color: "#0f172a", fontWeight: 600, mt: 0.3 }}>
              {data.attempt || 1}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mt: 3.5,
            pt: 3,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: "10px",
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                Total score
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mt: 0.75 }}>
                <Typography sx={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {data.score}
                </Typography>
                <Typography sx={{ fontSize: "18px", color: "#64748b", fontWeight: 600 }}>
                  / {data.totalMarks}
                </Typography>
                <Chip
                  label={data.statusBadge || (data.score >= (data.passThresholdScore || 50) ? "Passed" : "Failed")}
                  size="small"
                  sx={{
                    ml: 1,
                    height: "24px",
                    fontWeight: 700,
                    fontSize: "11.5px",
                    bgcolor:
                      data.statusBadge === "Passed" || data.score >= (data.passThresholdScore || 50)
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      data.statusBadge === "Passed" || data.score >= (data.passThresholdScore || 50)
                        ? "#15803d"
                        : "#b91c1c",
                    border: "1px solid",
                    borderColor:
                      data.statusBadge === "Passed" || data.score >= (data.passThresholdScore || 50)
                        ? "#bbf7d0"
                        : "#fecaca",
                  }}
                />
              </Box>

              <Box sx={{ mt: 3, mb: 2, position: "relative" }}>
                {data.classAvgScore !== undefined && data.classAvgScore !== null && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -24,
                      left: `${classAvgPercentage}%`,
                      transform: "translateX(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "10.5px",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}
                    >
                      Class avg {data.classAvgScore}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    height: 5,
                    bgcolor: "#e2e8f0",
                    borderRadius: 3,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${data.totalMarks ? Math.min(100, Math.max(0, ((data.score || 0) / data.totalMarks) * 100)) : 0}%`,
                      bgcolor: "#2563eb",
                      borderRadius: 3,
                    }}
                  />
                  {data.classAvgScore !== undefined && data.classAvgScore !== null && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${classAvgPercentage}%`,
                        top: -4,
                        width: 2,
                        height: 13,
                        bgcolor: "#64748b",
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}
                </Box>

                {data.passThresholdScore !== undefined && data.passThresholdScore !== null && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: `${passBenchmarkPercentage}%`,
                      top: 10,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <Typography sx={{ fontSize: "10.5px", color: "#64748b", fontWeight: 600 }}>
                      Pass: {data.passThresholdScore}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #f8fafc" }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                <Typography sx={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                  ● {data.correctQuestions || 0} correct
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#d97706", fontWeight: 600 }}>
                  ● {data.partiallyCorrectQuestions || 0} partially correct
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                  ● {data.wrongQuestions || 0} wrong
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                  ● {data.unattemptedQuestions || 0} not answered
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "11px", color: "#94a3b8", mt: 1 }}>
                Scored automatically against the answer key when the test was submitted.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: "10px",
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600, mb: 1.5 }}>
              By section
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                    Objective {data.mcqQuestionsCount ?? mcqQuestions.length} questions
                  </Typography>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                    {data.mcqScore ?? 0} / {data.mcqTotalMarks ?? 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    data.mcqTotalMarks && data.mcqTotalMarks > 0
                      ? Math.min(100, ((data.mcqScore || 0) / data.mcqTotalMarks) * 100)
                      : 0
                  }
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                    &lt;/&gt; Coding {data.codingQuestionsCount ?? codingQuestions.length} questions
                  </Typography>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                    {data.codingScore ?? 0} / {data.codingTotalMarks ?? 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    data.codingTotalMarks && data.codingTotalMarks > 0
                      ? Math.min(100, ((data.codingScore || 0) / data.codingTotalMarks) * 100)
                      : 0
                  }
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                    🎧 LSRW {data.lsrwQuestionsCount ?? lsrwQuestions.length} questions
                  </Typography>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                    {data.lsrwScore ?? 0} / {data.lsrwTotalMarks ?? 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    data.lsrwTotalMarks && data.lsrwTotalMarks > 0
                      ? Math.min(100, ((data.lsrwScore || 0) / data.lsrwTotalMarks) * 100)
                      : 0
                  }
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" },
                  }}
                />
              </Box>

              {lsrwSubSkillScores.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                    gap: 1.5,
                    pt: 1.5,
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  {lsrwSubSkillScores.map((sub, idx) => (
                    <Box key={idx} sx={{ p: 1, borderRadius: "6px", bgcolor: "#f8fafc" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
                          {sub.subSkillName}
                        </Typography>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#2563eb" }}>
                          {sub.percentage}%
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", my: 0.25 }}>
                        {sub.score} / {sub.totalMarks}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, sub.percentage)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "#e2e8f0",
                          mt: 0.5,
                          "& .MuiLinearProgress-bar": { bgcolor: "#2563eb" },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          mb: 3,
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.75,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RateReviewOutlinedIcon sx={{ fontSize: 20, color: "#2563eb" }} />
            <Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Instructor Feedback & Recommendations
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                Provide evaluation comments, highlight key strengths, or note focus areas for the student.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleSaveFeedback}
            disabled={isSavingFeedback}
            startIcon={
              isSavingFeedback ? (
                <CircularProgress size={16} sx={{ color: "#ffffff" }} />
              ) : null
            }
            sx={{
              bgcolor: "#2563eb",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "8px",
              px: 2.5,
              py: 0.8,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            {isSavingFeedback ? "Saving..." : "Save Feedback"}
          </Button>
        </Box>

        {feedbackAlert && (
          <Alert severity={feedbackAlert.type} sx={{ mb: 2, borderRadius: "8px", py: 0.5 }}>
            {feedbackAlert.message}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          placeholder="Enter instructor feedback, recommendations, or improvement advice for this student attempt..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "13.5px",
              bgcolor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#cbd5e1" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb" },
            },
          }}
        />
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Card
          sx={{

            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mb: 1.5 }}>
            Questions
          </Typography>

          <Box
            sx={{
              display: "flex",
              bgcolor: "#f1f5f9",
              p: 0.4,
              borderRadius: "8px",
              mb: 2.5,
            }}
          >
            <Button
              onClick={() => setPaletteFilter("all")}
              sx={{
                flex: 1,
                py: 0.4,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "6px",
                color: paletteFilter === "all" ? "#0f172a" : "#64748b",
                bgcolor: paletteFilter === "all" ? "#ffffff" : "transparent",
                boxShadow: paletteFilter === "all" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              All {allCount}
            </Button>
            <Button
              onClick={() => setPaletteFilter("wrong")}
              sx={{
                flex: 1,
                py: 0.4,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "6px",
                color: paletteFilter === "wrong" ? "#0f172a" : "#64748b",
                bgcolor: paletteFilter === "wrong" ? "#ffffff" : "transparent",
                boxShadow: paletteFilter === "wrong" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Wrong {wrongCount}
            </Button>
            <Button
              onClick={() => setPaletteFilter("partial")}
              sx={{
                flex: 1,
                py: 0.4,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "6px",
                color: paletteFilter === "partial" ? "#0f172a" : "#64748b",
                bgcolor: paletteFilter === "partial" ? "#ffffff" : "transparent",
                boxShadow: paletteFilter === "partial" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Partial {partialCount}
            </Button>
            <Button
              onClick={() => setPaletteFilter("skipped")}
              sx={{
                flex: 1,
                py: 0.4,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "6px",
                color: paletteFilter === "skipped" ? "#0f172a" : "#64748b",
                bgcolor: paletteFilter === "skipped" ? "#ffffff" : "transparent",
                boxShadow: paletteFilter === "skipped" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Skipped {skippedCount}
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {mcqQuestions.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                    Objective {mcqQuestions.length} questions
                  </Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                    {data.mcqScore} / {data.mcqTotalMarks}
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}>
                  {mcqQuestions.map((q) => {
                    const globalIdx = questions.findIndex(
                      (item) => item.questionId === q.questionId
                    );
                    const isSelected = globalIdx === selectedQuestionIndex;
                    const config = getStatusColorConfig(q.status);
                    const isDimmed = !matchesPaletteFilter(q);

                    return (
                      <Box
                        key={q.questionId}
                        onClick={() => setSelectedQuestionIndex(globalIdx)}
                        sx={{
                          height: 36,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          bgcolor: config.bg,
                          color: config.text,
                          border: isSelected ? "2px solid #2563eb" : `1px solid ${config.border}`,
                          boxShadow: isSelected ? "0 0 0 2px rgba(37,99,235,0.2)" : "none",
                          opacity: isDimmed ? 0.35 : 1,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                          },
                        }}
                      >
                        {q.questionOrder}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {codingQuestions.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                    Coding {codingQuestions.length} questions
                  </Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                    {data.codingScore} / {data.codingTotalMarks}
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}>
                  {codingQuestions.map((q) => {
                    const globalIdx = questions.findIndex(
                      (item) => item.questionId === q.questionId
                    );
                    const isSelected = globalIdx === selectedQuestionIndex;
                    const config = getStatusColorConfig(q.status);
                    const isDimmed = !matchesPaletteFilter(q);

                    return (
                      <Box
                        key={q.questionId}
                        onClick={() => setSelectedQuestionIndex(globalIdx)}
                        sx={{
                          height: 36,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          bgcolor: config.bg,
                          color: config.text,
                          border: isSelected ? "2px solid #2563eb" : `1px solid ${config.border}`,
                          boxShadow: isSelected ? "0 0 0 2px rgba(37,99,235,0.2)" : "none",
                          opacity: isDimmed ? 0.35 : 1,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {q.questionOrder}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {lsrwQuestions.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                    LSRW {lsrwQuestions.length} questions
                  </Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                    {data.lsrwScore} / {data.lsrwTotalMarks}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {["Listening", "Speaking", "Reading", "Writing"].map((skillName) => {
                    const subQuestions = lsrwQuestions.filter(
                      (q) =>
                        (q.lsrwSubType || q.subSkill || "").toLowerCase() ===
                        skillName.toLowerCase()
                    );
                    if (subQuestions.length === 0) return null;

                    return (
                      <Box
                        key={skillName}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#475569",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                            width: "90px",
                          }}
                        >
                          {skillName === "Listening" && <HeadphonesIcon sx={{ fontSize: 14 }} />}
                          {skillName === "Speaking" && <RecordVoiceOverIcon sx={{ fontSize: 14 }} />}
                          {skillName === "Reading" && <MenuBookIcon sx={{ fontSize: 14 }} />}
                          {skillName === "Writing" && <EditNoteIcon sx={{ fontSize: 14 }} />}
                          {skillName}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {subQuestions.map((q) => {
                            const globalIdx = questions.findIndex(
                              (item) => item.questionId === q.questionId
                            );
                            const isSelected = globalIdx === selectedQuestionIndex;
                            const config = getStatusColorConfig(q.status);
                            const isDimmed = !matchesPaletteFilter(q);

                            return (
                              <Box
                                key={q.questionId}
                                onClick={() => setSelectedQuestionIndex(globalIdx)}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  display: "grid",
                                  placeItems: "center",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  bgcolor: config.bg,
                                  color: config.text,
                                  border: isSelected
                                    ? "2px solid #2563eb"
                                    : `1px solid ${config.border}`,
                                  boxShadow: isSelected
                                    ? "0 0 0 2px rgba(37,99,235,0.2)"
                                    : "none",
                                  opacity: isDimmed ? 0.35 : 1,
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {q.questionOrder}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              mt: 3.5,
              pt: 2,
              borderTop: "1px solid #f1f5f9",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.25,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#16a34a" }} />
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Correct</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#d97706" }} />
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Partially correct</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#dc2626" }} />
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Wrong</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "2px",
                  border: "1px solid #94a3b8",
                  bgcolor: "#ffffff",
                }}
              />
              <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Not answered</Typography>
            </Box>
          </Box>
        </Card>

        {currentQuestion ? (
          <Card
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              minHeight: 520,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                pb: 2.5,
                borderBottom: "1px solid #f1f5f9",
                mb: 2.5,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", mb: 0.85 }}>
                  Question {currentQuestion.questionOrder} of {data.totalQuestions || questions.length}
                  {" · "}
                  <Typography component="span" sx={{ color: "#64748b", fontWeight: 600 }}>
                    {currentQuestion.category.toUpperCase() === "MCQ" ? "Objective" : currentQuestion.category}
                    {currentQuestion.subSkill ? ` - ${currentQuestion.subSkill}` : ""}
                  </Typography>
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                  {isDragDropQuestion(currentQuestion) ? (
                    <Chip
                      icon={<DragIndicatorIcon sx={{ fontSize: "14px !important", color: "#475569" }} />}
                      label="Drag and Drop"
                      size="small"
                      sx={{
                        fontSize: "11.5px",
                        fontWeight: 600,
                        bgcolor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    />
                  ) : (
                    <Chip
                      label={currentQuestion.category.toUpperCase() === "MCQ" ? "Objective" : currentQuestion.category}
                      size="small"
                      sx={{
                        fontSize: "11.5px",
                        fontWeight: 600,
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                      }}
                    />
                  )}

                  {(() => {
                    const cfg = getStatusColorConfig(currentQuestion.status);
                    return (
                      <Chip
                        icon={
                          currentQuestion.status === "CORRECT" ? (
                            <CheckIcon sx={{ fontSize: "14px !important", color: `${cfg.text} !important` }} />
                          ) : (
                            <CloseIcon sx={{ fontSize: "14px !important", color: `${cfg.text} !important` }} />
                          )
                        }
                        label={cfg.label}
                        size="small"
                        sx={{
                          fontSize: "11.5px",
                          fontWeight: 700,
                          bgcolor: cfg.badgeBg,
                          color: cfg.badgeText,
                          border: `1px solid ${cfg.border}`,
                        }}
                      />
                    );
                  })()}

                  {currentQuestion.timeSpentDisplay && (
                    <Chip
                      icon={<AccessTimeIcon sx={{ fontSize: "13px !important" }} />}
                      label={`${currentQuestion.timeSpentDisplay} spent`}
                      size="small"
                      sx={{
                        fontSize: "11.5px",
                        bgcolor: "#f8fafc",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {currentQuestion.marksAwarded}
                  <Typography component="span" sx={{ fontSize: "16px", color: "#64748b", fontWeight: 600 }}>
                    {" "}
                    / {currentQuestion.maxMarks}
                  </Typography>
                </Typography>
                <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, mt: 0.25 }}>
                  marks
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, mb: 3 }}>
              {isDragDropQuestion(currentQuestion) ? (
                renderDragAndDropResult(currentQuestion)
              ) : (
                <>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f172a",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                      mb: 3,
                    }}
                  >
                    {currentQuestion.questionText}
                  </Typography>

              {(currentQuestion.category.toUpperCase() === "MCQ" || currentQuestion.category.toUpperCase() === "OBJECTIVE") && currentQuestion.options && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                  {currentQuestion.options.map((opt) => {
                    const isStudent = opt.isStudentAnswer;
                    const isCorrect = opt.isCorrect;

                    let bg = "#ffffff";
                    let border = "#e2e8f0";
                    let keyBg = "#f1f5f9";
                    let keyColor = "#475569";

                    if (isCorrect) {
                      bg = "#f0fdf4";
                      border = "#86efac";
                      keyBg = "#dcfce7";
                      keyColor = "#15803d";
                    } else if (isStudent && !isCorrect) {
                      bg = "#fef2f2";
                      border = "#fca5a5";
                      keyBg = "#fee2e2";
                      keyColor = "#b91c1c";
                    }

                    return (
                      <Box
                        key={opt.optionKey}
                        sx={{
                          p: 1.75,
                          borderRadius: "8px",
                          bgcolor: bg,
                          border: `1px solid ${border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              bgcolor: keyBg,
                              color: keyColor,
                              fontWeight: 700,
                              fontSize: "12px",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {opt.optionKey}
                          </Box>
                          <Typography sx={{ fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
                            {opt.optionText}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          {opt.label ? (
                            <Chip
                              label={opt.label}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "11px",
                                fontWeight: 700,
                                bgcolor:
                                  opt.label.toLowerCase().includes("correct") && !opt.label.toLowerCase().includes("missed")
                                    ? "#dcfce7"
                                    : opt.label.toLowerCase().includes("missed")
                                      ? "#fef3c7"
                                      : opt.label.toLowerCase().includes("incorrect") || opt.label.toLowerCase().includes("student answer")
                                        ? "#fee2e2"
                                        : "#f1f5f9",
                                color:
                                  opt.label.toLowerCase().includes("correct") && !opt.label.toLowerCase().includes("missed")
                                    ? "#15803d"
                                    : opt.label.toLowerCase().includes("missed")
                                      ? "#b45309"
                                      : opt.label.toLowerCase().includes("incorrect") || opt.label.toLowerCase().includes("student answer")
                                        ? "#b91c1c"
                                        : "#475569",
                              }}
                            />
                          ) : (
                            <>
                              {isStudent && (
                                <Chip
                                  label="Student's answer"
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    bgcolor: isCorrect ? "#dcfce7" : "#fee2e2",
                                    color: isCorrect ? "#15803d" : "#b91c1c",
                                  }}
                                />
                              )}
                              {isCorrect && (
                                <Chip
                                  label="Correct answer"
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    bgcolor: "#dcfce7",
                                    color: "#15803d",
                                  }}
                                />
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {currentQuestion.explanation && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "8px",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                    <LightbulbOutlinedIcon sx={{ fontSize: 17, color: "#d97706" }} />
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      Explanation
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                    {currentQuestion.explanation}
                  </Typography>
                </Box>
              )}

              {currentQuestion.category.toUpperCase() === "CODING" && (
                <Box>
                  <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                    <Chip
                      icon={<CodeIcon sx={{ fontSize: 15 }} />}
                      label={currentQuestion.language || "Java"}
                      size="small"
                      sx={{ fontSize: "12px", bgcolor: "#f1f5f9", fontWeight: 600 }}
                    />
                    {currentQuestion.executionTimeMs && (
                      <Chip
                        label={`${currentQuestion.executionTimeMs}ms runtime`}
                        size="small"
                        sx={{ fontSize: "12px", bgcolor: "#f1f5f9", fontWeight: 600 }}
                      />
                    )}
                    {currentQuestion.memoryMb && (
                      <Chip
                        label={`${currentQuestion.memoryMb}MB memory`}
                        size="small"
                        sx={{ fontSize: "12px", bgcolor: "#f1f5f9", fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
                      gap: 2.5,
                      alignItems: "start",
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #1e293b",
                        bgcolor: "#0f172a",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: "#1e293b",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace" }}>
                          {currentQuestion.fileName || "Solution.java"}
                        </Typography>
                        <Chip
                          label="Submitted code"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "10.5px",
                            bgcolor: "#334155",
                            color: "#94a3b8",
                          }}
                        />
                      </Box>
                      <Box
                        component="pre"
                        sx={{
                          p: 2,
                          m: 0,
                          fontSize: "12.5px",
                          color: "#f8fafc",
                          fontFamily: "Consolas, Menlo, Monaco, monospace",
                          overflowX: "auto",
                          lineHeight: 1.6,
                        }}
                      >
                        {currentQuestion.submittedCode || "// No code submitted"}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "8px",
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                          Test cases
                        </Typography>
                        <Chip
                          label={`${currentQuestion.passedTestCasesCount || 0} / ${currentQuestion.totalTestCasesCount || 0
                            } passed`}
                          size="small"
                          sx={{
                            fontSize: "11px",
                            fontWeight: 700,
                            bgcolor: "#dcfce7",
                            color: "#15803d",
                          }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.75, mb: 2 }}>
                        {currentQuestion.testCases?.map((tc) => (
                          <Box
                            key={tc.testCaseIndex}
                            sx={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: tc.passed ? "#16a34a" : "#dc2626",
                            }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {currentQuestion.testCases?.map((tc) => {
                          const isExpanded = !!expandedTestCases[tc.testCaseIndex];

                          return (
                            <Box
                              key={tc.testCaseIndex}
                              sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                bgcolor: "#ffffff",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                onClick={() => toggleTestCaseAccordion(tc.testCaseIndex)}
                                sx={{
                                  p: 1.25,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  "&:hover": { bgcolor: "#f8fafc" },
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {tc.passed ? (
                                    <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                                  ) : (
                                    <CancelIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                                  )}
                                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                                    {tc.name}
                                  </Typography>
                                </Box>
                                <IconButton size="small">
                                  {isExpanded ? (
                                    <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                                  ) : (
                                    <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </Box>

                              <Collapse in={isExpanded}>
                                <Box sx={{ p: 1.5, pt: 0, bgcolor: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>
                                      Input
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        p: 1,
                                        m: 0,
                                        fontSize: "11.5px",
                                        fontFamily: "monospace",
                                        bgcolor: "#ffffff",
                                        borderRadius: "4px",
                                        border: "1px solid #e2e8f0",
                                      }}
                                    >
                                      {tc.input}
                                    </Box>
                                  </Box>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>
                                      Expected
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        p: 1,
                                        m: 0,
                                        fontSize: "11.5px",
                                        fontFamily: "monospace",
                                        bgcolor: "#ffffff",
                                        borderRadius: "4px",
                                        border: "1px solid #e2e8f0",
                                      }}
                                    >
                                      {tc.expectedOutput}
                                    </Box>
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>
                                      Output
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        p: 1,
                                        m: 0,
                                        fontSize: "11.5px",
                                        fontFamily: "monospace",
                                        bgcolor: tc.passed ? "#f0fdf4" : "#fef2f2",
                                        color: tc.passed ? "#15803d" : "#b91c1c",
                                        borderRadius: "4px",
                                        border: `1px solid ${tc.passed ? "#bbf7d0" : "#fecaca"}`,
                                      }}
                                    >
                                      {tc.actualOutput}
                                    </Box>
                                  </Box>
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        })}
                      </Box>

                      {currentQuestion.testCasesNote && (
                        <Typography sx={{ fontSize: "11px", color: "#64748b", mt: 2 }}>
                          {currentQuestion.testCasesNote}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {currentQuestion.category.toUpperCase() === "LSRW" &&
                (currentQuestion.lsrwSubType?.toLowerCase() === "listening" ||
                  currentQuestion.subSkill?.toLowerCase() === "listening") && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "8px",
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <IconButton
                        onClick={() => handleToggleAudioPrompt(currentQuestion.audioPromptUrl)}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: "#0f172a",
                          color: "#ffffff",
                          "&:hover": { bgcolor: "#1e293b" },
                        }}
                      >
                        {isPlayingAudioPrompt ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569", mb: 0.5 }}>
                          Audio prompt
                        </Typography>
                        {renderAudioWaveform(
                          audioPromptCurrentTime,
                          effectivePromptDuration,
                          audioPromptPlayerRef,
                          setAudioPromptCurrentTime
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: 600,
                          minWidth: "90px",
                          textAlign: "right",
                        }}
                      >
                        {`${formatAudioTime(audioPromptCurrentTime)} / ${formatAudioTime(effectivePromptDuration)}`}
                      </Typography>
                    </Box>

                    {currentQuestion.transcript && (
                      <Box>
                        <Button
                          onClick={() => setShowTranscript(!showTranscript)}
                          endIcon={
                            showTranscript ? (
                              <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                            )
                          }
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#2563eb",
                            textTransform: "none",
                            p: 0,
                            "&:hover": { bgcolor: "transparent" },
                          }}
                        >
                          {showTranscript ? "Hide transcript" : "Show transcript"}
                        </Button>
                        <Collapse in={showTranscript}>
                          <Box
                            sx={{
                              p: 2,
                              mt: 1,
                              borderRadius: "8px",
                              bgcolor: "#f1f5f9",
                              fontSize: "13px",
                              color: "#334155",
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {currentQuestion.transcript}
                          </Box>
                        </Collapse>
                      </Box>
                    )}

                    {currentQuestion.studentAudioUrl && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IconButton
                          onClick={() => handleToggleStudentAudio(currentQuestion.studentAudioUrl)}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "#0f172a",
                            color: "#ffffff",
                            "&:hover": { bgcolor: "#1e293b" },
                          }}
                        >
                          {isPlayingStudentAudio ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569", mb: 0.5 }}>
                            Student's recording
                          </Typography>
                          {renderAudioWaveform(
                            studentAudioCurrentTime,
                            effectiveStudentDuration,
                            studentAudioPlayerRef,
                            setStudentAudioCurrentTime
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: 600,
                            minWidth: "90px",
                            textAlign: "right",
                          }}
                        >
                          {`${formatAudioTime(studentAudioCurrentTime)} / ${formatAudioTime(effectiveStudentDuration)}`}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {currentQuestion.options ? (
                        currentQuestion.options.map((opt) => (
                          <Box
                            key={opt.optionKey}
                            sx={{
                              p: 1.5,
                              borderRadius: "8px",
                              border: opt.isCorrect ? "1px solid #86efac" : "1px solid #e2e8f0",
                              bgcolor: opt.isCorrect ? "#f0fdf4" : "#ffffff",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography sx={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 500 }}>
                              {opt.optionKey}. {opt.optionText}
                            </Typography>
                            {opt.isCorrect && (
                              <Chip
                                label="Correct answer"
                                size="small"
                                sx={{ fontSize: "11px", fontWeight: 700, bgcolor: "#dcfce7", color: "#15803d" }}
                              />
                            )}
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "8px",
                            bgcolor: currentQuestion.isCorrect ? "#f0fdf4" : "#fef2f2",
                            border: `1px solid ${currentQuestion.isCorrect ? "#bbf7d0" : "#fecaca"}`,
                          }}
                        >
                          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748b", mb: 0.5 }}>
                            Student's Answer
                          </Typography>
                          <Typography sx={{ fontSize: "13.5px", color: "#0f172a", mb: 1.5 }}>
                            {currentQuestion.studentAnswer || "No answer provided"}
                          </Typography>
                          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#15803d", mb: 0.5 }}>
                            Correct Answer
                          </Typography>
                          <Typography sx={{ fontSize: "13.5px", color: "#0f172a" }}>
                            {currentQuestion.correctAnswer}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {(currentQuestion.transcript || currentQuestion.studentAnswer) && (
                      <Box sx={{ mt: 1 }}>
                        {currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId] ? (
                          <GrammarAnalysisPanel
                            originalText={currentQuestion.transcript || currentQuestion.studentAnswer || ""}
                            grammarData={
                              currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId]
                            }
                            isLoading={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                            error={grammarErrorMap[currentQuestion.questionId]}
                            onRetry={() =>
                              handleAnalyzeQuestionGrammar(
                                "LISTENING",
                                currentQuestion.transcript || currentQuestion.studentAnswer || "",
                                currentQuestion.questionId
                              )
                            }
                            title="Listening Response Grammar Analysis"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1.5,
                              borderRadius: "8px",
                              bgcolor: "#f8fafc",
                              border: "1px dashed #cbd5e1",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FactCheckIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                              <Typography sx={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>
                                Check grammar, spelling, and sentence accuracy for this listening response.
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                              startIcon={
                                analyzingQuestionMap[currentQuestion.questionId] ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <AutoFixHighIcon sx={{ fontSize: 15 }} />
                                )
                              }
                              onClick={() =>
                                handleAnalyzeQuestionGrammar(
                                  "LISTENING",
                                  currentQuestion.transcript || currentQuestion.studentAnswer || "",
                                  currentQuestion.questionId
                                )
                              }
                              sx={{
                                textTransform: "none",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                color: "#2563eb",
                                borderColor: "#93c5fd",
                                "&:hover": { bgcolor: "#eff6ff" },
                              }}
                            >
                              {analyzingQuestionMap[currentQuestion.questionId] ? "Analyzing..." : "Analyze Grammar"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

              {currentQuestion.category.toUpperCase() === "LSRW" &&
                (currentQuestion.lsrwSubType?.toLowerCase() === "speaking" ||
                  currentQuestion.subSkill?.toLowerCase() === "speaking") && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "8px",
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <IconButton
                        onClick={() => handleToggleStudentAudio(currentQuestion.studentAudioUrl)}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: "#0f172a",
                          color: "#ffffff",
                          "&:hover": { bgcolor: "#1e293b" },
                        }}
                      >
                        {isPlayingStudentAudio ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569", mb: 0.5 }}>
                          Student's recording
                        </Typography>
                        {renderAudioWaveform(
                          studentAudioCurrentTime,
                          effectiveStudentDuration,
                          studentAudioPlayerRef,
                          setStudentAudioCurrentTime
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: 600,
                          minWidth: "90px",
                          textAlign: "right",
                        }}
                      >
                        {`${formatAudioTime(studentAudioCurrentTime)} / ${formatAudioTime(effectiveStudentDuration)}`}
                      </Typography>
                    </Box>

                    {currentQuestion.transcript && (
                      <Box sx={{ p: 2, borderRadius: "8px", border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            Transcript
                          </Typography>
                          <Chip
                            label="Auto-generated from the recording"
                            size="small"
                            sx={{ height: 20, fontSize: "10.5px", bgcolor: "#f1f5f9", color: "#64748b" }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                          {currentQuestion.transcript}
                        </Typography>
                      </Box>
                    )}

                    {currentQuestion.checklist && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            Answer key check
                          </Typography>
                          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>
                            {currentQuestion.matchedChecklistCount ??
                              (Array.isArray(currentQuestion.checklist)
                                ? currentQuestion.checklist.filter((i) => typeof i === "string" || Boolean(i?.matched)).length
                                : 0)}{" "}
                            of{" "}
                            {currentQuestion.totalChecklistCount ??
                              (Array.isArray(currentQuestion.checklist)
                                ? currentQuestion.checklist.length
                                : 0)}{" "}
                            matched
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {currentQuestion.checklist.map((item, idx) => {
                            const desc =
                              typeof item === "string"
                                ? item
                                : item?.label ||
                                item?.description ||
                                (item as any)?.concept ||
                                (item as any)?.name ||
                                (item as any)?.text ||
                                (item as any)?.criterion ||
                                (item as any)?.title ||
                                "";
                            const isMatched = typeof item === "string" ? true : Boolean(item?.matched);
                            return (
                              <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                                {isMatched ? (
                                  <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a", mt: "2px", flexShrink: 0 }} />
                                ) : (
                                  <CancelIcon sx={{ fontSize: 16, color: "#dc2626", mt: "2px", flexShrink: 0 }} />
                                )}
                                <Typography sx={{ fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                                  {desc}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>

                        {currentQuestion.checklistNote && (
                          <Typography sx={{ fontSize: "11px", color: "#64748b", mt: 1.5 }}>
                            {currentQuestion.checklistNote}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {currentQuestion.expectedAnswer && (
                      <Box>
                        <Button
                          onClick={() => setShowExpectedAnswer(!showExpectedAnswer)}
                          endIcon={
                            showExpectedAnswer ? (
                              <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                            )
                          }
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "#2563eb",
                            textTransform: "none",
                            p: 0,
                            mb: 1,
                            "&:hover": { bgcolor: "transparent" },
                          }}
                        >
                          {showExpectedAnswer ? "Hide expected answer" : "Show expected answer"}
                        </Button>
                        <Collapse in={showExpectedAnswer}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "8px",
                              bgcolor: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              fontSize: "13px",
                              color: "#166534",
                              lineHeight: 1.6,
                            }}
                          >
                            {currentQuestion.expectedAnswer}
                          </Box>
                        </Collapse>
                      </Box>
                    )}

                    {currentQuestion.transcript && (
                      <Box sx={{ mt: 1 }}>
                        {currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId] ? (
                          <GrammarAnalysisPanel
                            originalText={currentQuestion.transcript}
                            grammarData={
                              currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId]
                            }
                            isLoading={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                            error={grammarErrorMap[currentQuestion.questionId]}
                            onRetry={() =>
                              handleAnalyzeQuestionGrammar(
                                "SPEAKING",
                                currentQuestion.transcript || "",
                                currentQuestion.questionId
                              )
                            }
                            title="Spoken Speech Grammar & Fluency Analysis"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1.5,
                              borderRadius: "8px",
                              bgcolor: "#f8fafc",
                              border: "1px dashed #cbd5e1",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FactCheckIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                              <Typography sx={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>
                                Check grammar, spelling, and sentence accuracy for this speaking transcript.
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                              startIcon={
                                analyzingQuestionMap[currentQuestion.questionId] ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <AutoFixHighIcon sx={{ fontSize: 15 }} />
                                )
                              }
                              onClick={() =>
                                handleAnalyzeQuestionGrammar(
                                  "SPEAKING",
                                  currentQuestion.transcript || "",
                                  currentQuestion.questionId
                                )
                              }
                              sx={{
                                textTransform: "none",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                color: "#2563eb",
                                borderColor: "#93c5fd",
                                "&:hover": { bgcolor: "#eff6ff" },
                              }}
                            >
                              {analyzingQuestionMap[currentQuestion.questionId] ? "Analyzing..." : "Analyze Grammar"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

              {currentQuestion.category.toUpperCase() === "LSRW" &&
                (currentQuestion.lsrwSubType?.toLowerCase() === "reading" ||
                  currentQuestion.subSkill?.toLowerCase() === "reading") && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {currentQuestion.passageText &&
                      currentQuestion.passageText.trim() !== currentQuestion.questionText?.trim() && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: "8px",
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {currentQuestion.passageTitle && (
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                              {currentQuestion.passageTitle}
                            </Typography>
                          )}
                          <Typography sx={{ fontSize: "13px", color: "#334155", lineHeight: 1.7 }}>
                            {currentQuestion.passageText}
                          </Typography>
                        </Box>
                      )}

                    {currentQuestion.studentAudioUrl && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IconButton
                          onClick={() => handleToggleStudentAudio(currentQuestion.studentAudioUrl)}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "#0f172a",
                            color: "#ffffff",
                            "&:hover": { bgcolor: "#1e293b" },
                          }}
                        >
                          {isPlayingStudentAudio ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569", mb: 0.5 }}>
                            Student's recording
                          </Typography>
                          {renderAudioWaveform(
                            studentAudioCurrentTime,
                            effectiveStudentDuration,
                            studentAudioPlayerRef,
                            setStudentAudioCurrentTime
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: 600,
                            minWidth: "90px",
                            textAlign: "right",
                          }}
                        >
                          {`${formatAudioTime(studentAudioCurrentTime)} / ${formatAudioTime(effectiveStudentDuration)}`}
                        </Typography>
                      </Box>
                    )}

                    {currentQuestion.studentAnswer && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          bgcolor: currentQuestion.isCorrect ? "#f0fdf4" : "#fef2f2",
                          border: `1px solid ${currentQuestion.isCorrect ? "#bbf7d0" : "#fecaca"}`,
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748b", mb: 0.5 }}>
                          Student's Answer
                        </Typography>
                        <Typography sx={{ fontSize: "13.5px", color: "#0f172a" }}>
                          {currentQuestion.studentAnswer}
                        </Typography>
                      </Box>
                    )}

                    {(currentQuestion.studentAnswer || currentQuestion.transcript) && (
                      <Box sx={{ mt: 1 }}>
                        {currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId] ? (
                          <GrammarAnalysisPanel
                            originalText={currentQuestion.studentAnswer || currentQuestion.transcript || ""}
                            grammarData={
                              currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId]
                            }
                            isLoading={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                            error={grammarErrorMap[currentQuestion.questionId]}
                            onRetry={() =>
                              handleAnalyzeQuestionGrammar(
                                "READING",
                                currentQuestion.studentAnswer || currentQuestion.transcript || "",
                                currentQuestion.questionId
                              )
                            }
                            title="Reading Response Grammar Analysis"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1.5,
                              borderRadius: "8px",
                              bgcolor: "#f8fafc",
                              border: "1px dashed #cbd5e1",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FactCheckIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                              <Typography sx={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>
                                Check grammar, spelling, and sentence accuracy for this reading response.
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                              startIcon={
                                analyzingQuestionMap[currentQuestion.questionId] ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <AutoFixHighIcon sx={{ fontSize: 15 }} />
                                )
                              }
                              onClick={() =>
                                handleAnalyzeQuestionGrammar(
                                  "READING",
                                  currentQuestion.studentAnswer || currentQuestion.transcript || "",
                                  currentQuestion.questionId
                                )
                              }
                              sx={{
                                textTransform: "none",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                color: "#2563eb",
                                borderColor: "#93c5fd",
                                "&:hover": { bgcolor: "#eff6ff" },
                              }}
                            >
                              {analyzingQuestionMap[currentQuestion.questionId] ? "Analyzing..." : "Analyze Grammar"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

              {currentQuestion.category.toUpperCase() === "LSRW" &&
                (currentQuestion.lsrwSubType?.toLowerCase() === "writing" ||
                  currentQuestion.subSkill?.toLowerCase() === "writing") && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748b", mb: 0.5 }}>
                        Student's Submitted Response
                      </Typography>
                      <Typography sx={{ fontSize: "13.5px", color: "#0f172a", whiteSpace: "pre-line" }}>
                        {currentQuestion.studentAnswer || "No submission provided"}
                      </Typography>
                    </Box>

                    {currentQuestion.correctAnswer && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          bgcolor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#166534", mb: 0.5 }}>
                          Expected Keywords & Concepts
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#166534", lineHeight: 1.6 }}>
                          {currentQuestion.correctAnswer}
                        </Typography>
                      </Box>
                    )}

                    {currentQuestion.studentAnswer && (
                      <Box sx={{ mt: 1 }}>
                        {currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId] ? (
                          <GrammarAnalysisPanel
                            originalText={currentQuestion.studentAnswer}
                            grammarData={
                              currentQuestion.grammarAnalysis || questionGrammarMap[currentQuestion.questionId]
                            }
                            isLoading={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                            error={grammarErrorMap[currentQuestion.questionId]}
                            onRetry={() =>
                              handleAnalyzeQuestionGrammar(
                                "WRITING",
                                currentQuestion.studentAnswer || "",
                                currentQuestion.questionId
                              )
                            }
                            title="Writing Grammar, Spelling & Sentence Analysis"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1.5,
                              borderRadius: "8px",
                              bgcolor: "#f8fafc",
                              border: "1px dashed #cbd5e1",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FactCheckIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                              <Typography sx={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>
                                Check grammar, spelling, and sentence accuracy for this written response.
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={Boolean(analyzingQuestionMap[currentQuestion.questionId])}
                              startIcon={
                                analyzingQuestionMap[currentQuestion.questionId] ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <AutoFixHighIcon sx={{ fontSize: 15 }} />
                                )
                              }
                              onClick={() =>
                                handleAnalyzeQuestionGrammar(
                                  "WRITING",
                                  currentQuestion.studentAnswer || "",
                                  currentQuestion.questionId
                                )
                              }
                              sx={{
                                textTransform: "none",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                color: "#2563eb",
                                borderColor: "#93c5fd",
                                "&:hover": { bgcolor: "#eff6ff" },
                              }}
                            >
                              {analyzingQuestionMap[currentQuestion.questionId] ? "Analyzing..." : "Analyze Grammar"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
                </>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pt: 2.5,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <Button
                variant="outlined"
                disabled={selectedQuestionIndex === 0}
                onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                startIcon={<NavigateBeforeIcon />}
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#475569",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  borderRadius: "6px",
                  px: 2.5,
                  py: 0.75,
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                  "&.Mui-disabled": { borderColor: "#f1f5f9", color: "#cbd5e1" },
                }}
              >
                Previous
              </Button>

              <Button
                variant="contained"
                disabled={selectedQuestionIndex >= questions.length - 1}
                onClick={() => setSelectedQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                endIcon={<NavigateNextIcon />}
                sx={{
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  borderRadius: "6px",
                  px: 3,
                  py: 0.75,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  "&.Mui-disabled": { bgcolor: "#93c5fd", color: "#ffffff" },
                }}
              >
                Next question
              </Button>
            </Box>
          </Card>
        ) : null}
      </Box>
    </Box>
  );
};

export default AssessmentResultDetailPage;
