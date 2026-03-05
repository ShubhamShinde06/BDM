import { api } from "../../app/api";

export const authApi = api.injectEndpoints({
  endpoints: (b) => ({
    registerUser:     b.mutation({ query: (body) => ({ url: "/auth/register/user", method: "POST", body }) }),
    registerHospital: b.mutation({ query: (body) => ({ url: "/auth/register/hospital", method: "POST", body }) }),
    login:            b.mutation({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
    refresh:          b.mutation({ query: () => ({ url: "/auth/refresh", method: "POST" }) }),
    logoutApi:        b.mutation({ query: () => ({ url: "/auth/logout", method: "POST" }), invalidatesTags: ["Auth"] }),
    getMe:            b.query({ query: () => "/auth/me", providesTags: ["Auth"] }),
  }),
});

export const {
  useRegisterUserMutation, useRegisterHospitalMutation,
  useLoginMutation, useRefreshMutation,
  useLogoutApiMutation, useGetMeQuery,
} = authApi;
