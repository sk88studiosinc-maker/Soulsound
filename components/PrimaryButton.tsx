
import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'outline';
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = ''
}) => {
  const baseStyles = "px-8 py-4 rounded-full font-medium transition-all duration-300 active:scale-95 text-sm tracking-wide";
  const variants = {
    primary: "bg-[#8E9775] text-white shadow-sm hover:bg-[#7A8462]",
    outline: "border border-[#8E9775] text-[#8E9775] hover:bg-[#F4F1EA]"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
