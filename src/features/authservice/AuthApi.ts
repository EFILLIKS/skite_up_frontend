import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";

import type { LoginFormData } from "../../types/login.type";
import type { JwtPayload } from "../../types/JwtDecode.types";
import type {
    LoginResponse,
    ProfileResponse,
    ProfileUpdateDto,
    RefreshTokenRequest,
    RefreshTokenResponse,
} from "../../types/Auth.api.types";


const clearStoredAuthData = (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("exp");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("orgId");
    localStorage.removeItem("isPaid");
    localStorage.removeItem("isExpired");
};

const setStoredAuthData = (payload?: {
    accessToken?: string;
    refreshToken?: string;
}): void => {
    const accessToken = payload?.accessToken;

    if (!accessToken) {
        return;
    }

    try {
        const decoded = jwtDecode<JwtPayload>(accessToken);

        localStorage.setItem("accessToken", accessToken);

        if (decoded.exp) {
            localStorage.setItem("exp", String(decoded.exp));
        }

        if (decoded.sub) {
            localStorage.setItem("userId", decoded.sub);
        }

        if (decoded.role) {
            localStorage.setItem("role", decoded.role);
        }
        if (decoded.isPaid !== undefined && decoded.isPaid !== null) {
            localStorage.setItem("isPaid", String(decoded.isPaid));
        }
        if (decoded.isExpired !== undefined && decoded.isExpired !== null) {
            localStorage.setItem("isExpired", String(decoded.isExpired));
        } else if (decoded.planStatus && decoded.planStatus.toLowerCase().includes("expired")) {
            localStorage.setItem("isExpired", "true");
        }

        if (decoded.organizationId) {
            localStorage.setItem(
                "orgId",
                decoded.organizationId
            );
        }

        if (payload.refreshToken) {
            localStorage.setItem(
                "refreshToken",
                payload.refreshToken
            );
        }
    } catch (error) {
        console.error(
            "Failed to decode access token:",
            error
        );

        clearStoredAuthData();
    }
};

