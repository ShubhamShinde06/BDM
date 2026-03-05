// src/features/requests/requestApi.js
import { api } from '../../services/api';

export const requestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRequest: builder.mutation({
      query: (requestData) => ({
        url: '/requests',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['Requests'],
    }),
    getMyRequests: builder.query({
      query: ({ status, page = 1, limit = 10 } = {}) => {
        let url = '/requests/my?';
        if (status) url += `status=${status}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Requests'],
    }),
    getHospitalRequests: builder.query({
      query: ({ status, urgency, page = 1, limit = 20 } = {}) => {
        let url = '/requests/hospital?';
        if (status) url += `status=${status}&`;
        if (urgency) url += `urgency=${urgency}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Requests'],
    }),
    respondToRequest: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/requests/${id}/respond`,
        method: 'PATCH',
        body: { status, rejectionReason },
      }),
      invalidatesTags: ['Requests', 'Inventory'],
    }),
    completeRequest: builder.mutation({
      query: ({ id, donorId }) => ({
        url: `/requests/${id}/complete`,
        method: 'PATCH',
        body: { donorId },
      }),
      invalidatesTags: ['Requests', 'Donations'],
    }),
    cancelRequest: builder.mutation({
      query: (id) => ({
        url: `/requests/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Requests'],
    }),
  }),
});

export const {
  useCreateRequestMutation,
  useGetMyRequestsQuery,
  useGetHospitalRequestsQuery,
  useRespondToRequestMutation,
  useCompleteRequestMutation,
  useCancelRequestMutation,
} = requestApi;