export type LsrwSection = "READING" | "LISTENING" | "SPEAKING" | "WRITING";

export type GrammarSeverity = "HIGH" | "MEDIUM" | "LOW" | string;

export interface GrammarCheckRequest {
  section: LsrwSection;
  text: string;
  assessmentId?: number | string;
  questionId?: number | string;
  attemptId?: number | string;
}

export interface GrammarError {
  originalText: string;
  suggestion: string;
  errorType: string;
  startPosition: number;
  endPosition: number;
  explanation: string;
  severity: GrammarSeverity;
}

export interface GrammarCheckResponse {
  section?: LsrwSection | string;
  totalWords?: number;
  correctWords?: number;
  errorCount?: number;
  grammarScore?: number;
  spellingScore?: number;
  sentenceScore?: number;
  vocabularyScore?: number;
  finalScore?: number;
  errors?: GrammarError[];
  resultId?: string;
  questionMatchScore?: number;
  matchedConcepts?: string[];
  missingConcepts?: string[];
  questionFeedback?: string;
  expectedAnswerSummary?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvedAreas?: string[];
  suggestions?: string[];
}

export interface GrammarApiResponse {
  statusCode?: number;
  message?: string;
  data: GrammarCheckResponse;
}

export interface LsrwGrammarResults {
  reading?: GrammarCheckResponse;
  listening?: GrammarCheckResponse;
  speaking?: GrammarCheckResponse;
  writing?: GrammarCheckResponse;
  [questionId: string]: GrammarCheckResponse | undefined;
}
