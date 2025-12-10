import { useState } from 'react';
import { getErrorMessage, getErrorCode } from '@/utils/errorHandler';

/**
 * Hook to handle errors in forms and components
 * Returns error state and helper functions
 */
export function useErrorHandler() {
  const [error, setError] = useState<string>('');

  const handleError = (error: any, errorMessages?: Record<string, string>, url?: string) => {
    const errorCode = getErrorCode(error, url);
    const errorMessage = getErrorMessage(error, url);

    // Try to get message from error constants first
    if (errorCode && errorMessages && errorMessages[errorCode]) {
      setError(errorMessages[errorCode]);
    } else {
      setError(errorMessage);
    }
  };

  const clearError = () => {
    setError('');
  };

  return {
    error,
    setError,
    handleError,
    clearError,
  };
}

