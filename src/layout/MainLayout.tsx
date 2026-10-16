import React, { useEffect, useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";
import { navigationConfig, SuperAdminNavigation, TeacherNavigation, StudentNavigation, InstitutionAdminNavigation } from "./nav.config";
import type { MainLayoutProps } from "../types/MainLayout.types";
import type { UserProfile, UserRole } from "../types/Nav.types";
import { useProfileQuery } from "../features/authservice/AuthApi";
import { checkIsExpired } from "../utils/authUtils";

const SIDEBAR_WIDTH = 180;
const HEADER_HEIGHT = 56;

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  initialRole = (localStorage.getItem("role") as UserRole) || "ROLE_PUBLIC",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "",
    name: "User",
    email: "",
    role: initialRole,
  });

  const hasToken = Boolean(localStorage.getItem("accessToken"));
  const { data } = useProfileQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [authVersion, setAuthVersion] = useState(0);
  useEffect(() => {
    const handleAuthChange = () => setAuthVersion((v) => v + 1);
    window.addEventListener("auth-status-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-status-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (currentUser.role === "ROLE_INSTITUTION_ADMIN") {
      const isPaid = localStorage.getItem("isPaid") === "true";
      const isExpired = checkIsExpired();
      if ((!isPaid || isExpired) && location.pathname !== "/subscription") {
        navigate("/subscription", { replace: true });
      }
    }
  }, [currentUser.role, location.pathname, navigate, authVersion]);

  useEffect(() => {
    if (!data?.data) return;

    const firstName =
      data.data.firstName && data.data.firstName !== "null"
        ? data.data.firstName.trim()
        : "";
    const lastName =
      data.data.lastName && data.data.lastName !== "null"
        ? data.data.lastName.trim()
        : "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      (data.data as any).name ||
      "User";

    setCurrentUser((user) => ({
      ...user,
      id: data.data.id,
      name: fullName,
      email: data.data.email,
    }));
  }, [data]);

  const [activeNav, setActiveNav] = useState({
    id: "dashboard",
    title: "Dashboard",
  });

  useEffect(() => {
    const allSections =
      currentUser.role === "ROLE_SUPER_ADMIN"
        ? SuperAdminNavigation
        : currentUser.role === "ROLE_TEACHER"
          ? TeacherNavigation
          : currentUser.role === "ROLE_STUDENT"
            ? StudentNavigation
            : currentUser.role === "ROLE_INSTITUTION_ADMIN"
              ? InstitutionAdminNavigation
              : navigationConfig;

    const allItems = allSections.flatMap((s) => s.items);

    const matchingItem = allItems.find(
      (item) =>
        item.path === location.pathname ||
        (item.path !== "/" &&
          item.path !== "/dashboard" &&
          item.path !== "/institution/dashboard" &&
          item.path !== "/teacher/dashboard" &&
          item.path !== "/student/dashboard" &&
          location.pathname.startsWith(item.path))
    );

    if (matchingItem) {
      setActiveNav({
        id: matchingItem.id,
        title: matchingItem.title,
      });
    }
  }, [location.pathname, currentUser.role]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleSelectNav = (id: string, title: string) => {
    setActiveNav({ id, title });

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f8f9fc",
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        activeId={activeNav.id}
        onSelectNav={handleSelectNav}
        isMobile={isMobile}
      />

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: {
            xs: 0,
            md: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
          },
          right: 0,
          height: `${HEADER_HEIGHT}px`,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          activeTitle={activeNav.title}
        />
      </Box>

      <Box
        component="main"
        sx={{
          position: "fixed",

          top: `${HEADER_HEIGHT}px`,

          left: {
            xs: 0,
            md: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
          },

          right: 0,
          bottom: 0,

          overflowY: "auto",
          overflowX: "hidden",

          transition:
            "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",

          boxSizing: "border-box",

          p: { xs: 2, sm: 2.5, md: 3 },
          pb: { xs: 8, sm: 10, md: 12 },

          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#d0d5dd",
            borderRadius: 10,
          },

          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;