import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  Wifi as WifiIcon,
  DesktopWindows as DesktopWindowsIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  VolumeUp as VolumeUpIcon,
  Mic as MicIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  ArrowBackIosNewRounded as ArrowBackIosNewRoundedIcon,
  ArrowForwardIosRounded as ArrowForwardIosRoundedIcon,
  Headphones as HeadphonesIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  MenuBook as MenuBookIcon,
  EditNote as EditNoteIcon,
  WarningAmber as WarningAmberRoundedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  GraphicEq as GraphicEqIcon,
  Replay as ReplayIcon,
  LockOutlined as LockOutlinedIcon,
} from "@mui/icons-material";
import Editor from "@monaco-editor/react";
import { compileCode, evaluateCodeAgainstTestCases } from "../../utils/codeCompiler";
import { resolveAudioUrl } from "../../utils/audioUtils";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import type { SnackbarState } from "../../types/Snackbar.types";
import { SectionSystemCheckCard } from "../../components/assessment/SectionSystemCheckCard";
import type { SessionCheckType } from "../../components/assessment/SectionSystemCheckCard";

import {
  useGetPreCheckQuery,
  useStartSessionMutation,
  useGetSessionQuery,
  useSaveQuestionResponseMutation,
  useRunCodeMutation,
  useSubmitAssessmentMutation,
  useUploadTakeAssessmentAudioMutation,
  useUploadQuestionBankAudioMutation,
  useCheckGrammarMutation,
} from "../../features/assessment/AssessmentApi";
import { useRecordViolationMutation } from "../../features/violation/ViolationApi";
import type {
  AssessmentQuestionItem,
  AssessmentSectionInfo,
  RunCodeTestCaseResult,
} from "../../types/Assessment.types";
import type { LsrwSection, GrammarCheckResponse } from "../../types/Grammar.types";

type TestStage = "PRE_CHECK" | "SYSTEM_CHECK" | "TEST_SESSION" | "COMPLETED";

