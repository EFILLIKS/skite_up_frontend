import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";
import type { LoginFormData } from "../../types/login.type";
import type { JwtPayload } from "../../types/JwtDecode.types";
import type { LoginResponse, ProfileResponse } from "../../types/Auth.api.types";



const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        return headers;
    },
});

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginFormData>({
            query: (credentials) => ({
                url: `/auth/login`,
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_credentials, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const decoded = jwtDecode<JwtPayload>(data?.data?.accessToken as string);
                    localStorage.setItem("role", decoded.role);
                    localStorage.setItem("userId", decoded.userId);
                    localStorage.setItem("orgId", decoded.orgId);
                    localStorage.setItem("exp", decoded.exp.toString());
                    localStorage.setItem("accessToken", data?.data?.accessToken as string);
                    localStorage.setItem("refreshToken", data?.data?.refreshToken as string);
                } catch {
                }
            },
        }),
        profile: builder.query<ProfileResponse, void>({
            query: () => ({
                url: `/auth/profile`,
                method: "GET",
            }),
        }),
    }),
    
});

export const { useLoginMutation, useProfileQuery } = authApi;