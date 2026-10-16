import { useEffect } from "react";
import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import Login from "../../pages/auth/Login";
import Dashboard from "../../pages/dashboard/DashBoard";
import MainLayout from "../../layout/MainLayout";
import College from "../../pages/institution/Collage";
import Plan from "../../pages/offer/Plan";
import CollegeForm from "../../pages/institution/CollegeForm";
import Settings from "../../pages/settings/Settings";
import NotFound from "../../pages/error/NotFound";
import {
    isAccessTokenExpired,
    useRefreshMutation,
} from "../../features/authservice/AuthApi";
import type { JwtPayload } from "../../types/JwtDecode.types";
import type { UserRole } from "../../types/Nav.types";
import { checkIsExpired } from "../../utils/authUtils";
import InstitutionDashBoard from "../../pages/dashboard/InstitutionDashBoard";
import Teacher from "../../pages/teachers/Teacher";
import TeacherForm from "../../pages/teachers/TeacherForm";
import Students from "../../pages/students/Students";
import StudentTableForm from "../../pages/students/StudentTableForm";
import Subscription from "../../pages/offer/Subscription";
import TeacheDashBoard from "../../pages/dashboard/TeacherDashBoard";
import StudentDashBoard from "../../pages/dashboard/StudentDashBoard";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import QuestionBank from "../../pages/questionbank/QuestionBank";
import AssessmentsPage from "../../pages/assessments/AssessmentsPage";
import StudentAssessmentsPage from "../../pages/assessments/StudentAssessmentsPage";
import TakeAssessmentPage from "../../pages/assessments/TakeAssessmentPage";
import StudentResultPage from "../../pages/assessments/StudentResultPage";
import AssessmentResultDetailPage from "../../pages/assessments/AssessmentResultDetailPage";
import TeacherViolationPage from "../../pages/violations/TeacherViolationPage";

const getStoredUserRole = (): UserRole | null => {
    const role = localStorage.getItem("role") as UserRole | null;
    if (role) {
        return role;
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.role) {
                localStorage.setItem("role", decoded.role);
                return decoded.role as UserRole;
            }
        } catch {
            return null;
        }
    }
    return null;
};

const RequireAuth = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const hasValidAccessToken =
        Boolean(accessToken) &&
        !isAccessTokenExpired(accessToken);
    const [refresh, refreshResult] = useRefreshMutation();

    useEffect(() => {
        if (!hasValidAccessToken && refreshToken) {
            void refresh({ refreshToken });
        }
    }, [hasValidAccessToken, refresh, refreshToken]);

    const refreshedAccessToken =
        refreshResult.data?.data?.accessToken;
    const hasRefreshedAccessToken =
        Boolean(refreshedAccessToken) &&
        !isAccessTokenExpired(refreshedAccessToken);

    if (hasValidAccessToken || hasRefreshedAccessToken) {
        return <Outlet />;
    }

    if (
        !refreshToken ||
        refreshResult.isError ||
        (refreshResult.isSuccess && !hasRefreshedAccessToken)
    ) {
        return <Navigate to="/" replace />;
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
            }}
        >
            <CircularProgress aria-label="Restoring session" />
        </Box>
    );
};

interface RequireRoleProps {
    allowedRoles: UserRole[];
    requirePaid?: boolean;
    fallbackPath?: string;
}

const RequireRole = ({
    allowedRoles,
    requirePaid = false,
    fallbackPath = "/",
}: RequireRoleProps) => {
    const role = getStoredUserRole();
    const location = useLocation();

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to={fallbackPath} replace />;
    }

    if (role === "ROLE_INSTITUTION_ADMIN") {
        const isPaid = localStorage.getItem("isPaid") === "true";
        const isExpired = checkIsExpired();
        if ((!isPaid || isExpired || requirePaid) && (!isPaid || isExpired) && location.pathname !== "/subscription") {
            return <Navigate to="/subscription" replace />;
        }
    }

    return <Outlet />;
};

