"use client";

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorMessage = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  className = ""
}: ErrorMessageProps) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-red-800 mb-2">
        {title}
      </h2>
      
      <p className="text-red-600 mb-4">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
