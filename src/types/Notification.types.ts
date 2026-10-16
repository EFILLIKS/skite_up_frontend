export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  actionType?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  recipientRole?: string;
  actorName?: string;
  targetUrl?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  timeAgo?: string;
}

export interface NotificationCountsData {
  unreadCount: number;
  readCount: number;
  totalCount: number;
}

export interface NotificationListData {
  unreadCount: number;
  readCount: number;
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
  hasMore: boolean;
  items: NotificationItem[];
}

export interface NotificationsApiResponse {
  statusCode: number;
  message: string;
  data: NotificationListData;
}

export interface NotificationCountsApiResponse {
  statusCode: number;
  message: string;
  data: NotificationCountsData;
}

export interface NotificationQueryParams {
  page?: number;
  size?: number;
  isRead?: boolean;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: string;
  actionType?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  recipientRole?: string;
  targetUrl?: string;
  priority?: string;
}
