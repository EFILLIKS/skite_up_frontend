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
import skitupLogo from "../../assets/skitup-logo.svg";
import { useNavigate } from "react-router-dom";
const SIDEBAR_WIDTH = 180;

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const navigate = useNavigate()
  const { open, onClose, currentUser, activeId, onSelectNav, isMobile } = props;
  const visibleSections = getFilteredNavigation(navigationConfig, currentUser.role);
  const handleLogout = () => {
    navigate("/");
    localStorage.clear();

  }
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
          height: 45,
          minHeight: 56,
          px: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f2f4f7",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            py: 2,
          }}
        >
          <Box
            component="img"
            src={skitupLogo}
            alt="Skitup Logo"
            sx={{
              width: 150,
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
          px: 0,
          py: 2,
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
                const isActive = activeId === item.id;
                const isDisabled = Boolean(item.disabled);
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      disabled={isDisabled}
                      onClick={() => onSelectNav(item.id, item.title)}
                      sx={{
                        position: "relative",
                        minHeight: 34,
                        borderRadius: 1,
                        py: 0.75,
                        px: 1,
                        transition: "all 0.15s ease",
                        bgcolor: isActive && !isDisabled ? "#eaf4fc" : "transparent",
                        color: isDisabled ? "#b4bac5" : isActive ? "#337ECC" : "#475467",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 3,
                          borderRadius: 4,
                          bgcolor: isActive && !isDisabled ? "#337ECC" : "transparent",
                        },
                        "&:hover": {
                          bgcolor: isDisabled ? "transparent" : isActive ? "#eaf4fc" : "#f9fafb",
                          color: isDisabled ? "#b4bac5" : isActive ? "#337ECC" : "#1d2939",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 30,
                          color: isDisabled ? "#b4bac5" : isActive ? "#337ECC" : "#667085",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.title}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: 12,
                              fontWeight: isActive ? 600 : 500,
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
      <Box sx={{ borderTop: "1px solid #eaecf0", px: 0, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
          color="inherit"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: 0,
              px: 1,
              py: 0.75,
              width: "100%",
              borderRadius: 1,
              cursor: "pointer",
              color: "#667085",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#337ECC",
              },
            }}
            onClick={handleLogout}
          >
            <Tooltip title="Sign out">
              <LogoutRoundedIcon fontSize="small" />
            </Tooltip>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: 12,
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
