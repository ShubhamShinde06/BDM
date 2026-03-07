import { api } from "../../app/api";

export const userApi = api.injectEndpoints({
  endpoints: (b) => ({
    getUserProfile: b.query({
      query: () => "/users/profile",
      providesTags: ["UserProfile"],
    }),
    updateUserProfile: b.mutation({
      query: (body) => ({ url: "/users/profile", method: "PUT", body }),
      invalidatesTags: ["UserProfile"],
    }),
    getUserStats: b.query({
      query: () => "/users/stats",
      providesTags: ["UserStats"],
    }),
    toggleAvailability: b.mutation({
      query: (body) => ({ url: "/users/availability", method: "PATCH", body }),
      invalidatesTags: ["UserProfile", "UserStats"],
    }),
    getDonationHistory: b.query({
      query: (params = {}) => ({ url: "/users/donations", params }),
      providesTags: ["UserDonations"],
    }),
    getNearbyRequests: b.query({
      query: (params = {}) => ({ url: "/users/nearby-requests", params }),
      providesTags: ["NearbyRequests"],
    }),
    getNotifications: b.query({
      query: (params = {}) => ({ url: "/users/notifications", params }),
      providesTags: ["Notifications"],
    }),
    markNotificationRead: b.mutation({
      query: (id) => ({ url: `/users/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    markAllRead: b.mutation({
      query: () => ({ url: "/users/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    commitToDonate: b.mutation({
      query: ({ requestId, ...body }) => ({
        url: `/users/commit-donation/${requestId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["NearbyRequests", "MyCommits"],
    }),
    cancelCommit: b.mutation({
      query: (requestId) => ({
        url: `/users/cancel-commit/${requestId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["NearbyRequests", "MyCommits"],
    }),
    getMyCommits: b.query({
      query: () => "/users/my-commits",
      providesTags: ["MyCommits"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserStatsQuery,
  useToggleAvailabilityMutation,
  useGetDonationHistoryQuery,
  useGetNearbyRequestsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
  useCommitToDonateMutation,
  useCancelCommitMutation,
  useGetMyCommitsQuery,
} = userApi;