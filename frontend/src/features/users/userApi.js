// src/features/users/userApi.js
import { api } from '../../services/api';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    toggleAvailability: builder.mutation({
      query: (available) => ({
        url: '/users/availability',
        method: 'PATCH',
        body: { available },
      }),
      invalidatesTags: ['User'],
    }),
    getDonationHistory: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => 
        `/users/donation-history?page=${page}&limit=${limit}`,
      providesTags: ['Donations'],
    }),
    getNearbyRequests: builder.query({
      query: ({ city, page = 1, limit = 10 } = {}) => {
        let url = '/users/nearby-requests?';
        if (city) url += `city=${city}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Requests'],
    }),
    getUserStats: builder.query({
      query: () => '/users/stats',
      providesTags: ['User'],
    }),
    getNotifications: builder.query({
      query: ({ unreadOnly, page = 1, limit = 20 } = {}) => {
        let url = '/users/notifications?';
        if (unreadOnly) url += `unreadOnly=true&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/users/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/users/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useToggleAvailabilityMutation,
  useGetDonationHistoryQuery,
  useGetNearbyRequestsQuery,
  useGetUserStatsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = userApi;