// src/pages/Dashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../features/auth/authSlice';
import UserDashboard from '../features/users/components/UserDashboard';
import HospitalDashboard from '../features/hospitals/components/HospitalDashboard';
import AdminDashboard from '../features/admin/components/AdminDashboard';

const Dashboard = () => {
  const role = useSelector(selectUserRole);

  switch (role) {
    case 'main_admin':
      return <AdminDashboard />;
    case 'hospital_admin':
      return <HospitalDashboard />;
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;