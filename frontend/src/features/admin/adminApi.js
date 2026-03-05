// src/features/admin/adminApi.js
import { api } from '../../services/api';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Dashboard'],
    }),
    getAllHospitals: builder.query({
      query: ({ status, page = 1, limit = 20 } = {}) => {
        let url = '/admin/hospitals?';
        if (status) url += `status=${status}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Hospitals'],
    }),
    updateHospitalStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/hospitals/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Hospitals', 'Dashboard'],
    }),
    getAllUsers: builder.query({
      query: ({ role, status, bloodGroup, page = 1, limit = 20 } = {}) => {
        let url = '/admin/users?';
        if (role) url += `role=${role}&`;
        if (status) url += `status=${status}&`;
        if (bloodGroup) url += `bloodGroup=${bloodGroup}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Users'],
    }),
    toggleBlockUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Dashboard'],
    }),
    getAllRequests: builder.query({
      query: ({ status, bloodGroup, urgency, page = 1, limit = 20 } = {}) => {
        let url = '/admin/requests?';
        if (status) url += `status=${status}&`;
        if (bloodGroup) url += `bloodGroup=${bloodGroup}&`;
        if (urgency) url += `urgency=${urgency}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Requests'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAllHospitalsQuery,
  useUpdateHospitalStatusMutation,
  useGetAllUsersQuery,
  useToggleBlockUserMutation,
  useDeleteUserMutation,
  useGetAllRequestsQuery,
} = adminApi;