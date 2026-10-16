import { authApi } from "../authservice/AuthApi";
import type {
  QuestionBankItem,
  QuestionBankRequestDto,
  SingleQuestionApiResponse,
  QuestionBankBulkUploadResponse,
  QuestionBankBatchResponse,
  QuestionBankListApiResponse,
  QuestionBankListParams,
  QuestionBankLimitsResponse,
  SkillTreeNode,
} from "../../types/QuestionBank.types";

export const questionBankApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    createQuestion: builder.mutation<SingleQuestionApiResponse, QuestionBankRequestDto>({
      query: (body) => ({
        url: "/app/question-bank",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MCQQuestions", "Categories"],
    }),

    uploadQuestionsFile: builder.mutation<QuestionBankBulkUploadResponse, FormData>({
      query: (formData) => ({
        url: "/app/question-bank/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["MCQQuestions", "Categories"],
    }),

    createBatchQuestions: builder.mutation<QuestionBankBatchResponse, QuestionBankRequestDto[]>({
      query: (questions) => ({
        url: "/app/question-bank/batch",
        method: "POST",
        body: questions,
      }),
      invalidatesTags: ["MCQQuestions", "Categories"],
    }),

    getQuestionBankList: builder.query<QuestionBankListApiResponse, QuestionBankListParams>({
      query: ({
        category = "MCQ",
        skill,
        topic,
        type,
        difficulty,
        status,
        search,
        page = 0,
        size = 10,
        sortBy = "createdAt",
        direction = "DESC",
      }) => ({
        url: "/app/question-bank",
        method: "GET",
        params: {
          category,
          ...(skill && skill !== "All" && skill !== "All skills" ? { skill } : {}),
          ...(topic && topic !== "All" ? { topic } : {}),
          ...(type && type !== "All Types" ? { type } : {}),
          ...(difficulty && difficulty !== "All Levels" ? { difficulty } : {}),
          ...(status && status !== "All Status" ? { status } : {}),
          ...(search ? { search } : {}),
          page,
          size,
          sortBy,
          direction,
        },
      }),
      providesTags: ["MCQQuestions"],
    }),

    getQuestionById: builder.query<SingleQuestionApiResponse, string>({
      query: (id) => ({
        url: `/app/question-bank/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "MCQQuestions", id }],
    }),

    patchQuestion: builder.mutation<
      SingleQuestionApiResponse,
      { id: string; body: Partial<QuestionBankRequestDto> }
    >({
      query: ({ id, body }) => ({
        url: `/app/question-bank/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MCQQuestions", "Categories"],
    }),

    updateQuestion: builder.mutation<
      SingleQuestionApiResponse,
      { id: string; body: QuestionBankRequestDto }
    >({
      query: ({ id, body }) => ({
        url: `/app/question-bank/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["MCQQuestions", "Categories"],
    }),

    deleteQuestion: builder.mutation<{ statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/app/question-bank/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MCQQuestions", "Categories"],
    }),

    getSkillsTree: builder.query<{ statusCode: number; data: SkillTreeNode[] }, void>({
      query: () => ({
        url: "/app/question-bank/skills",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),

    getQuestionBankLimits: builder.query<QuestionBankLimitsResponse, void>({
      query: () => ({
        url: "/app/question-bank/limits",
        method: "GET",
      }),
      providesTags: ["MCQQuestions", "LSRWExercises"],
    }),

    uploadAudioFile: builder.mutation<
      import("../../types/Assessment.types").UploadAudioApiResponse,
      FormData
    >({
      query: (formData) => ({
        url: "/app/question-bank/audio",
        method: "POST",
        body: formData,
      }),
    }),

    getLSRWExercises: builder.query<any, {
      skill?: string;
      page?: number;
      size?: number;
      search?: string;
      difficulty?: string;
      status?: string;
    } | void>({
      query: (params) => ({
        url: "/app/question-bank",
        method: "GET",
        params: {
          category: "LSRW",
          ...(params?.skill ? { skill: params.skill } : {}),
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.difficulty && params.difficulty !== "All Levels" ? { difficulty: params.difficulty } : {}),
          ...(params?.status && params.status !== "All Status" ? { status: params.status } : {}),
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      }),
      providesTags: ["LSRWExercises"],
    }),

    createLSRWExercise: builder.mutation<any, any>({
      query: (body) => ({
        url: "/app/question-bank",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LSRWExercises", "Categories", "MCQQuestions"],
    }),

    updateLSRWExercise: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/app/question-bank/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["LSRWExercises", "Categories", "MCQQuestions"],
    }),

    deleteLSRWExercise: builder.mutation<any, string>({
      query: (id) => ({
        url: `/app/question-bank/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LSRWExercises", "Categories", "MCQQuestions"],
    }),

    getCodingProblems: builder.query<any, {
      page?: number;
      size?: number;
      search?: string;
      difficulty?: string;
      status?: string;
    } | void>({
      query: (params) => ({
        url: "/app/question-bank",
        method: "GET",
        params: {
          category: "Coding",
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.difficulty && params.difficulty !== "All Levels" ? { difficulty: params.difficulty } : {}),
          ...(params?.status && params.status !== "All Status" ? { status: params.status } : {}),
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      }),
      providesTags: ["CodingProblems"],
    }),

    createCodingProblem: builder.mutation<any, any>({
      query: (body) => ({
        url: "/app/question-bank",
        method: "POST",
        body: {
          category: "Coding",
          ...body,
        },
      }),
      invalidatesTags: ["CodingProblems", "Categories", "MCQQuestions"],
    }),

    updateCodingProblem: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/app/question-bank/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CodingProblems", "Categories", "MCQQuestions"],
    }),

    deleteCodingProblem: builder.mutation<any, string>({
      query: (id) => ({
        url: `/app/question-bank/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CodingProblems", "Categories", "MCQQuestions"],
    }),

    uploadCodingImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/app/question-bank/image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useCreateQuestionMutation,
  useUploadQuestionsFileMutation,
  useCreateBatchQuestionsMutation,
  useGetQuestionBankListQuery,
  useGetQuestionByIdQuery,
  usePatchQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetSkillsTreeQuery,
  useGetQuestionBankLimitsQuery,
  useUploadAudioFileMutation,
  useGetLSRWExercisesQuery,
  useCreateLSRWExerciseMutation,
  useUpdateLSRWExerciseMutation,
  useDeleteLSRWExerciseMutation,
  useGetCodingProblemsQuery,
  useCreateCodingProblemMutation,
  useUpdateCodingProblemMutation,
  useDeleteCodingProblemMutation,
  useUploadCodingImageMutation,
} = questionBankApi;

