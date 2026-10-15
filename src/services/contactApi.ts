import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface EnquiryPayload {
  name: string
  institutionName: string
  email: string
  phoneNumber: string
  subject: string
  description: string
}

export const contactApi = createApi({
  reducerPath: 'contactApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://test-site-production-185c.up.railway.app/api'
  }),

  endpoints: (builder) => ({
    submitEnquiry: builder.mutation<unknown, EnquiryPayload>({
      query: (body) => ({
        url: 'contact',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
})

export const { useSubmitEnquiryMutation } = contactApi