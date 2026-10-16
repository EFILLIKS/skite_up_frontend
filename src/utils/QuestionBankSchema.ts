import { object, string, number, array, boolean, type InferType } from "yup";

export interface QuestionOptionItem {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionFormData {
  id?: string;
  questionNumber?: number;
  questionType: string;
  questionText: string;
  explanation: string;
  skill: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  negativeMarks: number;
  status: "Published" | "Draft";
  options: QuestionOptionItem[];
}

export const createEmptyQuestion = (
  questionNumber: number = 1,
  defaultSkill: string = "Quantitative Ability",
  defaultTopic: string = "Time & Work"
): QuestionFormData => ({
  questionNumber,
  questionType: "Single choice",
  questionText: "",
  explanation: "",
  skill: defaultSkill,
  topic: defaultTopic,
  difficulty: "Easy",
  marks: 2,
  negativeMarks: 0.5,
  status: "Published",
  options: [
    { id: "opt-1", optionKey: "A", optionText: "", isCorrect: true },
    { id: "opt-2", optionKey: "B", optionText: "", isCorrect: false },
    { id: "opt-3", optionKey: "C", optionText: "", isCorrect: false },
    { id: "opt-4", optionKey: "D", optionText: "", isCorrect: false },
  ],
});

export const questionOptionSchema = object({
  id: string().optional(),
  optionKey: string().required("Option key is required"),
  optionText: string().trim().required("Option text cannot be empty"),
  isCorrect: boolean().required(),
});

export const singleQuestionSchema = object({
  questionType: string()
    .trim()
    .required("Question type is required"),
  questionText: string()
    .trim()
    .required("Question text is required")
    .min(5, "Question must be at least 5 characters long"),
  explanation: string()
    .trim()
    .max(1000, "Explanation must not exceed 1000 characters")
    .optional()
    .default(""),
  skill: string()
    .trim()
    .required("Skill is required"),
  topic: string()
    .trim()
    .required("Topic is required"),
  difficulty: string()
    .oneOf(["Easy", "Medium", "Hard"], "Invalid difficulty")
    .required("Difficulty is required"),
  marks: number()
    .typeError("Marks must be a valid number")
    .positive("Marks must be greater than 0")
    .required("Marks are required"),
  negativeMarks: number()
    .typeError("Negative marks must be a valid number")
    .min(0, "Negative marks cannot be negative")
    .required("Negative marks are required"),
  options: array()
    .of(questionOptionSchema)
    .min(2, "At least 2 options are required")
    .test(
      "at-least-one-correct",
      "Please select at least one correct option",
      (options) => Boolean(options && options.some((opt) => opt.isCorrect))
    )
    .required("Options are required"),
});

export const questionCountSchema = object({
  count: number()
    .typeError("Count must be a number")
    .integer("Must be a whole number")
    .min(1, "Please enter at least 1 question")
    .max(50, "You can add up to 50 questions at a time")
    .required("Number of questions is required"),
});

export type SingleQuestionSchemaData = InferType<typeof singleQuestionSchema>;
export type QuestionCountSchemaData = InferType<typeof questionCountSchema>;
