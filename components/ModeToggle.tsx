
import React from 'react';
import { UserMode } from '../types';

interface ModeToggleProps {
  mode: UserMode;
  onToggle: (mode: UserMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="flex bg-[#F4F1EA] p-1 rounded-full w-fit mx-auto">
      <button
        onClick={() => onToggle('beginner')}
        className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${
          mode === 'beginner' ? 'bg-white shadow-sm text-[#3C3C3C]' : 'text-[#8E8E8E]'
        }`}
      >
        Gentle
      </button>
      <button
        onClick={() => onToggle('advanced')}
        className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${
          mode === 'advanced' ? 'bg-white shadow-sm text-[#3C3C3C]' : 'text-[#8E8E8E]'
        }`}
      >
        Direct
      </button>
    </div>
  );
};
