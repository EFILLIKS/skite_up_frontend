import { authApi } from "../authservice/AuthApi";
import type {
  DashboardApiResponse,
  DashboardQueryParams,
  TeacherDashboardApiResponse,
  TeacherDashboardQueryParams,
  StudentDashboardApiResponse,
  StudentDashboardQueryParams,
  InstitutionDashboardApiResponse,
  InstitutionDashboardQueryParams,
} from "../../types/Dashboard.types";

export const dashboardApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuperAdminDashboard: builder.query<
      DashboardApiResponse,
      DashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/app/dashboard",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),
    getTeacherDashboard: builder.query<
      TeacherDashboardApiResponse,
      TeacherDashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/app/dashboard/teacher",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),
    getStudentDashboard: builder.query<
      StudentDashboardApiResponse,
      StudentDashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/app/dashboard/student",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),
    getInstitutionAdminDashboard: builder.query<
      InstitutionDashboardApiResponse,
      InstitutionDashboardQueryParams | void
    >({
      query: (params) => ({
        url: "/app/dashboard/institution-admin",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetSuperAdminDashboardQuery,
  useLazyGetSuperAdminDashboardQuery,
  useGetTeacherDashboardQuery,
  useLazyGetTeacherDashboardQuery,
  useGetStudentDashboardQuery,
  useLazyGetStudentDashboardQuery,
  useGetInstitutionAdminDashboardQuery,
  useLazyGetInstitutionAdminDashboardQuery,
} = dashboardApi;


