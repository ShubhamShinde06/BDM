import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../features/auth/authSlice";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions);
    if (refreshResult?.data?.accessToken) {
      api.dispatch(setCredentials({ accessToken: refreshResult.data.accessToken, user: api.getState().auth.user }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth","AdminDashboard","AdminHospitals","AdminUsers","AdminRequests",
    "HospitalProfile","HospitalInventory","HospitalDonors","HospitalStats","HospitalRequests",
    "UserProfile","UserStats","UserDonations","NearbyRequests","MyRequests","Notifications",
  ],
  endpoints: () => ({}),
});
