import { api } from "../../app/api";

export const adminApi = api.injectEndpoints({
  endpoints: (b) => ({
    getAdminDashboard: b.query({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    getAdminHospitals: b.query({
      query: (params = {}) => ({ url: "/admin/hospitals", params }),
      providesTags: ["AdminHospitals"],
    }),
    updateHospitalStatus: b.mutation({
      query: ({ id, status }) => ({
        url: `/admin/hospitals/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminHospitals", "AdminDashboard"],
    }),
    getAdminUsers: b.query({
      query: (params = {}) => ({ url: "/admin/users", params }),
      providesTags: ["AdminUsers"],
    }),
    toggleBlockUser: b.mutation({
      query: (id) => ({ url: `/admin/users/${id}/block`, method: "PATCH" }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: b.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminUsers", "AdminDashboard"],
    }),
    getAdminRequests: b.query({
      query: (params = {}) => ({ url: "/admin/requests", params }),
      providesTags: ["AdminRequests"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminHospitalsQuery,
  useUpdateHospitalStatusMutation,
  useGetAdminUsersQuery,
  useToggleBlockUserMutation,
  useDeleteUserMutation,
  useGetAdminRequestsQuery,
} = adminApi;
