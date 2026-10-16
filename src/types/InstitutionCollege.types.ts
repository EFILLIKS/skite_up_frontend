export type InstitutionCollegeStatus = "Active" | "Pending" | "Renewal Soon" | "Expired";

export interface InstitutionCollege {
  id: number;
  serial?: number;
  name: string;
  students: number;
  studentCapacity: number;
  renewalDate: string;
  status: InstitutionCollegeStatus;
  code?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  firstName?: string;
  lastName?: string;
  teacherCount?: number;
  plan?: string;
  startDate?: string;
  endDate?: string;
  revenue?: number;
  pending?: number;
  initiatedDate?: string;
}
