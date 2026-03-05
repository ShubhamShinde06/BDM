// src/components/common/ErrorMessage.jsx
import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import 'twin.macro';

/**
 * ErrorMessage Component
 * Displays error messages with different severity levels and optional retry functionality
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} [props.title] - Optional title for the error
 * @param {string} [props.type='error'] - Error type: 'error', 'warning', 'info'
 * @param {Function} [props.onRetry] - Optional retry function
 * @param {Function} [props.onDismiss] - Optional dismiss function
 * @param {Object} [props.error] - Error object (can be ApiError, ValidationError, etc.)
 * @param {boolean} [props.showDetails=false] - Whether to show error details
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant='default'] - 'default', 'banner', 'inline', 'toast'
 * @param {boolean} [props.compact=false] - Compact mode
 */

const ErrorMessage = ({
  message,
  title,
  type = 'error',
  onRetry,
  onDismiss,
  error,
  showDetails = false,
  className = '',
  variant = 'default',
  compact = false,
}) => {
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle tw="text-yellow-500" />;
      case 'info':
        return <FaInfoCircle tw="text-blue-500" />;
      case 'error':
      default:
        return <FaExclamationCircle tw="text-red-500" />;
    }
  };

  // Get styles based on type and variant
  const getStyles = () => {
    const baseStyles = {
      error: {
        bg: tw`bg-red-50`,
        border: tw`border-red-200`,
        text: tw`text-red-800`,
        title: tw`text-red-900`,
        button: tw`bg-red-100 hover:bg-red-200 text-red-800`,
      },
      warning: {
        bg: tw`bg-yellow-50`,
        border: tw`border-yellow-200`,
        text: tw`text-yellow-800`,
        title: tw`text-yellow-900`,
        button: tw`bg-yellow-100 hover:bg-yellow-200 text-yellow-800`,
      },
      info: {
        bg: tw`bg-blue-50`,
        border: tw`border-blue-200`,
        text: tw`text-blue-800`,
        title: tw`text-blue-900`,
        button: tw`bg-blue-100 hover:bg-blue-200 text-blue-800`,
      },
    };

    return baseStyles[type] || baseStyles.error;
  };

  const styles = getStyles();

  // Variant styles
  const variantStyles = {
    default: tw`rounded-lg border p-4`,
    banner: tw`border-b py-3 px-4`,
    inline: tw`text-sm`,
    toast: tw`rounded-lg shadow-lg border p-4`,
  };

  // Compact styles
  const compactStyles = compact ? tw`p-2 text-sm` : tw`p-4`;

  // Extract error details if error object is provided
  const getErrorDetails = () => {
    if (!error) return null;

    if (error.errors && Array.isArray(error.errors)) {
      return error.errors;
    }

    if (error.data?.errors) {
      return error.data.errors;
    }

    if (error.message && error.message !== message) {
      return [{ message: error.message }];
    }

    return null;
  };

  const errorDetails = getErrorDetails();

  return (
    <div
      css={[
        styles.bg,
        styles.border,
        styles.text,
        variantStyles[variant],
        !compact && variantStyles.default,
        compactStyles,
        tw`relative`,
        className,
      ]}
      role="alert"
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          tw="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <FaTimes />
        </button>
      )}

      <div tw="flex items-start space-x-3">
        {/* Icon */}
        <div tw="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div tw="flex-1 min-w-0">
          {/* Title */}
          {title && (
            <h3 css={[styles.title, tw`font-semibold mb-1`, compact && tw`text-sm`]}>
              {title}
            </h3>
          )}

          {/* Main message */}
          <p css={[compact && tw`text-sm`, !compact && tw`text-base`]}>
            {message}
          </p>

          {/* Error details */}
          {showDetails && errorDetails && (
            <div tw="mt-3">
              {Array.isArray(errorDetails) ? (
                <ul tw="list-disc list-inside space-y-1 text-sm opacity-90">
                  {errorDetails.map((detail, index) => (
                    <li key={index}>
                      {detail.field ? (
                        <>
                          <span tw="font-medium">{detail.field}:</span> {detail.message}
                        </>
                      ) : (
                        detail.message || detail
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p tw="text-sm opacity-90 mt-1">{errorDetails}</p>
              )}
            </div>
          )}

          {/* Stack trace in development */}
          {process.env.NODE_ENV === 'development' && error?.stack && showDetails && (
            <details tw="mt-3 text-xs opacity-70">
              <summary tw="cursor-pointer">Stack Trace</summary>
              <pre tw="mt-2 whitespace-pre-wrap font-mono">{error.stack}</pre>
            </details>
          )}

          {/* Retry button */}
          {onRetry && (
            <div tw="mt-4">
              <button
                onClick={onRetry}
                css={[styles.button, tw`px-4 py-2 rounded-lg font-medium text-sm transition-colors`]}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ValidationError Component
 * Specialized error display for validation errors
 */
export const ValidationError = ({ errors, className = '' }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div tw="bg-red-50 border border-red-200 rounded-lg p-4" className={className}>
      <h4 tw="text-red-900 font-semibold mb-2">Validation Failed</h4>
      <ul tw="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} tw="text-red-700 text-sm">
            {error.field ? (
              <>
                <span tw="font-medium">{error.field}:</span> {error.message}
              </>
            ) : (
              error.message || error
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * ApiError Component
 * Specialized error display for API errors
 */
export const ApiError = ({ error, onRetry, className = '' }) => {
  if (!error) return null;

  const statusCode = error.status || error.statusCode;
  const message = error.message || error.data?.message || 'An error occurred';
  const errors = error.data?.errors;

  // Handle different HTTP status codes
  const getStatusInfo = () => {
    switch (statusCode) {
      case 401:
        return {
          title: 'Authentication Required',
          message: 'Please log in to continue.',
        };
      case 403:
        return {
          title: 'Access Denied',
          message: "You don't have permission to access this resource.",
        };
      case 404:
        return {
          title: 'Not Found',
          message: 'The requested resource was not found.',
        };
      case 409:
        return {
          title: 'Conflict',
          message: message || 'This operation conflicts with existing data.',
        };
      case 422:
        return {
          title: 'Validation Error',
          message: 'Please check your input and try again.',
        };
      case 429:
        return {
          title: 'Too Many Requests',
          message: 'Please wait a moment before trying again.',
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
        };
      default:
        return {
          title: statusCode ? `Error ${statusCode}` : 'Error',
          message,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <ErrorMessage
      type="error"
      title={statusInfo.title}
      message={statusInfo.message}
      onRetry={onRetry}
      error={error}
      showDetails={!!errors}
      className={className}
    />
  );
};

/**
 * NetworkError Component
 * Specialized error display for network issues
 */
export const NetworkError = ({ onRetry, className = '' }) => {
  return (
    <ErrorMessage
      type="warning"
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
      className={className}
    />
  );
};

/**
 * ErrorBoundary Component
 * Catches and displays React component errors
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          type="error"
          title="Something went wrong"
          message={this.state.error?.message || 'An unexpected error occurred'}
          onRetry={() => this.setState({ hasError: false, error: null })}
          showDetails={process.env.NODE_ENV === 'development'}
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorMessageSkeleton Component
 * Loading skeleton for error message
 */
export const ErrorMessageSkeleton = () => (
  <div tw="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
    <div tw="flex items-start space-x-3">
      <div tw="w-5 h-5 bg-red-200 rounded-full" />
      <div tw="flex-1">
        <div tw="h-4 bg-red-200 rounded w-1/4 mb-2" />
        <div tw="h-3 bg-red-200 rounded w-3/4" />
      </div>
    </div>
  </div>
);

/**
 * useErrorMessage Hook
 * Manages error message state and provides dismiss functionality
 */
export const useErrorMessage = (initialError = null) => {
  const [error, setError] = React.useState(initialError);
  const [isVisible, setIsVisible] = React.useState(true);

  const showError = React.useCallback((newError) => {
    setError(newError);
    setIsVisible(true);
  }, []);

  const dismissError = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
    setIsVisible(true);
  }, []);

  return {
    error,
    isVisible,
    showError,
    dismissError,
    clearError,
    ErrorComponent: error && isVisible ? (
      <ErrorMessage
        message={error.message || 'An error occurred'}
        onDismiss={dismissError}
        error={error}
      />
    ) : null,
  };
};

export default ErrorMessage;