export const isAccessTokenExpired = (
    token?: string | null
): boolean => {
    if (!token) {
        return true;
    }

    try {
        const decoded = jwtDecode<JwtPayload>(token);

        if (!decoded.exp) {
            return true;
        }

        return decoded.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,

    prepareHeaders: (headers) => {
        const accessToken =
            localStorage.getItem("accessToken");

        if (accessToken) {
            headers.set(
                "Authorization",
                `Bearer ${accessToken}`
            );
        }

        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (
    args,
    api,
    extraOptions
) => {
        const requestUrl =
            typeof args === "string" ? args : args.url;

        if (
            requestUrl !== "/auth/login" &&
            requestUrl !== "/auth/refresh"
        ) {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (accessToken && isAccessTokenExpired(accessToken) && refreshToken) {
                const refreshResult = await baseQuery(
                    {
                        url: "/auth/refresh",
                        method: "POST",
                        body: {
                            refreshToken,
                        },
                    },
                    api,
                    extraOptions
                );

                if (refreshResult.data && !refreshResult.error) {
                    const refreshResponse = refreshResult.data as RefreshTokenResponse;
                    const newAccessToken = refreshResponse?.data?.accessToken;
                    const newRefreshToken = refreshResponse?.data?.refreshToken ?? refreshToken;

                    if (newAccessToken) {
                        setStoredAuthData({
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        });
                    }
                } else {
                    clearStoredAuthData();
                }
            }
        }

        let result = await baseQuery(
            args,
            api,
            extraOptions
        );

        if (
            requestUrl === "/auth/login" ||
            requestUrl === "/auth/refresh"
        ) {
            return result;
        }

        if (
            result.error &&
            (result.error.status === 401 ||
                result.error.status === 403)
        ) {
            const refreshToken =
                localStorage.getItem("refreshToken");

            if (!refreshToken) {
                clearStoredAuthData();

                return result;
            }

            const refreshResult = await baseQuery(
                {
                    url: "/auth/refresh",
                    method: "POST",
                    body: {
                        refreshToken,
                    },
                },
                api,
                extraOptions
            );

            if (
                refreshResult.data &&
                !refreshResult.error
            ) {
                const refreshResponse =
                    refreshResult.data as RefreshTokenResponse;

                const newAccessToken =
                    refreshResponse?.data?.accessToken;

                const newRefreshToken =
                    refreshResponse?.data?.refreshToken ??
                    refreshToken;

                if (newAccessToken) {
                    setStoredAuthData({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    });

                    result = await baseQuery(
                        args,
                        api,
                        extraOptions
                    );
                } else {
                    clearStoredAuthData();
                }
            } else {
                clearStoredAuthData();
            }
        }

        if (
            !result.error &&
            requestUrl !== "/auth/login" &&
            requestUrl !== "/auth/refresh"
        ) {
            const method = (
                typeof args === "string" ? "GET" : args.method || "GET"
            ).toUpperCase();

            if (method !== "GET") {
                try {
                    api.dispatch(
                        authApi.util.invalidateTags(["NotificationCounts", "Notifications"])
                    );
                    window.dispatchEvent(new Event("notification-count-update"));
                } catch {
                }
            }
        }

        return result;
    };

export const authApi = createApi({
    reducerPath: "authApi",

    baseQuery: baseQueryWithReauth,

    tagTypes: [
        "Profile",
        "Institutions",
        "Dashboard",
        "Teachers",
        "Students",
        "Categories",
        "MCQQuestions",
        "LSRWExercises",
        "CodingProblems",
        "Assessments",
        "Notifications",
        "NotificationCounts",
    ],

    endpoints: (builder) => ({
        login: builder.mutation<
            LoginResponse,
            LoginFormData
        >({
            query: (
                credentials: LoginFormData
            ) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),

            invalidatesTags: ["Profile"],

            async onQueryStarted(
                _credentials,
                { queryFulfilled }
            ) {
                try {
                    const { data } =
                        await queryFulfilled;

                    const accessToken =
                        data?.data?.accessToken;

                    const refreshToken =
                        data?.data?.refreshToken;

                    if (accessToken) {
                        setStoredAuthData({
                            accessToken,
                            refreshToken,
                        });
                    } else {
                        console.error(
                            "Login response did not contain an access token."
                        );

                        clearStoredAuthData();
                    }
                } catch (error) {
                    console.error(
                        "Login failed:",
                        error
                    );

                    clearStoredAuthData();
                }
            },
        }),

        refresh: builder.mutation<
            RefreshTokenResponse,
            RefreshTokenRequest
        >({
            query: (
                tokenRequest: RefreshTokenRequest
            ) => ({
                url: "/auth/refresh",
                method: "POST",
                body: tokenRequest,
            }),

            async onQueryStarted(
                _tokenRequest,
                { queryFulfilled }
            ) {
                try {
                    const { data } =
                        await queryFulfilled;

                    const accessToken =
                        data?.data?.accessToken;

                    const refreshToken =
                        data?.data?.refreshToken;

                    if (accessToken) {
                        setStoredAuthData({
                            accessToken,
                            refreshToken,
                        });
                    } else {
                        console.error(
                            "Refresh response did not contain an access token."
                        );

                        clearStoredAuthData();
                    }
                } catch (error) {
                    console.error(
                        "Refresh token failed:",
                        error
                    );

                    clearStoredAuthData();
                }
            },
        }),

        profile: builder.query<
            ProfileResponse,
            void
        >({
            query: () => ({
                url: "/auth/profile",
                method: "GET",
            }),
            keepUnusedDataFor: 300,
            providesTags: ["Profile"],
        }),

        updateProfile: builder.mutation<
            ProfileResponse,
            ProfileUpdateDto
        >({
            query: (body) => ({
                url: "/auth/profile",
                method: "PATCH",
                body,
            }),

            invalidatesTags: ["Profile"],
        }),
    }),
});

export const {
    useLoginMutation,
    useProfileQuery,
    useUpdateProfileMutation,
    useRefreshMutation,
} = authApi;