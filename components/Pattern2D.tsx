
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Pattern, ConstructionMode, StitchType } from '../types';

interface Pattern2DProps {
  pattern: Pattern;
  setPattern: React.Dispatch<React.SetStateAction<Pattern>>;
}

const STITCH_SYMBOLS: Record<StitchType, string> = {
  [StitchType.SC]: '×',
  [StitchType.DC]: '†',
  [StitchType.HDC]: 'T',
  [StitchType.TR]: '‡',
};

const Pattern2D: React.FC<Pattern2DProps> = ({ pattern, setPattern }) => {
  const isRound = pattern.mode === ConstructionMode.ROUND;

  useEffect(() => {
    const totalStitches = pattern.rows.reduce((sum, row) => sum + row.stitches.length, 0);
  }, [pattern]);

  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const delta = -e.deltaY * zoomSpeed;
    const newScale = Math.max(0.2, Math.min(5, scale + delta));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const renderFlatGrid = () => {
    const maxStitches = Math.max(...pattern.rows.map(r => r.stitches.length), 0);
    const cellSize = 30;
    const padding = 20;
    const width = Math.max(200, maxStitches * cellSize + padding * 2);
    const height = Math.max(200, pattern.rows.length * cellSize + padding * 2);

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {pattern.rows.map((row, rowIndex) => (
          <g key={row.id} transform={`translate(${padding}, ${height - padding - (rowIndex + 1) * cellSize})`}>
            {row.stitches.map((stitch, stIndex) => {
              const xPos = stIndex * cellSize;
              const yPos = 0;
              return (
                <g 
                  key={stitch.id} 
                  transform={`translate(${xPos}, ${yPos})`}
                >
                  <rect 
                    width={cellSize - 2} 
                    height={cellSize - 2} 
                    fill={stitch.color || '#f3f4f6'} 
                    rx="4" 
                    className="opacity-40"
                  />
                  <text 
                    x={cellSize / 2 - 1} 
                    y={cellSize / 2 + 4} 
                    textAnchor="middle" 
                    className="text-[14px] font-bold fill-gray-700 select-none pointer-events-none"
                  >
                    {STITCH_SYMBOLS[stitch.type]}
                  </text>
                </g>
              );
            })}
            <text x={-15} y={cellSize/2 + 4} className="text-[10px] fill-indigo-400 font-bold select-none pointer-events-none">R{rowIndex + 1}</text>
          </g>
        ))}
      </svg>
    );
  };

  const renderRoundGrid = () => {
    const size = 600;
    const center = size / 2;
    const step = 40;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {pattern.rows.map((row, rowIndex) => {
          const radius = (rowIndex + 1) * step + 20;
          const stitchCount = row.stitches.length;
          
          return (
            <g key={row.id}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              {row.stitches.map((stitch, stIndex) => {
                const angle = (stIndex / stitchCount) * Math.PI * 2 - Math.PI / 2;
                const x = center + Math.cos(angle) * radius;
                const y = center + Math.sin(angle) * radius;
                
                return (
                  <g 
                    key={stitch.id} 
                    transform={`translate(${x}, ${y})`}
                  >
                    <circle r="12" fill={stitch.color || '#f3f4f6'} className="opacity-40" />
                    <text 
                      textAnchor="middle" 
                      dy="4"
                      className="text-[12px] font-bold fill-gray-700 select-none pointer-events-none"
                      transform={`rotate(${(angle * 180 / Math.PI) + 90})`}
                    >
                      {STITCH_SYMBOLS[stitch.type]}
                    </text>
                  </g>
                );
              })}
              <text 
                x={center + radius + 10} 
                y={center} 
                className="text-[10px] fill-indigo-400 font-bold select-none pointer-events-none"
              >
                R{rowIndex + 1}
              </text>
            </g>
          );
        })}
        <circle cx={center} cy={center} r="5" fill="#indigo-500" className="opacity-20" />
      </svg>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-white flex items-center justify-center p-8 relative"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div 
        className="will-change-transform"
        style={{ 
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {isRound ? renderRoundGrid() : renderFlatGrid()}
      </div>

      {/* View Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg flex flex-col overflow-hidden">
          <button 
            onClick={() => setScale(s => Math.min(5, s + 0.2))}
            className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-100 text-gray-600"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button 
            onClick={() => setScale(s => Math.max(0.2, s - 0.2))}
            className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-100 text-gray-600"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={resetView}
            className="p-2 hover:bg-gray-100 transition-colors text-indigo-600 font-bold text-[10px]"
            title="Reset View"
          >
            RESET
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg px-2 py-1 text-center text-[10px] font-black text-gray-400">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Pattern2D;
