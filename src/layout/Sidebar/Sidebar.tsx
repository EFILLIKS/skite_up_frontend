import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { navigationConfig, getFilteredNavigation } from "../nav.config";
import { type SidebarProps } from "../../types/SideBar.types";
import { checkIsExpired } from "../../utils/authUtils";
import skitupLogo from "../../assets/skitup-logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
const SIDEBAR_WIDTH = 200;

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, onClose, currentUser, activeId, onSelectNav, isMobile } = props;
  const [authVersion, setAuthVersion] = React.useState(0);
  React.useEffect(() => {
    const handleAuthChange = () => {
      const activeSessionRole = sessionStorage.getItem("role");
      const activeSessionToken = sessionStorage.getItem("accessToken");
      if (activeSessionRole && activeSessionToken) {
        return;
      }
      setAuthVersion((v) => v + 1);
    };
    window.addEventListener("auth-status-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-status-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const isPaid = (sessionStorage.getItem("isPaid") || localStorage.getItem("isPaid")) === "true";
  const isExpired = checkIsExpired();
  const visibleSections = React.useMemo(
    () => getFilteredNavigation(navigationConfig, currentUser.role, isPaid, isExpired),
    [currentUser.role, isPaid, isExpired, authVersion]
  );
  const handleLogout = () => {
    navigate("/");
    sessionStorage.clear();
    localStorage.clear();
  };
  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRight: "1px solid #eaecf0",
      }}
    >
      <Box
        sx={{
          height: 56,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eaecf0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            py: 1.5,
          }}
        >
          <Box
            component="img"
            src={skitupLogo}
            alt="Skitup Logo"
            sx={{
              width: 145,
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} size="small" sx={{ color: "#667085" }}>
            <ChevronLeftRoundedIcon />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.25,
          py: 1.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#eaecf0", borderRadius: 4 },
        }}
      >
        {visibleSections.map((section, idx) => (
          <Box key={section.subheader || "navigation"} sx={{ mb: section.subheader ? 2.5 : 0 }}>
            {section.subheader && (
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  mb: 1,
                  display: "block",
                  color: "#98a2b3",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {section.subheader}
              </Typography>
            )}

            <List disablePadding>
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    item.path !== "/dashboard" &&
                    item.path !== "/teacher/dashboard" &&
                    item.path !== "/student/dashboard" &&
                    item.path !== "/institution/dashboard" &&
                    location.pathname.startsWith(item.path)) ||
                  activeId === item.id;
                const isDisabled = Boolean(item.disabled);
                const buttonItem = (
                  <ListItemButton
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      onSelectNav(item.id, item.title);
                      navigate(item.path);
                    }}
                    sx={{
                      position: "relative",
                      minHeight: 44,
                      borderRadius: "8px",
                      py: 1.1,
                      px: 1.75,
                      transition: "all 0.15s ease",
                      bgcolor: isActive && !isDisabled ? "#edf5fd" : "transparent",
                      color: isDisabled ? "#98a2b3" : isActive ? "#1570ef" : "#475467",
                      overflow: "hidden",
                      "&.Mui-disabled": {
                        opacity: 0.45,
                        cursor: "not-allowed",
                        pointerEvents: "auto",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3.5,
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius: "8px",
                        bgcolor: isActive && !isDisabled ? "#1570ef" : "transparent",
                      },
                      "&:hover": {
                        bgcolor: isDisabled ? "transparent" : isActive ? "#edf5fd" : "#f8fafc",
                        color: isDisabled ? "#98a2b3" : isActive ? "#1570ef" : "#1d2939",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isDisabled ? "#98a2b3" : isActive ? "#1570ef" : "#667085",
                        transition: "color 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        "& svg": {
                          width: 22,
                          height: 22,
                          color: isDisabled ? "#98a2b3 !important" : isActive && !isDisabled ? "#1570ef !important" : "#667085",
                          stroke: "currentColor",
                          fill: "none",
                        },
                        "& svg path, & svg circle, & svg rect, & svg polyline, & svg line": {
                          stroke: "currentColor",
                          fill: "none",
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.title}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "14.5px",
                            fontWeight: isActive && !isDisabled ? 600 : 500,
                            color: isDisabled ? "#98a2b3" : isActive ? "#1570ef" : "#475467",
                            lineHeight: 1.4,
                          },
                        },
                      }}
                    />

                    {item.badge && (
                      <Chip
                        label={item.badge}
                        color={item.badgeColor || "default"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 1.5,
                          px: 0.4,
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.75 }}>
                    {isDisabled ? (
                      <Tooltip title="Subscription required (Plan expired)" arrow placement="right">
                        <Box component="span" sx={{ width: "100%", display: "block", cursor: "not-allowed" }}>
                          {buttonItem}
                        </Box>
                      </Tooltip>
                    ) : (
                      buttonItem
                    )}
                  </ListItem>
                );
              })}
            </List>

            {idx < visibleSections.length - 1 && (
              <Divider sx={{ my: 1.5, borderColor: "#f2f4f7" }} />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ borderTop: "1px solid #eaecf0", px: 1, pt: 1.5, pb: 3.5, mt: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            color="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: 0,
              px: 1.5,
              py: 1,
              width: "100%",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#667085",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "#1570ef",
                bgcolor: "#f8fafc",
              },
            }}
            onClick={handleLogout}
          >
            <Tooltip title="Sign out">
              <LogoutRoundedIcon sx={{ fontSize: 20 }} />
            </Tooltip>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: "14px",
                color: "inherit",
              }}
            >
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              border: "none",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            display: { xs: "none", md: "block" },
            width: open ? SIDEBAR_WIDTH : 0,
            flexShrink: 0,
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid #eaecf0",
              boxShadow: "none",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
