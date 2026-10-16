import { authApi } from "../authservice/AuthApi";
import type {
  StudentsApiResponse,
  StudentDetailApiResponse,
  StudentSeatsApiResponse,
  StudentImportApiResponse,
  GetStudentsParams,
  StudentManualRow,
  StudentPatchDto,
} from "../../types/Student.types";

export const studentApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<StudentsApiResponse, GetStudentsParams>({
      query: ({
        page = 0,
        size = 10,
        sortBy = "createdAt",
        direction = "DESC",
        search,
        batch,
        department,
        status,
      }) => ({
        url: "/app/students",
        method: "GET",
        params: {
          page,
          size,
          sortBy,
          direction,
          ...(search ? { search } : {}),
          ...(batch && batch !== "All" && batch !== "All Batches" ? { batch } : {}),
          ...(department && department !== "All" && department !== "All Departments"
            ? { department }
            : {}),
          ...(status && status !== "All" && status !== "All Status" ? { status } : {}),
        },
      }),
      providesTags: ["Students"],
    }),

    getStudentById: builder.query<StudentDetailApiResponse, string>({
      query: (id) => ({
        url: `/app/students/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Students", id }],
    }),

    createStudent: builder.mutation<
      StudentImportApiResponse,
      FormData | StudentManualRow | { students: StudentManualRow[] }
    >({
      query: (body) => ({
        url: "/app/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    createStudentsBatch: builder.mutation<
      StudentImportApiResponse,
      | StudentManualRow[]
      | { students: StudentManualRow[]; institutionType?: string; institutionId?: string }
    >({
      query: (arg) => {
        if (Array.isArray(arg)) {
          return {
            url: "/app/students/batch",
            method: "POST",
            params: arg[0]?.institutionType
              ? { institutionType: arg[0].institutionType }
              : undefined,
            body: arg,
          };
        }
        return {
          url: "/app/students/batch",
          method: "POST",
          params: {
            ...(arg.institutionType ? { institutionType: arg.institutionType } : {}),
            ...(arg.institutionId ? { institutionId: arg.institutionId } : {}),
          },
          body: arg.students,
        };
      },
      invalidatesTags: ["Students"],
    }),

    updateStudent: builder.mutation<
      { statusCode: number; message: string; data?: unknown },
      { id: string; changes: StudentPatchDto }
    >({
      query: ({ id, changes }) => ({
        url: `/app/students/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Students",
        { type: "Students", id },
      ],
    }),

    deleteStudent: builder.mutation<
      { statusCode: number; message: string; data?: unknown },
      string
    >({
      query: (id) => ({
        url: `/app/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Students",
        { type: "Students", id },
      ],
    }),

    getStudentSeats: builder.query<StudentSeatsApiResponse, void>({
      query: () => ({
        url: "/app/students/seats",
        method: "GET",
      }),
      providesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useLazyGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useCreateStudentsBatchMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentSeatsQuery,
} = studentApi;
