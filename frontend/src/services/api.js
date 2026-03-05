// src/services/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'User',
    'Users',
    'Hospital',
    'Hospitals',
    'Request',
    'Requests',
    'Donation',
    'Donations',
    'Notification',
    'Notifications',
    'Inventory',
    'Dashboard',
  ],
  endpoints: () => ({}),
});