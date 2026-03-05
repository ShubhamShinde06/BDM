import { api } from "../../app/api";

export const hospitalApi = api.injectEndpoints({
  endpoints: (b) => ({
    searchHospitals: b.query({
      query: (params) => ({ url: "/hospitals/search", params }),
    }),
    getHospitalProfile: b.query({
      query: () => "/hospitals/profile",
      providesTags: ["HospitalProfile"],
    }),
    updateHospitalProfile: b.mutation({
      query: (body) => ({ url: "/hospitals/profile", method: "PUT", body }),
      invalidatesTags: ["HospitalProfile"],
    }),
    getInventory: b.query({
      query: () => "/hospitals/inventory",
      providesTags: ["HospitalInventory"],
    }),
    updateInventory: b.mutation({
      query: (body) => ({ url: "/hospitals/inventory", method: "PATCH", body }),
      invalidatesTags: ["HospitalInventory", "HospitalStats"],
    }),
    bulkUpdateInventory: b.mutation({
      query: (body) => ({ url: "/hospitals/inventory/bulk", method: "PATCH", body }),
      invalidatesTags: ["HospitalInventory", "HospitalStats"],
    }),
    getHospitalDonors: b.query({
      query: (params = {}) => ({ url: "/hospitals/donors", params }),
      providesTags: ["HospitalDonors"],
    }),
    getHospitalStats: b.query({
      query: () => "/hospitals/stats",
      providesTags: ["HospitalStats"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchHospitalsQuery,
  useLazySearchHospitalsQuery,
  useGetHospitalProfileQuery,
  useUpdateHospitalProfileMutation,
  useGetInventoryQuery,
  useUpdateInventoryMutation,
  useBulkUpdateInventoryMutation,
  useGetHospitalDonorsQuery,
  useGetHospitalStatsQuery,
} = hospitalApi;
