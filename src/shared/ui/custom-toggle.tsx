import React from 'react';

interface CustomToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CustomToggle = ({ label, checked, onChange, className = '' }: CustomToggleProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">
          {label}
        </label>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative h-10 w-full rounded-xl border transition-all duration-300 flex items-center px-1
          ${checked 
            ? 'bg-indigo-600/20 border-indigo-500/50' 
            : 'bg-black/20 border-white/10 hover:border-white/20'
          }
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            inline-block h-8 w-1/2 rounded-lg bg-white shadow-lg ring-0 transition-transform duration-300 ease-out
            flex items-center justify-center text-[10px] font-black uppercase tracking-widest
            ${checked ? 'translate-x-[95%] bg-indigo-500 text-white' : 'translate-x-0 bg-gray-700 text-gray-300'}
          `}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
};