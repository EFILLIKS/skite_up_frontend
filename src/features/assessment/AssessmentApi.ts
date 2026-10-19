import { authApi } from "../authservice/AuthApi";
import type {
  BatchSummaryItem,
  CreateAssessmentTemplateRequest,
  AssignAssessmentRequest,
  AssessmentResultsApiResponse,
  UnattendedStudentsData,
  ReassignAssessmentRequest,
  AssessmentHistoryItem,
  AssessmentTemplateItem,
  TeacherStudentResultsApiResponse,
  TeacherStudentResultsQueryParams,
  AssessmentDetailResponse,
  AssessmentDetailData,
} from "../../types/Assessment.types";

export const assessmentApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query<{ statusCode: number; message: string; data: BatchSummaryItem[] }, void>({
      query: () => ({
        url: "/app/assessments/batches",
        method: "GET",
      }),
      providesTags: ["Assessments"],
    }),

    createAssessmentTemplate: builder.mutation<
      { statusCode: number; message: string; data: any },
      CreateAssessmentTemplateRequest
    >({
      query: (body) => ({
        url: "/app/assessments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assessments"],
    }),

    getAssessmentTemplates: builder.query<
      { statusCode: number; data: AssessmentTemplateItem[] | { content: AssessmentTemplateItem[] } },
      { search?: string; batch?: string; department?: string; section?: string } | void
    >({
      query: (params) => ({
        url: "/app/assessments",
        method: "GET",
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.batch ? { batch: params.batch } : {}),
          ...(params?.department ? { department: params.department } : {}),
          ...(params?.section ? { section: params.section } : {}),
        },
      }),
      providesTags: ["Assessments"],
    }),

    deleteAssessmentTemplate: builder.mutation<{ statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/app/assessments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assessments"],
    }),

    getAssessmentById: builder.query<AssessmentDetailResponse, string>({
      query: (id) => ({
        url: `/app/assessments/${id}`,
        method: "GET",
      }),
      providesTags: ["Assessments"],
    }),

    assignAssessment: builder.mutation<
      { statusCode: number; message: string; data: any },
      AssignAssessmentRequest
    >({
      query: (body) => ({
        url: "/app/assessments/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assessments"],
    }),

    getAssessmentResults: builder.query<
      { statusCode: number; message: string; data: AssessmentResultsApiResponse },
      { status?: string; page?: number; size?: number; search?: string; date?: string } | void
    >({
      query: (params) => ({
        url: "/app/assessments/results",
        method: "GET",
        params: {
          status: params?.status && params.status !== "All Status" ? params.status : "All Status",
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.date ? { date: params.date } : {}),
        },
      }),
      providesTags: ["Assessments"],
    }),

    getUnattendedStudents: builder.query<
      { statusCode: number; message: string; data: UnattendedStudentsData },
      string
    >({
      query: (assignmentId) => ({
        url: `/app/assessments/assignments/${assignmentId}/unattended-students`,
        method: "GET",
      }),
    }),

    reassignAssessment: builder.mutation<
      { statusCode: number; message: string; data: any },
      { assignmentId: string; body: ReassignAssessmentRequest }
    >({
      query: ({ assignmentId, body }) => ({
        url: `/app/assessments/assignments/${assignmentId}/reassign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assessments"],
    }),

    getAssessmentHistory: builder.query<
      { statusCode: number; message: string; data: { content: AssessmentHistoryItem[]; page: number; size: number; totalElements: number } },
      { page?: number; size?: number; search?: string; sortBy?: string } | void
    >({
      query: (params) => ({
        url: "/app/assessments/history",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
        },
      }),
      providesTags: ["Assessments"],
    }),

    deleteAssessmentAssignment: builder.mutation<{ statusCode: number; message: string }, string>({
      query: (assignmentId) => ({
        url: `/app/assessments/assignments/${assignmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assessments"],
    }),

    getStudentAssessments: builder.query<
      import("../../types/Assessment.types").StudentAssessmentsApiResponse,
      import("../../types/Assessment.types").StudentAssessmentsQueryParams | void
    >({
      query: (params) => ({
        url: "/app/assessments/student",
        method: "GET",
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.status && params.status !== "All" ? { status: params.status } : {}),
          ...(params?.date ? { date: params.date } : {}),
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      }),
      providesTags: ["Assessments"],
    }),

    getPreCheck: builder.query<
      import("../../types/Assessment.types").AssessmentPreCheckResponse,
      string
    >({
      query: (id) => ({
        url: `/app/assessments/take/${id}/pre-check`,
        method: "GET",
      }),
      providesTags: ["Assessments"],
    }),

    startSession: builder.mutation<
      import("../../types/Assessment.types").AssessmentSessionResponse,
      string
    >({
      query: (id) => ({
        url: `/app/assessments/take/${id}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Assessments"],
    }),

    getSession: builder.query<
      import("../../types/Assessment.types").AssessmentSessionResponse,
      string
    >({
      query: (id) => ({
        url: `/app/assessments/take/${id}/session`,
        method: "GET",
      }),
      providesTags: ["Assessments"],
    }),

    saveQuestionResponse: builder.mutation<
      import("../../types/Assessment.types").QuestionResponseApiResponse,
      {
        id: string;
        questionId: string;
        body: import("../../types/Assessment.types").QuestionResponseRequest;
      }
    >({
      query: ({ id, questionId, body }) => ({
        url: `/app/assessments/take/${id}/questions/${questionId}/response`,
        method: "POST",
        body,
      }),
    }),

    runCode: builder.mutation<
      import("../../types/Assessment.types").RunCodeApiResponse,
      {
        id: string;
        questionId: string;
        body: import("../../types/Assessment.types").RunCodeRequest;
      }
    >({
      query: ({ id, questionId, body }) => ({
        url: `/app/assessments/take/${id}/questions/${questionId}/run-code`,
        method: "POST",
        body,
      }),
    }),

    submitAssessment: builder.mutation<
      import("../../types/Assessment.types").SubmitAssessmentResponse,
      { id: string; body?: import("../../types/Assessment.types").SubmitAssessmentRequest } | string
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const body = typeof arg === "string" ? {} : arg.body || {};
        return {
          url: `/app/assessments/take/${id}/submit`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Assessments"],
    }),

    getAssessmentResult: builder.query<
      import("../../types/Assessment.types").AssessmentResultResponse,
      string | { id: string; assessmentId?: string }
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return {
          url: `/app/assessments/student-results/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Assessments"],
    }),

    uploadTakeAssessmentAudio: builder.mutation<
      import("../../types/Assessment.types").UploadAudioApiResponse,
      { id: string; questionId: string; formData: FormData }
    >({
      query: ({ id, questionId, formData }) => ({
        url: `/app/assessments/take/${id}/questions/${questionId}/audio`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Assessments"],
    }),

    uploadQuestionBankAudio: builder.mutation<
      import("../../types/Assessment.types").UploadAudioApiResponse,
      FormData
    >({
      query: (formData) => ({
        url: `/app/question-bank/audio`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Assessments"],
    }),

    getTeacherStudentResults: builder.query<
      TeacherStudentResultsApiResponse,
      TeacherStudentResultsQueryParams | void
    >({
      query: (params) => ({
        url: "/app/assessments/student-results",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Assessments"],
    }),

    saveStudentResultFeedback: builder.mutation<
      { statusCode: number; message: string; data: any },
      { id: string; feedback: string }
    >({
      query: ({ id, feedback }) => ({
        url: `/app/assessments/student-results/${id}/feedback`,
        method: "POST",
        body: { feedback },
      }),
      invalidatesTags: ["Assessments"],
    }),

    checkGrammar: builder.mutation<
      import("../../types/Grammar.types").GrammarApiResponse,
      import("../../types/Grammar.types").GrammarCheckRequest
    >({
      async queryFn(body, _queryApi, _extraOptions, baseQuery) {
        const primaryResult = await baseQuery({
          url: "/grammar/check",
          method: "POST",
          body,
        });

        if (!primaryResult.error) {
          const resData: any = primaryResult.data;
          const normalized = resData?.data ? resData : { statusCode: 200, message: "Success", data: resData };
          return { data: normalized as import("../../types/Grammar.types").GrammarApiResponse };
        }

        if (
          primaryResult.error &&
          (primaryResult.error.status === 404 ||
            (primaryResult.error as any).status === "PARSING_ERROR" ||
            primaryResult.error.status === "FETCH_ERROR")
        ) {
          try {
            const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
            const rootUrl = rawBaseUrl.replace(/\/v1\/?$/, "");
            const altUrl = rootUrl ? `${rootUrl}/grammar/check` : "/api/grammar/check";
            const token = localStorage.getItem("accessToken");

            const response = await fetch(altUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(body),
            });

            if (response.ok) {
              const rawData = await response.json();
              const normalized = rawData?.data ? rawData : { statusCode: 200, message: "Success", data: rawData };
              return { data: normalized };
            }
          } catch (e) {
          }
        }

        return { error: primaryResult.error };
      },
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useCreateAssessmentTemplateMutation,
  useGetAssessmentTemplatesQuery,
  useDeleteAssessmentTemplateMutation,
  useAssignAssessmentMutation,
  useGetAssessmentResultsQuery,
  useGetUnattendedStudentsQuery,
  useLazyGetUnattendedStudentsQuery,
  useReassignAssessmentMutation,
  useGetAssessmentHistoryQuery,
  useDeleteAssessmentAssignmentMutation,
  useGetStudentAssessmentsQuery,
  useGetPreCheckQuery,
  useStartSessionMutation,
  useGetSessionQuery,
  useSaveQuestionResponseMutation,
  useRunCodeMutation,
  useSubmitAssessmentMutation,
  useGetAssessmentResultQuery,
  useLazyGetAssessmentResultQuery,
  useUploadTakeAssessmentAudioMutation,
  useUploadQuestionBankAudioMutation,
  useGetTeacherStudentResultsQuery,
  useLazyGetTeacherStudentResultsQuery,
  useSaveStudentResultFeedbackMutation,
  useCheckGrammarMutation,
  useGetAssessmentByIdQuery,
  useLazyGetAssessmentByIdQuery,
} = assessmentApi;
