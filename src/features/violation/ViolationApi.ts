import { authApi } from "../authservice/AuthApi";
import type {
  RecordViolationRequest,
  ViolationListResponse,
  ViolationItem,
  UpdateViolationStatusRequest,
} from "../../types/Violation.types";

export const violationApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    recordViolation: builder.mutation<
      { statusCode: number; message: string; data?: any },
      RecordViolationRequest
    >({
      query: (body) => ({
        url: "/app/violations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assessments"],
    }),

    getViolations: builder.query<
      ViolationListResponse,
      {
        search?: string;
        batch?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        size?: number;
      } | void
    >({
      query: (params) => ({
        url: "/app/violations",
        method: "GET",
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.batch ? { batch: params.batch } : {}),
          ...(params?.status && params.status !== "All" ? { status: params.status } : {}),
          ...(params?.startDate ? { startDate: params.startDate } : {}),
          ...(params?.endDate ? { endDate: params.endDate } : {}),
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      }),
      providesTags: ["Assessments"],
    }),

    getViolationById: builder.query<
      { statusCode: number; message: string; data: ViolationItem },
      string
    >({
      query: (id) => ({
        url: `/app/violations/${id}`,
        method: "GET",
      }),
      providesTags: ["Assessments"],
    }),

    updateViolationStatus: builder.mutation<
      { statusCode: number; message: string; data: ViolationItem },
      { id: string; body: UpdateViolationStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: `/app/violations/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Assessments"],
    }),
  }),
});

export const {
  useRecordViolationMutation,
  useGetViolationsQuery,
  useGetViolationByIdQuery,
  useUpdateViolationStatusMutation,
} = violationApi;
