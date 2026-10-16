export interface RecordViolationRequest {
  assignmentId?: string;
  assessmentId?: string;
  studentId?: string;
  studentName?: string;
  registerNumber?: string;
  violationType: string;
  key?: string;
  description: string;
  details?: string;
  timestamp?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | string;
  status?: "Pending" | "Allowed" | "Disqualified" | string;
}

export interface ViolationItem {
  id: string;
  assessmentId?: string;
  assessmentName?: string;
  testName?: string;
  assessmentTitle?: string;
  assignmentId?: string;
  studentId?: string;
  studentName: string;
  registerNumber?: string;
  department?: string;
  dept?: string;
  section?: string;
  batch?: string;
  time?: string;
  dateDisplay?: string;
  timeDisplay?: string;
  incidentTime?: string;
  timestamp?: string;
  reason?: string;
  violationType?: string;
  details?: string;
  description?: string;
  status: "Pending" | "Allowed" | "Disqualified" | string;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  remarks?: string | null;
  severity?: string;
}

export interface ViolationSummary {
  totalViolatedTest?: number;
  totalViolations?: number;
  pendingCount?: number;
  pendingReviews?: number;
  allowedCount?: number;
  disqualifiedCount?: number;
}

export interface ViolationPaginationData {
  content: ViolationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ViolationListResponse {
  statusCode: number;
  message: string;
  data: {
    summary?: ViolationSummary;
    kpis?: ViolationSummary;
    violations?: ViolationPaginationData;
    content?: ViolationItem[];
    distinctBatches?: string[];
    distinctDepartments?: string[];
    distinctStatuses?: string[];
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

export interface UpdateViolationStatusRequest {
  status: "Allowed" | "Disqualified" | "Pending" | string;
  reviewerName?: string;
  comment?: string;
}
