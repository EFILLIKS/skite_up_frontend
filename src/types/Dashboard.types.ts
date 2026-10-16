export interface DashboardSummary {
  activeColleges: number;
  totalColleges: number;
  amountCollected: number;
  formattedAmountCollected: string;
  pendingBalance: number;
  formattedPendingBalance: string;
}

export interface MonthlyRevenueItem {
  month: string;
  monthNumber: number;
  year: number;
  amount: number;
  formattedAmount: string;
}

export interface MonthlyExpenseItem {
  month: string;
  monthNumber: number;
  year: number;
  amount: number;
  formattedAmount: string;
}

export interface DashboardCollegeItem {
  id: string;
  collegeName: string;
  institutionCode: string;
  studentCount: number | null;
  currentStudentCount: number;
  maxMembers: number | null;
  totalRevenue: number;
  formattedTotalRevenue: string;
  pending: number;
  formattedPending: string;
  initiatedDate: string;
  formattedInitiatedDate: string;
  planStatus: string;
  planCode: string | null;
  planName: string | null;
  isPaid: boolean;
}

export interface DashboardCollegesPage {
  content: DashboardCollegeItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyRevenue: MonthlyRevenueItem[];
  monthlyExpenses: MonthlyExpenseItem[];
  colleges: DashboardCollegesPage;
}

export interface DashboardApiResponse {
  data: DashboardData;
  message: string;
  statusCode: number;
}

export interface DashboardQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export interface TeacherDashboardSummary {
  totalTestRecord: number;
  upcomingTest: number;
  completedTest: number;
}

export interface TeacherAssignmentItem {
  assignmentId: string;
  assessmentId: string;
  testName: string;
  categories: string;
  batch: string;
  department: string;
  section: string;
  opensAt: string;
  closesAt: string;
  averageMark: number;
  totalMarks: number;
  averageMarkDisplay: string;
  totalStudentsAssigned: number;
  totalStudentsAttended: number;
  attendanceDisplay: string;
  status: string;
}

export interface TeacherUpcomingAssignmentItem {
  assignmentId?: string;
  assessmentId?: string;
  testName?: string;
  categories?: string;
  batch?: string;
  department?: string;
  section?: string;
  opensAt?: string;
  closesAt?: string;
  totalStudentsAssigned?: number;
  totalMarks?: number;
  students?: string;
  marks?: string;
  [key: string]: unknown;
}

