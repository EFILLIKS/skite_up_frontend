export type LSRWSubTab = "Listening" | "Speaking" | "Reading" | "Writing";

export type LSRWLevel = "Beginner" | "Intermediate" | "Advanced";
export type LSRWStatus = "Published" | "Un-publish";
export type LSRWListeningQuestionType = "Voice Input" | "MCQ";

export interface LSRWOptionItem {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  optionOrder?: number;
}

export interface LSRWSubQuestion {
  id: string;
  questionNumber: number;
  questionType: LSRWListeningQuestionType;
  questionText: string;
  answer?: string;
  options?: LSRWOptionItem[];
  marks?: number;
  negativeMarks?: number;
}

export interface BaseLSRWExercise {
  id: string;
  title: string;
  description?: string;
  level: LSRWLevel;
  marks: number;
  negativeMarks: number;
  status: LSRWStatus;
  attemptsCount?: number;
  attemptsDisplay?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface ListeningExerciseItem extends BaseLSRWExercise {
  exerciseType: "LISTENING";
  types: string;
  duration: string;
  durationMinutes: number;
  content: string;
  audioFileName?: string;
  audioFileSize?: string;
  audioUrl?: string;
  subQuestions: LSRWSubQuestion[];
}

export interface SpeakingExerciseItem extends BaseLSRWExercise {
  exerciseType: "SPEAKING";
  duration: string;
  durationMinutes?: number;
  questionText: string;
  keywords: string;
}

export interface ReadingExerciseItem extends BaseLSRWExercise {
  exerciseType: "READING";
  duration: string;
  durationMinutes?: number;
  passageText: string;
  keywords?: string;
}

export interface WritingExerciseItem extends BaseLSRWExercise {
  exerciseType: "WRITING";
  duration?: string;
  durationMinutes?: number;
  words: number | string;
  keywords: string;
}

export type AnyLSRWExerciseItem =
  | ListeningExerciseItem
  | SpeakingExerciseItem
  | ReadingExerciseItem
  | WritingExerciseItem;

export interface LSRWFormData {
  subTab: LSRWSubTab;
  difficulty: LSRWLevel;
  marks: number | string;
  negativeMarks: number | string;
  duration: string;

  audioFile: File | null;
  audioFileName: string;
  audioFileSize: string;
  audioUrl: string;
  listeningType: LSRWListeningQuestionType;
  description: string;
  subQuestions: LSRWSubQuestion[];
  currentQuestionIndex: number;

  speakingQuestion: string;
  speakingKeywords: string;

  readingTopic: string;
  readingParagraph: string;

  writingTopic: string;
  writingWords: string | number;
  writingKeywords: string;
}

export interface LSRWFormValidationErrors {
  [key: string]: string | undefined;
}

export interface BackendLSRWQuestionItem {
  id: string;
  category: "LSRW" | string;
  lsrwSubType?: "LISTENING" | "SPEAKING" | "READING" | "WRITING" | string;
  skill?: string;
  topic?: string;
  exerciseTitle?: string;
  exerciseDescription?: string;
  difficulty?: string;
  questionType?: string;
  duration?: string;
  audioFileSize?: string;
  audioFileName?: string;
  audioFileUrl?: string;
  questionText?: string;
  voiceAnswer?: string;
  keywords?: string;
  readableParagraph?: string;
  wordLimit?: number;
  numberOfWords?: number;
  marks?: number;
  negativeMarks?: number;
  marksDisplay?: string;
  status?: string;
  attemptsCount?: number;
  attemptsDisplay?: string;
  createdBy?: string;
  createdAt?: string;
  options?: Array<{
    id?: string;
    optionKey: string;
    optionText: string;
    isCorrect: boolean;
    optionOrder?: number;
  }>;
}

export interface BackendLSRWListResponse {
  statusCode: number;
  message: string;
  data: {
    content: BackendLSRWQuestionItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    lsrwLimit?: number;
    lsrwCount?: number;
    listeningCount?: number;
    speakingCount?: number;
    readingCount?: number;
    writingCount?: number;
    remainingLimit?: number;
    isLimitReached?: boolean;
  };
}

export interface AudioUploadResponse {
  statusCode: number;
  message: string;
  data: {
    audioFileUrl: string;
    audioFileName: string;
    audioFileSize: string;
    sizeInBytes: number;
  };
}
