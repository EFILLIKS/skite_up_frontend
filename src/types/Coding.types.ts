export type CodingDifficulty = "Easy" | "Medium" | "High" | "Hard";
export type CodingStatus = "Published" | "Un-publish";

export interface CodingExampleItem {
  id: string;
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingTestCaseItem {
  id: string;
  input: string;
  output: string;
  isHidden?: boolean;
}

export interface CodingProblemItem {
  id: string;
  title: string;
  subtitle?: string;
  difficulty: CodingDifficulty;
  languagesCount?: number;
  testCasesCount?: number;
  limitsDisplay?: string;
  keywordsCount?: number;
  status: CodingStatus;
  problemStatement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples: CodingExampleItem[];
  sampleTestCases: CodingTestCaseItem[];
  questionType?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  marks: number;
  hiddenTestsCount: number;
  supportedLanguages: string[];
  imageUrl?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface CodingFormData {
  title: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: CodingExampleItem[];
  sampleTestCases: CodingTestCaseItem[];
  questionType: string;
  difficulty: CodingDifficulty;
  timeLimitMs: number | string;
  memoryLimitMb: number | string;
  marks: number | string;
  hiddenTestsCount: number | string;
  supportedLanguages: string[];
  imageFile?: File | null;
  imageUrl?: string;
  imageFileName?: string;
}

export interface CodingFormValidationErrors {
  [key: string]: string | undefined;
}

export interface CodingImageUploadResponse {
  statusCode: number;
  message: string;
  data: {
    imageUrl: string;
    imageFileName: string;
    imageFileSize: string;
    sizeInBytes: number;
  };
}

export interface BackendCodingProblemItem {
  id: string;
  category: "Coding" | string;
  questionType?: string;
  problemTitle?: string;
  title?: string;
  problemSubtitle?: string;
  subtitle?: string;
  difficulty: string;
  languagesCount?: number;
  totalTestCasesCount?: number;
  testCasesCount?: number;
  limitsDisplay?: string;
  keywords?: string | number;
  keywordsCount?: number;
  status: string;
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  sampleTestCases?: Array<{
    input: string;
    output: string;
    isHidden?: boolean;
  }>;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  marks?: number;
  hiddenTests?: number;
  hiddenTestCasesCount?: number;
  supportedLanguages?: string[];
  imageUrl?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface BackendCodingListResponse {
  statusCode: number;
  message: string;
  data: {
    content: BackendCodingProblemItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    codingLimit?: number;
    codingCount?: number;
    remainingLimit?: number;
    isLimitReached?: boolean;
    types?: string[];
    levels?: string[];
    statuses?: string[];
  };
}
