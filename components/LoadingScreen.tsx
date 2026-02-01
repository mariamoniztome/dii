import React from "react";

interface LoadingScreenProps {
  isVisible: boolean;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible, progress = 0 }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center z-[9999] animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-5"></div>
        <h1 className="text-2xl font-light tracking-widest">Loading...</h1>
        {progress > 0 && (
          <div className="w-48 h-1 bg-white/20 rounded mt-5 mx-auto overflow-hidden">
            <div
              className="h-full bg-white rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
