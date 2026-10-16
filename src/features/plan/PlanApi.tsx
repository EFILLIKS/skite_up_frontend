import { authApi } from "../authservice/AuthApi";

export interface Plan {
    id: string;
    code?: string;
    name?: string;
    durationDays?: number;
    maxMembers?: number | null;
    teachersIncluded?: boolean;
    pricePerMember?: number | null;
    monthlyPricePerMember?: number | null;
    yearlyPricePerMember?: number | null;
    monthlyPrice?: number | null;
    yearlyPrice?: number | null;
    annualPrice?: number | null;
    annualPricePerMember?: number | null;
    planDetails?: string;
    estimatedAmount?: number;
    changedAmount?: number;
    planExpiredDays?: number;
    createdBy?: string;
    updatedBy?: string | null;
    isRemoved?: boolean;
    isActivated?: boolean;
    createdAt?: string;
    updatedAt?: string;
    currentPlan?: boolean;
    effectivePlanId?: string;
    planId?: string | null;
    institutionId?: string | null;
    studentCount?: number | null;
    isPaid?: boolean | null;
    billingCycle?: string | null;
    durationMonths?: number | null;
    ratePerMember?: number | null;
}

export interface CreatePlanRequest {
    code?: string;
    name?: string;
    durationDays?: number;
    maxMembers?: number;
    teachersIncluded?: boolean;
    pricePerMember?: number | null;
    planDetails?: string;
    estimatedAmount?: number;
    changedAmount?: number;
    planExpiredDays?: number;
    isActivated?: boolean;
}

export interface ClaimPlanRequest {
    planId: string;
    institutionId?: string | null;
    studentCount?: number;
    durationMonths?: number;
    billingCycle?: string;
    ratePerMember?: number;
    isPaid?: boolean;
}

export interface ClaimPlanResponseData {
    keyId?: string;
    orderId?: string;
    razorpayOrderId?: string;
    paymentId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    subscriptionId?: string;
    planId?: string;
    isPaid?: boolean;
}

export interface ClaimPlanResponse {
    data?: ClaimPlanResponseData | Plan;
    message?: string;
    statusCode?: number;
    status?: string;
    keyId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
}

export interface RazorpayVerifyRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    institutionId?: string;
}

export interface RazorpayVerifyResponse {
    statusCode?: number;
    message?: string;
    status?: string;
    data?: {
        status?: string;
        message?: string;
        subscriptionId?: string;
        isPaid?: boolean;
    };
}

export interface PlanResponse {
    data: Plan;
    message: string;
    statusCode: number;
}

export interface PlansResponse {
    data: Plan[] | Plan;
    message: string;
    statusCode: number;
}

export const PlanApi = authApi.injectEndpoints({
    endpoints: (builder) => ({
        createPlan: builder.mutation<
            PlanResponse,
            CreatePlanRequest
        >({
            query: (plan) => ({
                url: "/app/plan",
                method: "POST",
                body: plan,
            }),
        }),

        claimPlan: builder.mutation<
            ClaimPlanResponse,
            ClaimPlanRequest
        >({
            query: (claimData) => ({
                url: "/app/payment/claim-plan",
                method: "POST",
                body: claimData,
            }),
            invalidatesTags: (_result, _error, arg) =>
                arg?.isPaid ? ["Profile"] : [],
        }),

        verifyPayment: builder.mutation<
            RazorpayVerifyResponse,
            RazorpayVerifyRequest
        >({
            query: (verifyData) => ({
                url: "/app/payment/verify",
                method: "POST",
                body: verifyData,
            }),
            invalidatesTags: ["Profile"],
        }),

        getPlan: builder.query<PlansResponse, void>({
            query: () => ({
                url: "/app/plan/all",
                method: "GET",
            }),
        }),
        getSubscription: builder.query<PlansResponse, void>({
            query: () => ({
                url: "/app/plan",
                method: "GET",
            }),
            providesTags: ["Profile"],
        }),
    }),
});

export const {
    useCreatePlanMutation,
    useClaimPlanMutation,
    useVerifyPaymentMutation,
    useGetPlanQuery,
    useGetSubscriptionQuery,
} = PlanApi;