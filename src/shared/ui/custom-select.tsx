import { ChevronDown } from 'lucide-react';
import React from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ label, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={`
              w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-10
              text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 
              focus:border-indigo-500/50 transition-all duration-300 cursor-pointer
              hover:bg-black/30 hover:border-white/20
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-200">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    );
  }
);
CustomSelect.displayName = 'CustomSelect';