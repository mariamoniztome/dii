import React from 'react';

interface ViewControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showPercentage?: boolean;
}

const ViewControls: React.FC<ViewControlsProps> = ({ 
  scale, 
  onZoomIn, 
  onZoomOut, 
  onReset,
  showPercentage = true 
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto z-4 0">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg flex flex-col overflow-hidden">
        <button 
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-100 text-gray-600 hover:text-indigo-600"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-100 text-gray-600 hover:text-indigo-600"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button 
          onClick={onReset}
          className="p-2 hover:bg-gray-100 transition-colors text-indigo-600 font-bold text-[10px] hover:text-indigo-700"
          title="Reset View"
        >
          RESET
        </button>
      </div>
      {showPercentage && (
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg px-2 py-1 text-center text-[10px] font-black text-gray-400">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

export default ViewControls;
