// src/components/ui/Button.jsx
import React from 'react';
import 'twin.macro';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = tw`rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`;
  
  const variants = {
    primary: tw`bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`,
    secondary: tw`bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500`,
    outline: tw`border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500`,
    danger: tw`bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500`,
  };

  const sizes = {
    sm: tw`px-3 py-1.5 text-sm`,
    md: tw`px-4 py-2 text-base`,
    lg: tw`px-6 py-3 text-lg`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      css={[
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && tw`opacity-50 cursor-not-allowed`,
      ]}
      className={className}
      {...props}
    >
      {loading ? (
        <div tw="flex items-center justify-center">
          <svg tw="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle tw="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path tw="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;