export const TakeAssessmentPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [stage, setStage] = useState<TestStage>("PRE_CHECK");

  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);
  const [beepPlayed, setBeepPlayed] = useState<boolean>(false);
  const [micAuthorized, setMicAuthorized] = useState<boolean>(false);

  const [activeSectionKey, setActiveSectionKey] = useState<string>("MCQ");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [paletteFilter, setPaletteFilter] = useState<"All" | "Skipped" | "Flag">("All");

  const [sectionChecksCompleted, setSectionChecksCompleted] = useState<Record<string, boolean>>({});

  const getNormalizedSessionType = (secKey: string): SessionCheckType => {
    const norm = (secKey || "").toUpperCase();
    if (norm.includes("CODE") || norm.includes("CODING") || norm.includes("PROGRAM")) {
      return "CODING";
    }
    if (
      norm.includes("LSRW") ||
      norm.includes("SPEAK") ||
      norm.includes("LISTEN") ||
      norm.includes("READ") ||
      norm.includes("WRITE") ||
      norm.includes("VOICE")
    ) {
      return "LSRW";
    }
    if (norm.includes("MCQ") || norm.includes("APTITUDE") || norm.includes("LOGIC") || norm.includes("GENERAL")) {
      return "MCQ";
    }
    return "OTHER";
  };

  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [codeAnswer, setCodeAnswer] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Python");

  const [answersMap, setAnswersMap] = useState<
    Record<
      string,
      {
        status: "ANSWERED" | "SKIPPED" | "FLAGGED" | "NOT_VISITED" | string;
        selectedOption?: string;
        textResponse?: string;
        code?: string;
        language?: string;
        audioResponseUrl?: string;
        audioBlobUrl?: string;
        transcript?: string;
        accuracy?: number;
        grammarAnalysis?: GrammarCheckResponse;
        grammarError?: string;
      }
    >
  >({});

  const [audioPromptPlaying, setAudioPromptPlaying] = useState<boolean>(false);
  const [completedAudioMap, setCompletedAudioMap] = useState<Record<string, boolean>>({});
  const [audioPromptCurrentTime, setAudioPromptCurrentTime] = useState<number>(0);
  const [audioPromptDuration, setAudioPromptDuration] = useState<number>(0);
  const [audioPromptProgress, setAudioPromptProgress] = useState<number>(0);
  const [audioPromptError, setAudioPromptError] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSecondsLeft, setRecordingSecondsLeft] = useState<number>(15);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any | null>(null);
  const liveTranscriptRef = useRef<string>("");
  const isRecordingVoiceRef = useRef<boolean>(false);
  const readingAccuracyRef = useRef<number>(0);
  const accumulatedTranscriptRef = useRef<string>("");
  const currentSessionTranscriptRef = useRef<string>("");

  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>("");
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState<boolean>(false);
  const studentAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [readingWordStatuses, setReadingWordStatuses] = useState<
    Record<number, "pending" | "correct" | "incorrect" | "current">
  >({});
  const [readingAccuracy, setReadingAccuracy] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isUploadingAudio, setIsUploadingAudio] = useState<boolean>(false);

  const [runsRemaining, setRunsRemaining] = useState<number>(3);
  const [codeTestResults, setCodeTestResults] = useState<RunCodeTestCaseResult[]>([]);
  const [normalizedTestResults, setNormalizedTestResults] = useState<
    Array<{
      testCaseNumber: number;
      input?: string;
      expectedOutput?: string;
      actualOutput?: string;
      passed: boolean;
      statusText?: string;
      isHidden?: boolean;
    }>
  >([]);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);
  const [isRunningCodeCustom, setIsRunningCodeCustom] = useState<boolean>(false);
  const [diagnosticTerminalOutput, setDiagnosticTerminalOutput] = useState<string>("");
  const [isCompilationError, setIsCompilationError] = useState<boolean>(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const getMonacoLanguage = (lang?: string): string => {
    switch (lang?.toLowerCase()) {
      case "python":
        return "python";
      case "java":
        return "java";
      case "c++":
      case "cpp":
        return "cpp";
      case "c":
        return "c";
      case "javascript":
      case "js":
        return "javascript";
      case "typescript":
      case "ts":
        return "typescript";
      default:
        return "plaintext";
    }
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const [submitDialogOpen, setSubmitDialogOpen] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const [violationDialogOpen, setViolationDialogOpen] = useState<boolean>(false);
  const [violationReason, setViolationReason] = useState<string>("");
  const [violationKey, setViolationKey] = useState<string>("");
  const [violationCount, setViolationCount] = useState<number>(0);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: rawPreCheckRes,
    isLoading: isPreCheckLoading,
    isError: isPreCheckError,
    refetch: refetchPreCheck,
  } = useGetPreCheckQuery(id, { skip: !id });

  const [startSessionTrigger, { isLoading: isStartingSession }] = useStartSessionMutation();
  const [saveResponseTrigger] = useSaveQuestionResponseMutation();
  const [runCodeTrigger, { isLoading: isRunningCode }] = useRunCodeMutation();
  const [submitAssessmentTrigger, { isLoading: isSubmittingTest }] = useSubmitAssessmentMutation();
  const [recordViolationTrigger] = useRecordViolationMutation();
  const [uploadTakeAudioTrigger] = useUploadTakeAssessmentAudioMutation();
  const [uploadAudioTrigger] = useUploadQuestionBankAudioMutation();
  const [checkGrammarTrigger] = useCheckGrammarMutation();

  const [analyzingGrammarMap, setAnalyzingGrammarMap] = useState<Record<string, boolean>>({});
  const pendingGrammarCallsRef = useRef<Set<string>>(new Set());

  const runGrammarAnalysis = async (
    section: LsrwSection,
    text: string,
    questionId: string
  ): Promise<GrammarCheckResponse | null> => {
    if (!text || !text.trim() || !questionId) return null;

    if (pendingGrammarCallsRef.current.has(questionId)) {
      return null;
    }

    pendingGrammarCallsRef.current.add(questionId);
    setAnalyzingGrammarMap((prev) => ({ ...prev, [questionId]: true }));

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
        setAnswersMap((prev) => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            grammarAnalysis: payload,
            grammarError: undefined,
          },
        }));
        return payload as GrammarCheckResponse;
      }
      return null;
    } catch (err: any) {
      console.warn("Grammar check completed with non-fatal warning:", err);
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          grammarError: "Grammar analysis is temporarily unavailable. Your answer is safely saved.",
        },
      }));
      return null;
    } finally {
      pendingGrammarCallsRef.current.delete(questionId);
      setAnalyzingGrammarMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const {
    data: rawSessionRes,
    isLoading: isSessionLoading,
    isError: isSessionError,
    refetch: refetchSession,
  } = useGetSessionQuery(id, { skip: !id || stage !== "TEST_SESSION" });

  const preCheckData = (rawPreCheckRes as any)?.data ?? rawPreCheckRes;
  const sessionData = (rawSessionRes as any)?.data ?? rawSessionRes;
  const questionsList: AssessmentQuestionItem[] = sessionData?.questions || [];
  const currentQuestion: AssessmentQuestionItem | undefined = questionsList[currentQuestionIndex];

  const getQuestionSectionKey = (q: any) => ((q?.sectionType || q?.sectionKey || "").toUpperCase());

  const sectionsList: AssessmentSectionInfo[] = React.useMemo(() => {
    if (Array.isArray(sessionData?.sections) && sessionData.sections.length > 0) {
      return sessionData.sections;
    }
    if (sessionData?.sections && typeof sessionData.sections === "object") {
      const vals = Object.values(sessionData.sections) as AssessmentSectionInfo[];
      if (vals.length > 0) return vals;
    }
    if (questionsList.length > 0) {
      const distinctKeys = Array.from(new Set(questionsList.map((q: any) => q.sectionType || q.sectionKey))).filter(Boolean);
      return distinctKeys.map((secKey) => {
        const count = questionsList.filter((q: any) => (q.sectionType || q.sectionKey) === secKey).length;
        const qNums = questionsList.filter((q: any) => (q.sectionType || q.sectionKey) === secKey).map((q) => q.questionNumber || 1);
        return {
          sectionKey: secKey,
          countDisplay: `${count} Questions`,
          startQuestionNumber: Math.min(...qNums),
          endQuestionNumber: Math.max(...qNums),
        };
      });
    }
    const catStr = preCheckData?.categories || "MCQ , LSRW , Coding";
    const categoriesArray = catStr.split(",").map((c: string) => c.trim()).filter(Boolean);
    return categoriesArray.map((cat: string) => ({
      sectionKey: cat.toUpperCase(),
      countDisplay: preCheckData?.totalItems ? `${preCheckData.totalItems} Questions` : "",
      startQuestionNumber: 1,
      endQuestionNumber: preCheckData?.totalItems || 1,
    }));
  }, [sessionData?.sections, questionsList, preCheckData?.categories, preCheckData?.totalItems]);

  const isSectionCompleted = React.useCallback(
    (secKey: string): boolean => {
      const normKey = (secKey || "").toUpperCase();
      if (completedSections.includes(normKey)) return true;

      const secIdx = sectionsList.findIndex(
        (s) => (s?.sectionKey || "").toUpperCase() === normKey
      );
      const activeIdx = sectionsList.findIndex(
        (s) => (s?.sectionKey || "").toUpperCase() === (activeSectionKey || "").toUpperCase()
      );
      if (secIdx !== -1 && activeIdx !== -1 && secIdx < activeIdx) {
        return true;
      }
      return false;
    },
    [completedSections, sectionsList, activeSectionKey]
  );

  useEffect(() => {
    const qSec = (currentQuestion as any)?.sectionType || currentQuestion?.sectionKey;
    if (qSec) {
      setActiveSectionKey(qSec.toUpperCase());
    } else if (sectionsList.length > 0 && !activeSectionKey) {
      setActiveSectionKey(sectionsList[0].sectionKey);
    }
  }, [currentQuestion, sectionsList]);

  useEffect(() => {
    if (sessionData?.timeRemainingSeconds && sessionData.timeRemainingSeconds > 0) {
      setRemainingSeconds(sessionData.timeRemainingSeconds);
    } else {
      const durationMins = sessionData?.durationMinutes || preCheckData?.durationMinutes || 8;
      setRemainingSeconds(durationMins * 60);
    }
  }, [sessionData?.timeRemainingSeconds, sessionData?.durationMinutes, preCheckData?.durationMinutes]);

  useEffect(() => {
    if (stage !== "TEST_SESSION") return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (Array.isArray(sessionData?.questions) && sessionData.questions.length > 0) {
      setAnswersMap((prev) => {
        const next = { ...prev };
        sessionData.questions.forEach((q: any) => {
          if (!next[q.id]) {
            const hasOption = Boolean(q.savedOptionKey || q.selectedOption);
            const hasText = Boolean(q.savedTextResponse || q.textResponse);
            const hasCode = Boolean(q.savedCode || q.code);
            const hasAudio = Boolean(q.savedAudioResponseUrl || q.audioResponseUrl);
            const isAnswered = hasOption || hasText || hasCode || hasAudio;
            next[q.id] = {
              status: q.status || (isAnswered ? "ANSWERED" : "NOT_VISITED"),
              selectedOption: q.savedOptionKey || q.selectedOption || "",
              textResponse: q.savedTextResponse || q.textResponse || "",
              code: q.savedCode || q.code || (typeof q.starterCode === "string" ? q.starterCode : ""),
              language: q.savedLanguage || q.language || "Python",
              audioResponseUrl: q.savedAudioResponseUrl || q.audioResponseUrl || "",
              transcript: q.transcript || "",
              accuracy: q.accuracy || 0,
            };
          }
        });
        return next;
      });
    }
  }, [sessionData?.questions]);

  useEffect(() => {
    if (currentQuestion) {
      const saved = answersMap[currentQuestion.id];
      const opt =
        saved?.selectedOption !== undefined
          ? saved.selectedOption
          : ((currentQuestion as any).savedOptionKey || currentQuestion.selectedOption || "");
      setSelectedOption(opt);

      const txt =
        saved?.textResponse !== undefined
          ? saved.textResponse
          : ((currentQuestion as any).savedTextResponse || currentQuestion.textResponse || "");
      setTextAnswer(txt);

      const availableLangs =
        currentQuestion.supportedLanguages && currentQuestion.supportedLanguages.length > 0
          ? currentQuestion.supportedLanguages
          : (currentQuestion.starterCode && typeof currentQuestion.starterCode === "object"
            ? Object.keys(currentQuestion.starterCode)
            : ["Java", "Python", "C++"]);

      const lang =
        saved?.language ||
        (currentQuestion as any).savedLanguage ||
        currentQuestion.language ||
        (availableLangs.length > 0 ? availableLangs[0] : "Java");
      setSelectedLanguage(lang);

      let qCode =
        saved?.code !== undefined
          ? saved.code
          : ((currentQuestion as any).savedCode || currentQuestion.code || "");
      if (!qCode && currentQuestion.starterCode) {
        if (typeof currentQuestion.starterCode === "object") {
          qCode =
            (currentQuestion.starterCode as any)[lang] ||
            (currentQuestion.starterCode as any)["Java"] ||
            (currentQuestion.starterCode as any)["Python"] ||
            Object.values(currentQuestion.starterCode)[0] ||
            "";
        } else {
          qCode = currentQuestion.starterCode;
        }
      }
      setCodeAnswer(qCode);

      const qSec = (currentQuestion as any).sectionType || currentQuestion.sectionKey;
      if (qSec) {
        const nextSec = qSec.toUpperCase();
        if (activeSectionKey && activeSectionKey.toUpperCase() !== nextSec) {
          setCompletedSections((prev) =>
            prev.includes(activeSectionKey.toUpperCase())
              ? prev
              : [...prev, activeSectionKey.toUpperCase()]
          );
        }
        setActiveSectionKey(nextSec);
      }
      if (currentQuestion.runsRemaining !== undefined) {
        setRunsRemaining(currentQuestion.runsRemaining);
      }
      setCodeTestResults([]);
      setNormalizedTestResults([]);
      setSelectedTestCaseIndex(0);
      setDiagnosticTerminalOutput("");

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setAudioPromptPlaying(false);
      setAudioPromptProgress(0);
      setAudioPromptCurrentTime(0);
      setAudioPromptDuration(0);
      setAudioPromptError(false);

      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
        studentAudioPlayerRef.current = null;
      }
      setIsPlayingRecordedAudio(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn("Stop mediaRecorder on question change:", e);
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (e) {
          console.warn("Abort speech recognition on question change:", e);
        }
        speechRecognitionRef.current = null;
      }
      setIsRecordingVoice(false);
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }

      const savedAudio =
        saved?.audioResponseUrl ||
        saved?.audioBlobUrl ||
        (currentQuestion as any).savedAudioResponseUrl ||
        (currentQuestion as any).audioResponseUrl ||
        "";
      setRecordedAudioUrl(savedAudio);
      setLiveTranscript(saved?.transcript || (currentQuestion as any).transcript || "");
      setReadingAccuracy(saved?.accuracy || (currentQuestion as any).accuracy || 0);
      setReadingWordStatuses({});
    }
  }, [currentQuestionIndex, currentQuestion?.id]);

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request error", err);
    }
  };

  const exitFullscreen = async () => {
    try {
      const doc = document as any;
      if (doc.exitFullscreen && doc.fullscreenElement) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen && doc.mozFullScreenElement) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen && doc.msFullscreenElement) {
        await doc.msExitFullscreen();
      }
    } catch (err) {
      console.warn("Exit fullscreen error", err);
    }
  };

  const triggerViolation = (type: string, description: string, keyVal?: string) => {
    setViolationReason(description);
    setViolationKey(keyVal || "");
    setViolationDialogOpen(true);
    setViolationCount((prev) => prev + 1);

    recordViolationTrigger({
      assignmentId: id,
      assessmentId: sessionData?.assessmentId || preCheckData?.assessmentId || id,
      violationType: type,
      key: keyVal,
      description,
      timestamp: new Date().toISOString(),
      status: "Pending",
      severity: "HIGH",
    }).catch((err) => {
      console.warn("Error posting violation", err);
    });
  };

  useEffect(() => {
    if (stage !== "TEST_SESSION") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^F([1-9]|1[0-2])$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(
          "FUNCTION_KEY_PRESSED",
          `Function key [${e.key}] was pressed. Function keys (F1–F12) are strictly prohibited during the assessment.`,
          e.key
        );
        return;
      }

      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(
          "DEV_TOOLS_ATTEMPT",
          `Developer tools shortcut [Ctrl+Shift+${e.key.toUpperCase()}] was detected. Inspecting elements is restricted.`
        );
        return;
      }

      if (e.ctrlKey && e.key.toUpperCase() === "U") {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(
          "VIEW_SOURCE_ATTEMPT",
          "Attempted to view source code using [Ctrl+U]."
        );
        return;
      }

      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        triggerViolation(
          "TAB_SWITCH",
          "Window switching shortcut [Alt+Tab] was pressed."
        );
        return;
      }

      if (e.key === "Escape") {
        triggerViolation(
          "FULLSCREEN_EXIT",
          "Escape key was pressed to exit full-screen mode."
        );
      }
    };

    const handleFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFull && stage === "TEST_SESSION" && !submitDialogOpen) {
        triggerViolation(
          "FULLSCREEN_EXIT",
          "Exited full-screen mode. The assessment must remain in full-screen at all times."
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && stage === "TEST_SESSION" && !submitDialogOpen) {
        triggerViolation(
          "TAB_SWITCH",
          "Tab switch detected. Navigating away from the assessment tab is not permitted."
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stage, submitDialogOpen, id, sessionData?.assessmentId, preCheckData?.assessmentId]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, "0")} : ${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  const handlePlayBeep = () => {
    if (preCheckData?.hardwareChecks?.audioPlaybackTestUrl) {
      try {
        const audio = new Audio(preCheckData.hardwareChecks.audioPlaybackTestUrl);
        audio.play().then(() => setBeepPlayed(true)).catch(() => playSyntheticBeep());
        return;
      } catch {
        playSyntheticBeep();
        return;
      }
    }
    playSyntheticBeep();
  };

  const playSyntheticBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
      setBeepPlayed(true);
    } catch {
      setBeepPlayed(true);
    }
  };

  const handleAuthorizeMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicAuthorized(true);
    } catch {
      setMicAuthorized(true);
    }
  };

  const handleConfirmStartTest = async () => {
    try {
      const res = await startSessionTrigger(id).unwrap();
      const sessionPayload = (res as any)?.data ?? res;
      if (sessionPayload?.timeRemainingSeconds) {
        setRemainingSeconds(sessionPayload.timeRemainingSeconds);
      }
      setStage("TEST_SESSION");
      await enterFullscreen();
    } catch (err: any) {
      setStage("TEST_SESSION");
      refetchSession();
      await enterFullscreen();
    }
  };

  const handleProceedTestAfterViolation = async () => {
    setViolationDialogOpen(false);
    await enterFullscreen();
    setSnackbar({
      open: true,
      message: "Returned to full screen. Please refrain from pressing function keys.",
      severity: "warning",
    });
  };

  const handleCloseTestAfterViolation = async () => {
    setViolationDialogOpen(false);
    await exitFullscreen();
    handleFinalSubmit();
  };

  const handleSelectOption = (optKey: string) => {
    setSelectedOption(optKey);
    if (currentQuestion) {
      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          selectedOption: optKey,
          status: "ANSWERED",
        },
      }));

      saveResponseTrigger({
        id,
        questionId: currentQuestion.id,
        body: {
          action: "SAVE",
          selectedOption: optKey,
          option: optKey,
          answer: optKey,
          value: optKey,
          optionKey: optKey,
          savedOptionKey: optKey,
        } as any,
      }).catch((err) => console.warn("Auto-save option error:", err));
    }
  };

  const cleanReadingWord = (w: string): string => {
    if (!w) return "";
    return w
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, "")
      .trim();
  };

  const calcLevenshtein = (a: string, b: string): number => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = i;
      for (let j = 1; j <= b.length; j++) {
        const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
        row[j - 1] = prev;
        prev = val;
      }
      row[b.length] = prev;
    }
    return row[b.length];
  };

  const READING_NUMBER_WORDS: Record<string, string[]> = {
    "0": ["zero"],
    "1": ["one"],
    "2": ["two"],
    "3": ["three"],
    "4": ["four"],
    "5": ["five"],
    "6": ["six"],
    "7": ["seven"],
    "8": ["eight"],
    "9": ["nine"],
    "10": ["ten"],
    "11": ["eleven"],
    "12": ["twelve"],
    "13": ["thirteen"],
    "14": ["fourteen"],
    "15": ["fifteen"],
    "16": ["sixteen"],
    "17": ["seventeen"],
    "18": ["eighteen"],
    "19": ["nineteen"],
    "20": ["twenty"],
    "27": ["twentyseven", "twenty-seven", "twenty", "seven"],
    "30": ["thirty"],
    "40": ["forty"],
    "50": ["fifty"],
    "100": ["hundred", "onehundred"],
  };

  const isReadingWordMatch = (target: string, spoken: string): boolean => {
    if (!target || !spoken) return false;
    const t = cleanReadingWord(target);
    const s = cleanReadingWord(spoken);
    if (!t || !s) return false;
    if (t === s) return true;

    if (READING_NUMBER_WORDS[t]?.includes(s) || READING_NUMBER_WORDS[s]?.includes(t)) {
      return true;
    }

    const tNoHyphen = t.replace(/-/g, "");
    const sNoHyphen = s.replace(/-/g, "");
    if (tNoHyphen === sNoHyphen) return true;

    if (t.length >= 4 && s.length >= 4) {
      if (t.startsWith(s) || s.startsWith(t)) {
        if (Math.abs(t.length - s.length) <= 3) return true;
      }
      if (t.endsWith(s) || s.endsWith(t)) {
        if (Math.abs(t.length - s.length) <= 3) return true;
      }
      const maxDist = t.length > 6 ? 2 : 1;
      if (calcLevenshtein(t, s) <= maxDist) return true;
    }

    return false;
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setSnackbar({ open: true, message: "Microphone access is not supported in this browser.", severity: "error" });
        return;
      }

      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
        setIsPlayingRecordedAudio(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "audio/webm;codecs=opus";
      if (typeof MediaRecorder !== "undefined") {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
              ? "audio/mp4"
              : "";
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        handleSaveAudioResponse(audioBlob);
      };

      setReadingWordStatuses({});
      setReadingAccuracy(0);
      readingAccuracyRef.current = 0;
      setLiveTranscript("");
      liveTranscriptRef.current = "";
      accumulatedTranscriptRef.current = "";
      currentSessionTranscriptRef.current = "";
      isRecordingVoiceRef.current = true;

      const isReading =
        Boolean(currentQuestion?.readableParagraph) ||
        currentQuestion?.subSkill?.toLowerCase() === "reading" ||
        currentQuestion?.skill?.toLowerCase() === "reading" ||
        (currentQuestion as any)?.lsrwSubType?.toLowerCase() === "reading" ||
        (currentQuestion as any)?.sectionType?.toLowerCase() === "reading" ||
        (currentQuestion as any)?.category?.toLowerCase() === "reading";

      const passageRaw = currentQuestion?.readableParagraph || (isReading ? currentQuestion?.questionText : "") || "";
      const passageWords = passageRaw.split(/\s+/).filter(Boolean);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let sessionTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              sessionTranscript += event.results[i][0].transcript + " ";
            }
            sessionTranscript = sessionTranscript.trim();
            currentSessionTranscriptRef.current = sessionTranscript;

            const combinedTranscript = (
              accumulatedTranscriptRef.current + " " + sessionTranscript
            ).trim();
            liveTranscriptRef.current = combinedTranscript;
            setLiveTranscript(combinedTranscript);

            if (isReading && passageWords.length > 0) {
              const spokenWords = combinedTranscript
                .split(/\s+/)
                .map(cleanReadingWord)
                .filter(Boolean);

              const newStatuses: Record<number, "pending" | "correct" | "incorrect" | "current"> = {};
              let sIdx = 0;
              let correctCount = 0;
              let attemptedCount = 0;
              let lastMatchedTargetIdx = -1;

              for (let tIdx = 0; tIdx < passageWords.length; tIdx++) {
                const targetClean = cleanReadingWord(passageWords[tIdx]);
                if (!targetClean) {
                  newStatuses[tIdx] = "correct";
                  continue;
                }

                if (sIdx >= spokenWords.length) {
                  if (tIdx === lastMatchedTargetIdx + 1 || (lastMatchedTargetIdx === -1 && tIdx === 0 && spokenWords.length > 0)) {
                    newStatuses[tIdx] = "current";
                  } else {
                    newStatuses[tIdx] = "pending";
                  }
                  continue;
                }

                const currentSpoken = spokenWords[sIdx];

                if (isReadingWordMatch(targetClean, currentSpoken)) {
                  newStatuses[tIdx] = "correct";
                  correctCount++;
                  attemptedCount++;
                  lastMatchedTargetIdx = tIdx;
                  sIdx++;
                  continue;
                }

                if (sIdx + 1 < spokenWords.length) {
                  const combinedSpoken = currentSpoken + spokenWords[sIdx + 1];
                  if (isReadingWordMatch(targetClean, combinedSpoken)) {
                    newStatuses[tIdx] = "correct";
                    correctCount++;
                    attemptedCount++;
                    lastMatchedTargetIdx = tIdx;
                    sIdx += 2;
                    continue;
                  }
                }

                if (
                  tIdx > 0 &&
                  isReadingWordMatch(cleanReadingWord(passageWords[tIdx - 1]), currentSpoken)
                ) {
                  sIdx++;
                  if (sIdx < spokenWords.length && isReadingWordMatch(targetClean, spokenWords[sIdx])) {
                    newStatuses[tIdx] = "correct";
                    correctCount++;
                    attemptedCount++;
                    lastMatchedTargetIdx = tIdx;
                    sIdx++;
                    continue;
                  }
                }

                let lookaheadFound = false;
                for (let look = 1; look <= 2 && sIdx + look < spokenWords.length; look++) {
                  if (isReadingWordMatch(targetClean, spokenWords[sIdx + look])) {
                    newStatuses[tIdx] = "correct";
                    correctCount++;
                    attemptedCount++;
                    lastMatchedTargetIdx = tIdx;
                    sIdx = sIdx + look + 1;
                    lookaheadFound = true;
                    break;
                  }
                }
                if (lookaheadFound) continue;

                let skippedTarget = false;
                for (let lookT = 1; lookT <= 2 && tIdx + lookT < passageWords.length; lookT++) {
                  if (isReadingWordMatch(cleanReadingWord(passageWords[tIdx + lookT]), currentSpoken)) {
                    skippedTarget = true;
                    break;
                  }
                }

                if (skippedTarget) {
                  newStatuses[tIdx] = "incorrect";
                  attemptedCount++;
                  continue;
                }

                newStatuses[tIdx] = "incorrect";
                attemptedCount++;
                sIdx++;
              }

              if (lastMatchedTargetIdx + 1 < passageWords.length && spokenWords.length > 0) {
                const hasCurrent = Object.values(newStatuses).includes("current");
                if (!hasCurrent) {
                  newStatuses[lastMatchedTargetIdx + 1] = "current";
                }
              }

              const accuracyVal = attemptedCount > 0
                ? Math.min(100, Math.round((correctCount / attemptedCount) * 100))
                : 0;

              readingAccuracyRef.current = accuracyVal;
              setReadingWordStatuses(newStatuses);
              setReadingAccuracy(accuracyVal);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Speech recognition warning/error:", e?.error, e);
          };

          recognition.onend = () => {
            accumulatedTranscriptRef.current = (
              accumulatedTranscriptRef.current + " " + currentSessionTranscriptRef.current
            ).trim();
            currentSessionTranscriptRef.current = "";

            if (isRecordingVoiceRef.current && mediaRecorderRef.current?.state === "recording") {
              try {
                recognition.start();
              } catch (err) {
              }
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition initialization error:", e);
        }
      }

      mediaRecorder.start(250);
      setIsRecordingVoice(true);

      const limit = currentQuestion?.recordingTimeLimitSeconds || (isReading ? 90 : 15);
      setRecordingSecondsLeft(limit);

      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = setInterval(() => {
        setRecordingSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(voiceTimerRef.current!);
            voiceTimerRef.current = null;
            stopVoiceRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone recording error:", err);
      setSnackbar({ open: true, message: "Microphone access denied or unavailable.", severity: "error" });
    }
  };

  const stopVoiceRecording = () => {
    isRecordingVoiceRef.current = false;
    accumulatedTranscriptRef.current = (
      accumulatedTranscriptRef.current + " " + currentSessionTranscriptRef.current
    ).trim();
    currentSessionTranscriptRef.current = "";

    setIsRecordingVoice(false);
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Error stopping MediaRecorder:", err);
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (err) {
        console.warn("Error stopping SpeechRecognition:", err);
      }
      speechRecognitionRef.current = null;
    }
  };

  const handleSaveAudioResponse = async (audioBlob: Blob) => {
    if (!currentQuestion) return;
    const blobUrl = URL.createObjectURL(audioBlob);
    setRecordedAudioUrl(blobUrl);
    setIsUploadingAudio(true);

    let uploadedAudioUrl = "";

    try {
      const formData = new FormData();
      const ext = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      const audioFile = new File([audioBlob], `response_${currentQuestion.id}.${ext}`, {
        type: audioBlob.type || "audio/webm",
      });
      formData.append("audio", audioFile);
      formData.append("file", audioFile);

      const uploadRes: any = await uploadTakeAudioTrigger({
        id,
        questionId: currentQuestion.id,
        formData,
      }).unwrap();

      uploadedAudioUrl =
        uploadRes?.data?.url ||
        uploadRes?.url ||
        uploadRes?.data?.audioUrl ||
        uploadRes?.audioUrl ||
        uploadRes?.data?.audioResponseUrl ||
        uploadRes?.audioResponseUrl ||
        "";
    } catch (err) {
      console.warn("Take assessment audio upload failed, trying fallback:", err);
      try {
        const fallbackFormData = new FormData();
        fallbackFormData.append("file", audioBlob);
        const fbRes: any = await uploadAudioTrigger(fallbackFormData).unwrap();
        uploadedAudioUrl = fbRes?.data?.url || fbRes?.url || "";
      } catch (e) {
        console.warn("Fallback upload also failed:", e);
      }
    }

    if (!uploadedAudioUrl) {
      try {
        uploadedAudioUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
      } catch (e) {
        uploadedAudioUrl = blobUrl;
      }
    }

    setIsUploadingAudio(false);

    const transcriptText = liveTranscriptRef.current || "";
    const currentQId = currentQuestion.id;

    const finalAccuracy = readingAccuracyRef.current || readingAccuracy || undefined;
    saveResponseTrigger({
      id,
      questionId: currentQId,
      body: {
        action: "SAVE",
        audioResponseUrl: uploadedAudioUrl,
        transcript: transcriptText || undefined,
        textResponse: transcriptText || undefined,
        accuracy: finalAccuracy,
      } as any,
    })
      .then(() => {
        setSnackbar({ open: true, message: "Audio response saved successfully!", severity: "success" });
      })
      .catch((err) => {
        console.warn("Save audio response error:", err);
      });

    setAnswersMap((prev) => ({
      ...prev,
      [currentQId]: {
        ...prev[currentQId],
        status: "ANSWERED",
        audioResponseUrl: uploadedAudioUrl,
        audioBlobUrl: blobUrl,
        transcript: transcriptText,
        accuracy: finalAccuracy || 0,
      },
    }));

    if (transcriptText.trim()) {
      let sec: LsrwSection = "SPEAKING";
      const qSubSkill = (currentQuestion.subSkill || (currentQuestion as any).lsrwSubType || "").toLowerCase();
      if (qSubSkill === "reading" || currentQuestion.readableParagraph) {
        sec = "READING";
      } else if (qSubSkill === "listening" || currentQuestion.audioPromptUrl) {
        sec = "LISTENING";
      }
      void runGrammarAnalysis(sec, transcriptText, currentQId);
    }
  };

  const handleToggleVoiceRecording = () => {
    if (isRecordingVoice) {
      stopVoiceRecording();
      setSnackbar({ open: true, message: "Recording stopped and saved.", severity: "success" });
    } else {
      startVoiceRecording();
    }
  };

  const handleTogglePlayRecordedAudio = () => {
    if (!recordedAudioUrl) return;

    if (isPlayingRecordedAudio && studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
      setIsPlayingRecordedAudio(false);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setAudioPromptPlaying(false);
      }

      if (!studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current = new Audio(recordedAudioUrl);
        studentAudioPlayerRef.current.onended = () => {
          setIsPlayingRecordedAudio(false);
        };
        studentAudioPlayerRef.current.onerror = () => {
          setIsPlayingRecordedAudio(false);
          setSnackbar({ open: true, message: "Unable to play recorded audio.", severity: "error" });
        };
      } else if (studentAudioPlayerRef.current.src !== recordedAudioUrl) {
        studentAudioPlayerRef.current.src = recordedAudioUrl;
      }

      studentAudioPlayerRef.current
        .play()
        .then(() => setIsPlayingRecordedAudio(true))
        .catch((err) => {
          console.warn("Play recorded audio error:", err);
          setIsPlayingRecordedAudio(false);
        });
    }
  };

  const navigateToQuestion = (targetIndex: number, actionType?: "SAVE" | "SKIP" | "FLAG") => {
    if (targetIndex < 0 || targetIndex >= questionsList.length) return;

    const targetQ = questionsList[targetIndex];
    if (targetQ) {
      const targetSecKey = getQuestionSectionKey(targetQ);
      if (isSectionCompleted(targetSecKey)) {
        setSnackbar({
          open: true,
          message: `${targetSecKey} session has already been completed and locked.`,
          severity: "warning",
        });
        return;
      }
    }

    if (currentQuestion) {
      const existing = answersMap[currentQuestion.id];
      const opt = selectedOption !== undefined ? selectedOption : (existing?.selectedOption || "");
      const txt = textAnswer !== undefined ? textAnswer : (existing?.textResponse || "");
      const cd = codeAnswer !== undefined ? codeAnswer : (existing?.code || "");
      const lang = selectedLanguage || existing?.language || "Python";
      const audioUrl = existing?.audioResponseUrl || recordedAudioUrl || "";
      const transcriptVal = existing?.transcript || liveTranscript || "";

      let nextStatus = existing?.status || "NOT_VISITED";
      if (actionType === "SKIP") {
        nextStatus = "SKIPPED";
      } else if (actionType === "FLAG") {
        nextStatus = "FLAGGED";
      } else if (opt || txt.trim() || cd || audioUrl) {
        nextStatus = "ANSWERED";
      }

      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          status: nextStatus,
          selectedOption: opt,
          textResponse: txt,
          code: cd,
          language: lang,
          audioResponseUrl: audioUrl,
          audioBlobUrl: existing?.audioBlobUrl,
          transcript: transcriptVal,
          accuracy: existing?.accuracy || readingAccuracy,
          grammarAnalysis: existing?.grammarAnalysis,
          grammarError: existing?.grammarError,
        },
      }));

      if (txt.trim()) {
        const qSubSkill = (currentQuestion.subSkill || (currentQuestion as any).lsrwSubType || "").toLowerCase();
        let sec: LsrwSection = "WRITING";
        if (qSubSkill === "reading" || currentQuestion.readableParagraph) {
          sec = "READING";
        } else if (qSubSkill === "listening" || currentQuestion.audioPromptUrl) {
          sec = "LISTENING";
        }
        if (!existing?.grammarAnalysis && !pendingGrammarCallsRef.current.has(currentQuestion.id)) {
          void runGrammarAnalysis(sec, txt, currentQuestion.id);
        }
      }

      const backendAction = actionType || (nextStatus === "ANSWERED" ? "SAVE" : "SKIP");
      saveResponseTrigger({
        id,
        questionId: currentQuestion.id,
        body: {
          action: backendAction,
          selectedOption: opt || undefined,
          option: opt || undefined,
          answer: opt || txt || transcriptVal || undefined,
          value: opt || txt || undefined,
          optionKey: opt || undefined,
          savedOptionKey: opt || undefined,
          textResponse: txt || undefined,
          code: cd || undefined,
          submittedCode: cd || undefined,
          userCode: cd || undefined,
          sourceCode: cd || undefined,
          language: lang || undefined,
          audioResponseUrl: audioUrl || undefined,
          transcript: transcriptVal || undefined,
        } as any,
      }).catch((err) => console.warn("Navigate save error:", err));
    }

    setCurrentQuestionIndex(targetIndex);
  };

  const handlePersistResponse = async (
    action: "SAVE" | "SKIP" | "FLAG",
    nextIndexOffset = 0
  ) => {
    const nextIdx = currentQuestionIndex + nextIndexOffset;
    navigateToQuestion(nextIdx, action);
  };

  const getQuestionAudioKey = (q?: AssessmentQuestionItem, idx?: number) => {
    if (!q) return String(idx ?? 0);
    return String(q.id || q.questionNumber || idx || 0);
  };

  const isCurrentAudioFinished = Boolean(
    !currentQuestion?.audioPromptUrl ||
    completedAudioMap[getQuestionAudioKey(currentQuestion, currentQuestionIndex)] ||
    answersMap[currentQuestion?.id || ""]?.selectedOption ||
    answersMap[currentQuestion?.id || ""]?.textResponse ||
    answersMap[currentQuestion?.id || ""]?.audioResponseUrl ||
    (currentQuestion as any)?.savedOption ||
    (currentQuestion as any)?.savedTextResponse ||
    (currentQuestion as any)?.savedAudioResponseUrl
  );

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleToggleAudioPrompt = () => {
    if (!currentQuestion?.audioPromptUrl) return;
    const qKey = getQuestionAudioKey(currentQuestion, currentQuestionIndex);

    if (completedAudioMap[qKey] || isCurrentAudioFinished) {
      return;
    }

    const resolvedUrl = resolveAudioUrl(currentQuestion.audioPromptUrl);
    if (audioPlayerRef.current) {
      if (audioPromptPlaying) {
        audioPlayerRef.current.pause();
        setAudioPromptPlaying(false);
      } else {
        audioPlayerRef.current.play().catch((err) => {
          console.warn("Audio play error:", err);
          setAudioPromptPlaying(false);
        });
        setAudioPromptPlaying(true);
      }
    } else {
      const audio = new Audio(resolvedUrl);
      audioPlayerRef.current = audio;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setAudioPromptDuration(audio.duration);
        }
      };

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setAudioPromptCurrentTime(audio.currentTime);
          setAudioPromptProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setAudioPromptPlaying(false);
        setAudioPromptProgress(100);
        setCompletedAudioMap((prev) => ({ ...prev, [qKey]: true }));
        audioPlayerRef.current = null;
      };

      audio.onerror = (e) => {
        console.warn("Audio playback error:", e);
        setAudioPromptPlaying(false);
        setAudioPromptError(true);
      };

      audio.play().catch((err) => {
        console.warn("Audio play error:", err);
        setAudioPromptPlaying(false);
        setAudioPromptError(true);
      });
      setAudioPromptPlaying(true);
    }
  };

  const renderAudioPromptPlayer = (isFinished: boolean) => {
    if (!currentQuestion?.audioPromptUrl) return null;

    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: "12px",
          bgcolor: isFinished ? "#f0fdf4" : "#f8fafc",
          border: `1.5px solid ${isFinished ? "#bbf7d0" : "#e2e8f0"}`,
          mb: 3,
          transition: "all 0.25s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleToggleAudioPrompt}
            disabled={isFinished}
            sx={{
              bgcolor: isFinished ? "#16a34a" : "#0f172a",
              color: "#ffffff",
              "&:hover": {
                bgcolor: isFinished ? "#16a34a" : "#1e293b",
              },
              "&.Mui-disabled": {
                bgcolor: isFinished ? "#16a34a" : "#94a3b8",
                color: "#ffffff",
              },
              width: 44,
              height: 44,
            }}
          >
            {isFinished ? (
              <CheckCircleIcon sx={{ fontSize: 24 }} />
            ) : audioPromptPlaying ? (
              <PauseIcon sx={{ fontSize: 24 }} />
            ) : (
              <PlayArrowIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: isFinished ? "#166534" : "#1e293b" }}>
                {isFinished ? "Audio prompt (Completed)" : "Audio prompt"}
              </Typography>
              {isFinished && (
                <Chip
                  label="Played"
                  size="small"
                  sx={{
                    bgcolor: "#dcfce7",
                    color: "#15803d",
                    fontWeight: 700,
                    fontSize: "11px",
                    height: 20,
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: "12px", color: isFinished ? "#15803d" : "#64748b", mt: 0.25 }}>
              {isFinished
                ? "Audio playback finished • Question unlocked"
                : audioPromptDuration > 0
                  ? `${formatAudioTime(audioPromptCurrentTime)} / ${formatAudioTime(audioPromptDuration)}`
                  : currentQuestion.audioDuration || "Click play to listen"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "3px", height: 26, px: 1 }}>
            {[8, 14, 22, 16, 10, 18, 24, 12, 18, 10, 16, 20, 14, 8].map((h, i) => (
              <Box
                key={i}
                sx={{
                  width: 3.5,
                  height: audioPromptPlaying ? `${h}px` : isFinished ? "10px" : "6px",
                  bgcolor: isFinished ? "#16a34a" : audioPromptPlaying ? "#2563eb" : "#cbd5e1",
                  borderRadius: "2px",
                  transition: "height 0.2s ease",
                }}
              />
            ))}
          </Box>
        </Box>

        {!isFinished && (audioPromptProgress > 0 || audioPromptPlaying) && (
          <Box sx={{ mt: 2, width: "100%", bgcolor: "#e2e8f0", height: 4, borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                width: `${audioPromptProgress}%`,
                bgcolor: "#2563eb",
                transition: "width 0.2s linear",
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderAudioLockedPlaceholder = () => (
    <Box
      sx={{
        p: 4,
        borderRadius: "12px",
        bgcolor: "#f8fafc",
        border: "1.5px dashed #cbd5e1",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        mb: 3,
      }}
    >
      <HeadphonesIcon sx={{ fontSize: 40, color: "#64748b" }} />
      <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
        Listen to the audio to unlock the question
      </Typography>
      <Typography sx={{ fontSize: "13px", color: "#64748b", maxWidth: 460 }}>
        Please play and listen to the complete audio prompt above. The question, response field, and options will be displayed once the audio has finished playing.
      </Typography>
      {audioPromptError && (
        <Box sx={{ mt: 1 }}>
          <Alert severity="warning" sx={{ mb: 1, fontSize: "12px" }}>
            The audio prompt could not be loaded. You can unlock the question to continue.
          </Alert>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const qKey = getQuestionAudioKey(currentQuestion, currentQuestionIndex);
              setCompletedAudioMap((prev) => ({ ...prev, [qKey]: true }));
            }}
          >
            Unlock Question
          </Button>
        </Box>
      )}
    </Box>
  );

  const handleRunCode = async () => {
    if (!currentQuestion || runsRemaining <= 0) return;
    setIsRunningCodeCustom(true);
    setRunsRemaining((prev) => Math.max(0, prev - 1));

    const rawCases = (currentQuestion as any).testCases || currentQuestion.visibleTestCases || [];
    const questionTitle = currentQuestion.codingTitle || currentQuestion.questionText || "";

    const compilation = compileCode(codeAnswer, selectedLanguage);

    if (compilation.isCompilationError) {
      setIsCompilationError(true);

      if (monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = compilation.errors.map((err) => ({
            startLineNumber: err.line,
            startColumn: Math.max(1, err.column - (err.codeSnippet?.length || 1)),
            endLineNumber: err.line,
            endColumn: Math.max(err.column + 1, (err.codeSnippet?.length || 1) + 2),
            message: err.message,
            severity: monacoRef.current.MarkerSeverity.Error,
          }));
          monacoRef.current.editor.setModelMarkers(model, "compiler", markers);
        }
      }

      const failingCases = rawCases.map((tc: any, idx: number) => ({
        testCaseNumber: tc.testCaseIndex || idx + 1,
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        actualOutput: "Compilation Error: See terminal output for details",
        passed: false,
        statusText: "Compilation Error",
        isHidden: Boolean(tc.isHidden),
      }));

      setNormalizedTestResults(failingCases);
      setDiagnosticTerminalOutput(compilation.formattedOutput);
      setSelectedTestCaseIndex(0);
      setIsRunningCodeCustom(false);
      return;
    }

    setIsCompilationError(false);
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, "compiler", []);
      }
    }

    try {
      const res = await runCodeTrigger({
        id,
        questionId: currentQuestion.id,
        body: { code: codeAnswer, language: selectedLanguage },
      }).unwrap();

      const runData = (res as any)?.data ?? res;
      if (runData.runsRemaining !== undefined) {
        setRunsRemaining(runData.runsRemaining);
      }

      if (runData.compileError || runData.hasCompileError || (runData.stderr && !runData.stdout && runData.testCases?.length === 0)) {
        setIsCompilationError(true);
        setDiagnosticTerminalOutput(runData.compileError || runData.stderr);
        const failingCases = rawCases.map((tc: any, idx: number) => ({
          testCaseNumber: tc.testCaseIndex || idx + 1,
          input: tc.input || "",
          expectedOutput: tc.expectedOutput || "",
          actualOutput: "Compilation Error",
          passed: false,
          statusText: "Compilation Error",
          isHidden: Boolean(tc.isHidden),
        }));
        setNormalizedTestResults(failingCases);
        setSelectedTestCaseIndex(0);
        return;
      }

      const backendCases = runData.testCaseResults || runData.testCases || [];
      if (backendCases.length > 0) {
        const merged = backendCases.map((bc: any, idx: number) => {
          const match =
            rawCases.find(
              (rc: any) =>
                (rc.testCaseIndex || rc.id) === (bc.testCaseNumber || bc.testCaseIndex || idx + 1)
            ) || rawCases[idx];
          return {
            testCaseNumber: bc.testCaseNumber || bc.testCaseIndex || idx + 1,
            input: bc.input || match?.input || "",
            expectedOutput: bc.expectedOutput || match?.expectedOutput || "",
            actualOutput:
              bc.actualOutput || (bc.passed ? (match?.expectedOutput || "") : "Wrong Output"),
            passed: Boolean(bc.passed),
            statusText: bc.statusText || (bc.passed ? "Passed" : "Wrong Answer"),
            isHidden: Boolean(match?.isHidden),
          };
        });
        setNormalizedTestResults(merged);
        const passedCount = merged.filter((m: any) => m.passed).length;
        setDiagnosticTerminalOutput(
          runData.diagnosticOutput ||
          runData.stdout ||
          `Code executed successfully: ${passedCount}/${merged.length} test cases passed.`
        );
        setSelectedTestCaseIndex(0);
      } else {
        const evalResult = evaluateCodeAgainstTestCases(
          codeAnswer,
          selectedLanguage,
          rawCases,
          questionTitle
        );
        setNormalizedTestResults(evalResult.testCases);
        setDiagnosticTerminalOutput(evalResult.diagnosticOutput);
        setSelectedTestCaseIndex(0);
      }
    } catch (err: any) {
      const evalResult = evaluateCodeAgainstTestCases(
        codeAnswer,
        selectedLanguage,
        rawCases,
        questionTitle
      );
      setNormalizedTestResults(evalResult.testCases);
      setDiagnosticTerminalOutput(evalResult.diagnosticOutput);
      setSelectedTestCaseIndex(0);
    } finally {
      setIsRunningCodeCustom(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await exitFullscreen();
      const res = await submitAssessmentTrigger({ id, body: {} as any }).unwrap();
      const payload = (res as any)?.data ?? res;
      setSubmissionResult(payload);
      setSubmitDialogOpen(false);
      setStage("COMPLETED");
    } catch (err: any) {
      await exitFullscreen();
      setSubmitDialogOpen(false);
      setStage("COMPLETED");
    }
  };

  const filteredQuestions = questionsList.filter((q) => {
    const qStatus = answersMap[q.id]?.status || q.status;
    if (paletteFilter === "Skipped") return qStatus === "SKIPPED";
    if (paletteFilter === "Flag") return qStatus === "FLAGGED";
    return true;
  });

  const pageTitle = sessionData?.title || preCheckData?.title || "Logical Thinking test";
  const pageCategories = sessionData?.categories || preCheckData?.categories || "MCQ , LSRW , Coding";

  const activeSectionInfo = sectionsList.find(
    (s) => (s?.sectionKey || "").toUpperCase() === (activeSectionKey || "").toUpperCase()
  );
  const activeSectionCountText =
    activeSectionInfo?.countDisplay ||
    (questionsList.length > 0
      ? `${questionsList.filter((q) => getQuestionSectionKey(q) === (activeSectionKey || "").toUpperCase()).length} Questions`
      : preCheckData?.totalItems
        ? `${preCheckData.totalItems} Questions`
        : "20 Questions");

  const currentSecKeyUpper = (activeSectionKey || "").toUpperCase();
  const isCurrentSectionChecked = Boolean(sectionChecksCompleted[currentSecKeyUpper]);
  const activeSectionQuestions = React.useMemo(() => {
    return questionsList.filter(
      (q) => getQuestionSectionKey(q) === currentSecKeyUpper
    );
  }, [questionsList, currentSecKeyUpper]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", color: "#101828", display: "flex", flexDirection: "column" }}>
      {stage === "COMPLETED" ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", p: 3 }}>
          <Card
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 480,
              border: "1px solid #eaecf0",
              borderRadius: "16px",
              bgcolor: "#ffffff",
              p: 4.5,
              textAlign: "center",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#ecfdf3",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <CheckIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#101828" }}>
              Assessment Submitted!
            </Typography>
            <Typography sx={{ fontSize: "13.5px", color: "#667085", mt: 1, mb: 3.5 }}>
              Your responses have been recorded and evaluated successfully.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => {
                  const targetId = submissionResult?.studentAssignmentId || id;
                  navigate(`/student/result/${targetId}`);
                }}
                sx={{
                  bgcolor: "#2563eb",
                  color: "#ffffff",
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                View Detailed Result
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/student/assessments")}
                sx={{
                  borderColor: "#d0d5dd",
                  color: "#344054",
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#98a2b3" },
                }}
              >
                Return to Assessments
              </Button>
            </Box>
          </Card>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              pb: 2,
              borderBottom: "1px solid #eaecf0",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#101828" }}>
                {pageTitle}
              </Typography>
              <Typography sx={{ fontSize: "12.5px", color: "#667085", mt: 0.25 }}>
                {pageCategories}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 500, mb: 0.2 }}>
                  Time remaining
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.75,
                    py: 0.5,
                    borderRadius: "20px",
                    border: remainingSeconds < 300 && remainingSeconds > 0 ? "1.5px solid #ef4444" : "1px solid #fee2e2",
                    bgcolor: remainingSeconds < 300 && remainingSeconds > 0 ? "#fef2f2" : "#ffffff",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: remainingSeconds < 300 && remainingSeconds > 0 ? "#ef4444" : "#e11d48",
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {formatTimer(
                      remainingSeconds > 0
                        ? remainingSeconds
                        : (sessionData?.durationMinutes || preCheckData?.durationMinutes || 8) * 60
                    )}
                  </Typography>
                  <AccessTimeIcon
                    sx={{
                      fontSize: 16,
                      color: remainingSeconds < 300 && remainingSeconds > 0 ? "#ef4444" : "#e11d48",
                    }}
                  />
                </Box>
              </Box>

              {stage === "TEST_SESSION" && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setSubmitDialogOpen(true)}
                  sx={{
                    bgcolor: "#101828",
                    color: "#ffffff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    borderRadius: "6px",
                    px: 2,
                    ml: 1,
                    "&:hover": { bgcolor: "#1f2937" },
                  }}
                >
                  Submit Test
                </Button>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                stage === "TEST_SESSION" && isCurrentSectionChecked && (activeSectionKey || "").toUpperCase() === "CODING"
                  ? { xs: "1fr", lg: "260px 1fr 280px" }
                  : stage === "TEST_SESSION"
                    ? { xs: "1fr", lg: "260px 1fr" }
                    : { xs: "1fr", md: "260px 1fr" },
              gap: 2.5,
              alignItems: "start",
              flex: 1,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #eaecf0",
                  borderRadius: "12px",
                  bgcolor: "#ffffff",
                  p: 1.75,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#101828" }}>
                    {activeSectionKey}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                    {activeSectionCountText}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {sectionsList.map((sec) => {
                    const isActive = (activeSectionKey || "").toUpperCase() === (sec?.sectionKey || "").toUpperCase();
                    const isCompleted = isSectionCompleted(sec.sectionKey);

                    return (
                      <Box
                        key={sec.sectionKey}
                        onClick={() => {
                          if (isCompleted) {
                            setSnackbar({
                              open: true,
                              message: `${sec.sectionKey} session is completed and locked.`,
                              severity: "warning",
                            });
                            return;
                          }
                          setActiveSectionKey(sec.sectionKey);
                          if (stage === "TEST_SESSION" && questionsList.length > 0) {
                            const idx = questionsList.findIndex(
                              (q) => getQuestionSectionKey(q) === (sec?.sectionKey || "").toUpperCase()
                            );
                            if (idx !== -1) navigateToQuestion(idx);
                          }
                        }}
                        sx={{
                          py: 0.75,
                          px: 1.5,
                          borderRadius: "6px",
                          bgcolor: isActive ? "#831843" : isCompleted ? "#f8fafc" : "#ffffff",
                          color: isActive ? "#ffffff" : isCompleted ? "#94a3b8" : "#475467",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: "13px",
                          cursor: isCompleted ? "not-allowed" : "pointer",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 0.75,
                          border: isActive
                            ? "1px solid #831843"
                            : isCompleted
                              ? "1px dashed #cbd5e1"
                              : "1px solid #e2e8f0",
                          opacity: isCompleted ? 0.7 : 1,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isActive ? "#831843" : isCompleted ? "#f8fafc" : "#f8fafc",
                          },
                        }}
                      >
                        {isCompleted && (
                          <LockOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        )}
                        <span>{sec.sectionKey}</span>
                        {isCompleted ? (
                          <Chip
                            label="Completed"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "9.5px",
                              fontWeight: 700,
                              bgcolor: "#f1f5f9",
                              color: "#64748b",
                              ml: 0.5,
                            }}
                          />
                        ) : sectionChecksCompleted[(sec.sectionKey || "").toUpperCase()] ? (
                          <CheckCircleIcon sx={{ fontSize: 14, color: isActive ? "#ffffff" : "#16a34a", ml: 0.5 }} />
                        ) : null}
                      </Box>
                    );
                  })}
                </Box>
              </Card>

              {stage === "TEST_SESSION" && (
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #eaecf0",
                    borderRadius: "12px",
                    bgcolor: "#ffffff",
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderRadius: "8px",
                      bgcolor: "#f1f5f9",
                      p: "3px",
                      mb: 2,
                    }}
                  >
                    {(["All", "Skipped", "Flag"] as const).map((tab) => (
                      <Box
                        key={tab}
                        onClick={() => setPaletteFilter(tab)}
                        sx={{
                          flex: 1,
                          textAlign: "center",
                          py: 0.4,
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: paletteFilter === tab ? 600 : 500,
                          bgcolor: paletteFilter === tab ? "#ffffff" : "transparent",
                          color: paletteFilter === tab ? "#0f172a" : "#64748b",
                          boxShadow: paletteFilter === tab ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                          cursor: "pointer",
                        }}
                      >
                        {tab}
                      </Box>
                    ))}
                  </Box>

                  {(activeSectionKey || "").toUpperCase() === "LSRW" ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                      {[
                        { name: "Listening", icon: <HeadphonesIcon sx={{ fontSize: 14 }} /> },
                        { name: "Speaking", icon: <RecordVoiceOverIcon sx={{ fontSize: 14 }} /> },
                        { name: "Reading", icon: <MenuBookIcon sx={{ fontSize: 14 }} /> },
                        { name: "Writing", icon: <EditNoteIcon sx={{ fontSize: 14 }} /> },
                      ].map((group) => {
                        const groupQuestions = questionsList.filter(
                          (q) =>
                            getQuestionSectionKey(q) === "LSRW" &&
                            q.subSkill?.toLowerCase() === group.name.toLowerCase()
                        );
                        if (groupQuestions.length === 0) return null;
                        return (
                          <Box key={group.name}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, color: "#64748b" }}>
                              {group.icon}
                              <Typography sx={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>
                                {group.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.75 }}>
                              {groupQuestions.map((qItem) => {
                                const idx = questionsList.findIndex((q) => q.id === qItem.id);
                                const isCurrent = currentQuestionIndex === idx;
                                const isCompletedSec = isSectionCompleted(getQuestionSectionKey(qItem));
                                const qStatus = answersMap[qItem.id]?.status || qItem?.status;

                                let bg = "#ffffff";
                                let color = "#334155";
                                if (qStatus === "ANSWERED") {
                                  bg = "#16a34a";
                                  color = "#ffffff";
                                } else if (qStatus === "SKIPPED") {
                                  bg = "#ea580c";
                                  color = "#ffffff";
                                } else if (qStatus === "FLAGGED") {
                                  bg = "#2563eb";
                                  color = "#ffffff";
                                }

                                return (
                                  <Box
                                    key={qItem.id}
                                    onClick={() => {
                                      if (isCompletedSec) {
                                        setSnackbar({
                                          open: true,
                                          message: "This question belongs to a completed session and is locked.",
                                          severity: "warning",
                                        });
                                        return;
                                      }
                                      if (idx !== -1) navigateToQuestion(idx);
                                    }}
                                    sx={{
                                      height: 28,
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      border: "1px solid #e2e8f0",
                                      bgcolor: bg,
                                      color,
                                      cursor: isCompletedSec ? "not-allowed" : "pointer",
                                      opacity: isCompletedSec ? 0.45 : 1,
                                      boxShadow: isCurrent ? "0 0 0 2px #ffffff, 0 0 0 3.5px #831843" : "none",
                                    }}
                                  >
                                    {qItem.questionNumber}
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.75 }}>
                      {(filteredQuestions.length > 0
                        ? filteredQuestions.filter(
                          (q) => !activeSectionKey || getQuestionSectionKey(q) === (activeSectionKey || "").toUpperCase()
                        )
                        : questionsList.filter(
                          (q) => !activeSectionKey || getQuestionSectionKey(q) === (activeSectionKey || "").toUpperCase()
                        )
                      ).map((q, idx) => {
                        const actualIdx = questionsList.findIndex((item) => item.id === q.id);
                        const isCurrent = currentQuestionIndex === actualIdx;
                        const isCompletedSec = isSectionCompleted(getQuestionSectionKey(q));
                        const qStatus = answersMap[q.id]?.status || q.status;

                        let bg = "#ffffff";
                        let color = "#334155";
                        if (qStatus === "ANSWERED") {
                          bg = "#16a34a";
                          color = "#ffffff";
                        } else if (qStatus === "SKIPPED") {
                          bg = "#ea580c";
                          color = "#ffffff";
                        } else if (qStatus === "FLAGGED") {
                          bg = "#2563eb";
                          color = "#ffffff";
                        }

                        return (
                          <Box
                            key={q.id || idx}
                            onClick={() => {
                              if (isCompletedSec) {
                                setSnackbar({
                                  open: true,
                                  message: "This question belongs to a completed session and is locked.",
                                  severity: "warning",
                                });
                                return;
                              }
                              navigateToQuestion(actualIdx);
                            }}
                            sx={{
                              height: 32,
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: 600,
                              border: "1px solid #e2e8f0",
                              bgcolor: bg,
                              color,
                              cursor: isCompletedSec ? "not-allowed" : "pointer",
                              opacity: isCompletedSec ? 0.45 : 1,
                              boxShadow: isCurrent ? "0 0 0 2px #ffffff, 0 0 0 3.5px #831843" : "none",
                            }}
                          >
                            {q.questionNumber || idx + 1}
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2.5, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#16a34a" }} />
                      <Typography sx={{ fontSize: "10.5px", color: "#64748b" }}>Answered</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#ea580c" }} />
                      <Typography sx={{ fontSize: "10.5px", color: "#64748b" }}>Skipped</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#2563eb" }} />
                      <Typography sx={{ fontSize: "10.5px", color: "#64748b" }}>Flag</Typography>
                    </Box>
                  </Box>
                </Card>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {stage === "PRE_CHECK" && (
                <Box>
                  {isPreCheckLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                      <CircularProgress sx={{ color: "#2563eb" }} />
                    </Box>
                  ) : isPreCheckError ? (
                    <Alert
                      severity="error"
                      action={
                        <Button color="inherit" size="small" onClick={() => refetchPreCheck()}>
                          Retry
                        </Button>
                      }
                      sx={{ borderRadius: "10px" }}
                    >
                      Failed to load assessment pre-check. Please verify your assignment ID and retry.
                    </Alert>
                  ) : (
                    <Card
                      elevation={0}
                      sx={{
                        border: "1px solid #eaecf0",
                        borderRadius: "16px",
                        bgcolor: "#ffffff",
                        p: { xs: 3, sm: 4 },
                        boxShadow: "0 4px 16px rgba(16, 24, 40, 0.05)",
                      }}
                    >
                      <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#101828" }}>
                        Communication
                      </Typography>
                      <Typography sx={{ fontSize: "13.5px", color: "#667085", mt: 0.5, mb: 3 }}>
                        Please complete the hardware connectivity and audits before beginning the assessment.
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 2,
                          mb: 3.5,
                          p: 2,
                          borderRadius: "12px",
                          bgcolor: "#f8fafc",
                          border: "1px solid #f1f5f9",
                          textAlign: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>Duration</Typography>
                          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#101828", mt: 0.25 }}>
                            {preCheckData?.durationMinutes} min
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>Questions</Typography>
                          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#101828", mt: 0.25 }}>
                            {preCheckData?.totalItems}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>Marks</Typography>
                          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#101828", mt: 0.25 }}>
                            {preCheckData?.totalMarks}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "12px", color: "#667085", fontWeight: 500 }}>Attempts</Typography>
                          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#101828", mt: 0.25 }}>
                            {preCheckData?.attemptsAllowed ?? 1}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <VolumeUpIcon sx={{ color: "#64748b" }} />
                            <Typography sx={{ fontSize: "13.5px", color: "#334155" }}>
                              Sound check: Ensure audio output is clear.
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handlePlayBeep}
                            sx={{
                              borderColor: beepPlayed ? "#16a34a" : "#22c55e",
                              color: beepPlayed ? "#16a34a" : "#22c55e",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "6px",
                              px: 2,
                            }}
                          >
                            {beepPlayed ? "Played ✓" : preCheckData?.hardwareChecks?.audioPlaybackLabel || "Play the beep"}
                          </Button>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <MicIcon sx={{ color: "#64748b" }} />
                            <Typography sx={{ fontSize: "13.5px", color: "#334155" }}>
                              Microphone check: Authorize microphone access for spoken responses.
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAuthorizeMic}
                            sx={{
                              borderColor: micAuthorized ? "#16a34a" : "#ef4444",
                              color: micAuthorized ? "#16a34a" : "#ef4444",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "6px",
                              px: 2,
                            }}
                          >
                            {micAuthorized
                              ? "Authorized ✓"
                              : preCheckData?.hardwareChecks?.microphoneStatus === "Authorized"
                                ? "Authorized ✓"
                                : preCheckData?.hardwareChecks?.microphoneAuthLabel || "Authorize mic"}
                          </Button>
                        </Box>
                      </Box>

                      {preCheckData?.instructions && preCheckData.instructions.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828", mb: 1 }}>
                            Instructions
                          </Typography>
                          <Box component="ul" sx={{ pl: 2.5, m: 0, color: "#475467", fontSize: "13px", lineHeight: 1.8 }}>
                            {preCheckData.instructions.map((inst: string, idx: number) => (
                              <li key={idx}>{inst}</li>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {preCheckData?.declarationText && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={declarationAccepted}
                              onChange={(e) => setDeclarationAccepted(e.target.checked)}
                              sx={{ color: "#2563eb", "&.Mui-checked": { color: "#2563eb" } }}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: "13px", color: "#344054" }}>
                              {preCheckData.declarationText}
                            </Typography>
                          }
                          sx={{ mb: 3.5 }}
                        />
                      )}

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          variant="contained"
                          disabled={Boolean(preCheckData?.declarationText && !declarationAccepted)}
                          onClick={() => setStage("SYSTEM_CHECK")}
                          sx={{
                            bgcolor: "#2563eb",
                            color: "#ffffff",
                            px: 3.5,
                            py: 1,
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "#1d4ed8" },
                          }}
                        >
                          Continue to system check
                        </Button>
                      </Box>
                    </Card>
                  )}
                </Box>
              )}

              {stage === "SYSTEM_CHECK" && (
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #eaecf0",
                    borderRadius: "16px",
                    bgcolor: "#ffffff",
                    p: 4,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#101828" }}>
                    System check
                  </Typography>
                  <Typography sx={{ fontSize: "13.5px", color: "#667085", mt: 0.5, mb: 3.5 }}>
                    Making sure your device is ready for a timed test.
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, mb: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.75,
                        borderRadius: "10px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <WifiIcon sx={{ fontSize: 20, color: "#64748b" }} />
                        <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                          Network connection stable
                        </Typography>
                      </Box>
                      <CheckIcon
                        sx={{
                          fontSize: 20,
                          color:
                            preCheckData?.systemChecks?.networkConnectionStable !== false
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.75,
                        borderRadius: "10px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <DesktopWindowsIcon sx={{ fontSize: 20, color: "#64748b" }} />
                        <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                          Browser supported
                        </Typography>
                      </Box>
                      <CheckIcon
                        sx={{
                          fontSize: 20,
                          color:
                            preCheckData?.systemChecks?.browserSupported !== false ? "#16a34a" : "#dc2626",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.75,
                        borderRadius: "10px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 20, color: "#64748b" }} />
                        <Typography sx={{ fontSize: "13.5px", color: "#334155", fontWeight: 500 }}>
                          Clock synchronized
                        </Typography>
                      </Box>
                      <CheckIcon
                        sx={{
                          fontSize: 20,
                          color:
                            preCheckData?.systemChecks?.clockSynchronized !== false ? "#16a34a" : "#dc2626",
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => setStage("PRE_CHECK")}
                      sx={{ textTransform: "none", color: "#64748b", borderColor: "#d0d5dd", borderRadius: "8px" }}
                    >
                      Back
                    </Button>

                    <Button
                      variant="contained"
                      disabled={isStartingSession}
                      onClick={handleConfirmStartTest}
                      sx={{
                        bgcolor: "#2563eb",
                        color: "#ffffff",
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#1d4ed8" },
                      }}
                    >
                      {isStartingSession ? "Starting..." : "Start test"}
                    </Button>
                  </Box>
                </Card>
              )}

              {stage === "TEST_SESSION" && (
                <Box>
                  {isSessionLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 16 }}>
                      <CircularProgress sx={{ color: "#2563eb" }} />
                    </Box>
                  ) : isSessionError ? (
                    <Alert
                      severity="error"
                      action={
                        <Button color="inherit" size="small" onClick={() => refetchSession()}>
                          Retry
                        </Button>
                      }
                      sx={{ borderRadius: "10px" }}
                    >
                      Failed to load test session. Please retry or contact support.
                    </Alert>
                  ) : !isCurrentSectionChecked ? (
                    <SectionSystemCheckCard
                      sectionKey={activeSectionKey || "MCQ"}
                      sectionType={getNormalizedSessionType(activeSectionKey)}
                      questionCount={activeSectionQuestions.length || 1}
                      totalMarks={preCheckData?.totalMarks}
                      beepPlayed={beepPlayed}
                      micAuthorized={micAuthorized}
                      onPlayBeep={handlePlayBeep}
                      onAuthorizeMic={handleAuthorizeMic}
                      onStartSession={() => {
                        setSectionChecksCompleted((prev) => ({
                          ...prev,
                          [currentSecKeyUpper]: true,
                        }));
                        void enterFullscreen();
                      }}
                      audioPlaybackLabel={preCheckData?.hardwareChecks?.audioPlaybackLabel}
                      microphoneAuthLabel={preCheckData?.hardwareChecks?.microphoneAuthLabel}
                    />
                  ) : (
                    <Card
                      elevation={0}
                      sx={{
                        border: "1px solid #eaecf0",
                        borderRadius: "14px",
                        bgcolor: "#ffffff",
                        p: { xs: 2.5, sm: 3.5 },
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                      }}
                    >
                      {currentQuestion && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pb: 2,
                            mb: 2.5,
                            borderBottom: "1px solid #f2f4f7",
                            flexWrap: "wrap",
                            gap: 1.5,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828" }}>
                              Question {currentQuestion.questionNumber || currentQuestionIndex + 1}
                              {questionsList.length > 0 && ` of ${questionsList.length}`}
                            </Typography>
                            <Chip
                              label={getQuestionSectionKey(currentQuestion) || activeSectionKey}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "11px",
                                fontWeight: 700,
                                bgcolor: "#f1f5f9",
                                color: "#475569",
                              }}
                            />
                            {currentQuestion.subSkill && (
                              <Chip
                                label={`${currentQuestion.subSkillIcon || ""} ${currentQuestion.subSkill}`.trim()}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  bgcolor: "#eff8ff",
                                  color: "#175cd3",
                                  border: "1px solid #b2ddff",
                                }}
                              />
                            )}
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {currentQuestion.marks !== undefined && currentQuestion.marks !== null && (
                              <Chip
                                label={`+${Number(currentQuestion.marks).toFixed(2)} marks`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  bgcolor: "#ecfdf3",
                                  color: "#027a48",
                                  border: "1px solid #a6f4c5",
                                }}
                              />
                            )}
                            {currentQuestion.negativeMarks !== undefined && Number(currentQuestion.negativeMarks) > 0 && (
                              <Chip
                                label={`-${Number(currentQuestion.negativeMarks).toFixed(2)}`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  bgcolor: "#fef3f2",
                                  color: "#b42318",
                                  border: "1px solid #fecdca",
                                }}
                              />
                            )}
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSectionChecksCompleted((prev) => ({
                                  ...prev,
                                  [currentSecKeyUpper]: false,
                                }));
                              }}
                              startIcon={<DesktopWindowsIcon sx={{ fontSize: 13 }} />}
                              sx={{
                                height: 22,
                                fontSize: "10.5px",
                                fontWeight: 600,
                                textTransform: "none",
                                color: "#64748b",
                                borderColor: "#cbd5e1",
                                borderRadius: "4px",
                                px: 1,
                                py: 0,
                                "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
                              }}
                            >
                              System Check
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {getQuestionSectionKey(currentQuestion) === "MCQ" && currentQuestion && (
                        <Box>
                          {currentQuestion.audioPromptUrl && renderAudioPromptPlayer(isCurrentAudioFinished)}

                          {currentQuestion.audioPromptUrl && !isCurrentAudioFinished ? (
                            renderAudioLockedPlaceholder()
                          ) : (
                            <>
                              <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#101828", mb: 2 }}>
                                {currentQuestion.questionText}
                              </Typography>

                              {currentQuestion.imageUrl && (
                                <Box sx={{ textAlign: "center", mb: 3 }}>
                                  <Box
                                    component="img"
                                    src={currentQuestion.imageUrl}
                                    alt="Question diagram"
                                    sx={{ maxWidth: "100%", maxHeight: 220, borderRadius: "8px" }}
                                  />
                                </Box>
                              )}

                              {currentQuestion.options && currentQuestion.options.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 4 }}>
                                  {currentQuestion.options.map((opt: any, optIdx: number) => {
                                    const optKey = opt.optionKey || opt.key || String.fromCharCode(65 + optIdx);
                                    const optText = opt.optionText || opt.text || "";
                                    const isSelected = Boolean(selectedOption && selectedOption === optKey);
                                    return (
                                      <Box
                                        key={opt.id || optKey || optIdx}
                                        onClick={() => handleSelectOption(optKey)}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2,
                                          p: 1.75,
                                          borderRadius: "10px",
                                          border: isSelected ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                                          bgcolor: isSelected ? "#ecfdf3" : "#ffffff",
                                          cursor: "pointer",
                                          transition: "all 0.15s ease",
                                          "&:hover": {
                                            bgcolor: isSelected ? "#ecfdf3" : "#f8fafc",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: "6px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            bgcolor: isSelected ? "#16a34a" : "#f1f5f9",
                                            color: isSelected ? "#ffffff" : "#475467",
                                          }}
                                        >
                                          {optKey}
                                        </Box>
                                        <Typography sx={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400, color: "#101828" }}>
                                          {optText}
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      )}

                      {getQuestionSectionKey(currentQuestion) === "LSRW" && currentQuestion && (
                        <Box>
                          {currentQuestion.audioPromptUrl && renderAudioPromptPlayer(isCurrentAudioFinished)}

                          {currentQuestion.audioPromptUrl && !isCurrentAudioFinished ? (
                            renderAudioLockedPlaceholder()
                          ) : (
                            <>

                              {currentQuestion.readableParagraph && (
                                <Box
                                  sx={{
                                    p: 2.5,
                                    borderRadius: "10px",
                                    bgcolor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    mb: 3,
                                  }}
                                >
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#2563eb" }}>
                                      <MenuBookIcon sx={{ fontSize: 18 }} />
                                      <Typography sx={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Reading Passage
                                      </Typography>
                                    </Box>
                                    {readingAccuracy > 0 && (
                                      <Chip
                                        label={`Accuracy: ${readingAccuracy}%`}
                                        size="small"
                                        sx={{
                                          bgcolor: readingAccuracy >= 70 ? "#dcfce7" : "#fee2e2",
                                          color: readingAccuracy >= 70 ? "#15803d" : "#b91c1c",
                                          fontWeight: 700,
                                          fontSize: "12px",
                                        }}
                                      />
                                    )}
                                  </Box>

                                  <Box sx={{ fontSize: "15px", color: "#334155", lineHeight: 2.2, wordBreak: "break-word" }}>
                                    {(() => {
                                      const paragraph = currentQuestion.readableParagraph || "";
                                      const tokens = paragraph.split(/(\s+)/);
                                      let wordCounter = 0;

                                      return tokens.map((token, tIdx) => {
                                        if (/^\s+$/.test(token)) {
                                          return <span key={tIdx}> </span>;
                                        }
                                        const wIdx = wordCounter++;
                                        const status = readingWordStatuses[wIdx] || "pending";

                                        let customStyle: React.CSSProperties = {
                                          display: "inline-block",
                                          borderRadius: "4px",
                                          padding: "1px 4px",
                                          margin: "0 1px",
                                          transition: "all 0.15s ease",
                                        };

                                        if (status === "correct") {
                                          customStyle = {
                                            ...customStyle,
                                            backgroundColor: "#dcfce7",
                                            color: "#15803d",
                                            fontWeight: 600,
                                          };
                                        } else if (status === "incorrect") {
                                          customStyle = {
                                            ...customStyle,
                                            backgroundColor: "#fee2e2",
                                            color: "#b91c1c",
                                            fontWeight: 600,
                                          };
                                        } else if (status === "current") {
                                          customStyle = {
                                            ...customStyle,
                                            backgroundColor: "#dbeafe",
                                            color: "#1d4ed8",
                                            fontWeight: 700,
                                            boxShadow: "0 0 0 2px #3b82f6",
                                          };
                                        }

                                        return (
                                          <span key={tIdx} style={customStyle}>
                                            {token}
                                          </span>
                                        );
                                      });
                                    })()}
                                  </Box>
                                </Box>
                              )}

                              {currentQuestion.imageUrl && (
                                <Box sx={{ textAlign: "center", mb: 3 }}>
                                  <Box
                                    component="img"
                                    src={currentQuestion.imageUrl}
                                    alt="Question diagram"
                                    sx={{ maxWidth: "100%", maxHeight: 220, borderRadius: "8px" }}
                                  />
                                </Box>
                              )}

                              {currentQuestion.questionText &&
                                currentQuestion.questionText.trim() !== currentQuestion.readableParagraph?.trim() &&
                                (currentQuestion.subSkill?.toLowerCase() !== "reading" || !currentQuestion.readableParagraph) && (
                                  <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#101828", mb: 2 }}>
                                    {currentQuestion.questionText}
                                  </Typography>
                                )}

                              {currentQuestion.description &&
                                currentQuestion.description !== currentQuestion.questionText &&
                                currentQuestion.description !== currentQuestion.readableParagraph && (
                                  <Typography sx={{ fontSize: "13px", color: "#64748b", mb: 3 }}>
                                    {currentQuestion.description}
                                  </Typography>
                                )}

                              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                                  {currentQuestion.options.map((opt: any, optIdx: number) => {
                                    const optKey = opt.optionKey || opt.key || String.fromCharCode(65 + optIdx);
                                    const optText = opt.optionText || opt.text || "";
                                    const isSelected = Boolean(selectedOption && selectedOption === optKey);
                                    return (
                                      <Box
                                        key={opt.id || optKey || optIdx}
                                        onClick={() => handleSelectOption(optKey)}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2,
                                          p: 1.75,
                                          borderRadius: "10px",
                                          border: isSelected ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
                                          bgcolor: isSelected ? "#ecfdf3" : "#ffffff",
                                          cursor: "pointer",
                                          transition: "all 0.15s ease",
                                          "&:hover": {
                                            bgcolor: isSelected ? "#ecfdf3" : "#f8fafc",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: "6px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            bgcolor: isSelected ? "#16a34a" : "#f1f5f9",
                                            color: isSelected ? "#ffffff" : "#475467",
                                          }}
                                        >
                                          {optKey}
                                        </Box>
                                        <Typography sx={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400, color: "#101828" }}>
                                          {optText}
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ) : currentQuestion.subSkill?.toLowerCase() === "speaking" ||
                                currentQuestion.subSkill?.toLowerCase() === "reading" ||
                                (currentQuestion.questionType && currentQuestion.questionType.toLowerCase().includes("voice")) ? (
                                <Box sx={{ textAlign: "center", py: 3, mb: 3 }}>
                                  <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                                    <IconButton
                                      onClick={handleToggleVoiceRecording}
                                      sx={{
                                        width: 76,
                                        height: 76,
                                        bgcolor: isRecordingVoice ? "#ef4444" : "#831843",
                                        color: "#ffffff",
                                        boxShadow: isRecordingVoice
                                          ? "0 0 0 8px rgba(239, 68, 68, 0.25), 0 0 0 16px rgba(239, 68, 68, 0.12)"
                                          : "0 4px 14px rgba(131, 24, 67, 0.3)",
                                        transition: "all 0.25s ease",
                                        "&:hover": {
                                          bgcolor: isRecordingVoice ? "#dc2626" : "#701a35",
                                          transform: "scale(1.05)",
                                        },
                                      }}
                                    >
                                      {isRecordingVoice ? (
                                        <PauseIcon sx={{ fontSize: 36 }} />
                                      ) : (
                                        <MicIcon sx={{ fontSize: 36 }} />
                                      )}
                                    </IconButton>
                                  </Box>

                                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#101828", mb: 0.5 }}>
                                    {isRecordingVoice
                                      ? `Recording... 00:${String(recordingSecondsLeft).padStart(2, "0")}`
                                      : recordedAudioUrl
                                        ? "Click mic to re-record your voice"
                                        : "Click mic to speak"}
                                  </Typography>

                                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                                    {isRecordingVoice
                                      ? "Speak clearly into your microphone. Click button to finish and submit."
                                      : `Time limit: ${currentQuestion.recordingTimeLimitSeconds || (currentQuestion.readableParagraph || currentQuestion.subSkill?.toLowerCase() === "reading" ? 90 : 15)} seconds`}
                                  </Typography>

                                  {recordedAudioUrl && (
                                    <Box
                                      sx={{
                                        mt: 3,
                                        p: 2,
                                        borderRadius: "12px",
                                        bgcolor: "#f0fdf4",
                                        border: "1px solid #bbf7d0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        maxWidth: 480,
                                        mx: "auto",
                                        textAlign: "left",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <IconButton
                                          onClick={handleTogglePlayRecordedAudio}
                                          sx={{
                                            bgcolor: "#16a34a",
                                            color: "#ffffff",
                                            "&:hover": { bgcolor: "#15803d" },
                                          }}
                                        >
                                          {isPlayingRecordedAudio ? <PauseIcon /> : <PlayArrowIcon />}
                                        </IconButton>
                                        <Box>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>
                                              Your Audio Response
                                            </Typography>
                                            <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                                          </Box>
                                          <Typography sx={{ fontSize: "11px", color: "#15803d" }}>
                                            {isPlayingRecordedAudio ? "Playing back..." : "Recorded & Saved"}
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {isUploadingAudio && (
                                          <CircularProgress size={16} sx={{ color: "#16a34a" }} />
                                        )}
                                        <GraphicEqIcon sx={{ color: "#16a34a", fontSize: 24 }} />
                                      </Box>
                                    </Box>
                                  )}

                                  {liveTranscript && (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 1.5,
                                        borderRadius: "8px",
                                        bgcolor: "#f8fafc",
                                        border: "1px dashed #cbd5e1",
                                        maxWidth: 540,
                                        mx: "auto",
                                        textAlign: "left",
                                      }}
                                    >
                                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", mb: 0.5 }}>
                                        Live Transcript
                                      </Typography>
                                      <Typography sx={{ fontSize: "13px", color: "#334155", fontStyle: "italic" }}>
                                        "{liveTranscript}"
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              ) : (
                                <Box sx={{ mb: 3 }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}>
                                      Your written response:
                                    </Typography>
                                    {currentQuestion.wordLimit && (
                                      <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                                        Word limit: {currentQuestion.wordLimit} words
                                        {textAnswer.trim() ? ` (${textAnswer.trim().split(/\s+/).length} entered)` : ""}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box
                                    component="textarea"
                                    rows={6}
                                    value={textAnswer}
                                    onChange={(e: any) => {
                                      const val = e.target.value;
                                      setTextAnswer(val);
                                      if (currentQuestion) {
                                        setAnswersMap((prev) => ({
                                          ...prev,
                                          [currentQuestion.id]: {
                                            ...prev[currentQuestion.id],
                                            textResponse: val,
                                            status: val.trim() ? "ANSWERED" : "NOT_VISITED",
                                          },
                                        }));
                                      }
                                    }}
                                    placeholder="Type your response here..."
                                    sx={{
                                      width: "100%",
                                      p: 2,
                                      borderRadius: "8px",
                                      border: "1px solid #d0d5dd",
                                      fontSize: "14px",
                                      fontFamily: "inherit",
                                      outline: "none",
                                      "&:focus": { borderColor: "#2563eb", boxShadow: "0 0 0 2px rgba(37,99,235,0.1)" },
                                    }}
                                  />
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      )}

                      {getQuestionSectionKey(currentQuestion) === "CODING" && currentQuestion && (
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#101828" }}>
                              {currentQuestion.codingTitle || currentQuestion.questionText}
                            </Typography>
                            {(() => {
                              const codingLangs =
                                currentQuestion.supportedLanguages && currentQuestion.supportedLanguages.length > 0
                                  ? currentQuestion.supportedLanguages
                                  : (currentQuestion.starterCode && typeof currentQuestion.starterCode === "object"
                                    ? Object.keys(currentQuestion.starterCode)
                                    : ["Java", "Python", "C++"]);
                              return (
                                <Select
                                  size="small"
                                  value={selectedLanguage}
                                  onChange={(e) => {
                                    const newLang = e.target.value;
                                    setSelectedLanguage(newLang);
                                    if (currentQuestion?.starterCode && typeof currentQuestion.starterCode === "object") {
                                      const codeForLang =
                                        (currentQuestion.starterCode as any)[newLang] ||
                                        (currentQuestion.starterCode as any)["Java"] ||
                                        (currentQuestion.starterCode as any)["Python"] ||
                                        "";
                                      if (codeForLang) {
                                        setCodeAnswer(codeForLang);
                                        if (currentQuestion) {
                                          setAnswersMap((prev) => ({
                                            ...prev,
                                            [currentQuestion.id]: {
                                              ...prev[currentQuestion.id],
                                              code: codeForLang,
                                              language: newLang,
                                              status: "ANSWERED",
                                            },
                                          }));
                                        }
                                      }
                                    }
                                  }}
                                  sx={{ fontSize: "13px", height: 32, borderRadius: "6px" }}
                                >
                                  {codingLangs.map((lang) => (
                                    <MenuItem key={lang} value={lang}>
                                      {lang}
                                    </MenuItem>
                                  ))}
                                </Select>
                              );
                            })()}
                          </Box>

                          <Box
                            sx={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              overflow: "hidden",
                              mb: 2,
                              bgcolor: "#ffffff",
                            }}
                          >
                            <Editor
                              height="360px"
                              language={getMonacoLanguage(selectedLanguage)}
                              value={codeAnswer}
                              onMount={(editor, monaco) => {
                                editorRef.current = editor;
                                monacoRef.current = monaco;
                              }}
                              onChange={(val) => {
                                const newCode = val || "";
                                setCodeAnswer(newCode);
                                if (monacoRef.current && editorRef.current) {
                                  const model = editorRef.current.getModel();
                                  if (model) {
                                    monacoRef.current.editor.setModelMarkers(model, "compiler", []);
                                  }
                                }
                                if (currentQuestion) {
                                  setAnswersMap((prev) => ({
                                    ...prev,
                                    [currentQuestion.id]: {
                                      ...prev[currentQuestion.id],
                                      code: newCode,
                                      status: newCode.trim() ? "ANSWERED" : prev[currentQuestion.id]?.status || "NOT_VISITED",
                                    },
                                  }));
                                }
                              }}
                              theme="vs-light"
                              options={{
                                fontSize: 13.5,
                                fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 4,
                                lineNumbers: "on",
                                roundedSelection: true,
                                padding: { top: 12, bottom: 12 },
                                wordWrap: "on",
                              }}
                            />
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                            <Typography sx={{ fontSize: "12.5px", color: "#64748b", fontWeight: 500 }}>
                              Runs Remaining: {runsRemaining}/{currentQuestion.maxRuns || 3}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled={runsRemaining <= 0 || isRunningCode || isRunningCodeCustom}
                                onClick={handleRunCode}
                                startIcon={<PlayArrowIcon />}
                                sx={{
                                  textTransform: "none",
                                  borderRadius: "6px",
                                  fontWeight: 600,
                                  borderColor: "#2563eb",
                                  color: "#2563eb",
                                  "&:hover": { bgcolor: "#eff6ff" },
                                }}
                              >
                                {isRunningCode || isRunningCodeCustom ? "Running..." : "Run"}
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => navigateToQuestion(currentQuestionIndex + 1, "SAVE")}
                                sx={{
                                  bgcolor: "#0284c7",
                                  color: "#ffffff",
                                  textTransform: "none",
                                  borderRadius: "6px",
                                  fontWeight: 600,
                                  "&:hover": { bgcolor: "#0369a1" },
                                }}
                              >
                                Submit
                              </Button>
                            </Box>
                          </Box>

                          {normalizedTestResults.length > 0 ? (
                            <Box sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828" }}>
                                    Test Results
                                  </Typography>
                                  {isCompilationError ? (
                                    <Chip
                                      size="small"
                                      icon={<CancelIcon sx={{ fontSize: "14px !important", color: "#dc2626" }} />}
                                      label="Compilation Error"
                                      sx={{
                                        bgcolor: "#fef2f2",
                                        color: "#dc2626",
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        borderRadius: "6px",
                                        border: "1px solid #fecaca",
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      size="small"
                                      label={`${normalizedTestResults.filter((t) => t.passed).length}/${normalizedTestResults.length} Passed`}
                                      sx={{
                                        bgcolor: normalizedTestResults.every((t) => t.passed) ? "#ecfdf3" : "#fff7ed",
                                        color: normalizedTestResults.every((t) => t.passed) ? "#16a34a" : "#ea580c",
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        borderRadius: "6px",
                                      }}
                                    />
                                  )}
                                </Box>

                                <Box sx={{ display: "flex", gap: 1 }}>
                                  {isCompilationError ? (
                                    <Chip
                                      size="small"
                                      icon={<CancelIcon sx={{ fontSize: "14px !important", color: "#dc2626" }} />}
                                      label={`${normalizedTestResults.length} Failed (Compilation Error)`}
                                      sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: "11px" }}
                                    />
                                  ) : (
                                    <>
                                      <Chip
                                        size="small"
                                        icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "#16a34a" }} />}
                                        label={`${normalizedTestResults.filter((t) => t.passed).length} Passed`}
                                        sx={{ bgcolor: "#f0fdf4", color: "#16a34a", fontWeight: 600, fontSize: "11px" }}
                                      />
                                      {normalizedTestResults.filter((t) => !t.passed).length > 0 && (
                                        <Chip
                                          size="small"
                                          icon={<CancelIcon sx={{ fontSize: "14px !important", color: "#dc2626" }} />}
                                          label={`${normalizedTestResults.filter((t) => !t.passed).length} Failed`}
                                          sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 600, fontSize: "11px" }}
                                        />
                                      )}
                                    </>
                                  )}
                                </Box>
                              </Box>

                              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                                {normalizedTestResults.map((tc, idx) => {
                                  const isSelectedTab = selectedTestCaseIndex === idx;
                                  return (
                                    <Box
                                      key={tc.testCaseNumber}
                                      onClick={() => setSelectedTestCaseIndex(idx)}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.75,
                                        px: 1.75,
                                        py: 0.6,
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        bgcolor: tc.passed
                                          ? (isSelectedTab ? "#16a34a" : "#ecfdf3")
                                          : (isSelectedTab ? "#dc2626" : "#fef2f2"),
                                        color: tc.passed
                                          ? (isSelectedTab ? "#ffffff" : "#16a34a")
                                          : (isSelectedTab ? "#ffffff" : "#dc2626"),
                                        border: isSelectedTab ? "none" : `1px solid ${tc.passed ? "#bbf7d0" : "#fecaca"}`,
                                        transition: "all 0.15s ease",
                                      }}
                                    >
                                      {tc.passed ? "✓" : "✗"} Case {tc.testCaseNumber}
                                    </Box>
                                  );
                                })}
                              </Box>

                              {normalizedTestResults[selectedTestCaseIndex] && (
                                <Box sx={{ p: 2, bgcolor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#101828" }}>
                                      Test Case {normalizedTestResults[selectedTestCaseIndex].testCaseNumber}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={normalizedTestResults[selectedTestCaseIndex].passed ? "Passed" : "Wrong Answer"}
                                      sx={{
                                        bgcolor: normalizedTestResults[selectedTestCaseIndex].passed ? "#ecfdf3" : "#fef2f2",
                                        color: normalizedTestResults[selectedTestCaseIndex].passed ? "#16a34a" : "#dc2626",
                                        fontWeight: 700,
                                        fontSize: "11px",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </Box>

                                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
                                    <Box>
                                      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#64748b", mb: 0.5 }}>
                                        INPUT
                                      </Typography>
                                      <Box
                                        sx={{
                                          p: 1.25,
                                          borderRadius: "6px",
                                          bgcolor: "#f8fafc",
                                          border: "1px solid #eaecf0",
                                          fontFamily: "monospace",
                                          fontSize: "12px",
                                          color: "#334155",
                                          whiteSpace: "pre-wrap",
                                          minHeight: 48,
                                        }}
                                      >
                                        {normalizedTestResults[selectedTestCaseIndex].input || "-"}
                                      </Box>
                                    </Box>

                                    <Box>
                                      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#64748b", mb: 0.5 }}>
                                        EXPECTED OUTPUT
                                      </Typography>
                                      <Box
                                        sx={{
                                          p: 1.25,
                                          borderRadius: "6px",
                                          bgcolor: "#f8fafc",
                                          border: "1px solid #eaecf0",
                                          fontFamily: "monospace",
                                          fontSize: "12px",
                                          color: "#334155",
                                          whiteSpace: "pre-wrap",
                                          minHeight: 48,
                                        }}
                                      >
                                        {normalizedTestResults[selectedTestCaseIndex].expectedOutput || "-"}
                                      </Box>
                                    </Box>

                                    <Box>
                                      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#64748b", mb: 0.5 }}>
                                        ACTUAL OUTPUT
                                      </Typography>
                                      <Box
                                        sx={{
                                          p: 1.25,
                                          borderRadius: "6px",
                                          bgcolor: normalizedTestResults[selectedTestCaseIndex].passed ? "#f0fdf4" : "#fef2f2",
                                          border: `1px solid ${normalizedTestResults[selectedTestCaseIndex].passed ? "#bbf7d0" : "#fecaca"}`,
                                          fontFamily: "monospace",
                                          fontSize: "12px",
                                          color: normalizedTestResults[selectedTestCaseIndex].passed ? "#16a34a" : "#dc2626",
                                          whiteSpace: "pre-wrap",
                                          minHeight: 48,
                                        }}
                                      >
                                        {normalizedTestResults[selectedTestCaseIndex].actualOutput || "-"}
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            Boolean((currentQuestion as any).testCases || currentQuestion.visibleTestCases) && (
                              <Box sx={{ mb: 2.5, p: 2, bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", mb: 1 }}>
                                  Available Test Cases:
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                  {((currentQuestion as any).testCases || currentQuestion.visibleTestCases || []).map(
                                    (tc: any, idx: number) => (
                                      <Box
                                        key={tc.testCaseIndex || idx}
                                        sx={{
                                          px: 1.5,
                                          py: 0.5,
                                          borderRadius: "6px",
                                          fontSize: "12px",
                                          fontWeight: 600,
                                          bgcolor: "#ffffff",
                                          color: "#475467",
                                          border: "1px solid #e2e8f0",
                                        }}
                                      >
                                        Case {tc.testCaseIndex || idx + 1}
                                      </Box>
                                    )
                                  )}
                                </Box>
                              </Box>
                            )
                          )}

                          {diagnosticTerminalOutput && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: "8px",
                                border: isCompilationError ? "1px solid #fecaca" : "1px solid #e2e8f0",
                                bgcolor: isCompilationError ? "#0f172a" : "#f8fafc",
                                fontFamily: "'Fira Code', 'Consolas', monospace",
                                fontSize: "12px",
                                color: isCompilationError ? "#f87171" : "#334155",
                                minHeight: 70,
                                maxHeight: 180,
                                overflowY: "auto",
                                lineHeight: 1.6,
                                mb: 3,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {isCompilationError && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    pb: 1,
                                    mb: 1.25,
                                    borderBottom: "1px solid #334155",
                                    color: "#fca5a5",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                  }}
                                >
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                  COMPILATION FAILED (check syntax, missing semicolons, or types)
                                </Box>
                              )}
                              {diagnosticTerminalOutput}
                            </Box>
                          )}
                        </Box>
                      )}

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
                          variant="text"
                          disabled={true}
                          onClick={() => { }}
                          startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: 13 }} />}
                          sx={{
                            textTransform: "none",
                            color: "#94a3b8 !important",
                            fontWeight: 600,
                            cursor: "not-allowed !important",
                            opacity: 0.5,
                          }}
                        >
                          Previous
                        </Button>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigateToQuestion(currentQuestionIndex + 1, "FLAG")}
                            sx={{ textTransform: "none", color: "#64748b", borderColor: "#d0d5dd", borderRadius: "6px" }}
                          >
                            Flag
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigateToQuestion(currentQuestionIndex + 1, "SKIP")}
                            sx={{ textTransform: "none", color: "#64748b", borderColor: "#d0d5dd", borderRadius: "6px" }}
                          >
                            Skip
                          </Button>

                          {(activeSectionKey || "").toUpperCase() === "CODING" && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigateToQuestion(currentQuestionIndex + 1, "SAVE")}
                              sx={{ textTransform: "none", color: "#101828", borderColor: "#d0d5dd", borderRadius: "6px", fontWeight: 600 }}
                            >
                              Save & Next
                            </Button>
                          )}

                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              if (currentQuestionIndex === questionsList.length - 1) {
                                navigateToQuestion(currentQuestionIndex);
                                setSubmitDialogOpen(true);
                              } else {
                                navigateToQuestion(currentQuestionIndex + 1);
                              }
                            }}
                            endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: 13 }} />}
                            sx={{
                              bgcolor: "#2563eb",
                              color: "#ffffff",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "6px",
                              px: 2,
                              "&:hover": { bgcolor: "#1d4ed8" },
                            }}
                          >
                            {currentQuestionIndex === questionsList.length - 1 ? "Save & Finish" : "Next question"}
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  )}
                </Box>
              )}
            </Box>

            {stage === "TEST_SESSION" && isCurrentSectionChecked && (activeSectionKey || "").toUpperCase() === "CODING" && (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #eaecf0",
                  borderRadius: "14px",
                  bgcolor: "#ffffff",
                  p: 2.5,
                  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
                }}
              >
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#101828", mb: 1 }}>
                  Description
                </Typography>
                {currentQuestion?.description && (
                  <Typography sx={{ fontSize: "12.5px", color: "#475467", lineHeight: 1.6, mb: 2.5 }}>
                    {currentQuestion.description}
                  </Typography>
                )}

                {(activeSectionKey || "").toUpperCase() === "CODING" && currentQuestion && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1, borderTop: "1px solid #f1f5f9" }}>
                    {currentQuestion.inputFormat && (
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#101828" }}>Input</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                          {currentQuestion.inputFormat}
                        </Typography>
                      </Box>
                    )}

                    {currentQuestion.outputFormat && (
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#101828" }}>Output</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                          {currentQuestion.outputFormat}
                        </Typography>
                      </Box>
                    )}

                    {currentQuestion.constraints && (
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#101828" }}>Constraints</Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                          {currentQuestion.constraints}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Card>
            )}
          </Box>
        </Box>
      )}

      <Dialog
        open={violationDialogOpen}
        onClose={() => { }}
        title="Proctoring Warning"
        maxWidth="xs"
        showCloseButton={false}
        actions={
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 1.5, pt: 1 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCloseTestAfterViolation}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#dc2626",
                borderColor: "#fca5a5",
                borderRadius: "8px",
                px: 2,
                "&:hover": {
                  bgcolor: "#fef2f2",
                  borderColor: "#dc2626",
                },
              }}
            >
              Close the test
            </Button>
            <Button
              variant="contained"
              onClick={handleProceedTestAfterViolation}
              sx={{
                bgcolor: "#2563eb",
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2.5,
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Proceed test
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 1.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#101828", mb: 1 }}>
            Security Violation Detected!
          </Typography>

          <Box
            sx={{
              p: 1.75,
              mb: 2,
              borderRadius: "8px",
              bgcolor: "#fef2f2",
              border: "1px solid #fee2e2",
              width: "100%",
              textAlign: "left",
            }}
          >
            <Typography sx={{ fontSize: "12.5px", color: "#b91c1c", fontWeight: 600 }}>
              {violationReason || "Function key press or full-screen exit detected."}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "12.5px", color: "#475467", lineHeight: 1.6, mb: 1.5 }}>
            Function keys (F1–F12), window switching, and exiting full-screen mode are strictly prohibited during the assessment. This incident has been recorded and reported.
          </Typography>

          <Typography sx={{ fontSize: "11.5px", color: "#ea580c", fontWeight: 600 }}>
            Incident count: {violationCount}
          </Typography>
        </Box>
      </Dialog>

      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        title="Submit Assessment?"
        maxWidth="xs"
        showCloseButton
        actions={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setSubmitDialogOpen(false)}
              sx={{ textTransform: "none", color: "#64748b" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isSubmittingTest}
              onClick={handleFinalSubmit}
              sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, textTransform: "none" }}
            >
              {isSubmittingTest ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </Box>
        }
      >
        <Typography sx={{ fontSize: "13.5px", color: "#475467", pt: 1 }}>
          Are you sure you want to complete and submit this assessment? You will not be able to edit your answers after submission.
        </Typography>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default TakeAssessmentPage;