export interface TeacherAssignmentsPage {
  content: TeacherAssignmentItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TeacherDashboardData {
  teacherName?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  staffId?: string | null;
  welcomeMessage?: string;
  bannerBadge?: string;
  summary: TeacherDashboardSummary;
  assignments: TeacherAssignmentsPage;
  upcomingAssignments: TeacherUpcomingAssignmentItem[];
}

export interface TeacherDashboardApiResponse {
  data: TeacherDashboardData;
  message: string;
  statusCode: number;
}

export interface TeacherDashboardQueryParams {
  page?: number;
  size?: number;
  search?: string;
  batch?: string;
  department?: string;
  section?: string;
}

export interface StudentDashboardSummary {
  totalTests: number;
  averageScore: number;
  averageScoreDisplay: string;
  timeSpentHours: number;
  timeSpentDisplay: string;
  liveCount: number;
  upcomingCount: number;
  completedCount: number;
  attendedCount: number;
  missedCount: number;
}

export interface StudentDashboardTestDistribution {
  totalAttended: number;
  totalAttendedPercent: number;
  currentTest: number;
  currentTestPercent: number;
  totalMissed: number;
  totalMissedPercent: number;
  totalTests: number;
}

export interface StudentDashboardTaskItem {
  id?: string;
  assignmentId?: string;
  assessmentId?: string;
  studentAssignmentId?: string;
  title: string;
  categories?: string;
  categoryList?: string[];
  status: "Live" | "Upcoming" | "Completed" | "Missed" | string;
  statusColor?: string;
  timeDisplay: string;
  opensAt?: string;
  closesAt?: string;
  durationMinutes: number;
  totalQuestions?: number;
  totalMarks?: number;
  canStart: boolean;
  attended?: boolean;
  score?: number | null;
  percentage?: number | null;
}

export interface StudentDashboardTasksPage {
  content: StudentDashboardTaskItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface StudentDashboardCalendar {
  year: number;
  month: string;
  monthValue: number;
  selectedDate: string;
  selectedDateDisplay: string;
  completedDates: string[];
  todayDates: string[];
  upcomingDates: string[];
  testsForSelectedDate?: StudentDashboardTaskItem[];
}

export interface StudentDashboardData {
  studentName?: string;
  firstName?: string;
  registerNumber?: string;
  batch?: string;
  degree?: string;
  department?: string;
  section?: string;
  bannerBadge?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  summary: StudentDashboardSummary;
  testDistribution: StudentDashboardTestDistribution;
  tasks: StudentDashboardTaskItem[];
  tasksPage?: StudentDashboardTasksPage;
  calendar: StudentDashboardCalendar;
}

export interface StudentDashboardApiResponse {
  statusCode: number;
  message: string;
  data: StudentDashboardData;
}

export interface StudentDashboardQueryParams {
  search?: string;
  status?: string;
  date?: string;
  page?: number;
  size?: number;
}

export interface InstitutionAdminProfile {
  adminName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  initials?: string;
  profilePicture?: string | null;
  institutionId?: string;
  institutionName?: string;
  institutionCode?: string;
}

export interface InstitutionDashboardBanner {
  showBanner?: boolean;
  message?: string;
  buttonText?: string;
  buttonLink?: string;
  trialDaysLeft?: number;
  isTrial?: boolean;
  isPaid?: boolean;
}

export interface InstitutionDashboardSummary {
  studentsCount?: number;
  teachersCount?: number;
  departmentsCount?: number;
  planTitle?: string;
  planValue?: string;
  planStatus?: string;
  trialDaysLeft?: number;
}

export interface InstitutionDashboardCard {
  key: string;
  title: string;
  value: string;
  count?: number;
  description: string;
  icon?: string;
}

export interface InstitutionDashboardTableItem {
  index?: number;
  batch: string;
  department: string;
  section: string;
  testName: string;
  categories: string;
  averageMark?: number;
  totalMarks?: number;
  averageMarkDisplay?: string;
  attendedStudents?: number;
  totalStudents?: number;
  attendanceDisplay?: string;
  status?: string;
  opensAt?: string;
  closesAt?: string;
  assignmentId?: string;
  assessmentId?: string;
}

export interface InstitutionDashboardTablePage {
  content: InstitutionDashboardTableItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface InstitutionDashboardFilters {
  availableBatches?: string[];
  availableDepartments?: string[];
  availableSections?: string[];
  availableStatuses?: string[];
}

export interface InstitutionDashboardCalendar {
  year?: number;
  month?: string;
  monthValue?: number;
  selectedDate?: string;
  selectedDateDisplay?: string;
  completedDates?: string[];
  todayDates?: string[];
  upcomingDates?: string[];
  testsForSelectedDate?: any[];
}

export interface InstitutionDashboardData {
  admin?: InstitutionAdminProfile;
  banner?: InstitutionDashboardBanner;
  title?: string;
  subtitle?: string;
  summary?: InstitutionDashboardSummary;
  cards?: InstitutionDashboardCard[];
  table?: InstitutionDashboardTablePage;
  filters?: InstitutionDashboardFilters;
  calendar?: InstitutionDashboardCalendar;
}

export interface InstitutionDashboardApiResponse {
  statusCode: number;
  message: string;
  data: InstitutionDashboardData;
}

export interface InstitutionDashboardQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  search?: string | null;
  batch?: string | null;
  department?: string | null;
  section?: string | null;
  status?: string | null;
  date?: string | null;
}


