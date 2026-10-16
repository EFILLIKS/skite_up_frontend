export * from "./Grammar.types";
import type { GrammarCheckResponse, LsrwGrammarResults } from "./Grammar.types";

export interface BatchSummaryItem {
  batch: string;
  department: string;
  studentCount: number;
  displayText: string;
}

export interface CreateAssessmentTemplateRequest {
  testName: string;
  description: string;
  categories: string[];
  mcqCount?: number;
  lsrwCount?: number;
  codingCount?: number;
  durationMinutes: number;
  negativeMarksPerWrong: number;
  attemptsAllowed: number;
  randomizeQuestionOrder: boolean;
  shuffleAnswerOptions: boolean;
  resultVisibility: string;
  showCorrectAnswers: boolean;
  selectedQuestionIds: string[];
}

export interface AssignAssessmentRequest {
  assessmentId: string;
  opensAt: string;
  closesAt: string;
  batches: string[];
}

export interface AssessmentAssignmentItem {
  assignmentId: string;
  assessmentId?: string;
  title: string;
  batches?: string[];
  batchesDisplay: string;
  types: string;
  marks?: number;
  marksDisplay: string;
  dateDisplay: string;
  timeDisplay: string;
  opensAt?: string;
  closesAt?: string;
  status: "Active" | "Completed" | "Draft" | string;
  isReassign?: boolean;
  totalStudentsAssigned: number;
  totalStudentsAttended: number;
  totalStudentsNotAttended: number;
  canReassign: boolean;
}

export interface AssessmentCalendarData {
  monthDisplay: string;
  selectedDateDisplay: string;
  selectedDate: string;
  completedDates: string[];
  todayDates: string[];
  upcomingDates: string[];
}

export interface AssessmentResultsApiResponse {
  content: AssessmentAssignmentItem[];
  page: number;
  size: number;
  totalElements: number;
  calendar?: AssessmentCalendarData;
}

export interface UnattendedStudentItem {
  studentId: string;
  studentName: string;
  registerNumber: string;
  batch: string;
  department?: string;
  status?: string;
  attended: boolean;
}

export interface AttendedStudentItem {
  studentId: string;
  studentName: string;
  registerNumber: string;
  batch: string;
  department?: string;
  status?: string;
  attended: boolean;
  score?: number;
  percentage?: number;
}

export interface UnattendedStudentsData {
  assignmentId: string;
  testName: string;
  totalAssigned: number;
  attendedCount: number;
  unattendedCount: number;
  unattendedStudents: UnattendedStudentItem[];
  attendedStudents: AttendedStudentItem[];
}

export interface ReassignAssessmentRequest {
  opensAt: string;
  closesAt: string;
}

export interface AssessmentHistoryItem {
  assignmentId: string;
  title: string;
  historySubtitle: string;
  batchesDisplay: string;
  submittedDisplay: string;
  averageDisplay: string;
  highestDisplay: string;
}

export interface AssessmentTemplateItem {
  id: string;
  testName: string;
  description?: string;
  categories: string[];
  categoriesDisplay?: string;
  marks?: number;
  marksDisplay?: string;
  durationMinutes?: number;
  questionCount?: number;
  createdAt?: string;
}

export type AssessmentTab = "Result" | "Assign" | "History";

export interface StudentAssessmentItem {
  assignmentId: string;
  assessmentId: string;
  studentAssignmentId: string;
  title: string;
  categories: string;
  categoryList?: string[];
  status: "Live" | "Upcoming" | "Completed" | "Missed" | string;
  statusColor?: string;
  timeDisplay: string;
  durationMinutes: number;
  totalQuestions: number;
  canStart: boolean;
  attended: boolean;
  score?: number | null;
  percentage?: number | null;
  opensAt?: string;
  closesAt?: string;
}

export interface StudentAssessmentFilterCounts {
  all: number;
  live: number;
  upcoming: number;
  completed: number;
  missed: number;
}

