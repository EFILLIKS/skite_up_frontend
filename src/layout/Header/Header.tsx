import React, { useState } from "react";
import { Box, AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Menu, MenuItem, Chip, Tooltip, Divider, ListItemIcon, ListItemText, } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
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
  ROLE_ADMIN: {
    label: "Admin",
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

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentUser,
}) => {
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const handleOpenProfile = (e: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(e.currentTarget);
  };
  const handleCloseProfile = () => setProfileAnchor(null);
  const currentRoleMeta = roleConfig[currentUser.role] || roleConfig["ROLE_PUBLIC"];
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #eaecf0",
        color: "#1d2939",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: 45,
          height: 45,
          px: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
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
              sx={{
                color: "#667085",
                borderRadius: 2,
                border: "1px solid #eaecf0",
                "&:hover": { bgcolor: "#f2f4f7" },
              }}
            >
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsNoneRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box
            onClick={handleOpenProfile}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              p: 0.6,
              borderRadius: 2.5,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#f2f4f7" },
            }}
          >
            <Avatar
              src={currentUser.avatar}
              alt={currentUser.name}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#9D1E63",
                fontWeight: 700,
                fontSize: 14,
                border: "2px solid #ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {currentUser.name.charAt(0)}
            </Avatar>

            <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#101828", lineHeight: 1.2 }}>
                {currentUser.name}
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
                {currentUser.name}
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
            <MenuItem onClick={handleCloseProfile} sx={{ fontSize: 14, py: 1 }}>
              <ListItemIcon>
                <AccountCircleRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </MenuItem>
            <MenuItem onClick={handleCloseProfile} sx={{ fontSize: 14, py: 1 }}>
              <ListItemIcon>
                <SettingsRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Account Settings" />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleCloseProfile} sx={{ fontSize: 14, py: 1, color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
