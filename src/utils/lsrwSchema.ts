import { object, string, number, array, boolean } from "yup";
import type {
  LSRWFormData,
  LSRWSubQuestion,
  LSRWOptionItem,
  LSRWSubTab,
  ListeningExerciseItem,
  SpeakingExerciseItem,
  ReadingExerciseItem,
  WritingExerciseItem,
} from "../types/LSRW.types";

export const defaultOptionList = (): LSRWOptionItem[] => [
  { id: "opt-1", optionKey: "A", optionText: "", isCorrect: true },
  { id: "opt-2", optionKey: "B", optionText: "", isCorrect: false },
  { id: "opt-3", optionKey: "C", optionText: "", isCorrect: false },
  { id: "opt-4", optionKey: "D", optionText: "", isCorrect: false },
];

export const createEmptySubQuestion = (
  questionNumber: number = 1,
  type: "Voice Input" | "MCQ" = "Voice Input"
): LSRWSubQuestion => ({
  id: `sq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  questionNumber,
  questionType: type,
  questionText: "",
  answer: "",
  options: defaultOptionList(),
  marks: 10,
  negativeMarks: 0,
});

export const createDefaultLSRWFormData = (subTab: LSRWSubTab): LSRWFormData => {
  let defaultDuration = "10 min";
  if (subTab === "Listening") defaultDuration = "10 min";
  else if (subTab === "Speaking") defaultDuration = "8 min";
  else if (subTab === "Reading") defaultDuration = "5 min";
  else if (subTab === "Writing") defaultDuration = "15 min";

  return {
    subTab,
    difficulty: "Intermediate",
    marks: 50,
    negativeMarks: 0,
    duration: defaultDuration,

    audioFile: null,
    audioFileName: "",
    audioFileSize: "",
    audioUrl: "",
    listeningType: "Voice Input",
    description: "",
    subQuestions: [
      createEmptySubQuestion(1, "Voice Input"),
    ],
    currentQuestionIndex: 0,

    speakingQuestion: "",
    speakingKeywords: "",

    readingTopic: "",
    readingParagraph: "",

    writingTopic: "",
    writingWords: 120,
    writingKeywords: "",
  };
};

export const lsrwListeningVoiceSchema = object({
  audioFileName: string().trim().required("Audio file is required"),
  description: string().trim().required("Description is required"),
  difficulty: string().required("Please select difficulty"),
  duration: string().trim().required("Duration is required (e.g. hr : min : sec)"),
  marks: number()
    .typeError("Marks must be a number")
    .positive("Marks must be greater than 0")
    .required("Marks are required"),
  negativeMarks: number()
    .typeError("Negative marks must be a number")
    .min(0, "Negative marks cannot be negative")
    .default(0),
  questionText: string()
    .trim()
    .required("Question text is required")
    .min(5, "Question must be at least 5 characters"),
  answer: string()
    .trim()
    .required("Answer is required for voice input")
    .min(1, "Answer cannot be empty"),
});

export const lsrwListeningMCQSchema = object({
  audioFileName: string().trim().required("Audio file is required"),
  description: string().trim().required("Description is required"),
  difficulty: string().required("Please select difficulty"),
  duration: string().trim().required("Duration is required (e.g. hr : min : sec)"),
  marks: number()
    .typeError("Marks must be a number")
    .positive("Marks must be greater than 0")
    .required("Marks are required"),
  negativeMarks: number()
    .typeError("Negative marks must be a number")
    .min(0, "Negative marks cannot be negative")
    .default(0),
  questionText: string()
    .trim()
    .required("Question text is required")
    .min(5, "Question must be at least 5 characters"),
  options: array()
    .of(
      object({
        optionKey: string().required(),
        optionText: string().trim().required("Option text cannot be empty"),
        isCorrect: boolean().required(),
      })
    )
    .min(2, "At least 2 options are required")
    .test(
      "at-least-one-correct",
      "Please select at least one correct option",
      (options) => Boolean(options && options.some((opt) => opt.isCorrect))
    )
    .required("Options are required"),
});

export const lsrwSpeakingSchema = object({
  duration: string().trim().required("Duration is required (e.g. hr : min : sec)"),
  speakingQuestion: string()
    .trim()
    .required("Question text is required")
    .min(5, "Question must be at least 5 characters"),
  speakingKeywords: string().trim().required("Keywords are required"),
  difficulty: string().required("Please select difficulty"),
  marks: number()
    .typeError("Marks must be a number")
    .positive("Marks must be greater than 0")
    .required("Marks are required"),
  negativeMarks: number()
    .typeError("Negative marks must be a number")
    .min(0, "Negative marks cannot be negative")
    .default(0),
});

export const lsrwReadingSchema = object({
  readingTopic: string()
    .trim()
    .required("Topic is required")
    .min(3, "Topic must be at least 3 characters"),
  duration: string().trim().required("Duration is required (e.g. hr : min : sec)"),
  readingParagraph: string()
    .trim()
    .required("Readable paragraph is required")
    .min(15, "Paragraph must be at least 15 characters"),
  difficulty: string().required("Please select difficulty"),
  marks: number()
    .typeError("Marks must be a number")
    .positive("Marks must be greater than 0")
    .required("Marks are required"),
  negativeMarks: number()
    .typeError("Negative marks must be a number")
    .min(0, "Negative marks cannot be negative")
    .default(0),
});

export const lsrwWritingSchema = object({
  writingTopic: string()
    .trim()
    .required("Topic is required")
    .min(3, "Topic must be at least 3 characters"),
  duration: string().trim().required("Duration is required (e.g. hr : min : sec)"),
  writingWords: number()
    .typeError("Number of words must be a number")
    .positive("Word count must be greater than 0")
    .required("Number of words is required"),
  writingKeywords: string().trim().required("Keywords are required"),
  difficulty: string().required("Please select difficulty"),
  marks: number()
    .typeError("Marks must be a number")
    .positive("Marks must be greater than 0")
    .required("Marks are required"),
  negativeMarks: number()
    .typeError("Negative marks must be a number")
    .min(0, "Negative marks cannot be negative")
    .default(0),
});

export const initialListeningExercises: ListeningExerciseItem[] = [];
export const initialSpeakingExercises: SpeakingExerciseItem[] = [];
export const initialReadingExercises: ReadingExerciseItem[] = [];
export const initialWritingExercises: WritingExerciseItem[] = [];

