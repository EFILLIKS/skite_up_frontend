import React, { useMemo, useState } from "react";
import {
    Box,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from "@mui/material";
import {
    CalendarTodayOutlined,
    PeopleOutlineOutlined,
    AssignmentOutlined,
    SearchOutlined,
    TrendingUpOutlined,
    RefreshOutlined,
    ReceiptLongOutlined,
    MenuBookOutlined,
    HistoryOutlined,
    CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
    useGetSubscriptionQuery,
    useClaimPlanMutation,
    useVerifyPaymentMutation,
    type Plan,
} from "../../features/plan/PlanApi";
import { useProfileQuery } from "../../features/authservice/AuthApi";
import {
    loadRazorpayScript,
    type RazorpayCheckoutOptions,
    type RazorpayPaymentSuccessResponse,
} from "../../utils/razorpay";
import Card from "../../components/common/Card";
import Dialog from "../../components/common/Dialog";
import Button from "../../components/common/Button";
import Snackbar from "../../components/common/Snackbar";
import type { SnackbarState } from "../../types/Snackbar.types";

type BillingCycle = "Annual" | "Monthly";
const TABS = ["Plans", "History", "Invoice", "Docs"] as const;
type TabType = (typeof TABS)[number];

interface PlanFeatureItem {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const Subscription: React.FC = () => {
    const navigate = useNavigate();
    const { data: profileResponse } = useProfileQuery();

    const {
        data: subscriptionList,
        isLoading,
        isFetching,
        refetch,
    } = useGetSubscriptionQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [claimPlan, { isLoading: isClaiming }] = useClaimPlanMutation();
    const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const [successModalData, setSuccessModalData] = useState<{
        open: boolean;
        planName: string;
        members: number;
        validTill: string;
    } | null>(null);

    const [activeTab, setActiveTab] = useState<TabType>("Plans");

    const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("Monthly");
    const [memberSlots, setMemberSlots] = useState<number | string>(400);
    const [durationMonths, setDurationMonths] = useState<number | string>(3);

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });

    const plans: Plan[] = useMemo(() => {
        let list: Plan[] = [];
        if (subscriptionList?.data) {
            list = Array.isArray(subscriptionList.data)
                ? subscriptionList.data
                : [subscriptionList.data];
        }

        const sortOrder: Record<string, number> = {
            TRIAL: 1,
            STANDARD: 2,
            ENTERPRISE: 3,
        };
        return [...list].sort((a, b) => {
            const orderA = sortOrder[(a.code || "").toUpperCase()] ?? 99;
            const orderB = sortOrder[(b.code || "").toUpperCase()] ?? 99;
            return orderA - orderB;
        });
    }, [subscriptionList]);

    const currentActivePlan = useMemo(() => {
        return plans.find((p) => Boolean(p.currentPlan)) || null;
    }, [plans]);

    const handleOpenModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setSelectedCycle(billingCycle);
        const isTrialPlan =
            plan.code?.toUpperCase() === "TRIAL" ||
            Boolean(plan.name?.toLowerCase().includes("trial")) ||
            plan.pricePerMember === 0;

        if (isTrialPlan) {
            setMemberSlots(50);
            setDurationMonths(1);
        } else {
            setMemberSlots(400);
            setDurationMonths(3);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isClaiming) return;
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    const isSelectedTrial = Boolean(
        selectedPlan?.code?.toUpperCase() === "TRIAL" ||
        selectedPlan?.name?.toLowerCase().includes("trial") ||
        selectedPlan?.pricePerMember === 0
    );

    const modalRate = useMemo(() => {
        if (!selectedPlan) return 0;
        if (isSelectedTrial) return 0;
        if (selectedCycle === "Annual") {
            return (
                selectedPlan.yearlyPricePerMember ??
                selectedPlan.annualPricePerMember ??
                selectedPlan.yearlyPrice ??
                selectedPlan.annualPrice ??
                150
            );
        }
        return (
            selectedPlan.monthlyPricePerMember ??
            selectedPlan.monthlyPrice ??
            200
        );
    }, [selectedPlan, selectedCycle, isSelectedTrial]);

    const modalDuration = useMemo(() => {
        if (isSelectedTrial) return 1;
        if (selectedCycle === "Annual") return 12;
        const months = Number(durationMonths);
        return isNaN(months) || months <= 0 ? 1 : months;
    }, [selectedCycle, durationMonths, isSelectedTrial]);

    const modalTotalEstimation = useMemo(() => {
        if (isSelectedTrial) return 0;
        const slots = Number(memberSlots);
        const validSlots = isNaN(slots) || slots <= 0 ? 0 : slots;
        return validSlots * modalRate * modalDuration;
    }, [memberSlots, modalRate, modalDuration, isSelectedTrial]);

    const handleProceed = async () => {
        if (!selectedPlan) return;

        const isTrialPlan = isSelectedTrial;
        const isPaidPlan = !isTrialPlan;
        const slots = isTrialPlan ? 50 : Number(memberSlots);
        const duration = isTrialPlan ? 1 : modalDuration;

        if (isNaN(slots) || slots <= 0) {
            setSnackbar({
                open: true,
                message: "Please enter a valid number of member slots.",
                severity: "error",
            });
            return;
        }

        try {
            setIsPaymentProcessing(true);

            const res = await claimPlan({
                planId: selectedPlan.effectivePlanId || selectedPlan.id,
                studentCount: slots,
                durationMonths: duration,
                billingCycle: isTrialPlan ? "MONTHLY" : selectedCycle === "Annual" ? "ANNUAL" : "MONTHLY",
                ratePerMember: isTrialPlan ? 0 : modalRate,
                isPaid: isTrialPlan ? true : false,
            }).unwrap();

            const paymentData = (res as any)?.data || res;
            const orderId =
                paymentData?.orderId ||
                paymentData?.razorpayOrderId ||
                paymentData?.order_id ||
                paymentData?.razorpay_order_id ||
                (res as any)?.orderId ||
                (res as any)?.razorpayOrderId ||
                (res as any)?.order_id ||
                (res as any)?.razorpay_order_id;

            const keyId =
                paymentData?.keyId ||
                paymentData?.key_id ||
                paymentData?.key ||
                paymentData?.razorpayKeyId ||
                paymentData?.razorpay_key_id ||
                (res as any)?.keyId ||
                (res as any)?.key_id ||
                (res as any)?.key ||
                (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;

            const amountInPaise =
                paymentData?.amount ||
                paymentData?.totalAmountInPaise ||
                (res as any)?.amount ||
                modalTotalEstimation * 100;

            const currency =
                paymentData?.currency ||
                (res as any)?.currency ||
                "INR";

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + modalDuration);
            const formattedValidTill = expiryDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            if (isPaidPlan) {
                if (!orderId) {
                    setIsPaymentProcessing(false);
                    console.error("[Subscription] Paid plan selected, but backend did not return an order ID:", res);
                    setSnackbar({
                        open: true,
                        message:
                            (res as any)?.message ||
                            "Failed to create payment order. Backend did not return an order ID.",
                        severity: "error",
                    });
                    return;
                }

                if (!keyId) {
                    setIsPaymentProcessing(false);
                    console.error("[Subscription] Razorpay Key ID is missing from server response:", res);
                    setSnackbar({
                        open: true,
                        message:
                            "Razorpay Key ID is missing. Please ensure razorpay.key-id is returned by the backend or configured in VITE_RAZORPAY_KEY_ID.",
                        severity: "error",
                    });
                    return;
                }

                const isLoaded = await loadRazorpayScript();
                const razorpayConstructor = (window as unknown as { Razorpay?: new (opts: RazorpayCheckoutOptions) => any }).Razorpay;
                if (!isLoaded || !razorpayConstructor) {
                    setIsPaymentProcessing(false);
                    setSnackbar({
                        open: true,
                        message: "Razorpay payment gateway failed to load. Please check your internet connection.",
                        severity: "error",
                    });
                    return;
                }

                const options: RazorpayCheckoutOptions = {
                    key: keyId,
                    amount: amountInPaise,
                    currency: currency,
                    name: "EFILLIKS",
                    description: `${selectedPlan.name || "Subscription"} Plan`,
                    order_id: orderId,
                    handler: async (paymentResponse: RazorpayPaymentSuccessResponse) => {
                        console.log("[Subscription] Razorpay payment completed. Verifying payment:", paymentResponse);
                        try {
                            const verifyRes = await verifyPayment({
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            }).unwrap();

                            setIsModalOpen(false);
                            setSelectedPlan(null);
                            setIsPaymentProcessing(false);

                            localStorage.setItem("isExpired", "false");
                            localStorage.setItem("isPaid", "true");
                            window.dispatchEvent(new Event("auth-status-changed"));
                            window.dispatchEvent(new Event("storage"));

                            setSuccessModalData({
                                open: true,
                                planName: selectedPlan.name || "Standard Plan",
                                members: slots,
                                validTill: formattedValidTill,
                            });

                            setSnackbar({
                                open: true,
                                message: verifyRes?.message || "Payment verified and subscription activated successfully!",
                                severity: "success",
                            });

                            void refetch();
                        } catch (verifyErr: unknown) {
                            setIsPaymentProcessing(false);
                            console.error("[Subscription] Payment verification failed:", verifyErr);
                            const errObj = verifyErr as { data?: { message?: string }; message?: string };
                            setSnackbar({
                                open: true,
                                message:
                                    errObj?.data?.message ||
                                    errObj?.message ||
                                    "Payment verification failed. Please contact support.",
                                severity: "error",
                            });
                        }
                    },
                    prefill: {
                        name: profileResponse?.data
                            ? [profileResponse.data.firstName, profileResponse.data.lastName]
                                  .filter((p) => p && p !== "null" && p !== "undefined")
                                  .join(" ")
                                  .trim()
                            : "",
                        email: profileResponse?.data?.email || "",
                        contact: profileResponse?.data?.phone || "",
                    },
                    theme: {
                        color: "#2563eb",
                    },
                    modal: {
                        ondismiss: () => {
                            setIsPaymentProcessing(false);
                            setSnackbar({
                                open: true,
                                message: "Payment cancelled by user.",
                                severity: "warning",
                            });
                        },
                    },
                };

                const rzp = new razorpayConstructor(options);
                rzp.on("payment.failed", (failedRes: any) => {
                    console.error("[Subscription] Razorpay transaction failed:", failedRes);
                    setIsPaymentProcessing(false);
                    setSnackbar({
                        open: true,
                        message: failedRes?.error?.description || "Payment failed. Please try again.",
                        severity: "error",
                    });
                });
                rzp.open();
            } else {
                setIsModalOpen(false);
                setSelectedPlan(null);
                setIsPaymentProcessing(false);

                localStorage.setItem("isExpired", "false");
                localStorage.setItem("isPaid", "true");
                window.dispatchEvent(new Event("auth-status-changed"));
                window.dispatchEvent(new Event("storage"));

                setSuccessModalData({
                    open: true,
                    planName: selectedPlan.name || "Trial Plan",
                    members: slots,
                    validTill: formattedValidTill,
                });

                setSnackbar({
                    open: true,
                    message: res?.message || "Trial plan claimed successfully!",
                    severity: "success",
                });
                void refetch();
            }
        } catch (err: unknown) {
            setIsPaymentProcessing(false);
            const errorObj = err as {
                data?: { message?: string };
                message?: string;
            };
            setSnackbar({
                open: true,
                message:
                    errorObj?.data?.message ||
                    errorObj?.message ||
                    "Failed to process subscription. Please try again.",
                severity: "error",
            });
        }
    };

    const getPlanFeatures = (plan: Plan): PlanFeatureItem[] => {
        const isEnterprise =
            plan.code?.toUpperCase() === "ENTERPRISE" ||
            plan.name?.toLowerCase().includes("enterprise");
        const isTrial =
            plan.code?.toUpperCase() === "TRIAL" ||
            plan.name?.toLowerCase().includes("trial");

        if (isTrial) {
            return [
                {
                    icon: <CalendarTodayOutlined sx={{ fontSize: 20 }} />,
                    title: `${plan.durationDays || 7} days`,
                    subtitle: "Subscription duration",
                },
                {
                    icon: <PeopleOutlineOutlined sx={{ fontSize: 20 }} />,
                    title: `Up to ${plan.maxMembers || 50} members`,
                    subtitle: "Including Staffs",
                },
                {
                    icon: <AssignmentOutlined sx={{ fontSize: 20 }} />,
                    title: "Practice Questions",
                    subtitle: "Enabled 10 practice questions",
                },
            ];
        }

        if (isEnterprise) {
            return [
                {
                    icon: <CalendarTodayOutlined sx={{ fontSize: 20 }} />,
                    title: `${plan.durationDays || 7} days`,
                    subtitle: "Subscription duration",
                },
                {
                    icon: <PeopleOutlineOutlined sx={{ fontSize: 20 }} />,
                    title:
                        plan.maxMembers != null
                            ? `Up to ${plan.maxMembers} members`
                            : "Custom members",
                    subtitle: "Including Staffs",
                },
                {
                    icon: <AssignmentOutlined sx={{ fontSize: 20 }} />,
                    title: "Practice Questions",
                    subtitle: "Enabled 30 practice questions",
                },
                {
                    icon: <SearchOutlined sx={{ fontSize: 20 }} />,
                    title: "Students Test",
                    subtitle: "Analyse students test",
                },
                {
                    icon: <TrendingUpOutlined sx={{ fontSize: 20 }} />,
                    title: "Cognitive test",
                    subtitle: "Cognitive game access",
                },
            ];
        }

        return [
            {
                icon: <CalendarTodayOutlined sx={{ fontSize: 20 }} />,
                title: `${plan.durationDays || 365} days`,
                subtitle: "Subscription duration",
            },
            {
                icon: <PeopleOutlineOutlined sx={{ fontSize: 20 }} />,
                title: `Up to ${plan.maxMembers || 500} members`,
                subtitle: "Including Staffs",
            },
            {
                icon: <AssignmentOutlined sx={{ fontSize: 20 }} />,
                title: "Practice Questions",
                subtitle: "Enabled 30 practice questions",
            },
            {
                icon: <SearchOutlined sx={{ fontSize: 20 }} />,
                title: "Students Test",
                subtitle: "Analyse students test",
            },
            {
                icon: <TrendingUpOutlined sx={{ fontSize: 20 }} />,
                title: "Cognitive test",
                subtitle: "Cognitive game access",
            },
        ];
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: { xs: 24, sm: 28 },
                            fontWeight: 700,
                            color: "#101828",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Subscription
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: "#667085" }}>
                        Fix the students and monitor
                    </Typography>
                </Box>
                <Tooltip title="Refresh subscription details">
                    <span>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => void refetch()}
                            disabled={isLoading || isFetching}
                            sx={{
                                minWidth: 36,
                                width: 36,
                                height: 36,
                                p: 0,
                                borderColor: "#e5e9f0",
                                bgcolor: "#fff",
                                color: "#475467",
                                "&:hover": { bgcolor: "#f8fafc", borderColor: "#d0d5dd" },
                            }}
                        >
                            <RefreshOutlined sx={{ fontSize: 18 }} />
                        </Button>
                    </span>
                </Tooltip>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #eaecf0",
                    gap: 3.5,
                    mt: 3,
                    mb: 4,
                    overflowX: "auto",
                }}
            >
                {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <Box
                            key={tab}
                            component="button"
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                pb: 1.25,
                                fontSize: 13.5,
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? "#9d174d" : "#667085",
                                borderBottom: isActive
                                    ? "2.5px solid #9d174d"
                                    : "2.5px solid transparent",
                                transition: "all 0.15s ease",
                                outline: "none",
                                whiteSpace: "nowrap",
                                "&:hover": {
                                    color: isActive ? "#9d174d" : "#101828",
                                },
                            }}
                        >
                            {tab}
                        </Box>
                    );
                })}
            </Box>

            {activeTab === "Plans" && (
                <>
                    {isLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                gap: 3.5,
                            }}
                        >
                            {[1, 2].map((k) => (
                                <Paper
                                    key={k}
                                    variant="outlined"
                                    sx={{
                                        width: { xs: "100%", sm: 380, md: 400 },
                                        p: 3.5,
                                        borderRadius: 4,
                                        bgcolor: "#fff",
                                    }}
                                >
                                    <Skeleton variant="text" width="40%" height={24} sx={{ mx: "auto", mb: 1 }} />
                                    <Skeleton variant="text" width="60%" height={32} sx={{ mx: "auto", mb: 2 }} />
                                    <Skeleton variant="text" width="50%" height={48} sx={{ mx: "auto", mb: 3 }} />
                                    <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 2, mb: 3 }} />
                                    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
                                </Paper>
                            ))}
                        </Box>
                    ) : plans.length === 0 ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 6,
                                textAlign: "center",
                                borderRadius: 3,
                                borderColor: "#e5e9f0",
                                bgcolor: "#fff",
                                maxWidth: 600,
                                mx: "auto",
                            }}
                        >
                            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#344054" }}>
                                No subscription plans found
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: "#667085", mt: 0.5 }}>
                                Please check back later or contact your system administrator.
                            </Typography>
                        </Paper>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "stretch",
                                flexWrap: "wrap",
                                gap: 3.5,
                            }}
                        >
                            {plans.map((plan) => {
                                const isTrial =
                                    plan.code?.toUpperCase() === "TRIAL" ||
                                    plan.name?.toLowerCase().includes("trial");
                                const isEnterprise =
                                    plan.code?.toUpperCase() === "ENTERPRISE" ||
                                    plan.name?.toLowerCase().includes("enterprise");
                                const isCurrent = Boolean(plan.currentPlan);

                                let displayPrice = 0;
                                let subPriceText = "Per member";

                                if (isTrial) {
                                    displayPrice = 0;
                                    subPriceText = "Per member";
                                } else if (billingCycle === "Annual") {
                                    displayPrice =
                                        plan.yearlyPricePerMember ??
                                        plan.annualPricePerMember ??
                                        plan.yearlyPrice ??
                                        plan.annualPrice ??
                                        150;
                                    subPriceText = "Per member / month";
                                } else {
                                    displayPrice =
                                        plan.monthlyPricePerMember ??
                                        plan.monthlyPrice ??
                                        200;
                                    subPriceText = "Per member / month";
                                }

                                const isMagentaTheme = isEnterprise;
                                const primaryColor = isMagentaTheme ? "#be185d" : isTrial ? "#2563eb" : "#4f46e5";
                                const iconBg = isMagentaTheme ? "#fdf2f8" : isTrial ? "#edf5fd" : "#eef2ff";
                                const iconColor = isMagentaTheme ? "#be185d" : isTrial ? "#2563eb" : "#4f46e5";
                                const cardBorderColor = isMagentaTheme ? "#be185d" : isTrial ? "#bfdbfe" : "#cbd5e1";
                                const cardShadow = isMagentaTheme
                                    ? "0 0 25px rgba(190, 24, 93, 0.16), 0 4px 20px rgba(0, 0, 0, 0.04)"
                                    : "0 4px 20px rgba(0, 0, 0, 0.04)";

                                const features = getPlanFeatures(plan);

                                return (
                                    <Card
                                        key={plan.id}
                                        variant="outlined"
                                        sx={{
                                            flex: "1 1 340px",
                                            maxWidth: { xs: "100%", sm: 420 },
                                            minWidth: { xs: "100%", sm: 340 },
                                            borderRadius: 4,
                                            bgcolor: "#ffffff",
                                            borderColor: cardBorderColor,
                                            borderWidth: "1.5px",
                                            boxShadow: cardShadow,
                                            display: "flex",
                                            flexDirection: "column",
                                            position: "relative",
                                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                            },
                                        }}
                                        contentSx={{
                                            p: { xs: 2.5, sm: 3.5 },
                                            "&:last-child": { pb: { xs: 2.5, sm: 3.5 } },
                                        }}
                                    >
                                        {isTrial ? (
                                            <Box sx={{ textAlign: "center", mb: 0.5 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        color: "#475467",
                                                    }}
                                                >
                                                    Free
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: 22,
                                                        fontWeight: 700,
                                                        color: "#101828",
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    {plan.name || "Try Skiteup 0.1"}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: 15,
                                                            fontWeight: 600,
                                                            color: "#101828",
                                                        }}
                                                    >
                                                        {plan.name || "Skiteup 0.1 Enterprise"}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            bgcolor: "#fce7f3",
                                                            p: "3px",
                                                            borderRadius: "20px",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            border: "1px solid #fbcfe8",
                                                        }}
                                                    >
                                                        <Box
                                                            component="button"
                                                            type="button"
                                                            onClick={() => setBillingCycle("Annual")}
                                                            sx={{
                                                                border: "none",
                                                                bgcolor:
                                                                    billingCycle === "Annual"
                                                                        ? "#ffffff"
                                                                        : "transparent",
                                                                color:
                                                                    billingCycle === "Annual"
                                                                        ? "#be185d"
                                                                        : "#64748b",
                                                                boxShadow:
                                                                    billingCycle === "Annual"
                                                                        ? "0 1px 3px rgba(0,0,0,0.12)"
                                                                        : "none",
                                                                borderRadius: "16px",
                                                                px: 1.5,
                                                                py: 0.35,
                                                                fontSize: 11,
                                                                fontWeight:
                                                                    billingCycle === "Annual" ? 600 : 500,
                                                                cursor: "pointer",
                                                                transition: "all 0.15s ease",
                                                                outline: "none",
                                                            }}
                                                        >
                                                            Annual
                                                        </Box>
                                                        <Box
                                                            component="button"
                                                            type="button"
                                                            onClick={() => setBillingCycle("Monthly")}
                                                            sx={{
                                                                border: "none",
                                                                bgcolor:
                                                                    billingCycle === "Monthly"
                                                                        ? "#ffffff"
                                                                        : "transparent",
                                                                color:
                                                                    billingCycle === "Monthly"
                                                                        ? "#be185d"
                                                                        : "#64748b",
                                                                boxShadow:
                                                                    billingCycle === "Monthly"
                                                                        ? "0 1px 3px rgba(0,0,0,0.12)"
                                                                        : "none",
                                                                borderRadius: "16px",
                                                                px: 1.5,
                                                                py: 0.35,
                                                                fontSize: 11,
                                                                fontWeight:
                                                                    billingCycle === "Monthly" ? 600 : 500,
                                                                cursor: "pointer",
                                                                transition: "all 0.15s ease",
                                                                outline: "none",
                                                            }}
                                                        >
                                                            Monthly
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    sx={{
                                                        fontSize: 22,
                                                        fontWeight: 700,
                                                        color: "#101828",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {isEnterprise
                                                        ? "For Growing Institutions"
                                                        : "For Standard Institutions"}
                                                </Typography>
                                            </>
                                        )}

                                        <Box sx={{ textAlign: "center", my: 1.5 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: 34,
                                                    fontWeight: 700,
                                                    color: primaryColor,
                                                    lineHeight: 1.15,
                                                }}
                                            >
                                                ₹{displayPrice}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    color: "#64748b",
                                                    mt: 0.5,
                                                }}
                                            >
                                                {subPriceText}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ mt: 1, mb: 3 }}>
                                            {isCurrent ? (
                                                <Button
                                                    fullWidth
                                                    disabled
                                                    sx={{
                                                        bgcolor: "#8eaee0 !important",
                                                        color: "#ffffff !important",
                                                        py: 1.15,
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        fontSize: 14,
                                                        boxShadow: "none",
                                                        "&.Mui-disabled": {
                                                            bgcolor: "#8eaee0 !important",
                                                            color: "#ffffff !important",
                                                            cursor: "not-allowed !important",
                                                            pointerEvents: "auto !important",
                                                        },
                                                    }}
                                                >
                                                    Current plan
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleOpenModal(plan)}
                                                    sx={{
                                                        bgcolor: isMagentaTheme ? "#8b1d5c" : "#2563eb",
                                                        "&:hover": {
                                                            bgcolor: isMagentaTheme ? "#701646" : "#1d4ed8",
                                                        },
                                                        color: "#ffffff",
                                                        py: 1.15,
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        fontSize: 14,
                                                        boxShadow: "none",
                                                    }}
                                                >
                                                    {isTrial ? "Claim plan" : "Upgrade to institute"}
                                                </Button>
                                            )}
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 2,
                                                mt: 1,
                                            }}
                                        >
                                            {features.map((feature, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            bgcolor: iconBg,
                                                            color: iconColor,
                                                            display: "grid",
                                                            placeItems: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {feature.icon}
                                                    </Box>
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                color: "#101828",
                                                                lineHeight: 1.3,
                                                            }}
                                                        >
                                                            {feature.title}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontSize: 12,
                                                                color: "#667085",
                                                                lineHeight: 1.3,
                                                            }}
                                                        >
                                                            {feature.subtitle}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}
                </>
            )}

            {activeTab === "History" && (
                <Card
                    variant="outlined"
                    sx={{ borderRadius: 3, borderColor: "#e5e9f0", bgcolor: "#fff", p: 1 }}
                    contentSx={{ p: { xs: 2.5, sm: 3.5 } }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <HistoryOutlined sx={{ color: "#9d174d", fontSize: 24 }} />
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>
                            Subscription History
                        </Typography>
                    </Box>

                    {currentActivePlan ? (
                        <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #eaecf0", mb: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                <Box>
                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#101828" }}>
                                        Current Plan: {currentActivePlan.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.3 }}>
                                        Member Capacity: {currentActivePlan.maxMembers ? `${currentActivePlan.maxMembers} members` : "Custom"} • Expiration: {currentActivePlan.durationDays || currentActivePlan.planExpiredDays || 7} days
                                    </Typography>
                                </Box>
                                <Chip
                                    label="Active"
                                    size="small"
                                    icon={<CheckCircleOutlineOutlined sx={{ fontSize: "16px !important" }} />}
                                    sx={{ bgcolor: "#ecfdf3", color: "#027a48", fontWeight: 600, px: 0.5 }}
                                />
                            </Box>
                        </Box>
                    ) : null}

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: "#eaecf0" }}>
                        <Table sx={{ minWidth: 600 }}>
                            <TableHead sx={{ bgcolor: "#f9fafb" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Plan Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Cycle</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Duration</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Rate / Member</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {plans.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{p.name}</TableCell>
                                        <TableCell sx={{ fontSize: 13, color: "#475467" }}>{p.durationDays && p.durationDays >= 365 ? "Annual" : "Weekly / Monthly"}</TableCell>
                                        <TableCell sx={{ fontSize: 13, color: "#475467" }}>{p.durationDays ? `${p.durationDays} Days` : "-"}</TableCell>
                                        <TableCell sx={{ fontSize: 13, color: "#475467" }}>{p.pricePerMember === 0 ? "Free (₹0)" : `₹${p.pricePerMember || 150}`}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={p.currentPlan ? "Active Plan" : "Available"}
                                                sx={{
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    bgcolor: p.currentPlan ? "#e0f2fe" : "#f2f4f7",
                                                    color: p.currentPlan ? "#0284c7" : "#475467",
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {activeTab === "Invoice" && (
                <Card
                    variant="outlined"
                    sx={{ borderRadius: 3, borderColor: "#e5e9f0", bgcolor: "#fff", p: 1 }}
                    contentSx={{ p: { xs: 2.5, sm: 3.5 } }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <ReceiptLongOutlined sx={{ color: "#9d174d", fontSize: 24 }} />
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>
                            Invoices & Receipts
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "#667085", mb: 3 }}>
                        View and download billing invoices for your institution subscriptions.
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: "#eaecf0" }}>
                        <Table sx={{ minWidth: 600 }}>
                            <TableHead sx={{ bgcolor: "#f9fafb" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Invoice ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Plan</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467" }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: "#475467", align: "right" }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow hover>
                                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>INV-2026-001</TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#475467" }}>{currentActivePlan?.name || "Try Skiteup 0.1"}</TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#475467" }}>Recent</TableCell>
                                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>₹0.00</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label="Settled"
                                            sx={{ fontSize: 11, fontWeight: 600, bgcolor: "#ecfdf3", color: "#027a48" }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" variant="text" sx={{ textTransform: "none", color: "#2563eb", fontWeight: 600 }}>
                                            Download
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {activeTab === "Docs" && (
                <Card
                    variant="outlined"
                    sx={{ borderRadius: 3, borderColor: "#e5e9f0", bgcolor: "#fff", p: 1 }}
                    contentSx={{ p: { xs: 2.5, sm: 3.5 } }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <MenuBookOutlined sx={{ color: "#9d174d", fontSize: 24 }} />
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>
                            Subscription Documentation & Guidelines
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "#667085", mb: 3 }}>
                        Guidelines and policy rules for seat limits, faculty allowances, and exam modules.
                    </Typography>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#eaecf0" }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#101828", mb: 0.5 }}>
                                Member Capacity & Seats
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#667085", lineHeight: 1.5 }}>
                                Plans allocate a fixed or custom quota for students and faculty members. For Enterprise institutions, seats can be configured flexibly to fit institutional size.
                            </Typography>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#eaecf0" }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#101828", mb: 0.5 }}>
                                Question & Assessment Bank
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#667085", lineHeight: 1.5 }}>
                                Trial tier offers 10 questions. Standard & Enterprise include up to 30 enabled practice assessments, detailed analytics, and cognitive access.
                            </Typography>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#eaecf0" }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#101828", mb: 0.5 }}>
                                Annual vs Monthly Billing
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#667085", lineHeight: 1.5 }}>
                                Annual subscriptions come with a 25% discounted per-member rate (₹150 vs ₹200) locked for 12 months. Monthly subscriptions allow flexible duration choices.
                            </Typography>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#eaecf0" }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#101828", mb: 0.5 }}>
                                Renewals & Plan Upgrades
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#667085", lineHeight: 1.5 }}>
                                Upgrading your plan takes immediate effect. Existing active students and staff members will retain seamless access without disruption.
                            </Typography>
                        </Paper>
                    </Box>
                </Card>
            )}

            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                title={selectedPlan?.name || "Skiteup Enterprise"}
                description="Configure your Subscription Specification"
                showCloseButton={true}
                maxWidth="xs"
                contentSx={{ pt: 1, px: 3, pb: 1 }}
                actions={
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, width: "100%" }}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseModal}
                            disabled={isClaiming}
                            sx={{
                                borderColor: "#be185d",
                                color: "#be185d",
                                bgcolor: "#fff",
                                borderRadius: 2,
                                px: 3,
                                py: 0.8,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                "&:hover": {
                                    borderColor: "#9d174d",
                                    bgcolor: "#fdf2f8",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => void handleProceed()}
                            loading={isClaiming || isVerifying || isPaymentProcessing}
                            disabled={isClaiming || isVerifying || isPaymentProcessing}
                            sx={{
                                bgcolor: "#2563eb",
                                "&:hover": { bgcolor: "#1d4ed8" },
                                color: "#fff",
                                borderRadius: 2,
                                px: 3,
                                py: 0.8,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                boxShadow: "none",
                            }}
                        >
                            {isPaymentProcessing || isVerifying
                                ? "Processing..."
                                : isSelectedTrial
                                ? "Claim plan"
                                : "Proceed"}
                        </Button>
                    </Box>
                }
            >
                <Box sx={{ mt: 1 }}>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#344054",
                            mb: 0.75,
                        }}
                    >
                        Number of member slots
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={isSelectedTrial ? 50 : memberSlots}
                        onChange={(e) => {
                            if (!isSelectedTrial) setMemberSlots(e.target.value);
                        }}
                        disabled={isClaiming || isSelectedTrial}
                        slotProps={{
                            htmlInput: { min: 1 },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: isSelectedTrial ? "#f8fafc" : "#ffffff",
                            },
                        }}
                    />
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#667085",
                            mt: 0.5,
                            mb: (selectedCycle === "Monthly" || isSelectedTrial) ? 2 : 1,
                        }}
                    >
                        {isSelectedTrial
                            ? "Trial plan allows up to 50 member slots (Disabled)"
                            : "Enter only number of Students and Staffs"}
                    </Typography>

                    {(selectedCycle === "Monthly" || isSelectedTrial) && (
                        <>
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#344054",
                                    mb: 0.75,
                                }}
                            >
                                Number of month
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={isSelectedTrial ? 1 : durationMonths}
                                onChange={(e) => {
                                    if (!isSelectedTrial) setDurationMonths(e.target.value);
                                }}
                                disabled={isClaiming || isSelectedTrial}
                                slotProps={{
                                    htmlInput: { min: 1, max: 11 },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        bgcolor: isSelectedTrial ? "#f8fafc" : "#ffffff",
                                    },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: "#667085",
                                    mt: 0.5,
                                    mb: 1,
                                }}
                            >
                                {isSelectedTrial
                                    ? "Trial plan duration is fixed to 1 month (Disabled)"
                                    : "Enter the number of month"}
                            </Typography>
                        </>
                    )}

                    <Box
                        sx={{
                            border: "1.5px dashed #3b82f6",
                            bgcolor: "#f0f7ff",
                            borderRadius: 2,
                            p: 2,
                            my: 2.5,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Typography sx={{ fontSize: 13, color: "#475467" }}>
                                Total Count
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#101828" }}>
                                {isSelectedTrial ? 50 : Number(memberSlots) || 0}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Typography sx={{ fontSize: 13, color: "#475467" }}>
                                Rate per Member
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#101828" }}>
                                ₹{modalRate}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                            }}
                        >
                            <Typography sx={{ fontSize: 13, color: "#475467" }}>
                                Duration (Month)
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#101828" }}>
                                {modalDuration}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                borderTop: "1px dashed #cbd5e1",
                                my: 1.5,
                            }}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#101828",
                                }}
                            >
                                Total Estimation
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: isSelectedTrial ? "#2563eb" : "#9d174d",
                                }}
                            >
                                ₹{modalTotalEstimation.toLocaleString("en-IN")}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Dialog>

            <Dialog
                open={Boolean(successModalData?.open)}
                onClose={() => setSuccessModalData(null)}
                title=""
                maxWidth="xs"
                showCloseButton={false}
                actions={
                    <Box sx={{ width: "100%", pb: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                setSuccessModalData(null);
                                localStorage.setItem("isExpired", "false");
                                localStorage.setItem("isPaid", "true");
                                window.dispatchEvent(new Event("auth-status-changed"));
                                window.dispatchEvent(new Event("storage"));
                                const userRole = localStorage.getItem("role");
                                const targetPath =
                                    userRole === "ROLE_SUPER_ADMIN"
                                        ? "/dashboard"
                                        : "/institution/dashboard";
                                navigate(targetPath);
                            }}
                            sx={{
                                bgcolor: "#2563eb",
                                "&:hover": { bgcolor: "#1d4ed8" },
                                color: "#ffffff",
                                py: 1.2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                }
            >
                {successModalData && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            pt: 1,
                            pb: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                bgcolor: "#ecfdf5",
                                color: "#10b981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                            }}
                        >
                            <CheckCircleOutlineOutlined sx={{ fontSize: 38 }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#101828",
                                mb: 0.5,
                            }}
                        >
                            Subscription Activated!
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 13.5,
                                color: "#667085",
                                mb: 2.5,
                            }}
                        >
                            Your {successModalData.planName} is active.
                        </Typography>

                        <Box
                            sx={{
                                width: "100%",
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 2.5,
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                textAlign: "left",
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                                    Plan
                                </Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                    {successModalData.planName}
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                                    Members
                                </Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                    {successModalData.members} (including teachers)
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                                    Valid Till
                                </Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                    {successModalData.validTill}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Dialog>

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            />
        </Box>
    );
};

export default Subscription;