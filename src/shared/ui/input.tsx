import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wider ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          suppressHydrationWarning // [FIX] Ignores browser extension injections
          className={`w-full bg-gray-950 border ${error ? 'border-red-500' : 'border-gray-800'} rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-700 ${className}`}
          {...props}
        />
        {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';