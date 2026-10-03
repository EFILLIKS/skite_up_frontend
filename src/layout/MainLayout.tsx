import React, { useEffect, useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";
import type { MainLayoutProps } from "../types/MainLayout.types";
import type { UserProfile, UserRole } from "../types/Nav.types";
import { useProfileQuery } from "../features/authservice/AuthApi";

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  initialRole = (localStorage.getItem("role") as UserRole) || "ROLE_PUBLIC",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { data } = useProfileQuery();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "",
    name: "User",
    email: "",
    role: initialRole,
  });

  useEffect(() => {
    if (!data?.data) return;

    setCurrentUser((user) => ({
      ...user,
      id: data.data.id,
      name: `${data.data.firstName} ${data.data.lastName}`.trim(),
      email: data.data.email,
    }));
  }, [data]);

  const [activeNav, setActiveNav] = useState({
    id: "dashboard",
    title: "Dashboard",
  });

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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fc" }}>
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
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          activeTitle={activeNav.title}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            p: 1,
            maxWidth: 1600,
            width: "100%",
            mx: "auto",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
