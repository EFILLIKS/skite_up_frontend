import { authApi } from "../authservice/AuthApi";
import type {
  TeachersApiResponse,
  TeacherSeatsApiResponse,
  CreateTeacherRequest,
  CreateTeacherResponse,
  TeacherPatchDto,
  TeacherPatchResponse,
  GetTeachersParams,
  TeacherItem,
} from "../../types/Teacher.types";

export const teacherApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query<TeachersApiResponse, GetTeachersParams>({
      query: ({
        page = 0,
        size = 10,
        sortBy = "createdAt",
        direction = "DESC",
        search,
        status,
        institutionId,
      }) => ({
        url: "/app/teachers",
        method: "GET",
        params: {
          page,
          size,
          sortBy,
          direction,
          ...(search ? { search } : {}),
          ...(status && status !== "All" && status !== "All Status" ? { status } : {}),
          ...(institutionId ? { institutionId } : {}),
        },
      }),
      providesTags: ["Teachers"],
    }),

    getTeacherById: builder.query<
      { statusCode: number; message: string; data: TeacherItem },
      string
    >({
      query: (id) => ({
        url: `/app/teachers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Teachers", id }],
    }),

    createTeacher: builder.mutation<CreateTeacherResponse, CreateTeacherRequest>({
      query: (teacher) => ({
        url: "/app/teachers",
        method: "POST",
        body: teacher,
      }),
      invalidatesTags: ["Teachers"],
    }),

    updateTeacher: builder.mutation<
      TeacherPatchResponse,
      { id: string; changes: TeacherPatchDto }
    >({
      query: ({ id, changes }) => ({
        url: `/app/teachers/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Teachers",
        { type: "Teachers", id },
      ],
    }),

    deleteTeacher: builder.mutation<
      { statusCode: number; message: string; data: unknown },
      string
    >({
      query: (id) => ({
        url: `/app/teachers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Teachers",
        { type: "Teachers", id },
      ],
    }),

    getTeacherSeats: builder.query<TeacherSeatsApiResponse, string | undefined>({
      query: (institutionId) => ({
        url: "/app/teachers/seats",
        method: "GET",
        params: institutionId ? { institutionId } : undefined,
      }),
      providesTags: ["Teachers"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useLazyGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeacherSeatsQuery,
} = teacherApi;
