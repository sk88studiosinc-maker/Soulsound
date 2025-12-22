
import React, { useState } from 'react';
import { Caption } from '../types';

interface CaptionCardProps {
  caption: Caption;
}

const CaptionCard: React.FC<CaptionCardProps> = ({ caption }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLabel = (type: string) => {
    switch(type) {
      case 'Punchy Hook': return 'The Hook';
      case 'Poetic': return 'The Verse';
      case 'Minimalist': return 'The Silence';
      case 'Viral/Curiosity': return 'The Spark';
      default: return type;
    }
  };

  return (
    <div className="glass p-6 rounded-2xl transition-all hover:border-purple-500/50 group relative animate-fadeIn border border-white/5">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
          {getLabel(caption.type)}
        </span>
        <span className="text-xl">{caption.emoji}</span>
      </div>
      <p className="text-slate-200 leading-relaxed serif text-lg whitespace-pre-wrap">
        {caption.text}
      </p>
      <button 
        onClick={handleCopy}
        className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 border border-white/10"
      >
        {copied ? (
          <span className="text-green-400">✓ Saved to Clipboard</span>
        ) : (
          <span>Copy This Caption</span>
        )}
      </button>
    </div>
  );
};

export default CaptionCard;
