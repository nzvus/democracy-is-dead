import React from 'react';

interface LobbyFlowLayoutProps {
  children: React.ReactNode;
  status: 'waiting' | 'setup' | 'voting' | 'ended';
}

export const LobbyFlowLayout = ({ children, status }: LobbyFlowLayoutProps) => {
  // Dynamic background based on status
  const getBackground = () => {
    switch (status) {
      case 'waiting': return 'bg-gray-950'; // Plain dark
      case 'setup': return 'bg-gray-950';
      case 'voting': return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950'; // Subtle glow
      case 'ended': return 'bg-gray-950'; 
      default: return 'bg-gray-950';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${getBackground()} relative overflow-hidden`}>
      {/* Optional: Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("/grid.svg")` }} 
      />
      
      {/* Content Container */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};