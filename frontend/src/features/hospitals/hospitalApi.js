// src/features/hospitals/hospitalApi.js
import { api } from '../../services/api';

export const hospitalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHospitalProfile: builder.query({
      query: () => '/hospital/profile',
      providesTags: ['Hospital'],
    }),
    updateHospitalProfile: builder.mutation({
      query: (data) => ({
        url: '/hospital/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Hospital'],
    }),
    getInventory: builder.query({
      query: () => '/hospital/inventory',
      providesTags: ['Inventory'],
    }),
    updateInventory: builder.mutation({
      query: ({ bloodGroup, units }) => ({
        url: '/hospital/inventory',
        method: 'PATCH',
        body: { bloodGroup, units },
      }),
      invalidatesTags: ['Inventory'],
    }),
    bulkUpdateInventory: builder.mutation({
      query: (inventory) => ({
        url: '/hospital/inventory/bulk',
        method: 'PATCH',
        body: { inventory },
      }),
      invalidatesTags: ['Inventory'],
    }),
    getDonors: builder.query({
      query: ({ bloodGroup, availability, city, page = 1, limit = 20 } = {}) => {
        let url = '/hospital/donors?';
        if (bloodGroup) url += `bloodGroup=${bloodGroup}&`;
        if (availability !== undefined) url += `availability=${availability}&`;
        if (city) url += `city=${city}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Users'],
    }),
    getHospitalStats: builder.query({
      query: () => '/hospital/stats',
      providesTags: ['Hospital'],
    }),
    searchHospitals: builder.query({
      query: ({ bloodGroup, city, page = 1, limit = 10 }) => {
        let url = '/hospitals/search?';
        url += `bloodGroup=${bloodGroup}&`;
        if (city) url += `city=${city}&`;
        url += `page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ['Hospitals'],
    }),
  }),
});

export const {
  useGetHospitalProfileQuery,
  useUpdateHospitalProfileMutation,
  useGetInventoryQuery,
  useUpdateInventoryMutation,
  useBulkUpdateInventoryMutation,
  useGetDonorsQuery,
  useGetHospitalStatsQuery,
  useSearchHospitalsQuery,
} = hospitalApi;