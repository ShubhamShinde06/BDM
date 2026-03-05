// src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeartbeat, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useLogoutMutation } from '../../features/auth/authApi';
import { selectCurrentUser } from '../../features/auth/authSlice';
import 'twin.macro';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav tw="bg-white shadow-lg">
      <div tw="max-w-7xl mx-auto px-4">
        <div tw="flex justify-between items-center h-16">
          <Link to="/" tw="flex items-center space-x-2">
            <FaHeartbeat tw="text-red-600 text-2xl" />
            <span tw="font-bold text-xl text-gray-800">BloodLink</span>
          </Link>

          {user && (
            <div tw="flex items-center space-x-4">
              <span tw="text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                tw="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;