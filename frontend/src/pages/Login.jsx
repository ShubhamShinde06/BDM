// src/pages/Login.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { FaHeartbeat } from 'react-icons/fa';
import toast from 'react-hot-toast';
import 'twin.macro';

const Login = () => {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data).unwrap();
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.data?.message || 'Login failed');
    }
  };

  return (
    <div tw="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div tw="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div tw="text-center mb-8">
          <div tw="flex justify-center mb-4">
            <FaHeartbeat tw="text-red-600 text-5xl" />
          </div>
          <h2 tw="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p tw="text-gray-600">Sign in to your BloodLink account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} tw="space-y-6">
          <Input
            label="Email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={errors.password?.message}
            placeholder="Enter your password"
          />

          <div tw="mb-4">
            <label tw="block text-gray-700 mb-2">Login as</label>
            <div tw="flex space-x-4">
              <label tw="flex items-center">
                <input
                  type="radio"
                  value="user"
                  defaultChecked
                  {...register('loginAs')}
                  tw="mr-2"
                />
                User
              </label>
              <label tw="flex items-center">
                <input
                  type="radio"
                  value="hospital"
                  {...register('loginAs')}
                  tw="mr-2"
                />
                Hospital
              </label>
            </div>
          </div>

          <Button type="submit" loading={isLoading} tw="w-full">
            Sign In
          </Button>
        </form>

        <div tw="mt-6 text-center">
          <p tw="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" tw="text-red-600 hover:text-red-700 font-semibold">
              Register as User
            </Link>
          </p>
          <p tw="text-gray-600 mt-2">
            Register your hospital?{' '}
            <Link to="/register-hospital" tw="text-red-600 hover:text-red-700 font-semibold">
              Hospital Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;