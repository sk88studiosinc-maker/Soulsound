
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div className="bg-white border border-[#E5E5E5] p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
    {title && <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8E8E8E] mb-4">{title}</h3>}
    {children}
  </div>
);
