
import React, { useState, useRef, useCallback } from 'react';
import { Pattern, ConstructionMode, StitchType } from '../types';
import { STITCH_COLORS } from '../constants.tsx';

interface Pattern2DProps {
  pattern: Pattern;
  setPattern: React.Dispatch<React.SetStateAction<Pattern>>;
}

const STITCH_SYMBOLS: Record<StitchType, string> = {
  [StitchType.SC]: '×',
  [StitchType.DC]: '†',
  [StitchType.HDC]: 'T',
  [StitchType.TR]: '‡',
  [StitchType.INC]: '∨',
  [StitchType.DEC]: '∧',
  [StitchType.SLST]: '•',
};

interface EditingStitch {
  rowIndex: number;
  stIndex: number;
  stitchId: string;
  x: number;
  y: number;
}

const Pattern2D: React.FC<Pattern2DProps> = ({ pattern, setPattern }) => {
  const isRound = pattern.mode === ConstructionMode.ROUND;

  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [movedDuringClick, setMovedDuringClick] = useState(false);

  // Color Picker state
  const [editingStitch, setEditingStitch] = useState<EditingStitch | null>(null);

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
    setMovedDuringClick(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setMovedDuringClick(true);
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleStitchClick = (e: React.MouseEvent, rowIndex: number, stIndex: number, stitchId: string, x: number, y: number) => {
    if (movedDuringClick) return; // Ignore clicks if panning
    e.stopPropagation();
    
    // We want to show the picker relative to the stitch, but it must be adjusted for scale and offset
    setEditingStitch({ rowIndex, stIndex, stitchId, x, y });
  };

  const updateStitchColor = (color: string) => {
    if (!editingStitch) return;
    
    const newRows = [...pattern.rows];
    const targetRow = { ...newRows[editingStitch.rowIndex] };
    const targetStitches = [...targetRow.stitches];
    targetStitches[editingStitch.stIndex] = { ...targetStitches[editingStitch.stIndex], color };
    targetRow.stitches = targetStitches;
    newRows[editingStitch.rowIndex] = targetRow;

    setPattern(prev => ({ ...prev, rows: newRows }));
    setEditingStitch(null);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setEditingStitch(null);
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
                  className="cursor-pointer transition-transform hover:scale-110 origin-center"
                  onMouseDown={(e) => handleStitchClick(e, rowIndex, stIndex, stitch.id, padding + xPos + cellSize/2, height - padding - (rowIndex + 1) * cellSize + cellSize/2)}
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
                    className="cursor-pointer transition-transform hover:scale-110 origin-center"
                    onMouseDown={(e) => handleStitchClick(e, rowIndex, stIndex, stitch.id, x, y)}
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
      onClick={() => setEditingStitch(null)}
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

      {/* Floating Color Picker Overlay */}
      {editingStitch && (
        <div 
          className="absolute z-50 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border border-gray-100 flex gap-2 pointer-events-auto animate-in fade-in zoom-in duration-200"
          style={{
            // Position it near the stitch based on coordinate system
            // We need to account for center origin + scale + offset
            left: `calc(50% + ${offset.x}px + ${ (editingStitch.x - (isRound ? 300 : (Math.max(...pattern.rows.map(r => r.stitches.length), 0) * 30 + 40)/2 )) * scale }px)`,
            top: `calc(50% + ${offset.y}px + ${ (editingStitch.y - (isRound ? 300 : (pattern.rows.length * 30 + 40)/2 )) * scale }px)`,
            transform: 'translate(-50%, -120%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {STITCH_COLORS.map(color => (
            <button
              key={color}
              onClick={() => updateStitchColor(color)}
              className="w-6 h-6 rounded-full border border-black/5 hover:scale-125 transition-transform shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-gray-100" />
        </div>
      )}

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
      
      {/* Help Hint */}
      <div className="absolute top-4 right-4 bg-white/50 backdrop-blur text-[10px] px-3 py-1 rounded-full text-gray-500 border border-gray-100">
        Click a stitch to change color
      </div>
    </div>
  );
};

export default Pattern2D;
