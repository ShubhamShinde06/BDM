// src/app/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import hospitalReducer from '../features/hospitals/hospitalSlice';
import requestReducer from '../features/requests/requestSlice';
import adminReducer from '../features/admin/adminSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import { api } from '../services/api';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  hospital: hospitalReducer,
  request: requestReducer,
  admin: adminReducer,
  notification: notificationReducer,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;