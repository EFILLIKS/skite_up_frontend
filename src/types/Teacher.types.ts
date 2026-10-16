export interface TeacherItem {
  id: string;
  staffId?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  initials?: string;
  department: string;
  subject: string;
  status: "Active" | "Invited" | string;
  phoneNumber?: string;
  email?: string;
}

export interface TeacherPageData {
  content: TeacherItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalSeats: number;
  usedSeats: number;
  remainingSeats: number;
  isLimitReached: boolean;
  activeCount: number;
  invitedCount: number;
  institutionName?: string;
}

export interface TeachersApiResponse {
  statusCode: number;
  message: string;
  data: TeacherPageData;
}

export interface TeacherSeatsData {
  totalSeats: number;
  usedSeats: number;
  remainingSeats: number;
  isLimitReached: boolean;
  activeCount: number;
  invitedCount: number;
  institutionName?: string;
}

export interface TeacherSeatsApiResponse {
  statusCode: number;
  message: string;
  data: TeacherSeatsData;
}

export interface CreateTeacherRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  subject: string;
  status?: string;
}

export interface CreateTeacherResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

export interface TeacherPatchDto {
  status?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  subject?: string;
}

export interface TeacherPatchResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

export interface GetTeachersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  direction?: "ASC" | "DESC" | string;
  institutionId?: string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  subject: string;
  status?: string;
}
