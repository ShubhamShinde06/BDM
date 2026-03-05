import { api } from "../../app/api";

export const requestsApi = api.injectEndpoints({
  endpoints: (b) => ({
    createRequest: b.mutation({
      query: (body) => ({ url: "/requests", method: "POST", body }),
      invalidatesTags: ["MyRequests"],
    }),
    getMyRequests: b.query({
      query: (params = {}) => ({ url: "/requests/my", params }),
      providesTags: ["MyRequests"],
    }),
    cancelRequest: b.mutation({
      query: (id) => ({ url: `/requests/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: ["MyRequests"],
    }),
    getHospitalRequests: b.query({
      query: (params = {}) => ({ url: "/requests/hospital", params }),
      providesTags: ["HospitalRequests"],
    }),
    respondToRequest: b.mutation({
      query: ({ id, ...body }) => ({
        url: `/requests/${id}/respond`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["HospitalRequests", "HospitalInventory", "HospitalStats"],
    }),
    completeRequest: b.mutation({
      query: ({ id, ...body }) => ({
        url: `/requests/${id}/complete`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["HospitalRequests", "HospitalStats"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateRequestMutation,
  useGetMyRequestsQuery,
  useCancelRequestMutation,
  useGetHospitalRequestsQuery,
  useRespondToRequestMutation,
  useCompleteRequestMutation,
} = requestsApi;
