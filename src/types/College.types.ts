export type CollegeStatus = "Plan Activated" | "Trial Expired" | "2 Days Left";
export interface College {
    id: number;
    name: string;
    students: number;
    revenue: number;
    pending: number;
    initiatedDate: string;
    status: CollegeStatus;
}