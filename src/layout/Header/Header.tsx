import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Typography, Badge, Menu, MenuItem, Chip, Tooltip, Divider, ListItemIcon, ListItemText } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import type { UserRole } from "../../types/Nav.types";
import type { HeaderProps } from "../../types/Header.types";
import Button from "../../components/common/Button";
import { useGetNotificationCountsQuery } from "../../features/notifications/NotificationApi";
import { playNotificationSound } from "../../utils/notificationSound";
import NotificationPopover from "./NotificationPopover";

const roleConfig: Record<
  UserRole,
  { label: string; color: "primary" | "secondary" | "success" | "warning" | "error"; icon: React.ReactElement }
> = {
  ROLE_SUPER_ADMIN: {
    label: "Super Admin",
    color: "error",
    icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
  },
  ROLE_ORG_ADMIN: {
    label: "Organization Admin",
    color: "primary",
    icon: <SupervisorAccountRoundedIcon fontSize="small" />,
  },
  ROLE_INSTITUTION_ADMIN: {
    label: "Institution Admin",
    color: "primary",
    icon: <SupervisorAccountRoundedIcon fontSize="small" />,
  },
  ROLE_TEACHER: {
    label: "Teacher",
    color: "success",
    icon: <SchoolRoundedIcon fontSize="small" />,
  },
  ROLE_STUDENT: {
    label: "Student",
    color: "secondary",
    icon: <MenuBookRoundedIcon fontSize="small" />,
  },
  ROLE_PUBLIC: {
    label: "Public",
    color: "warning",
    icon: <PublicRoundedIcon fontSize="small" />,
  },
};

const HEADER_HEIGHT = 56;

let globalPreviousUnreadCount: number | null = null;

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentUser,
}) => {
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(localStorage.getItem("accessToken")));

  useEffect(() => {
    const handleAuthChange = () => {
      setHasToken(Boolean(localStorage.getItem("accessToken")));
    };
    window.addEventListener("auth-status-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-status-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const { data: countsData, refetch: refetchCounts } = useGetNotificationCountsQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const handleNotificationUpdate = () => {
      refetchCounts();
    };
    window.addEventListener("notification-count-update", handleNotificationUpdate);
    return () => {
      window.removeEventListener("notification-count-update", handleNotificationUpdate);
    };
  }, [refetchCounts]);

  const unreadCount =
    countsData?.data?.unreadCount ??
    (countsData as any)?.unreadCount ??
    (countsData as any)?.data?.count ??
    (countsData as any)?.count ??
    0;

  useEffect(() => {
    if (countsData !== undefined) {
      if (globalPreviousUnreadCount !== null && unreadCount > globalPreviousUnreadCount) {
        playNotificationSound();
      }
      globalPreviousUnreadCount = unreadCount;
    }
  }, [unreadCount, countsData]);

  const handleOpenNotifications = (e: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(e.currentTarget);
    refetchCounts();
  };
  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleOpenProfile = (e: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(e.currentTarget);
  };
  const handleCloseProfile = () => setProfileAnchor(null);
  const currentRoleMeta = roleConfig[currentUser.role] || roleConfig["ROLE_PUBLIC"];

  const displayName = currentUser.name
    ? currentUser.name
      .replace(/\bnull\b/gi, "")
      .replace(/\bundefined\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || "User"
    : "User";

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        height: `${HEADER_HEIGHT}px`,
        bgcolor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #eaecf0",
        color: "#1d2939",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: "border-box",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Button
          onClick={onToggleSidebar}
          sx={{
            color: "#344054",
            borderRadius: 2,
            display: { xs: "flex", md: "none" },
            "&:hover": { bgcolor: "#f2f4f7" },
          }}
          aria-label="Toggle Navigation"
        >
          <MenuRoundedIcon fontSize="small" />
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Tooltip title="Notifications">
          <IconButton
            onClick={handleOpenNotifications}
            sx={{
              width: 38,
              height: 38,
              color: Boolean(notificationAnchor) ? "#9D1E63" : "#667085",
              bgcolor: Boolean(notificationAnchor) ? "#fdf2f8" : "transparent",
              borderRadius: 2,
              border: "1px solid #eaecf0",
              "&:hover": { bgcolor: "#f2f4f7" },
            }}
            aria-label="Notifications"
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#9D1E63",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 10,
                  height: 18,
                  minWidth: 18,
                  px: 0.5,
                },
              }}
            >
              {unreadCount > 0 ? (
                <NotificationsActiveRoundedIcon fontSize="small" sx={{ color: "#9D1E63" }} />
              ) : (
                <NotificationsNoneRoundedIcon fontSize="small" />
              )}
            </Badge>
          </IconButton>
        </Tooltip>

        <NotificationPopover
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleCloseNotifications}
          unreadCount={unreadCount}
        />

        <Box
          onClick={handleOpenProfile}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            p: 0.5,
            borderRadius: 2.5,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": { bgcolor: "#f2f4f7" },
          }}
        >
          {currentUser.avatar ? (
            <Box
              component="img"
              src={currentUser.avatar}
              alt={displayName}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "#9D1E63",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                textAlign: "center",
                flexShrink: 0,
                border: "2px solid #ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                userSelect: "none",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Box>
          )}

          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "left",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", lineHeight: 1.25 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085", lineHeight: 1.2 }}>
              {currentUser.role
                .replace("ROLE_", "")
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleCloseProfile}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                borderRadius: 2.5,
                minWidth: 220,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)",
                border: "1px solid #eaecf0",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#101828" }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085" }}>
              {currentUser.email}
            </Typography>
            <Box sx={{ mt: 0.8 }}>
              <Chip
                label={currentRoleMeta.label}
                size="small"
                color={currentRoleMeta.color}
                sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
              />
            </Box>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              handleCloseProfile();
              navigate("/settings");
            }}
            sx={{ fontSize: 14, py: 1 }}
          >
            <ListItemIcon>
              <AccountCircleRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseProfile();
              navigate("/settings");
            }}
            sx={{ fontSize: 14, py: 1 }}
          >
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              handleCloseProfile();
              globalPreviousUnreadCount = null;
              localStorage.clear();
              navigate("/", { replace: true });
            }}
            sx={{ fontSize: 14, py: 1, color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
