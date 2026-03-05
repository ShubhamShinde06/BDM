// src/features/auth/authApi.js
import { api } from '../../services/api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register/user',
        method: 'POST',
        body: userData,
      }),
    }),
    registerHospital: builder.mutation({
      query: (hospitalData) => ({
        url: '/auth/register/hospital',
        method: 'POST',
        body: hospitalData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authSlice.actions.setCredentials({
            user: data.user,
            accessToken: data.accessToken,
          }));
        } catch (err) {
          console.error('Login failed:', err);
        }
      },
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(authSlice.actions.logout());
        dispatch(api.util.resetApiState());
      },
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useRegisterHospitalMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;