export interface StudentAssessmentsPage {
  content: StudentAssessmentItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface StudentAssessmentsData {
  filterCounts: StudentAssessmentFilterCounts;
  content: StudentAssessmentItem[];
  assessments?: StudentAssessmentsPage;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface StudentAssessmentsApiResponse {
  statusCode: number;
  message: string;
  data: StudentAssessmentsData;
}

export interface StudentAssessmentsQueryParams {
  search?: string;
  status?: string;
  date?: string;
  page?: number;
  size?: number;
}

export interface AssessmentPreCheckData {
  title: string;
  categories: string;
  durationMinutes: number;
  totalItems: number;
  totalMarks: number;
  attemptsAllowed: number;
  systemChecks: {
    networkConnectionStable: boolean;
    browserSupported: boolean;
    clockSynchronized: boolean;
  };
  hardwareChecks?: {
    audioPlaybackLabel?: string;
    audioPlaybackTestUrl?: string;
    microphoneAuthLabel?: string;
    microphoneStatus?: string;
  };
  instructions: string[];
  declarationText: string;
}

export interface AssessmentPreCheckResponse {
  statusCode: number;
  message: string;
  data: AssessmentPreCheckData;
}

export interface AssessmentSubSkillGroup {
  name: "Listening" | "Speaking" | "Reading" | "Writing" | string;
  icon?: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
}

export interface AssessmentSectionInfo {
  sectionKey: "MCQ" | "LSRW" | "CODING" | string;
  countDisplay: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  subSkills?: AssessmentSubSkillGroup[];
}

export interface AssessmentQuestionOption {
  id?: string;
  key?: string;
  text?: string;
  optionKey?: string;
  optionText?: string;
  optionOrder?: number;
}

export interface AssessmentCodingTestCase {
  id?: string | number;
  testCaseIndex?: number;
  input?: string;
  expectedOutput?: string;
  isHidden?: boolean;
  sample?: boolean;
}

export interface AssessmentQuestionItem {
  id: string;
  questionNumber: number;
  sectionKey?: "MCQ" | "LSRW" | "CODING" | string;
  sectionType?: "MCQ" | "LSRW" | "CODING" | string;
  subSkill?: "Listening" | "Speaking" | "Reading" | "Writing" | string;
  skill?: string;
  questionType?: string;
  category?: string;
  lsrwSubType?: string;
  subSkillIcon?: string;
  questionText: string;
  imageUrl?: string | null;
  description?: string | null;
  marks?: number;
  negativeMarks?: number;
  options?: AssessmentQuestionOption[];
  audioPromptUrl?: string | null;
  audioDuration?: string | null;
  readableParagraph?: string | null;
  wordLimit?: number | null;
  recordingTimeLimitSeconds?: number;
  codingTitle?: string;
  inputFormat?: string | null;
  outputFormat?: string | null;
  constraints?: string | null;
  supportedLanguages?: string[];
  starterCode?: string | Record<string, string>;
  starterCodeByLanguage?: Record<string, string>;
  testCases?: any[];
  visibleTestCases?: AssessmentCodingTestCase[];
  runsRemaining?: number;
  maxRuns?: number;
  status?: "ANSWERED" | "SKIPPED" | "FLAGGED" | "NOT_VISITED" | string;
  selectedOption?: string | null;
  savedOptionKey?: string | null;
  textResponse?: string | null;
  savedTextResponse?: string | null;
  audioResponseUrl?: string | null;
  savedAudioUrl?: string | null;
  code?: string | null;
  savedCode?: string | null;
  language?: string | null;
  savedLanguage?: string | null;
  isFlagged?: boolean;
  isSkipped?: boolean;
}

export interface AssessmentPaletteSummary {
  all: number;
  answered: number;
  skipped: number;
  flagged: number;
  notVisited: number;
}

export interface AssessmentSessionData {
  assessmentId?: string;
  assignmentId?: string;
  title: string;
  categories: string;
  timeRemainingSeconds: number;
  timeRemainingDisplay: string;
  sections: AssessmentSectionInfo[] | Record<string, AssessmentSectionInfo>;
  paletteSummary: AssessmentPaletteSummary;
  questions: AssessmentQuestionItem[];
}

export interface AssessmentSessionResponse {
  statusCode: number;
  message: string;
  data: AssessmentSessionData;
}

export interface QuestionResponseRequest {
  action: "SAVE" | "SKIP" | "FLAG" | "CLEAR" | string;
  selectedOption?: string | null;
  textResponse?: string | null;
  audioResponseUrl?: string | null;
  transcript?: string | null;
  code?: string | null;
  language?: string | null;
  passedTestCases?: number | null;
  totalTestCases?: number | null;
  timeSpentSeconds?: number | null;
}

export interface QuestionResponseApiResponse {
  statusCode: number;
  message: string;
  data: {
    questionId: string;
    action: string;
    status: string;
    selectedOption?: string | null;
    isFlagged?: boolean;
    isSkipped?: boolean;
    paletteSummary?: AssessmentPaletteSummary;
  };
}

export interface RunCodeRequest {
  code: string;
  language: string;
}

export interface RunCodeTestCaseItem {
  testCaseIndex: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  statusBadge?: string;
  badgeColor?: string;
  executionTimeMs?: number;
}

export interface RunCodeTestCaseResult {
  testCaseNumber?: number;
  testCaseIndex?: number;
  passed: boolean;
  statusText?: string;
  actualOutput?: string;
  expectedOutput?: string;
}

export interface RunCodeData {
  allPassed?: boolean;
  totalTestCases?: number;
  passedTestCases?: number;
  runsRemaining: number;
  maxRuns?: number;
  executionTimeMs?: number;
  diagnosticOutput?: string;
  stdout?: string;
  stderr?: string;
  testCaseResults?: RunCodeTestCaseItem[];
  testCases?: RunCodeTestCaseResult[];
}

export interface RunCodeApiResponse {
  statusCode: number;
  message: string;
  data: RunCodeData;
}

export interface StudentResponseBatchItem {
  selectedOption?: string | null;
  timeSpentSeconds?: number | null;
  code?: string | null;
  language?: string | null;
  passedTestCases?: number | null;
  totalTestCases?: number | null;
  textResponse?: string | null;
  audioResponseUrl?: string | null;
  transcript?: string | null;
}

export interface SubmitAssessmentRequest {
  responses?: Record<string, StudentResponseBatchItem>;
}

export interface UploadAudioData {
  audioFileUrl?: string;
  audioFileName?: string;
  audioFileSize?: string;
  sizeInBytes?: number;
  documentUrl?: string;
  documentName?: string;
  documentSize?: string;
  document?: {
    url?: string;
    name?: string;
    size?: string;
    sizeInBytes?: number;
  };
  fileUrl?: string;
  fileName?: string;
  questionId?: string;
}

export interface UploadAudioApiResponse {
  statusCode: number;
  message: string;
  data: UploadAudioData;
}

export interface StudentLsrwSubSection {
  subSkillName: string;
  score: number;
  totalMarks: number;
  percentage: number;
}

export interface StudentPaletteFilters {
  all: number;
  wrong: number;
  skipped: number;
}

export interface StudentTestSectionBreakdown {
  sectionName: string;
  questionCountDisplay?: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  partiallyCorrectQuestions?: number;
  incorrectQuestions: number;
  unattemptedQuestions: number;
  score: number;
  totalMarks: number;
  percentage: number;
  subSections?: StudentLsrwSubSection[] | null;
}

export interface StudentQuestionOption {
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  isStudentAnswer: boolean;
}

export interface StudentCodingTestCase {
  testCaseIndex: number;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
  marks: number;
}

export interface StudentQuestionEvaluation {
  questionId: string;
  questionOrder: number;
  totalQuestionsInTest?: number;
  category: "MCQ" | "CODING" | "LSRW" | string;
  subSkill?: string;
  questionText: string;
  status: "CORRECT" | "WRONG" | "PARTIALLY_CORRECT" | "NOT_ANSWERED" | string;
  isCorrect?: boolean | null;
  marksAwarded: number;
  maxMarks: number;
  negativeMarks?: number;
  percentage: number;
  timeSpentDisplay?: string | null;
  explanation?: string | null;
  options?: StudentQuestionOption[] | null;
  studentAnswer?: string | null;
  correctAnswer?: string | null;
  language?: string | null;
  fileName?: string | null;
  submittedCode?: string | null;
  executionTimeMs?: number | null;
  memoryMb?: number | null;
  passedTestCasesCount?: number | null;
  totalTestCasesCount?: number | null;
  testCases?: StudentCodingTestCase[] | null;
  testCasesNote?: string | null;
  lsrwSubType?: "Listening" | "SPEAKING" | "Reading" | "Writing" | string | null;
  audioPromptUrl?: string | null;
  audioPromptDuration?: string | null;
  studentAudioUrl?: string | null;
  studentAudioDuration?: string | null;
  transcript?: string | null;
  passageTitle?: string | null;
  passageText?: string | null;
  checklist?: Array<{ index?: number; label?: string; description?: string; name?: string; concept?: string; text?: string; criterion?: string; matched?: boolean } | string> | null;
  matchedChecklistCount?: number | null;
  totalChecklistCount?: number | null;
  checklistNote?: string | null;
  expectedAnswer?: string | null;
  strengths?: string[] | string | null;
  improvedAreas?: string[] | string | null;
  aiSuggestions?: string[] | string | null;
  grammarAnalysis?: GrammarCheckResponse | null;
}

export interface StudentTestResultData {
  assignmentId?: string;
  assessmentId?: string;
  studentAssignmentId?: string;
  studentName?: string;
  studentRegisterNumber?: string;
  studentDepartment?: string;
  studentBatch?: string;
  studentSection?: string;
  testTitle?: string;
  sectionsSubtitle?: string;
  status?: string;
  statusBadge?: string;
  submittedAt?: string;
  submittedAtDisplay?: string;
  durationSpentDisplay?: string;
  timeTakenDisplay?: string;
  attempt?: number;
  score: number;
  totalMarks: number;
  percentage: number;
  passThresholdScore?: number;
  classAvgScore?: number;
  accuracyPercentage?: number;
  totalQuestions?: number;
  attemptedQuestions?: number;
  correctQuestions?: number;
  partiallyCorrectQuestions?: number;
  wrongQuestions?: number;
  unattemptedQuestions?: number;
  scoringNote?: string | null;
  mcqScore?: number;
  mcqTotalMarks?: number;
  mcqPercentage?: number;
  mcqQuestionsCount?: number;
  mcqCorrectCount?: number;
  mcqIncorrectCount?: number;
  mcqUnattemptedCount?: number;
  lsrwScore?: number;
  lsrwTotalMarks?: number;
  lsrwPercentage?: number;
  lsrwQuestionsCount?: number;
  lsrwCorrectCount?: number;
  lsrwIncorrectCount?: number;
  lsrwUnattemptedCount?: number;
  lsrwSubSections?: StudentLsrwSubSection[];
  grammarScore?: number | null;
  grammarResults?: LsrwGrammarResults | null;
  codingScore?: number;
  codingTotalMarks?: number;
  codingPercentage?: number;
  codingQuestionsCount?: number;
  codingCorrectCount?: number;
  codingIncorrectCount?: number;
  codingUnattemptedCount?: number;
  paletteFilters?: StudentPaletteFilters;
  sectionBreakdowns?: StudentTestSectionBreakdown[];
  questionEvaluations?: StudentQuestionEvaluation[];
  attended?: boolean;
  instructorFeedback?: string;
  feedback?: string;
}

export interface AssessmentResultResponse {
  statusCode: number;
  message: string;
  data: StudentTestResultData;
}

export type SubmitAssessmentResponse = AssessmentResultResponse;

export interface TeacherStudentResultItem {
  id: string;
  studentId?: string;
  studentName: string;
  registerNumber: string;
  email?: string;
  avatarColor?: string;
  batch: string;
  department: string;
  section: string;
  testId?: string;
  testTitle?: string;
  testName?: string;
  categories?: string[] | string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: "Passed" | "Failed" | "Needs Review" | "Absent" | "Completed" | string;
  timeTaken?: string;
  timeTakenDisplay?: string;
  submittedAt?: string;
  submittedAtDisplay?: string;
}

export interface TeacherStudentResultsAnalytics {
  totalAttended?: number;
  totalAssigned?: number;
  attendanceRate?: number;
  averageScore?: number;
  avgScore?: number;
  passedCount?: number;
  passRate?: number;
  highestScore?: number;
  maxScore?: number;
  topStudentName?: string;
  topStudentDept?: string;
}

export interface TeacherStudentResultsFilters {
  availableBatches?: string[];
  availableDepartments?: string[];
  availableSections?: string[];
  availableStatuses?: string[];
  availableTestTitles?: string[];
}

export interface TeacherStudentResultsData {
  content: TeacherStudentResultItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  analytics?: TeacherStudentResultsAnalytics;
  summary?: TeacherStudentResultsAnalytics;
  filters?: TeacherStudentResultsFilters;
  calendar?: AssessmentCalendarData;
}

export interface TeacherStudentResultsApiResponse {
  statusCode: number;
  message: string;
  data: TeacherStudentResultsData;
}

export interface TeacherStudentResultsQueryParams {
  search?: string;
  testTitle?: string;
  batch?: string;
  department?: string;
  section?: string;
  status?: string;
  date?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC" | "asc" | "desc";
}



