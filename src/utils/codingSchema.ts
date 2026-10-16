import { object, string, number, array } from "yup";
import type {
  CodingFormData,
  CodingProblemItem,
  CodingExampleItem,
  CodingTestCaseItem,
} from "../types/Coding.types";

export const DEFAULT_LANGUAGES = ["Python", "Java", "C++", "JavaScript", "C"];

export const createEmptyExample = (): CodingExampleItem => ({
  id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  input: "",
  output: "",
  explanation: "",
});

export const createEmptyTestCase = (isHidden = false): CodingTestCaseItem => ({
  id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  input: "",
  output: "",
  isHidden,
});

export const createDefaultCodingFormData = (): CodingFormData => ({
  title: "",
  problemStatement: "",
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  examples: [createEmptyExample()],
  sampleTestCases: [createEmptyTestCase(false)],
  questionType: "Coding",
  difficulty: "High",
  timeLimitMs: 1000,
  memoryLimitMb: 257,
  marks: 50,
  hiddenTestsCount: 10,
  supportedLanguages: [...DEFAULT_LANGUAGES],
  imageFile: null,
  imageUrl: "",
});

export const codingProblemSchema = object({
  title: string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  problemStatement: string()
    .trim()
    .required("Problem statement is required")
    .min(10, "Problem statement must be at least 10 characters"),
  difficulty: string().required("Difficulty is required"),
  timeLimitMs: number()
    .typeError("Time limit must be a number")
    .positive("Time limit must be positive")
    .required("Time limit is required"),
  memoryLimitMb: number()
    .typeError("Memory limit must be a number")
    .positive("Memory limit must be positive")
    .required("Memory limit is required"),
  marks: number()
    .typeError("Marks must be a number")
    .positive("Marks must be positive")
    .required("Marks are required"),
  hiddenTestsCount: number()
    .typeError("Hidden tests must be a number")
    .min(0, "Hidden tests cannot be negative")
    .default(0),
  supportedLanguages: array()
    .of(string())
    .min(1, "Select at least one supported language")
    .required("Supported languages are required"),
});

export const initialCodingProblems: CodingProblemItem[] = [];

