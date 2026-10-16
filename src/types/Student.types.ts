export type InstitutionType = "College" | "School" | string;

export interface StudentManualRow {
  id?: string;
  registerNumber: string;
  studentName: string;
  degree?: string;
  batch?: string;
  department?: string;
  section?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  status?: string;
  institutionType?: InstitutionType;
  institutionId?: string;
}

export interface StudentItem {
  id: string;
  registerNumber: string;
  studentName: string;
  name?: string;
  degree?: string;
  batch?: string;
  department?: string;
  section?: string;
  email?: string;
  phoneNumber?: string;
  status?: "Active" | "Inactive" | "Disable" | string;
  noOfTest?: string | number;
  noOfTests?: string | number;
  testsDisplay?: string;
  tests?: string | number;
  institutionType?: InstitutionType;
  institutionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPageData {
  content: StudentItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalSeats?: number;
  usedSeats?: number;
  remainingSeats?: number;
  isLimitReached?: boolean;
  activeCount?: number;
  inactiveCount?: number;
}

export interface StudentsApiResponse {
  statusCode: number;
  message: string;
  data: StudentPageData;
}

export interface StudentDetailApiResponse {
  statusCode: number;
  message: string;
  data: StudentItem;
}

export interface StudentSeatsData {
  totalSeats: number;
  usedSeats: number;
  remainingSeats: number;
  isLimitReached: boolean;
  activeCount?: number;
  inactiveCount?: number;
}

export interface StudentSeatsApiResponse {
  statusCode: number;
  message: string;
  data: StudentSeatsData;
}

export interface StudentImportResponseData {
  totalProcessed?: number;
  successCount?: number;
  failedCount?: number;
  skippedCount?: number;
  usedSeats?: number;
  totalSeats?: number;
  remainingSeats?: number;
  errors?: Array<{ row?: number; registerNumber?: string; message?: string }>;
  failedRecords?: Array<{ row?: number; registerNumber?: string; message?: string }>;
}

export interface StudentImportApiResponse {
  statusCode: number;
  message: string;
  data?: StudentImportResponseData;
}

export interface GetStudentsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC" | string;
  search?: string;
  batch?: string;
  department?: string;
  status?: string;
}

export interface StudentPatchDto {
  registerNumber?: string;
  studentName?: string;
  degree?: string;
  batch?: string;
  department?: string;
  section?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
}
