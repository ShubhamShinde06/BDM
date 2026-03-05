// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHeart, FaHospital, FaUsers, FaTint } from 'react-icons/fa';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import 'twin.macro';

const Home = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div>
      {/* Hero Section */}
      <section tw="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div tw="container mx-auto px-4 text-center">
          <h1 tw="text-5xl font-bold mb-6">Save Lives, Donate Blood</h1>
          <p tw="text-xl mb-8 max-w-2xl mx-auto">
            Join BloodLink - Pakistan's largest blood donation network. Connect donors with those in need, instantly.
          </p>
          {!isAuthenticated && (
            <div tw="space-x-4">
              <Link
                to="/register"
                tw="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Become a Donor
              </Link>
              <Link
                to="/login"
                tw="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors inline-block"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section tw="py-16 bg-gray-50">
        <div tw="container mx-auto px-4">
          <h2 tw="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div tw="grid md:grid-cols-3 gap-8">
            <div tw="text-center">
              <div tw="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart tw="text-red-600 text-3xl" />
              </div>
              <h3 tw="text-xl font-semibold mb-2">Register as Donor</h3>
              <p tw="text-gray-600">Sign up with your blood group and location to start saving lives</p>
            </div>
            <div tw="text-center">
              <div tw="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHospital tw="text-red-600 text-3xl" />
              </div>
              <h3 tw="text-xl font-semibold mb-2">Find Hospitals</h3>
              <p tw="text-gray-600">Search for nearby hospitals with available blood supply</p>
            </div>
            <div tw="text-center">
              <div tw="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTint tw="text-red-600 text-3xl" />
              </div>
              <h3 tw="text-xl font-semibold mb-2">Donate Blood</h3>
              <p tw="text-gray-600">Respond to urgent requests and track your donation history</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section tw="py-16 bg-white">
        <div tw="container mx-auto px-4">
          <div tw="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div tw="text-4xl font-bold text-red-600 mb-2">5000+</div>
              <div tw="text-gray-600">Lives Saved</div>
            </div>
            <div>
              <div tw="text-4xl font-bold text-red-600 mb-2">1000+</div>
              <div tw="text-gray-600">Active Donors</div>
            </div>
            <div>
              <div tw="text-4xl font-bold text-red-600 mb-2">50+</div>
              <div tw="text-gray-600">Partner Hospitals</div>
            </div>
            <div>
              <div tw="text-4xl font-bold text-red-600 mb-2">24/7</div>
              <div tw="text-gray-600">Emergency Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;