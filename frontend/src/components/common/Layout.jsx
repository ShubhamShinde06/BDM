// src/components/common/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import 'twin.macro';

const Layout = () => {
  return (
    <div tw="min-h-screen bg-gray-100">
      <Navbar />
      <div tw="flex">
        <Sidebar />
        <main tw="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;