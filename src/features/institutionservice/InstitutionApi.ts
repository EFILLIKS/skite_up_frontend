import { authApi } from "../authservice/AuthApi";

export interface CreateInstitutionRequest {
  institutionName: string;
  institutionCode: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  settings?: {
    mcqTest?: boolean;
    codingTest?: boolean;
    lsrwTest?: boolean;
  };

  plan?: string;
}

export interface InstitutionPatchRequest {
  institutionName?: string;
  institutionCode?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  settings?: {
    mcqTest?: boolean;
    codingTest?: boolean;
    lsrwTest?: boolean;
  };
  plan?: string;
  isActivated?: boolean;
}

export interface InstitutionOrganization {
  id: string;
  orgEmail: string;
  name: string;
  address1: string;
  address2: string;
  state: string;
  city: string;
  zipcode: string;
  orgPhoneNumber: string;
  isRemoved: boolean;
  isActivated: boolean;
}

export interface InstitutionSettings {
  mcqTest: boolean;
  codingTest: boolean;
  lsrwTest: boolean;
}

export interface Institution {
  id: string;
  institutionName: string;
  institutionCode: string;
  studentCount?: number | null;
  students?: number;
  studentCapacity?: number;
  currentStudentCount?: number | null;
  maxMembers?: number | null;
  studentSlot?: number | null;
  renewalDate?: string;
  endDate?: string;
  planRenewalDate?: string | null;
  planCode?: string | null;
  planName?: string | null;
  isPaid?: boolean;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  organization?: InstitutionOrganization;
  organizationId?: string;

  plan: string;

  settings: InstitutionSettings;

  isRemoved: boolean;
  isActivated: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface InstitutionListData {
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  renewalCount: number;
  currentStudentCount?: number;
  studentSlot?: number;
  totalCurrentStudents?: number;
  totalStudentSlots?: number;

  content: Institution[];

  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface InstitutionResponse {
  data: InstitutionListData;
  message: string;
  statusCode: number;
}

export interface InstitutionDetailResponse {
  data: Institution;
  message: string;
  statusCode: number;
}

export interface GetInstitutionParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  search?: string;
  status?: string;
}

export const institutionApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    createInstitution: builder.mutation<
      unknown,
      CreateInstitutionRequest
    >({
      query: (institution) => ({
        url: "/app/create-institution",
        method: "POST",
        body: institution,
      }),
      invalidatesTags: ["Institutions", "Dashboard"],
    }),

    getInstitutions: builder.query<
      InstitutionResponse,
      GetInstitutionParams
    >({
      query: ({
        page = 0,
        size = 10,
        sortBy = "createdAt",
        direction = "DESC",
        search,
        status,
      }) => ({
        url: "/app/retrieve-institution",
        method: "GET",
        params: {
          page,
          size,
          sortBy,
          direction,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["Institutions"],
    }),

    getInstitution: builder.query<InstitutionDetailResponse, string>({
      query: (id) => ({
        url: `/app/institution/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Institutions", id }],
    }),

    updateInstitution: builder.mutation<
      InstitutionDetailResponse,
      { id: string; changes: InstitutionPatchRequest }
    >({
      query: ({ id, changes }) => ({
        url: `/app/institution/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Institutions",
        "Dashboard",
        { type: "Institutions", id },
      ],
    }),

    deleteInstitution: builder.mutation<
      InstitutionDetailResponse,
      string
    >({
      query: (id) => ({
        url: `/app/institution/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Institutions",
        "Dashboard",
        { type: "Institutions", id },
      ],
    }),
  }),
});


export const {
  useCreateInstitutionMutation,
  useGetInstitutionsQuery,
  useGetInstitutionQuery,
  useLazyGetInstitutionQuery,
  useUpdateInstitutionMutation,
  useDeleteInstitutionMutation,
} = institutionApi;