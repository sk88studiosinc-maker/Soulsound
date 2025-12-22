
import React from 'react';

export const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-purple-500/30">
      {/* Background is handled by body styles in index.html, but we ensure content is centered */}
      <main className="max-w-md mx-auto min-h-screen flex flex-col p-6 overflow-x-hidden">
        {children}
      </main>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .serif {
          font-family: 'Crimson Pro', serif;
        }
      `}</style>
    </div>
  );
};
