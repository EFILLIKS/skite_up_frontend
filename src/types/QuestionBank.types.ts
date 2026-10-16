export interface CategorySkill {
  skillName: string;
  topics: string[];
  count: number;
}

export interface DomainCategoryData {
  domainName: string;
  totalQuestionsCount: number;
  skills: CategorySkill[];
}

export interface CategoriesApiResponse {
  statusCode: number;
  message: string;
  data: DomainCategoryData[];
}

export type BackendDifficulty = "EASY" | "MEDIUM" | "HARD" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type BackendStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export type MCQSubtype = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";

export interface QuestionBankOption {
  id?: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

export type MCQOptionPayload = QuestionBankOption;

export interface QuestionBankRequestDto {
  category: "MCQ" | "LSRW" | "Coding" | "Cognitive Games" | "Draft" | string;
  questionType: "Single choice" | "Multiple choice" | "True/False" | string;
  skill: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  questionText: string;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  status: "Published" | "Draft" | string;
  options: QuestionBankOption[];
}

export type CreateMCQDto = QuestionBankRequestDto;

export interface QuestionBankItem {
  id: string;
  category: "MCQ" | "LSRW" | "Coding" | "Cognitive Games" | "Draft" | string;
  questionType: "Single choice" | "Multiple choice" | "True/False" | string;
  skill: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  questionText: string;
  marks: number;
  negativeMarks: number;
  marksDisplay?: string;
  explanation?: string;
  status: "Published" | "Draft" | string;
  usedInTests?: number;
  usedInTestsDisplay?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  options: QuestionBankOption[];

  subtype?: MCQSubtype;
  skillName?: string;
  topicName?: string;
  usedInTestsCount?: number;
}

export type MCQQuestionResponse = QuestionBankItem;

export interface SingleQuestionApiResponse {
  statusCode: number;
  message: string;
  data: QuestionBankItem;
}

export interface QuestionBankBulkUploadData {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  mcqLimit: number;
  usedCount: number;
  remainingCount: number;
  errors: string[];
  questions: QuestionBankItem[];
}

export interface QuestionBankBulkUploadResponse {
  statusCode: number;
  message: string;
  data: QuestionBankBulkUploadData;
}

export type BulkMCQApiResponse = QuestionBankBulkUploadResponse;

export interface QuestionBankBatchResponse {
  statusCode: number;
  message: string;
  data: QuestionBankItem[];
}

export interface QuestionBankListParams {
  category?: string;
  skill?: string;
  topic?: string;
  type?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  subtype?: string;
  skillName?: string;
  topicName?: string;
}

export type GetMCQListParams = QuestionBankListParams;

export interface TopicTreeNode {
  topic: string;
  count?: number;
}

export interface SkillTreeNode {
  skill?: string;
  name?: string;
  count?: number;
  topics: Array<TopicTreeNode | string>;
}

export interface QuestionBankListData {
  content: QuestionBankItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
  mcqLimit: number;
  mcqCount: number;
  remainingLimit: number;
  totalQuestions?: number;
  allSkillsCount?: number;
  isLimitReached?: boolean;
  limitReached?: boolean;
  skills?: SkillTreeNode[];
  skillsTree?: SkillTreeNode[];
  types?: string[];
  typesList?: string[];
  levels?: string[];
  levelsList?: string[];
  statuses?: string[];
  statusesList?: string[];
  institutionId?: string;
  institutionName?: string;
  categoryCounts?: {
    mcqCount: number;
    lsrwCount: number;
    codingCount: number;
    cognitiveGamesCount: number;
    draftCount: number;
  };
}

export interface QuestionBankListApiResponse {
  statusCode: number;
  message: string;
  data: QuestionBankListData;
}

export interface QuestionBankLimitsData {
  mcqLimit: number;
  mcqCount?: number;
  usedCount?: number;
  remainingCount?: number;
  isLimitReached?: boolean;
  lsrwLimit?: number;
  lsrwCount?: number;
  lsrwRemainingLimit?: number;
  isLsrwLimitReached?: boolean;
  listeningCount?: number;
  speakingCount?: number;
  readingCount?: number;
  writingCount?: number;
  totalQuestions?: number;
  publishedCount?: number;
  draftCount?: number;
  codingLimit?: number;
  codingCount?: number;
  codingRemainingLimit?: number;
  isCodingLimitReached?: boolean;
  categoryCounts?: {
    MCQ?: number;
    LSRW?: number;
    Coding?: number;
    "Cognitive Games"?: number;
    Draft?: number;
  };
}

export interface QuestionBankLimitsResponse {
  statusCode: number;
  message: string;
  data: QuestionBankLimitsData;
}

export type LSRWExerciseType = "LISTENING" | "SPEAKING" | "READING" | "WRITING";

export interface LSRWSubQuestionPayload {
  id?: string;
  questionText: string;
  questionType: string;
  optionsJson?: string;
  correctAnswer?: string;
  marks: number;
}

export interface CreateLSRWDto {
  exerciseType: LSRWExerciseType;
  title: string;
  description?: string;
  mediaUrl?: string;
  passageText?: string;
  promptText?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EASY" | "MEDIUM" | "HARD";
  durationMinutes: number;
  totalMarks: number;
  negativeMarks?: number;
  status: "PUBLISHED" | "DRAFT";
  questions?: LSRWSubQuestionPayload[];
}

export interface LSRWExerciseResponse {
  id: string;
  exerciseType: LSRWExerciseType;
  title: string;
  description?: string;
  mediaUrl?: string;
  passageText?: string;
  promptText?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EASY" | "MEDIUM" | "HARD";
  durationMinutes: number;
  totalMarks: number;
  negativeMarks?: number;
  status: "PUBLISHED" | "DRAFT";
  questionsCount?: number;
  questions?: LSRWSubQuestionPayload[];
  createdByName?: string;
  createdAt?: string;
}

export interface BulkLSRWApiResponse {
  statusCode: number;
  message: string;
  data: LSRWExerciseResponse[];
}

export interface GetLSRWListParams {
  page?: number;
  size?: number;
  institutionId?: string;
  exerciseType?: LSRWExerciseType;
  difficulty?: string;
  status?: string;
  search?: string;
}

export interface CodingTestCasePayload {
  id?: string;
  inputData: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface CreateCodingDto {
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimitMs: number;
  memoryLimitMb: number;
  marks: number;
  minimumMarks?: number;
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  status: "PUBLISHED" | "DRAFT";
  supportedLanguages?: string[];
  positiveKeywords?: string[];
  negativeKeywords?: string[];
  testCases: CodingTestCasePayload[];
}

export interface CodingProblemResponse {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimitMs?: number;
  memoryLimitMb?: number;
  marks: number;
  minimumMarks?: number;
  testCasesCount?: number;
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  supportedLanguages?: string[];
  positiveKeywords?: string[];
  negativeKeywords?: string[];
  status: "PUBLISHED" | "DRAFT";
  createdByName?: string;
  createdAt?: string;
  testCases?: CodingTestCasePayload[];
}

export interface BulkCodingApiResponse {
  statusCode: number;
  message: string;
  data: CodingProblemResponse[];
}

export interface GetCodingListParams {
  page?: number;
  size?: number;
  institutionId?: string;
  difficulty?: string;
  status?: string;
  search?: string;
}

export type LSRWSubTab = "Listening" | "Speaking" | "Reading" | "Writing";
export type LSRWLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CognitiveGame {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  metrics: string[];
}
