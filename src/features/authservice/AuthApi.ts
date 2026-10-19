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


export const getStoredAccessToken = (): string | null => {
    return sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
};

export const getStoredRefreshToken = (): string | null => {
    return sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
};

export const clearStoredAuthData = (): void => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("exp");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("orgId");
    sessionStorage.removeItem("isPaid");
    sessionStorage.removeItem("isExpired");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("exp");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("orgId");
    localStorage.removeItem("isPaid");
    localStorage.removeItem("isExpired");
};

export const setStoredAuthData = (payload?: {
    accessToken?: string;
    refreshToken?: string;
}): void => {
    const accessToken = payload?.accessToken;

    if (!accessToken) {
        return;
    }

    try {
        const decoded = jwtDecode<JwtPayload>(accessToken);

        // Store in BOTH sessionStorage (for per-tab/window isolation) and localStorage (for persistence)
        sessionStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accessToken", accessToken);

        if (decoded.exp) {
            sessionStorage.setItem("exp", String(decoded.exp));
            localStorage.setItem("exp", String(decoded.exp));
        }

        if (decoded.sub) {
            sessionStorage.setItem("userId", decoded.sub);
            localStorage.setItem("userId", decoded.sub);
        }

        if (decoded.role) {
            sessionStorage.setItem("role", decoded.role);
            localStorage.setItem("role", decoded.role);
        }
        if (decoded.isPaid !== undefined && decoded.isPaid !== null) {
            sessionStorage.setItem("isPaid", String(decoded.isPaid));
            localStorage.setItem("isPaid", String(decoded.isPaid));
        }
        if (decoded.isExpired !== undefined && decoded.isExpired !== null) {
            sessionStorage.setItem("isExpired", String(decoded.isExpired));
            localStorage.setItem("isExpired", String(decoded.isExpired));
        } else if (decoded.planStatus && decoded.planStatus.toLowerCase().includes("expired")) {
            sessionStorage.setItem("isExpired", "true");
            localStorage.setItem("isExpired", "true");
        }

        if (decoded.organizationId) {
            sessionStorage.setItem("orgId", decoded.organizationId);
            localStorage.setItem("orgId", decoded.organizationId);
        }

        if (payload.refreshToken) {
            sessionStorage.setItem("refreshToken", payload.refreshToken);
            localStorage.setItem("refreshToken", payload.refreshToken);
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

    prepareHeaders: (headers, { endpoint }) => {
        const accessToken = getStoredAccessToken();

        // Never attach Authorization header on login or refresh endpoints
        if (accessToken && endpoint !== "refresh" && endpoint !== "login") {
            headers.set(
                "Authorization",
                `Bearer ${accessToken}`
            );
        }

        return headers;
    },
});

// Shared singleton promise to prevent concurrent refresh calls and race conditions
let activeRefreshPromise: Promise<string | null> | null = null;

export const requestNewAccessToken = async (): Promise<string | null> => {
    // If a refresh is already in progress, wait for it instead of firing duplicate requests
    if (activeRefreshPromise) {
        return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
        try {
            const refreshToken = getStoredRefreshToken();
            if (!refreshToken) {
                return null;
            }

            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
            // Call /auth/refresh without Authorization header to avoid server-side ExpiredJwtException
            const response = await fetch(`${baseUrl}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                // Only clear session if refresh token is explicitly rejected by auth server (401 / 403)
                if (response.status === 401 || response.status === 403) {
                    console.warn("Refresh token expired or invalid (HTTP " + response.status + "). Clearing session.");
                    clearStoredAuthData();
                } else {
                    console.warn("Refresh token call returned HTTP " + response.status + ". Preserving session.");
                }
                return null;
            }

            const data = await response.json();
            const newAccessToken =
                data?.data?.accessToken || data?.accessToken;
            const newRefreshToken =
                data?.data?.refreshToken || data?.refreshToken || refreshToken;

            if (newAccessToken) {
                setStoredAuthData({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });
                return newAccessToken;
            }
            return null;
        } catch (error) {
            console.error("Network or connection error during token refresh:", error);
            // DO NOT clear auth data during network disconnect or offline testing!
            return null;
        } finally {
            activeRefreshPromise = null;
        }
    })();

    return activeRefreshPromise;
};

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

        // Don't intercept auth endpoints
        if (
            requestUrl === "/auth/login" ||
            requestUrl === "/auth/refresh"
        ) {
            return await baseQuery(args, api, extraOptions);
        }

        // 1. If access token is known to be expired, refresh it first
        const accessToken = getStoredAccessToken();
        const refreshToken = getStoredRefreshToken();

        if (accessToken && isAccessTokenExpired(accessToken) && refreshToken) {
            await requestNewAccessToken();
        }

        // 2. Perform the actual query
        let result = await baseQuery(
            args,
            api,
            extraOptions
        );

        // 3. If query returns 401 Unauthorized, refresh and retry once
        if (result.error && result.error.status === 401) {
            const currentRefreshToken = localStorage.getItem("refreshToken");

            if (currentRefreshToken) {
                const refreshedToken = await requestNewAccessToken();

                if (refreshedToken) {
                    result = await baseQuery(
                        args,
                        api,
                        extraOptions
                    );
                }
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
                        data?.data?.accessToken || (data as any)?.accessToken;

                    const refreshToken =
                        data?.data?.refreshToken || (data as any)?.refreshToken;

                    if (accessToken) {
                        setStoredAuthData({
                            accessToken,
                            refreshToken,
                        });
                    } else {
                        console.error(
                            "Refresh response did not contain an access token."
                        );
                    }
                } catch (error: any) {
                    console.error(
                        "Refresh token failed:",
                        error
                    );

                    const status = error?.error?.status || error?.status;
                    if (status === 401 || status === 403) {
                        clearStoredAuthData();
                    }
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