const AssessmentsRedirect = () => {
    const role = getStoredUserRole();
    if (role === "ROLE_STUDENT") {
        return <Navigate to="/student/assessments" replace />;
    }
    return <Navigate to="/teacher/assessments" replace />;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<RequireAuth />}>
                    <Route path="/assessments" element={<AssessmentsRedirect />} />
                    <Route
                        element={
                            <RequireRole
                                allowedRoles={["ROLE_SUPER_ADMIN"]}
                            />
                        }
                    >
                        <Route
                            path="/dashboard"
                            element={
                                <MainLayout>
                                    <Dashboard />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/colleges"
                            element={
                                <MainLayout>
                                    <College />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/colleges/form"
                            element={
                                <MainLayout>
                                    <CollegeForm />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/colleges/form/:id"
                            element={
                                <MainLayout>
                                    <CollegeForm />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/offers"
                            element={
                                <MainLayout>
                                    <Plan />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <MainLayout>
                                    <Settings />
                                </MainLayout>
                            }
                        />
                    </Route>
                    <Route
                        element={
                            <RequireRole
                                allowedRoles={["ROLE_INSTITUTION_ADMIN", "ROLE_SUPER_ADMIN"]}
                            />
                        }
                    >
                        <Route
                            path="/subscription"
                            element={
                                <MainLayout>
                                    <Subscription />
                                </MainLayout>
                            }
                        />
                    </Route>

                    <Route
                        element={
                            <RequireRole
                                allowedRoles={["ROLE_INSTITUTION_ADMIN", "ROLE_SUPER_ADMIN"]}
                                requirePaid={true}
                            />
                        }
                    >
                        <Route
                            path="/institution/dashboard"
                            element={
                                <MainLayout>
                                    <InstitutionDashBoard />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/institution/teachers"
                            element={
                                <MainLayout>
                                    <Teacher />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/institution/teachers/form"
                            element={
                                <MainLayout>
                                    <TeacherForm />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/institution/teachers/form/:id"
                            element={
                                <MainLayout>
                                    <TeacherForm />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/teachers"
                            element={<Navigate to="/institution/teachers" replace />}
                        />
                        <Route
                            path="/teachers/form"
                            element={<Navigate to="/institution/teachers/form" replace />}
                        />
                        <Route
                            path="/teachers/form/:id"
                            element={<Navigate to="/institution/teachers/form/:id" replace />}
                        />
                        <Route
                            path="/institution/students"
                            element={
                                <MainLayout>
                                    <Students />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/institution/students/form"
                            element={
                                <MainLayout>
                                    <StudentTableForm />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/institution/students/form/:id"
                            element={
                                <MainLayout>
                                    <StudentTableForm />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/students"
                            element={<Navigate to="/institution/students" replace />}
                        />
                        <Route
                            path="/students/form"
                            element={<Navigate to="/institution/students/form" replace />}
                        />
                        <Route
                            path="/students/form/:id"
                            element={<Navigate to="/institution/students/form/:id" replace />}
                        />
                        <Route
                            path="/institution/settings"
                            element={
                                <MainLayout>
                                    <Settings />
                                </MainLayout>
                            }
                        />
                    </Route>
                    <Route element={
                        <RequireRole
                            allowedRoles={["ROLE_TEACHER", "ROLE_INSTITUTION_ADMIN", "ROLE_SUPER_ADMIN"]}
                        />
                    }>
                        <Route path="/teacher/dashboard" element={<MainLayout><TeacheDashBoard /></MainLayout>} />
                        <Route path="/teacher/students" element={<MainLayout><Students /></MainLayout>} />
                        <Route path="/teacher/assessments" element={<MainLayout><AssessmentsPage /></MainLayout>} />
                        <Route path="/teacher/question-bank" element={<MainLayout><QuestionBank /></MainLayout>} />
                        <Route path="/question-bank" element={<Navigate to="/teacher/question-bank" replace />} />
                        <Route path="/teacher/violation" element={<MainLayout><TeacherViolationPage /></MainLayout>} />
                        <Route path="/teacher/assessments/result/:id" element={<MainLayout><AssessmentResultDetailPage /></MainLayout>} />
                        <Route path="/teacher/settings" element={<MainLayout><Settings /></MainLayout>} />
                        <Route path="/teacher/support" element={<MainLayout><ModulePlaceholder title="Support" subtitle="Get help and contact the technical support team." /></MainLayout>} />
                    </Route>
                    <Route element={
                        <RequireRole
                            allowedRoles={["ROLE_STUDENT", "ROLE_TEACHER", "ROLE_INSTITUTION_ADMIN", "ROLE_SUPER_ADMIN"]}
                        />
                    }>
                        <Route path="/student/dashboard" element={<MainLayout><StudentDashBoard /></MainLayout>} />
                        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                        <Route path="/student/assessments" element={<MainLayout><StudentAssessmentsPage /></MainLayout>} />
                        <Route path="/student/assessments/take/:id" element={<TakeAssessmentPage />} />
                        <Route path="/assessments/take/:id" element={<TakeAssessmentPage />} />
                        <Route path="/student/result" element={<MainLayout><StudentResultPage /></MainLayout>} />
                        <Route path="/student/result/:id" element={<MainLayout><AssessmentResultDetailPage /></MainLayout>} />
                        <Route path="/assessments/result/:id" element={<MainLayout><AssessmentResultDetailPage /></MainLayout>} />
                        <Route path="/student/settings" element={<MainLayout><Settings /></MainLayout>} />
                        <Route path="/student/support" element={<MainLayout><ModulePlaceholder title="Support" subtitle="Get help and contact technical support." /></MainLayout>} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;