import React, { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";

import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} from "../../features/notifications/NotificationApi";
import type { NotificationItem } from "../../types/Notification.types";
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  playNotificationSound,
} from "../../utils/notificationSound";

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  unreadCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(isNotificationSoundEnabled);

  const hasToken = Boolean(localStorage.getItem("accessToken"));
  const { data: notificationsData, isLoading, isFetching } = useGetNotificationsQuery(
    {
      page: 0,
      size: 30,
      isRead: activeTab === "UNREAD" ? false : undefined,
    },
    { skip: !hasToken, refetchOnMountOrArgChange: true }
  );

  const [markAsRead, { isLoading: isMarkingSingle }] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications, { isLoading: isClearingAll }] = useClearAllNotificationsMutation();

  const items = notificationsData?.data?.items || [];
  const totalCount = notificationsData?.data?.totalCount ?? items.length;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setNotificationSoundEnabled(next);
    if (next) {
      playNotificationSound();
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id).unwrap();
      } catch {
      }
    }
  };

  const handleMarkSingleRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleDeleteSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications().unwrap();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const getNotificationIcon = (item: NotificationItem) => {
    const category = (item.category || item.type || "").toUpperCase();
    if (category.includes("ASSESSMENT") || category.includes("TEST")) {
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#F3E8FF",
            color: "#7E22CE",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <AssignmentRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
      );
    }
    if (category.includes("STUDENT")) {
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#EFF8FF",
            color: "#175CD3",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <SchoolRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
      );
    }
    if (category.includes("TEACHER") || category.includes("USER") || category.includes("CREATION")) {
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#ECFDF3",
            color: "#027A48",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <PersonRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
      );
    }
    return (
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: "#FDF2F8",
          color: "#9D1E63",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 19 }} />
      </Box>
    );
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: { xs: "92vw", sm: 420 },
            maxWidth: 440,
            borderRadius: 3,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            border: "1px solid #eaecf0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #f2f4f7",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#101828", fontSize: 16 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} New`}
                size="small"
                sx={{
                  bgcolor: "#FDF2F8",
                  color: "#9D1E63",
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={soundEnabled ? "Mute notification sound" : "Unmute notification sound"}>
              <IconButton
                size="small"
                onClick={handleToggleSound}
                sx={{
                  color: soundEnabled ? "#9D1E63" : "#98a2b3",
                  bgcolor: soundEnabled ? "#fdf2f8" : "transparent",
                  "&:hover": { bgcolor: soundEnabled ? "#fce7f3" : "#f2f4f7" },
                }}
              >
                {soundEnabled ? <VolumeUpRoundedIcon fontSize="small" /> : <VolumeOffRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll}
                    sx={{ color: "#475467", "&:hover": { bgcolor: "#f2f4f7" } }}
                  >
                    <DoneAllRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {items.length > 0 && (
              <Tooltip title="Clear all notifications">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleClearAll}
                    disabled={isClearingAll}
                    sx={{ color: "#475467", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
                  >
                    <ClearAllRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 34,
            "& .MuiTabs-indicator": {
              bgcolor: "#9D1E63",
              height: 2.5,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab
            value="ALL"
            label={`All (${totalCount})`}
            sx={{
              minHeight: 34,
              py: 0.5,
              px: 1.5,
              fontSize: 12.5,
              fontWeight: activeTab === "ALL" ? 700 : 500,
              textTransform: "none",
              color: activeTab === "ALL" ? "#9D1E63" : "#667085",
              "&.Mui-selected": { color: "#9D1E63" },
            }}
          />
          <Tab
            value="UNREAD"
            label={`Unread (${unreadCount})`}
            sx={{
              minHeight: 34,
              py: 0.5,
              px: 1.5,
              fontSize: 12.5,
              fontWeight: activeTab === "UNREAD" ? 700 : 500,
              textTransform: "none",
              color: activeTab === "UNREAD" ? "#9D1E63" : "#667085",
              "&.Mui-selected": { color: "#9D1E63" },
            }}
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          bgcolor: "#fcfcfd",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#eaecf0", borderRadius: 3 },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1.5 }}>
            <CircularProgress size={26} sx={{ color: "#9D1E63" }} />
            <Typography variant="caption" sx={{ color: "#667085" }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ py: 6, px: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#f2f4f7",
                display: "grid",
                placeItems: "center",
                color: "#98a2b3",
                mb: 1.5,
              }}
            >
              <NotificationsNoneRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#101828", mb: 0.5 }}>
              {activeTab === "UNREAD" ? "No unread notifications" : "No notifications yet"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085", maxWidth: 260, lineHeight: 1.4 }}>
              {activeTab === "UNREAD"
                ? "You have caught up with all your updates and alerts."
                : "When new assessments, student records, or activities happen, you'll see them here."}
            </Typography>
          </Box>
        ) : (
          items.map((item, idx) => (
            <React.Fragment key={item.id}>
              <Box
                onClick={() => handleItemClick(item)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  p: 1.75,
                  cursor: item.isRead ? "default" : "pointer",
                  bgcolor: item.isRead ? "#ffffff" : "rgba(157, 30, 99, 0.035)",
                  borderLeft: item.isRead ? "3px solid transparent" : "3px solid #9D1E63",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    bgcolor: item.isRead ? "#f9fafb" : "rgba(157, 30, 99, 0.06)",
                    "& .item-actions": { opacity: 1 },
                  },
                }}
              >
                {getNotificationIcon(item)}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: item.isRead ? 600 : 700,
                        color: "#101828",
                        fontSize: 13,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </Typography>

                    {!item.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#9D1E63",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: "#475467",
                      fontSize: 12,
                      mt: 0.4,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.message}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.8 }}>
                    {item.timeAgo && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: 12, color: "#98a2b3" }} />
                        <Typography variant="caption" sx={{ color: "#98a2b3", fontSize: 11 }}>
                          {item.timeAgo}
                        </Typography>
                      </Box>
                    )}

                    {item.actorName && (
                      <Typography variant="caption" sx={{ color: "#667085", fontSize: 11, fontWeight: 500 }}>
                        by {item.actorName}
                      </Typography>
                    )}

                    {item.priority && ["HIGH", "URGENT"].includes(item.priority.toUpperCase()) && (
                      <Chip
                        label={item.priority}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: "#FEF3F2",
                          color: "#B42318",
                        }}
                      />
                    )}

                  </Box>
                </Box>

                <Box
                  className="item-actions"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.3,
                    opacity: { xs: 1, sm: 0 },
                    transition: "opacity 0.15s ease",
                    alignSelf: "center",
                  }}
                >
                  {!item.isRead && (
                    <Tooltip title="Mark read">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMarkSingleRead(e, item.id)}
                        disabled={isMarkingSingle}
                        sx={{
                          p: 0.4,
                          color: "#027A48",
                          "&:hover": { bgcolor: "#ecfdf3" },
                        }}
                      >
                        <CheckRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteSingle(e, item.id)}
                      sx={{
                        p: 0.4,
                        color: "#98a2b3",
                        "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                      }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {idx < items.length - 1 && <Divider sx={{ borderColor: "#f2f4f7" }} />}
            </React.Fragment>
          ))
        )}
      </Box>

      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: "#ffffff",
          borderTop: "1px solid #eaecf0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" sx={{ color: "#667085", fontSize: 11.5 }}>
          {isFetching ? "Refreshing..." : `${unreadCount} unread of ${totalCount}`}
        </Typography>

        <Typography
          variant="caption"
          onClick={onClose}
          sx={{
            color: "#9D1E63",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 12,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Dismiss
        </Typography>
      </Box>
    </Popover>
  );
};

export default NotificationPopover;
