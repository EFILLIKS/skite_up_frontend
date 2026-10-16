import { authApi } from "../authservice/AuthApi";
import type {
  NotificationsApiResponse,
  NotificationCountsApiResponse,
  NotificationQueryParams,
  CreateNotificationDto,
} from "../../types/Notification.types";

export const notificationApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsApiResponse, NotificationQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append("page", String(params.page));
        if (params?.size !== undefined) queryParams.append("size", String(params.size));
        if (params?.isRead !== undefined) queryParams.append("isRead", String(params.isRead));

        const qs = queryParams.toString();
        return {
          url: `/notifications${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Notifications"],
    }),

    getNotificationCounts: builder.query<NotificationCountsApiResponse, void>({
      query: () => ({
        url: "/notifications/counts",
        method: "GET",
      }),
      providesTags: ["NotificationCounts"],
    }),

    markNotificationAsRead: builder.mutation<{ statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "NotificationCounts"],
    }),

    markAllNotificationsAsRead: builder.mutation<{ statusCode: number; message: string }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "NotificationCounts"],
    }),

    deleteNotification: builder.mutation<{ statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "NotificationCounts"],
    }),

    clearAllNotifications: builder.mutation<{ statusCode: number; message: string }, void>({
      query: () => ({
        url: "/notifications/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "NotificationCounts"],
    }),

    createNotification: builder.mutation<{ statusCode: number; message: string }, CreateNotificationDto>({
      query: (body) => ({
        url: "/notifications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications", "NotificationCounts"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetNotificationCountsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useCreateNotificationMutation,
} = notificationApi;
