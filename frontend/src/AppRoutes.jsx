// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './features/auth/components/Register';
import HospitalRegister from './features/auth/components/HospitalRegister';
import Dashboard from './pages/Dashboard';
import Profile from './features/users/components/Profile';
import DonationHistory from './features/users/components/DonationHistory';
import Notifications from './features/users/components/Notifications';
import HospitalProfile from './features/hospitals/components/HospitalProfile';
import Inventory from './features/hospitals/components/Inventory';
import DonorsList from './features/hospitals/components/DonorsList';
import CreateRequest from './features/requests/components/CreateRequest';
import RequestList from './features/requests/components/RequestList';
import RequestDetails from './features/requests/components/RequestDetails';
import AdminDashboard from './features/admin/components/AdminDashboard';
import ManageUsers from './features/admin/components/ManageUsers';
import ManageHospitals from './features/admin/components/ManageHospitals';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-hospital" element={<HospitalRegister />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* User Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/donations" element={<DonationHistory />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Request Routes */}
          <Route path="/requests/new" element={<CreateRequest />} />
          <Route path="/requests" element={<RequestList />} />
          <Route path="/requests/:id" element={<RequestDetails />} />
          
          {/* Hospital Routes - Hospital Admin Only */}
          <Route element={<PrivateRoute allowedRoles={['hospital_admin']} />}>
            <Route path="/hospital/profile" element={<HospitalProfile />} />
            <Route path="/hospital/inventory" element={<Inventory />} />
            <Route path="/hospital/donors" element={<DonorsList />} />
          </Route>
          
          {/* Admin Routes - Main Admin Only */}
          <Route element={<PrivateRoute allowedRoles={['main_admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/hospitals" element={<ManageHospitals />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;